import { Engine } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { Environment } from "../environment/environment";
import { RobotSwarm } from "../robot/swarm";
import { SearchedObject } from "../environment/searchedObject";
import { Base } from "../environment/base";
import { PlanningController } from "../robot/controllers/planningController";
import { LeaderRobot } from "../tms/actors/leaderRobot";
import { CollapsibleObject } from "../environment/collapsibleObject";
import { EntityType } from "../common/interfaces/interfaces";
import { TrustRobot } from "../tms/actors/trustRobot";
import { RobotBuilder } from "../robot/robotBuilder";
import { TrustDataProvider } from "../tms/trustDataProvider";
import { AuthorityInstance } from "../tms/actors/authority";
import { SimulationConfig, EnvironmentConfig, RobotConfig } from "../jsonConfig/parser";
import { calculateRobotsBoundingBox, calculateScalingFactor, mapRobotCoordsToBase } from "../environment/utils";
import { ConstantsInstance } from "../tms/consts";
import { RegularRobot } from "../tms/actors/regularRobot";
import { createRobotStateMachine } from "../stateMachine/robotStateMachine";
import { MaliciousRobot } from "../tms/actors/maliciousRobot";
import { createMaliciousStateMachine } from "../stateMachine/maliciousStateMachine";
import { CommunicationController } from "../robot/controllers/communication/comunicationController";
import { EventEmitter, SimulationEvents } from "../common/eventEmitter";
import { RandomizerInstance } from "../../utils/random/randomizer";
import { isConfigOfLeaderRobot, isConfigOfMaliciousRobot } from "./utils";

export const swarmBuilder = (
  robotsConfig: RobotConfig[],
  engine: Engine,
  environment: Environment,
  trustDataProvider: TrustDataProvider,
): RobotSwarm => {
  const leaderRobot = robotsConfig.find((robot) => isConfigOfLeaderRobot(robot));
  if (!leaderRobot) {
    throw new Error("Leader robot is required in the configuration");
  }

  const eventEmitter = new EventEmitter<SimulationEvents>();
  const planningController = new PlanningController(environment.base);

  const boundingBox = calculateRobotsBoundingBox(robotsConfig.map((robot) => robot.coordinates));
  const scale = calculateScalingFactor(boundingBox, environment.base);

  const newLeaderCoordinates = mapRobotCoordsToBase(leaderRobot.coordinates, environment.base, boundingBox, scale);

  const communicationController = new CommunicationController();
  const swarm = new RobotSwarm(communicationController, planningController, eventEmitter);

  const leader: LeaderRobot = new RobotBuilder(
    leaderRobot.label,
    newLeaderCoordinates,
    trustDataProvider,
    createRobotStateMachine(),
    communicationController,
  )
    .setMovementControllerArgs({ environment })
    .setDetectionControllerArgs({ engine })
    .setPlanningController(planningController)
    .setEventEmitter(eventEmitter)
    .build(LeaderRobot);

  swarm.addRobot(leader);

  robotsConfig.forEach((robot) => {
    let newRobot: TrustRobot;
    if (isConfigOfLeaderRobot(robot)) {
      return;
    }

    const newRobotCoordinates = mapRobotCoordsToBase(robot.coordinates, environment.base, boundingBox, scale);

    if (isConfigOfMaliciousRobot(robot)) {
      newRobot = new RobotBuilder(
        robot.label,
        newRobotCoordinates,
        trustDataProvider,
        createMaliciousStateMachine(),
        communicationController,
      )
        .setMovementControllerArgs({ environment })
        .setDetectionControllerArgs({ engine })
        .setPlanningController(planningController)
        .build(MaliciousRobot);
    } else {
      newRobot = new RobotBuilder(
        robot.label,
        newRobotCoordinates,
        trustDataProvider,
        createRobotStateMachine(),
        communicationController,
        leader,
      )
        .setMovementControllerArgs({ environment })
        .setDetectionControllerArgs({ engine })
        .setPlanningController(planningController)
        .build(RegularRobot);
    }

    swarm.addRobot(newRobot);
  });

  trustDataProvider.addAuthority(AuthorityInstance);
  return swarm;
};

export const environmentBuilder = (environmentConfig: EnvironmentConfig): Environment => {
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

export const simulationCofigParser = (
  simulationConfig: SimulationConfig,
  engine: Engine,
  trustDataProvider: TrustDataProvider,
) => {
  initConstantsInstance(simulationConfig);
  RandomizerInstance.setSeed(simulationConfig.seed);
  const environment = environmentBuilder(simulationConfig.environment);
  const swarm = swarmBuilder(simulationConfig.robots, engine, environment, trustDataProvider);
  AuthorityInstance.setSwarm(swarm);
  return { swarm, environment };
};

function initConstantsInstance(simulationConfig: SimulationConfig) {
  const cellSize =
    parseInt(document.getElementById("environmentCanvas")!.getAttribute("cell-size") ?? `${30}`, 10) || 30;

  ConstantsInstance.setUp({
    ...simulationConfig.trust,
    CELL_SIZE: cellSize,
    ...simulationConfig.authority,
    ...simulationConfig.robotGeneral,
  });
}
