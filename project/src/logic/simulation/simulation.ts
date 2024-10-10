import { Body, Bounds, Composite, Engine, Events, Render, Runner, World } from "matter-js";

import { ROBOT_RADIUS } from "../robot/robot";
import { randomPointFromOtherSides } from "../../utils/robotUtils";
import { Coordinates } from "../environment/coordinates";
import { simulationCofigParser } from "./simulationConfigParser";
import { RobotSwarm } from "../robot/swarm";
import { EntityCacheInstance } from "../../utils/cache";
import { Environment } from "../environment/environment";
import { MissionState, MissionStateHandler, MissionStateHandlerInstance } from "./missionStateHandler";
import { OccupiedSidesHandler } from "./occupiedSidesHandler";
import { EnvironmentGridSingleton } from "../visualization/environmentGrid";
import { GridVisualizer } from "../visualization/gridVisualizer";
import { TrustRobot } from "../tms/actors/trustRobot";
import { initializeEngine, initializeRender, initializeRunner } from "../../utils/matterJs";
import { createWorldBounds } from "../../utils/bodies";
import { TrustDataProvider } from "../tms/trustDataProvider";
import { AuthorityInstance } from "../tms/actors/authority";
import { SimulationConfig } from "../jsonConfig/parser";
import { EventEmitter, SimulationEvents, SimulationEventsEnum } from "../common/eventEmitter";

let engine: Engine = initializeEngine();
const interval = 7000;
let lastActionTime = 0;

export class Simulation {
  private gridVisualizer: GridVisualizer | null = null;
  private swarm: RobotSwarm;
  private environment: Environment;
  private render: Render | null = null;
  private runner: Runner | null = null;
  private simulationListener: EventEmitter<SimulationEvents>;

  constructor(
    simulationConfig: SimulationConfig,
    trustDataProvider: TrustDataProvider,
    simulationListener: EventEmitter<SimulationEvents>,
  ) {
    const sim = simulationCofigParser(simulationConfig, engine, trustDataProvider);
    this.swarm = sim.swarm;
    this.environment = sim.environment;
    this.simulationListener = simulationListener;
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

  init(elem: HTMLElement | null) {
    this.addBodiesToWorld(engine.world, this.swarm, this.environment);
    this.environment.createBorders(engine.world);

    EnvironmentGridSingleton.setWidthAndHeight(this.environment.size.width, this.environment.size.height);
    this.gridVisualizer = new GridVisualizer(EnvironmentGridSingleton, "environmentCanvas");

    this.render = initializeRender(elem, engine, this.environment);
    Render.run(this.render as Render);
  }

  start() {
    if (!this.gridVisualizer || !this.render) {
      throw new Error("Init was not called before starting the simulation");
    }

    const worldBounds = createWorldBounds(this.environment.size, ROBOT_RADIUS);

    this.runner = initializeRunner();

    const occupiedSidesHandler = new OccupiedSidesHandler();
    this.addCommunicationController(this.swarm);
    const missionStateHandler = MissionStateHandlerInstance.create(this.swarm, occupiedSidesHandler);
    this.setupBeforeUpdate(
      engine,
      this.swarm,
      this.environment,
      worldBounds,
      occupiedSidesHandler,
      missionStateHandler,
    );
    this.setupAfterUpdate(engine, this.swarm, this.environment, this.gridVisualizer);
    // this.setupClickListener(this.render, this.swarm, this.environment, occupiedSidesHandler);

    Runner.run(this.runner, engine);
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
      const currentTime = engine.timing.timestamp;
      // const currentTime = 0;

      let timeElapsed = false;
      if (currentTime - lastActionTime >= interval) {
        timeElapsed = true;

        lastActionTime = currentTime;
      } else {
        timeElapsed = false;
      }

      const detected = missionStateHandler.updateMissionState(EnvironmentGridSingleton, timeElapsed);

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
        // console.log("Object is in the base");
        this.stopRunner();
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
          timeElapsed: false,
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
      // const robotsInBase = environment.base.countRobotsInBase(swarm);
      // if (robotsInBase > 0) {
      //   console.log(`Number of robots in the base: ${robotsInBase}`);
      // }
      swarm.robots.forEach((robot) => {
        EnvironmentGridSingleton.markRobot(robot);
      });

      gridVisualizer.updateCells(EnvironmentGridSingleton.getChangedCells());
      EnvironmentGridSingleton.clearChangedCells();
    });
  }

  resume() {
    (this.runner as Runner).enabled = true;
  }

  private stopRunner() {
    if (this.runner) {
      Runner.stop(this.runner);
    }

    this.simulationListener.emit(SimulationEventsEnum.SIMULATION_ENDED);
  }

  stop() {
    if (this.render) {
      if (this.render.canvas) this.render.canvas.remove();
      this.render.textures = {};
      Render.stop(this.render);
    }

    if (this.runner) {
      Runner.stop(this.runner);
    }
  }

  reset() {
    Events.off(engine, undefined as any, undefined as any);
    World.clear(engine.world, false);
    Engine.clear(engine);
    if (this.render) {
      Render.stop(this.render);
      this.render.canvas.remove();
      this.render.canvas = null as any;
      this.render.context = null as any;
      this.render.textures = {};
    }

    if (this.runner) Runner.stop(this.runner as Runner);

    MissionStateHandlerInstance.reset();
    EnvironmentGridSingleton.reset();
    EntityCacheInstance.reset();
    AuthorityInstance.reset();
  }

  pause() {
    (this.runner as Runner).enabled = false;
  }

  resize(scale: number, containerWidth: number, containerHeight: number) {
    if (!this.render) return;

    const viewportWidth = this.environment.size.width;
    const viewportHeight = this.environment.size.height;

    this.render.bounds.min.x = -10;
    this.render.bounds.min.y = -10;
    this.render.bounds.max.x = viewportWidth + 10;
    this.render.bounds.max.y = viewportHeight + 10;

    this.render.canvas.style.width = `${viewportWidth * scale}px`;
    this.render.canvas.style.height = `${viewportHeight * scale}px`;

    this.render.canvas.style.marginLeft = `${(containerWidth - viewportWidth * scale) / 2}px`;
    this.render.canvas.style.marginTop = `${(containerHeight - viewportHeight * scale) / 2}px`;

    Render.lookAt(this.render, {
      min: this.render.bounds.min,
      max: this.render.bounds.max,
    });
  }
}
