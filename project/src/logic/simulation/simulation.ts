import { Body, Bounds, Composite, Engine, Events, Render, Runner, World } from "matter-js";

import { Robot, ROBOT_RADIUS } from "../robot/robot";
import { handleBorderDistance, randomPointFromOtherSides } from "../../utils/robotUtils";
import { Coordinates } from "../environment/coordinates";
import { simulationCofigParser, SimulationConfig } from "./simulationConfigParser";
import { RobotSwarm } from "../robot/swarm";
import { EntityCache } from "../../utils/cache";
import { Environment } from "../environment/environment";
import { MissionStateHandler } from "./missionStateHandler";
import { OccupiedSidesHandler } from "./occupiedSidesHandler";

export class Simulation {
  private simulationConfig: SimulationConfig;
  private cache: EntityCache;
  simulationStarted: boolean = false;

  constructor(simulationConfig: SimulationConfig) {
    this.simulationConfig = simulationConfig;
    this.cache = new EntityCache();
  }

  private createRobots(swarm: RobotSwarm): Array<Body> {
    this.cache.robots = this.cache.createCache(swarm.robots);
    return swarm.robots.map((robot) => robot.getBody());
  }

  private createEnvironment(environment: Environment): Body[] {
    this.cache.obstacles = this.cache.createCache([environment.searchedObject]);
    return [environment.searchedObject.getBody(), environment.base.getBody()];
  }

  start(elem: HTMLDivElement | null) {
    const engine = this.initializeEngine();
    const { swarm, environment } = this.parseSimulationConfig(engine);

    const render = this.initializeRender(elem, engine, environment);
    const runner = this.initializeRunner();
    const worldBounds = this.createWorldBounds(environment.size);

    const occupiedSidesHandler = new OccupiedSidesHandler();

    const missionStateHandler = new MissionStateHandler(swarm, environment, occupiedSidesHandler, this.cache);

    this.addBodiesToWorld(engine.world, swarm, environment);
    environment.createBorders(engine.world);

    this.setupBeforeUpdate(
      engine,
      swarm,
      environment,
      worldBounds,
      occupiedSidesHandler,
      render,
      runner,
      missionStateHandler,
    );
    this.setupAfterUpdate(engine, swarm, environment);
    this.setupClickListener(render, swarm, environment, occupiedSidesHandler);

    Render.run(render);
    Runner.run(runner, engine);

    const resume = () => {
      Render.run(render);
      Runner.run(engine);
    };

    const stop = () => {
      this.pause(render, runner);
      render.canvas.remove();
      render.textures = {};
    };

    return {
      stop,
      resume,
    };
  }

  private initializeEngine() {
    const engine = Engine.create({
      velocityIterations: 6,
      positionIterations: 6,
    });
    engine.timing.timeScale = 0.8;
    engine.gravity.y = 0;
    engine.gravity.x = 0;
    return engine;
  }

  private initializeRender(elem: HTMLDivElement | null, engine: Engine, environment: Environment) {
    return Render.create({
      element: elem ?? undefined,
      engine: engine,
      options: {
        width: environment.size.width,
        height: environment.size.height,
        showVelocity: true,
        wireframes: true,
        background: "#ffffff",
      },
    });
  }

  private initializeRunner() {
    return Runner.create();
  }

  private createWorldBounds(size: { width: number; height: number }) {
    return Bounds.create([
      { x: ROBOT_RADIUS + 5, y: ROBOT_RADIUS + 5 },
      { x: size.width - ROBOT_RADIUS - 5, y: size.height - ROBOT_RADIUS - 5 },
    ]);
  }

  private parseSimulationConfig(engine: Engine) {
    return simulationCofigParser(this.simulationConfig, engine);
  }

  private addBodiesToWorld(world: World, swarm: RobotSwarm, environment: Environment) {
    Composite.add(world, this.createRobots(swarm));
    Composite.add(world, this.createEnvironment(environment));
  }

  private setupBeforeUpdate(
    engine: Engine,
    swarm: RobotSwarm,
    environment: Environment,
    worldBounds: Bounds,
    occupiedSides: OccupiedSidesHandler,
    render: Render,
    runner: Runner,
    missionStateHandler: MissionStateHandler,
  ) {
    const checkBounds = this.createBoundsChecker(worldBounds, environment, occupiedSides);

    Events.on(engine, "beforeUpdate", () => {
      missionStateHandler.updateMissionState();

      swarm.robots.forEach((robot) => {
        checkBounds(robot);
      });

      if (environment.base.isSearchedObjectInBase(environment.searchedObject)) {
        console.log("Object is in the base");
        this.pause(render, runner);
      }
    });
  }

  private createBoundsChecker(
    worldBounds: Bounds,
    environment: Environment,
    occupiedSidesHandler: OccupiedSidesHandler,
  ) {
    return (robot: Robot) => {
      const futurePosition = {
        x: robot.getPosition().x + robot.getBody().velocity.x + 3,
        y: robot.getPosition().y + robot.getBody().velocity.y + 3,
      };

      if (!Bounds.contains(worldBounds, futurePosition)) {
        robot.update(
          this.cache,
          occupiedSidesHandler.getOccupiedSides(),
          randomPointFromOtherSides(environment, robot.getPosition() as Coordinates),
        );
      }
    };
  }

  private setupAfterUpdate(engine: Engine, swarm: RobotSwarm, environment: Environment) {
    Events.on(engine, "afterUpdate", () => {
      const robotsInBase = environment.base.countRobotsInBase(swarm);
      console.log(`Number of robots in the base: ${robotsInBase}`);
    });
  }

  private setupClickListener(
    render: Render,
    swarm: RobotSwarm,
    environment: Environment,
    occupiedSidesHandler: OccupiedSidesHandler,
  ) {
    document.addEventListener("click", (event) => {
      const rect = render.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height) {
        swarm.robots.forEach((robot) => {
          robot.update(
            this.cache,
            occupiedSidesHandler.getOccupiedSides(),
            handleBorderDistance(event.clientX - rect.left, event.clientY - rect.top, ROBOT_RADIUS, environment),
          );
        });
      }
    });
  }

  private pause(render: Render, runner: Runner) {
    Render.stop(render);
    Runner.stop(runner);
  }
}
