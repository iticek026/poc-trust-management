import { Body, Bounds, Composite, Engine, Events, Render, Runner, World } from "matter-js";

import { ROBOT_RADIUS } from "../robot/robot";
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
import { TrustRobot } from "../tms/actors/trustRobot";
import { initializeEngine, initializeRender, initializeRunner } from "../../utils/matterJs";

let render: Render | null = null;
let runner: Runner | null = null;
let engine: Engine = initializeEngine();

export class Simulation {
  private simulationConfig: SimulationConfig;
  private gridVisualizer: GridVisualizer | null = null;

  constructor(simulationConfig: SimulationConfig) {
    this.simulationConfig = simulationConfig;
  }

  private createRobots(swarm: RobotSwarm): Array<Body | Composite> {
    EntityCacheInstance.createCache(swarm.robots, "robots");
    return swarm.robots.map((robot) => robot.getInitBody());
  }

  private addCommunicationController(swarm: RobotSwarm) {
    swarm.robots.forEach((robot) => {
      robot.assignCommunicationController(swarm.robots);
    });
  }

  private createEnvironment(environment: Environment): (Body | Composite)[] {
    const obstacles = environment.obstacles ?? [];

    EntityCacheInstance.createCache([environment.searchedObject, ...obstacles], "obstacles");

    const obstaclesBodies = obstacles.map((obstacle) => obstacle.getInitBody());
    return [environment.searchedObject.getInitBody(), environment.base.getInitBody(), ...obstaclesBodies];
  }

  start(elem: HTMLElement | null) {
    if (render) {
      (render as Render).canvas.remove();
      (render as Render).textures = {};
    }

    // engine =;
    const { swarm, environment } = this.parseSimulationConfig(engine);

    render = initializeRender(elem, engine, environment);
    runner = initializeRunner();
    const worldBounds = this.createWorldBounds(environment.size);

    const occupiedSidesHandler = new OccupiedSidesHandler();

    const missionStateHandler = MissionStateHandlerInstance.create(swarm, occupiedSidesHandler);
    this.addCommunicationController(swarm);
    this.addBodiesToWorld(engine.world, swarm, environment);
    environment.createBorders(engine.world);

    this.gridVisualizer = new GridVisualizer(EnvironmentGridSingleton, "environmentCanvas");
    this.gridVisualizer.drawGrid();

    this.setupBeforeUpdate(engine, swarm, environment, worldBounds, occupiedSidesHandler, missionStateHandler);
    this.setupAfterUpdate(engine, swarm, environment, this.gridVisualizer);
    // this.setupClickListener(render, swarm, environment, occupiedSidesHandler);

    Render.run(render);
    Runner.run(runner, engine);
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
        this.pause();
      }
    });
  }

  private createBoundsChecker(
    worldBounds: Bounds,
    environment: Environment,
    occupiedSidesHandler: OccupiedSidesHandler,
    swarm: RobotSwarm,
  ) {
    return (robot: TrustRobot) => {
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

  resume() {
    (runner as Runner).enabled = true;
  }

  stop() {
    Render.stop(render as Render);
    Runner.stop(runner as Runner);
    (render as Render).canvas.remove();
    (render as Render).textures = {};
  }

  reset() {
    Render.stop(render as Render);
    Runner.stop(runner as Runner);
    (render as Render).canvas.remove();
    (render as Render).textures = {};
    Events.off(engine, undefined as any, undefined as any);

    World.clear((engine as Engine).world, true);
    Engine.clear(engine as Engine);

    MissionStateHandlerInstance.reset();
    EnvironmentGridSingleton.reset();
    EntityCacheInstance.reset();
    (this.gridVisualizer as GridVisualizer).drawGrid();
    // this.start((render as Render).element);
    // this.pause();
  }

  pause() {
    (runner as Runner).enabled = false;
  }
}
