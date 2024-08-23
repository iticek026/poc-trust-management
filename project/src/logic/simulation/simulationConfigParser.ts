import { Engine } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { Environment } from "../environment/environment";
import { DetectionController } from "../robot/controllers/detectionController";
import { MovementController } from "../robot/controllers/movementController";
import { Robot } from "../robot/robot";
import { RobotBuilder } from "../robot/robotBuilder";
import { RobotSwarm } from "../robot/swarm";
import { CollapsibleObject } from "../environment/collapsibleObject";
import { SearchedObject } from "../environment/searchedObject";

export type SimulationConfig = {
  robots: RobotConfig[];
  environment: EnvironmentConfig;
};

export type RobotConfig = {
  coordinates: Coordinates;
};

export type EnvironmentObjectConfig = {
  height: number;
  width: number;
  coordinates: Coordinates;
};

export type EnvironmentConfig = {
  searchedObject: EnvironmentObjectConfig;
  base: EnvironmentObjectConfig;
  height: number;
  width: number;
};

const swarmBuilder = (
  robotsConfig: RobotConfig[],
  engine: Engine,
  environment: Environment
): RobotSwarm => {
  const robots: Robot[] = robotsConfig.map((robot) => {
    return new RobotBuilder()
      .setPosition(new Coordinates(robot.coordinates.x, robot.coordinates.y))
      .addMovementController(new MovementController(environment))
      .addDetectionController(new DetectionController(engine))
      .build();
  });

  return new RobotSwarm(robots);
};

const environmentBuilder = (
  environmentConfig: EnvironmentConfig
): Environment => {
  const {
    height: soHeight,
    width: soWidth,
    coordinates: soCoordinates,
  } = environmentConfig.searchedObject;
  const searchedObject = new SearchedObject(
    {
      height: soHeight,
      width: soWidth,
    },
    soCoordinates
  );

  // const {
  //   height: baseHeight,
  //   width: baseWidth,
  //   coordinates: baseCoordinates,
  // } = environmentConfig.base;
  // const base = new CollapsibleObject(
  //   { height: baseHeight, width: baseWidth },
  //   baseCoordinates,
  //   EntityType.BASE // TODO Create separate class for base
  // );

  const environment = new Environment(searchedObject, {} as CollapsibleObject, {
    width: environmentConfig.width,
    height: environmentConfig.height,
  });

  return environment;
};

export const simulationCofigParser = (
  simulationConfig: SimulationConfig,
  engine: Engine
) => {
  const environment = environmentBuilder(simulationConfig.environment);
  const swarm = swarmBuilder(simulationConfig.robots, engine, environment);
  return { swarm, environment };
};
