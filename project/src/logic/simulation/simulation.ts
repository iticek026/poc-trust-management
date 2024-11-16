import { Body, Bounds, Composite, Engine, Events, Render, Runner, World } from "matter-js";

import { ROBOT_RADIUS } from "../robot/robot";
import { randomPointFromOtherSides } from "../../utils/robotUtils";
import { Coordinates } from "../environment/coordinates";
import { simulationCofigParser } from "./simulationConfigParser";
import { RobotSwarm } from "../robot/swarm";
import { EntityCacheInstance } from "../../utils/cache";
import { Environment } from "../environment/environment";
import { MissionStateHandler, MissionStateHandlerInstance } from "./missionStateHandler";
import { OccupiedSidesHandler } from "./occupiedSidesHandler";
import { EnvironmentGridSingleton } from "../visualization/environmentGrid";
import { GridVisualizer } from "../visualization/gridVisualizer";
import { TrustRobot } from "../tms/actors/trustRobot";
import { initializeEngine, initializeRender, initializeRunner } from "../../utils/matterJs";
import { createWorldBounds } from "../../utils/bodies";
import { TrustDataProvider } from "../tms/trustDataProvider";
import { AuthorityInstance } from "../tms/actors/authority";
import { EventEmitter, SimulationEvents, SimulationEventsEnum } from "../common/eventEmitter";
import { Logger } from "../logger/logger";
import { SimulationConfig } from "../jsonConfig/config";
import { addData } from "../indexedDb/indexedDb";
import { RandomizerInstance } from "@/utils/random/randomizer";

const interval = 5000;
let lastActionTime = 0;
export let timestamp = 0;

export class Simulation {
  private gridVisualizer: GridVisualizer | null = null;
  public swarm: RobotSwarm;
  private environment: Environment;
  private render: Render | null = null;
  private runner: Runner | null = null;
  private simulationListener: EventEmitter<SimulationEvents>;
  private engine: Engine = initializeEngine();
  public simulationConfig: SimulationConfig;
  private trustDataProvider: TrustDataProvider;

  constructor(
    simulationConfig: SimulationConfig,
    trustDataProvider: TrustDataProvider,
    simulationListener: EventEmitter<SimulationEvents>,
  ) {
    this.trustDataProvider = trustDataProvider;
    this.simulationConfig = simulationConfig;
    const sim = simulationCofigParser(simulationConfig, this.engine, trustDataProvider);
    this.swarm = sim.swarm;
    this.environment = sim.environment;
    this.simulationListener = simulationListener;
  }

  private createRobots(swarm: RobotSwarm): Array<Body | Composite> {
    return swarm.robots.map((robot) => robot.getInitBody());
  }

  private createEnvironment(environment: Environment): (Body | Composite)[] {
    const obstacles = environment.obstacles ?? [];

    const obstaclesBodies = obstacles.map((obstacle) => obstacle.getInitBody());
    return [environment.searchedObject.getInitBody(), environment.base.getInitBody(), ...obstaclesBodies];
  }

  init(elem: HTMLElement | null) {
    this.addBodiesToWorld(this.engine.world, this.swarm, this.environment);
    this.environment.createBorders(this.engine.world);

    EnvironmentGridSingleton.setWidthAndHeight(this.environment.size.width, this.environment.size.height);
    this.gridVisualizer = new GridVisualizer(EnvironmentGridSingleton, "environmentCanvas");

    this.render = initializeRender(elem, this.engine, this.environment);
    Render.run(this.render as Render);
  }

  start() {
    if (!this.gridVisualizer || !this.render) {
      throw new Error("Init was not called before starting the simulation");
    }

    const worldBounds = createWorldBounds(this.environment.size, ROBOT_RADIUS);

    this.runner = initializeRunner();

    const occupiedSidesHandler = this.swarm.occupiedSidesHandler;
    const missionStateHandler = MissionStateHandlerInstance.create(this.swarm, occupiedSidesHandler);
    this.setupBeforeUpdate(
      this.engine,
      this.swarm,
      this.environment,
      worldBounds,
      occupiedSidesHandler,
      missionStateHandler,
    );
    this.setupAfterUpdate(this.engine, this.swarm, this.gridVisualizer);

    Runner.run(this.runner, this.engine);
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
    occupiedSidesHandler: OccupiedSidesHandler,
    missionStateHandler: MissionStateHandler,
  ) {
    const checkBounds = this.createBoundsChecker(worldBounds, environment, occupiedSidesHandler, swarm);

    Events.on(engine, "beforeUpdate", () => {
      timestamp = this.engine.timing.timestamp;

      let timeElapsed = false;
      if (timestamp - lastActionTime >= interval) {
        timeElapsed = true;

        lastActionTime = timestamp;
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

      swarm.robots.forEach((robot) => {
        checkBounds(robot);
      });

      const robotsInBase = environment.base.countRobotsInBase(swarm);

      if (environment.base.isSearchedObjectInBase(environment.searchedObject)) {
        Logger.info("Mission completed");
        this.stopRunner();
      }

      if (MissionStateHandlerInstance.isMissionCancelled() && robotsInBase === swarm.robots.length) {
        Logger.info("Mission cancelled");
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
          occupiedSidesHandler: occupiedSidesHandler,
          destination: randomPointFromOtherSides(environment, robot.getPosition() as Coordinates),
          planningController: swarm.planningController,
          grid: EnvironmentGridSingleton,
          timeElapsed: false,
        });
      }
    };
  }

  private setupAfterUpdate(engine: Engine, swarm: RobotSwarm, gridVisualizer: GridVisualizer) {
    Events.on(engine, "afterUpdate", () => {
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

  pause() {
    (this.runner as Runner).enabled = false;
  }

  private stopRunner() {
    if (this.runner) {
      Runner.stop(this.runner);
    }

    this.simulationListener.emit(SimulationEventsEnum.SIMULATION_ENDED);

    addData({ seed: RandomizerInstance.getSeed()!, data: this.trustDataProvider.getAnalysisData(), label: "run" });
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
    Events.off(this.engine, undefined as any, undefined as any);
    Composite.clear(this.engine.world, false);
    Engine.clear(this.engine);
    if (this.render) {
      Render.stop(this.render);
      this.render.canvas.remove();
      this.render.canvas = null as any;
      this.render.context = null as any;
      this.render.textures = {};
    }

    if (this.runner) Runner.stop(this.runner);

    MissionStateHandlerInstance.reset();
    EnvironmentGridSingleton.reset();
    EntityCacheInstance.reset();
    AuthorityInstance.reset();
    Logger.clearLogs();
    lastActionTime = 0;
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
