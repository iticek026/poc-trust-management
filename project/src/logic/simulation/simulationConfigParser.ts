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
import { LeaderRobot } from "../tms/actors/leaderRobot";
import { CollapsibleObject } from "../environment/collapsibleObject";
import { EntityType } from "../common/interfaces/interfaces";
import { TrustRobot } from "../tms/actors/trustRobot";

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

const robotInitProperties = (engine: Engine, environment: Environment, robotConfig: RobotConfig) => {
  return {
    movementController: new MovementController(environment),
    detectionController: new DetectionController(engine),
    coordinates: new Coordinates(robotConfig.coordinates.x, robotConfig.coordinates.y),
  };
};

const createLeaderRobot = (engine: Engine, environment: Environment, robotConfig: RobotConfig) => {
  const properties = robotInitProperties(engine, environment, robotConfig);
  return new LeaderRobot(properties.coordinates, properties.movementController, properties.detectionController);
};

const swarmBuilder = (robotsConfig: RobotConfig[], engine: Engine, environment: Environment): RobotSwarm => {
  const leaderRobot = robotsConfig.find((robot) => robot?.isLeader);
  if (!leaderRobot) {
    throw new Error("Leader robot is required in the configuration");
  }
  const leader = createLeaderRobot(engine, environment, leaderRobot);

  const robots: Robot[] = robotsConfig.map((robot) => {
    const properties = robotInitProperties(engine, environment, robot);
    if (robot?.isLeader) {
      return leader;
    }
    return new TrustRobot(
      properties.coordinates,
      properties.movementController,
      properties.detectionController,
      leader,
    );
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
