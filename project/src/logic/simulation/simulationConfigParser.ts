import { Engine } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { Environment } from "../environment/environment";
import { DetectionController } from "../robot/controllers/detectionController";
import { MovementController } from "../robot/controllers/movementController";
import { Robot } from "../robot/robot";
import { RobotBuilder } from "../robot/robotBuilder";
import { RobotSwarm } from "../robot/swarm";
import { SearchedObject } from "../environment/searchedObject";
import { Base } from "../environment/base";
import { PlanningController } from "../robot/controllers/planningController";

export type SimulationConfig = {
  robots: RobotConfig[];
  environment: EnvironmentConfig;
};

export type RobotConfig = {
  coordinates: Coordinates;
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
  height: number;
  width: number;
};

const swarmBuilder = (robotsConfig: RobotConfig[], engine: Engine, environment: Environment): RobotSwarm => {
  const robots: Robot[] = robotsConfig.map((robot) => {
    return new RobotBuilder()
      .setPosition(new Coordinates(robot.coordinates.x, robot.coordinates.y))
      .addMovementController(new MovementController(environment))
      .addDetectionController(new DetectionController(engine))
      .addPlanningController(new PlanningController(environment.base))
      .build();
  });

  return new RobotSwarm(robots);
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

  const environment = new Environment(searchedObject, base, {
    width: environmentConfig.width,
    height: environmentConfig.height,
  });

  return environment;
};

export const simulationCofigParser = (simulationConfig: SimulationConfig, engine: Engine) => {
  const environment = environmentBuilder(simulationConfig.environment);
  const swarm = swarmBuilder(simulationConfig.robots, engine, environment);
  return { swarm, environment };
};
