import { Engine } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { Environment } from "../environment/environment";
import { EnvironmentObject } from "../environment/environmentObject";
import { DetectionController } from "../robot/controllers/detectionController";
import { MovementController } from "../robot/controllers/movementController";
import { Robot } from "../robot/robot";
import { RobotBuilder } from "../robot/robotBuilder";
import { RobotSwarm } from "../robot/swarm";

export type SimulationConfig = {
  robots: RobotConfig[];
  environment: Environment;
};

export type RobotConfig = {
  coordinates: Coordinates;
};

export type EnvironmentConfig = {
  goal: EnvironmentObject;
  base: EnvironmentObject;
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
  const environment = new Environment(
    environmentConfig.goal,
    environmentConfig.base,
    environmentConfig.height,
    environmentConfig.width
  );

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
