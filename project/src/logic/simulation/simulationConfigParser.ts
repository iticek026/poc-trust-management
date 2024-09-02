import { Engine } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { Environment } from "../environment/environment";
import { DetectionController } from "../robot/controllers/detectionController";
import { MovementController } from "../robot/controllers/movementController";
import { Robot } from "../robot/robot";
import { RobotSwarm } from "../robot/swarm";
import { SearchedObject } from "../environment/searchedObject";
import { Base } from "../environment/base";
import { PlanningController } from "../robot/controllers/planningController";
import { RegularRobot } from "../robot/regularRobot";
import { LeaderRobot } from "../robot/leaderRobot";
import { CollapsibleObject } from "../environment/collapsibleObject";
import { EntityType } from "../common/interfaces/interfaces";

export type SimulationConfig = {
  robots: RobotConfig[];
  environment: EnvironmentConfig;
};

export type RobotConfig = {
  coordinates: CoordinatesConfig;
  isLeader?: boolean;
};

export type CoordinatesConfig = {
  x: number;
  y: number;
};

export type EnvironmentObjectConfig = {
  height: number;
  width: number;
  coordinates: CoordinatesConfig;
};

export type EnvironmentConfig = {
  searchedObject: EnvironmentObjectConfig;
  base: EnvironmentObjectConfig;
  obstacles?: EnvironmentObjectConfig[];
  height: number;
  width: number;
};

const swarmBuilder = (robotsConfig: RobotConfig[], engine: Engine, environment: Environment): RobotSwarm => {
  const robots: Robot[] = robotsConfig.map((robot) => {
    const coordinates = new Coordinates(robot.coordinates.x, robot.coordinates.y);
    const movementController = new MovementController(environment);
    const detectionController = new DetectionController(engine);
    if (robot?.isLeader) {
      return new LeaderRobot(coordinates, movementController, detectionController);
    }
    return new RegularRobot(coordinates, movementController, detectionController);
  });

  return new RobotSwarm(robots, new PlanningController(environment.base));
};

const environmentBuilder = (environmentConfig: EnvironmentConfig): Environment => {
  const { height: soHeight, width: soWidth, coordinates: soCoordinates } = environmentConfig.searchedObject;
  const searchedObject = new SearchedObject(
    {
      height: soHeight,
      width: soWidth,
    },
    new Coordinates(soCoordinates.x, soCoordinates.y),
  );

  const { height: baseHeight, width: baseWidth, coordinates: baseCoordinates } = environmentConfig.base;
  const base = new Base(
    { height: baseHeight, width: baseWidth },
    new Coordinates(baseCoordinates.x, baseCoordinates.y),
  );

  const obstacles = environmentConfig.obstacles?.map((obstacle) => {
    const { height, width, coordinates } = obstacle;
    return new CollapsibleObject(
      {
        height,
        width,
      },
      new Coordinates(coordinates.x, coordinates.y),
      EntityType.OBSTACLE,
      { isStatic: true },
    );
  });

  const environment = new Environment(
    searchedObject,
    base,
    {
      width: environmentConfig.width,
      height: environmentConfig.height,
    },
    obstacles,
  );

  return environment;
};

export const simulationCofigParser = (simulationConfig: SimulationConfig, engine: Engine) => {
  const environment = environmentBuilder(simulationConfig.environment);
  const swarm = swarmBuilder(simulationConfig.robots, engine, environment);
  return { swarm, environment };
};
