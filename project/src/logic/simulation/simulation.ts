import { Body, Bounds, Composite, Engine, Events, Render, Runner } from "matter-js";

import { Robot, ROBOT_RADIUS } from "../robot/robot";
import { handleBorderDistance, randomPointFromOtherSides } from "../../utils/robotUtils";
import { Coordinates } from "../environment/coordinates";
import { simulationCofigParser, SimulationConfig } from "./simulationConfigParser";
import { RobotSwarm } from "../robot/swarm";
import { EntityCache } from "../../utils/cache";
import { Environment } from "../environment/environment";
import { MissioState, ObjectSide, OccupiedSides, RobotState } from "../../utils/interfaces";

export class Simulation {
  private simulationConfig: SimulationConfig;
  private cache: EntityCache;
  private missionState: MissioState = MissioState.SEARCHING;
  simulationStarted: boolean = false;

  constructor(simulationConfig: SimulationConfig) {
    this.simulationConfig = simulationConfig;
    this.cache = new EntityCache();
  }

  private createRobots(swarm: RobotSwarm): Array<Body> {
    this.cache.robots = this.cache.createCache(swarm.robots);
    return swarm.robots.map((robot) => robot.getRobotMatterBody());
  }

  private createEnvironment(environment: Environment): Body[] {
    this.cache.obstacles = this.cache.createCache([environment.searchedObject]);
    return [environment.searchedObject.getBody(), environment.base.getBody()];
  }

  start(elem: HTMLDivElement | null) {
    const engine = Engine.create({
      velocityIterations: 6,
      positionIterations: 6,
    });

    const world = engine.world;

    engine.timing.timeScale = 0.8;
    engine.gravity.y = 0;
    engine.gravity.x = 0;

    const { swarm, environment } = simulationCofigParser(this.simulationConfig, engine);

    const occupiedSides: OccupiedSides = {
      Top: { robotId: undefined, isOccupied: false },
      Bottom: { robotId: undefined, isOccupied: false },
      Left: { robotId: undefined, isOccupied: false },
      Right: { robotId: undefined, isOccupied: false },
    };

    const searchedObject = environment.searchedObject;
    const base = environment.base;

    const render = Render.create({
      element: elem ?? undefined,
      engine: engine,
      options: {
        width: environment.size.width,
        height: environment.size.height,
        showVelocity: true,
        wireframes: true,
        background: "#ffffff", // or '#ff0000' or other valid color string
      },
    });

    const worldBounds = Bounds.create([
      { x: ROBOT_RADIUS + 5, y: ROBOT_RADIUS + 5 },
      {
        x: environment.size.width - ROBOT_RADIUS - 5,
        y: environment.size.height - ROBOT_RADIUS - 5,
      },
    ]);

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    Composite.add(world, this.createRobots(swarm));
    Composite.add(world, this.createEnvironment(environment));

    environment.createBorders(world);

    const checkBounds = (robot: Robot) => {
      const futurePosition = {
        x: robot.getPosition().x + robot.getBody().velocity.x + 3,
        y: robot.getPosition().y + robot.getBody().velocity.y + 3,
      };

      if (!Bounds.contains(worldBounds, futurePosition)) {
        robot.update(
          this.cache,
          occupiedSides,
          randomPointFromOtherSides(environment, robot.getPosition() as Coordinates),
        );
      }
    };

    Events.on(engine, "beforeUpdate", () => {
      if (base.isSearchedObjectInBase(searchedObject)) {
        console.log("Object is in the base");
        pause();
      }
      swarm.robots.forEach((robot) => {
        checkBounds(robot);
        if (this.missionState === MissioState.SEARCHING) {
          robot.update(this.cache, occupiedSides);
        }
        if (this.missionState === MissioState.TRANSPORTING) {
          const side = Object.entries(occupiedSides).find(([, obj]) => obj.robotId === robot.getId())?.[0];
          robot.executeMovement(ObjectSide[side as keyof typeof ObjectSide]);
        }
      });

      if (this.missionState === MissioState.PLANNING) {
        swarm.robots[0].planningController.collaborativelyPlanTrajectory(swarm.robots);
        this.missionState = MissioState.TRANSPORTING;
      }

      if (this.missionState === MissioState.TRANSPORTING && swarm.robots[0].planningController.didFinisthIteration()) {
        this.missionState = MissioState.PLANNING;
      }

      // updateSimulation(swarm.robots, searchedObject, base.getBody());
    });

    document.addEventListener("click", (event) => {
      const rect = render.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height) {
        swarm.robots.forEach((robot) => {
          robot.update(
            this.cache,
            occupiedSides,
            handleBorderDistance(event.clientX - rect.left, event.clientY - rect.top, ROBOT_RADIUS, environment),
          );
        });
      }
    });

    Events.on(engine, "afterUpdate", () => {
      const robotsInBase = base.countRobotsInBase(swarm);
      console.log(`Number of robots in the base: ${robotsInBase}`);

      if (
        searchedObject.requiredNumberOfRobots -
          Object.values(occupiedSides).filter((side) => side.isOccupied).length ===
          0 &&
        this.missionState === MissioState.SEARCHING
      ) {
        console.log("All sides are occupied");
        swarm.robots.forEach((robot) => {
          robot.state = RobotState.PLANNING;
          robot.planningController.setObject(searchedObject);
        });
        this.missionState = MissioState.PLANNING;
      }
    });

    // Function to resume the engine
    const resume = () => {
      Render.run(render);
      Runner.run(engine);
    };

    const stop = () => {
      pause();
      render.canvas.remove();
      render.textures = {};
    };

    const pause = () => {
      Render.stop(render);
      Runner.stop(runner);
    };

    return {
      stop,
      resume,
    };
  }
}
