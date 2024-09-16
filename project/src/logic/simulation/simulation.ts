import { Body, Bounds, Composite, Engine, Events, Render, Runner, World } from "matter-js";

import { Robot, ROBOT_RADIUS } from "../robot/robot";
import { handleBorderDistance, randomPointFromOtherSides } from "../../utils/robotUtils";
import { Coordinates } from "../environment/coordinates";
import { simulationCofigParser, SimulationConfig } from "./simulationConfigParser";
import { RobotSwarm } from "../robot/swarm";
import { EntityCacheInstance } from "../../utils/cache";
import { Environment } from "../environment/environment";
import { MissionState, MissionStateHandler, MissionStateHandlerInstance } from "./missionStateHandler";
import { OccupiedSidesHandler } from "./occupiedSidesHandler";
import { EnvironmentGridSingleton } from "../visualization/environmentGrid";
import { GridVisualizer } from "../visualization/gridVisualizer";

export class Simulation {
  private simulationConfig: SimulationConfig;
  simulationStarted: boolean = false;

  constructor(simulationConfig: SimulationConfig) {
    this.simulationConfig = simulationConfig;
  }

  private createRobots(swarm: RobotSwarm): Array<Body> {
    EntityCacheInstance.createCache(swarm.robots, "robots");
    return swarm.robots.map((robot) => robot.getBody());
  }

  private addCommunicationController(swarm: RobotSwarm) {
    swarm.robots.forEach((robot) => {
      robot.assignCommunicationController(swarm.robots);
    });
  }

  private createEnvironment(environment: Environment): Body[] {
    const obstacles = environment.obstacles ?? [];

    EntityCacheInstance.createCache([environment.searchedObject, ...obstacles], "obstacles");

    const obstaclesBodies = obstacles.map((obstacle) => obstacle.getBody());
    return [environment.searchedObject.getBody(), environment.base.getBody(), ...obstaclesBodies];
  }

  start(elem: HTMLDivElement | null) {
    const engine = this.initializeEngine();
    const { swarm, environment } = this.parseSimulationConfig(engine);

    const render = this.initializeRender(elem, engine, environment);
    const runner = this.initializeRunner();
    const worldBounds = this.createWorldBounds(environment.size);

    const occupiedSidesHandler = new OccupiedSidesHandler();

    const missionStateHandler = MissionStateHandlerInstance.create(swarm, occupiedSidesHandler);
    this.addCommunicationController(swarm);
    this.addBodiesToWorld(engine.world, swarm, environment);
    environment.createBorders(engine.world);

    const gridVisualizer = new GridVisualizer(EnvironmentGridSingleton, "environmentCanvas");
    gridVisualizer.drawGrid();

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
    this.setupAfterUpdate(engine, swarm, environment, gridVisualizer);
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
    const checkBounds = this.createBoundsChecker(worldBounds, environment, occupiedSides, swarm);

    Events.on(engine, "beforeUpdate", () => {
      const detected = missionStateHandler.updateMissionState(EnvironmentGridSingleton);

      detected?.obstacles?.forEach((obstacle) => {
        EnvironmentGridSingleton.markObstacle(obstacle);
      });

      MissionStateHandlerInstance.getObstaclesDetected().forEach((obstacle) => {
        EnvironmentGridSingleton.markObstacle(obstacle);
      });

      if (missionStateHandler.getMissionState() === MissionState.SEARCHING) {
        swarm.robots.forEach((robot) => {
          checkBounds(robot);
        });
      }

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
    swarm: RobotSwarm,
  ) {
    return (robot: Robot) => {
      const futurePosition = {
        x: robot.getPosition().x + robot.getBody().velocity.x + 3,
        y: robot.getPosition().y + robot.getBody().velocity.y + 3,
      };

      if (!Bounds.contains(worldBounds, futurePosition)) {
        robot.update({
          occupiedSides: occupiedSidesHandler.getOccupiedSides(),
          destination: randomPointFromOtherSides(environment, robot.getPosition() as Coordinates),
          planningController: swarm.planningController,
          grid: EnvironmentGridSingleton,
        });
      }
    };
  }

  private setupAfterUpdate(
    engine: Engine,
    swarm: RobotSwarm,
    environment: Environment,
    gridVisualizer: GridVisualizer,
  ) {
    Events.on(engine, "afterUpdate", () => {
      const robotsInBase = environment.base.countRobotsInBase(swarm);
      console.log(`Number of robots in the base: ${robotsInBase}`);

      swarm.robots.forEach((robot) => {
        EnvironmentGridSingleton.markRobot(robot);
      });

      gridVisualizer.drawGrid();
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
          robot.update({
            occupiedSides: occupiedSidesHandler.getOccupiedSides(),
            destination: handleBorderDistance(
              event.clientX - rect.left,
              event.clientY - rect.top,
              ROBOT_RADIUS,
              environment,
            ),
            grid: EnvironmentGridSingleton,
            planningController: swarm.planningController,
          });
        });
      }
    });
  }

  private pause(render: Render, runner: Runner) {
    Render.stop(render);
    Runner.stop(runner);
  }
}
