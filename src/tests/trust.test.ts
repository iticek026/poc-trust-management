import { describe, test, expect } from "@jest/globals";
import { TrustService } from "../logic/tms/trustService";
import { Authority } from "../logic/tms/actors/authority";
import { Interaction } from "../logic/common/interaction";
import { RobotBuilder } from "../logic/robot/robotBuilder";
import { environmentBuilder } from "../logic/simulation/simulationConfigParser";
import { LeaderRobot } from "../logic/tms/actors/leaderRobot";
import { PlanningController } from "../logic/robot/controllers/planningController";
import { ContextInformation } from "../logic/tms/trust/contextInformation";
import { Message, MessageType } from "../logic/common/interfaces/task";
import { createContextData } from "../utils/utils";
import { MissionStateHandler } from "../logic/simulation/missionStateHandler";
import { Engine } from "matter-js";
import { RobotSwarm } from "../logic/robot/swarm";
import { OccupiedSidesHandler } from "../logic/simulation/occupiedSidesHandler";
import { TrustDataProvider } from "../logic/tms/trustDataProvider";
import { erosion, resolveUncheckedMessaged } from "../logic/tms/trust/utils";

const DefaultSimulationConfig = require("../logic/jsonConfig/default.json");
import { RegularRobot } from "../logic/tms/actors/regularRobot";
import { EntityCacheInstance } from "../utils/cache";

import "./mocks/constants";
import { TestMissionState } from "./mocks/missionState";
import { Entity } from "../logic/common/entity";
import { CommunicationController } from "../logic/robot/controllers/communication/comunicationController";
import { ConstantsInstance } from "../logic/tms/consts";
import { EventEmitter, SimulationEvents } from "../logic/common/eventEmitter";

function setUp() {
  const authority = new Authority();
  const environment = environmentBuilder(DefaultSimulationConfig.environment);
  const planningController = new PlanningController(environment.base);

  const engine = {} as Engine;

  const trustDataProvider = new TrustDataProvider();
  const communicationController = new CommunicationController();
  const swarm = new RobotSwarm(communicationController, planningController, {} as any);
  const eventEmitter = new EventEmitter<SimulationEvents>();

  ConstantsInstance.setUp({
    ...DefaultSimulationConfig.trust,
    CELL_SIZE: 30,
    ...DefaultSimulationConfig.authority,
    ...DefaultSimulationConfig.robotGeneral,
  });

  const leader: LeaderRobot = new RobotBuilder(
    "robot1",
    { x: 1, y: 2 },
    trustDataProvider,
    {} as any,
    communicationController,
  )
    .setMovementControllerArgs({ environment })
    .setDetectionControllerArgs({ engine })
    .setPlanningController(planningController)
    .setEventEmitter(eventEmitter)
    .build(LeaderRobot);

  const robot = new RobotBuilder(
    "robot2",
    { x: 1, y: 2 },
    trustDataProvider,
    {} as any,
    communicationController,
    leader,
  )
    .setMovementControllerArgs({ environment })
    .setDetectionControllerArgs({ engine })
    .setPlanningController(planningController)
    .build(RegularRobot);

  swarm.addRobot(leader);
  swarm.addRobot(robot);

  const occupiedSidesHandler = swarm.occupiedSidesHandler;

  EntityCacheInstance.createCache([leader, robot], "robots");

  return { authority, leader, robot, swarm, occupiedSidesHandler };
}

describe("Trust", () => {
  let authority: Authority;
  let leader: LeaderRobot;
  let swarm: RobotSwarm;
  let occupiedSidesHandler: OccupiedSidesHandler;

  beforeEach(() => {
    const seutup = setUp();
    authority = seutup.authority;
    leader = seutup.leader;
    swarm = seutup.swarm;
    occupiedSidesHandler = seutup.occupiedSidesHandler;
  });

  describe("Add interaction and update trust", () => {
    test("Add interaction and update trust - outcome true", () => {
      const trustService1 = new TrustService(leader, authority, null);

      const missionStateHandler = new MissionStateHandler().create(swarm, occupiedSidesHandler);
      const contextData = createContextData(
        { type: MessageType.REPORT_STATUS, payload: ["data"] },
        missionStateHandler.getContextData(),
        0.5,
      );

      const interaction = new Interaction({
        fromRobotId: 1,
        toRobotId: 2,
        outcome: true,
        context: new ContextInformation(contextData),
        receivedValue: { x: 3, y: 5 },
        expectedValue: { x: 1, y: 2 },
      });
      trustService1.addInteractionAndUpdateTrust(interaction);

      const trustRecord = trustService1.getTrustRecord(2);
      expect(trustRecord?.trustScore).toBeGreaterThan(0.5);
    });
  });

  test("Add interaction and update trust - outcome true, not accure data", () => {
    const trustService1 = new TrustService(leader, authority, null);

    const missionStateHandler = new MissionStateHandler().create(swarm, occupiedSidesHandler);
    const contextData = createContextData(
      { type: MessageType.REPORT_STATUS, payload: ["data"] },
      missionStateHandler.getContextData(),
      0.5,
    );

    const interaction = new Interaction({
      fromRobotId: 1,
      toRobotId: 2,
      outcome: true,
      context: new ContextInformation(contextData),
      receivedValue: { x: 1, y: 2 },
      expectedValue: { x: 100, y: 200 },
    });
    trustService1.addInteractionAndUpdateTrust(interaction);

    const trustRecord = trustService1.getTrustRecord(2);
    expect(trustRecord?.trustScore).toBeLessThan(0.5);
  });

  test("Add interaction and update trust - outcome true, not accure data, multiple interactions", () => {
    const trustService1 = new TrustService(leader, authority, null);

    const missionStateHandler = new MissionStateHandler().create(swarm, occupiedSidesHandler);
    const contextData = createContextData(
      { type: MessageType.REPORT_STATUS, payload: ["data"] },
      missionStateHandler.getContextData(),
      0.5,
    );

    const interaction = new Interaction({
      fromRobotId: 1,
      toRobotId: 2,
      outcome: true,
      context: new ContextInformation(contextData),
      receivedValue: { x: 1, y: 2 },
      expectedValue: { x: 100, y: 200 },
    });
    trustService1.addInteractionAndUpdateTrust(interaction);

    const trustScore1 = trustService1.getTrustRecord(2)?.trustScore as number;
    expect(trustScore1).toBeLessThan(0.5);

    trustService1.addInteractionAndUpdateTrust(interaction);
    const trustScore2 = trustService1.getTrustRecord(2)?.trustScore as number;
    expect(trustScore2).toBeLessThan(trustScore1);
  });

  test("Add interaction and update trust - outcome false", () => {
    const trustService1 = new TrustService(leader, authority, null);

    const missionStateHandler = new MissionStateHandler().create(swarm, occupiedSidesHandler);
    const contextData = createContextData(
      { type: MessageType.REPORT_STATUS, payload: ["data"] },
      missionStateHandler.getContextData(),
      0.5,
    );

    const interaction = new Interaction({
      fromRobotId: 1,
      toRobotId: 2,
      outcome: false,
      context: new ContextInformation(contextData),
      receivedValue: undefined,
      expectedValue: { x: 1, y: 2 },
    });
    trustService1.addInteractionAndUpdateTrust(interaction);

    const trustRecord = trustService1.getTrustRecord(2);
    expect(trustRecord?.trustScore).toBeLessThan(0.5);
  });

  describe("Erosion", () => {
    test("Full trust", () => {
      const erosedTrustScore = erosion(1, 7);
      expect(erosedTrustScore).toBeLessThan(1);
    });

    test("Stay same trust", () => {
      const erosedTrustScore = erosion(0.5, 10);
      expect(erosedTrustScore).toBe(0.5);
    });

    test("Recover trust", () => {
      const erosedTrustScore = erosion(0.2, 7);
      expect(erosedTrustScore).toBeGreaterThan(0.2);
    });

    test("Full trust", () => {
      const erosedTrustScore = erosion(1, 7);
      const longTimeErodsion = erosion(1, 100);
      expect(longTimeErodsion).toBeLessThan(erosedTrustScore);
    });

    test("Extreme long duration trust change", () => {
      const timeErodsion = erosion(1, 100000);
      expect(timeErodsion).toBeGreaterThan(0);
      expect(timeErodsion).toBeLessThan(1);
    });
  });

  describe("resolveUncheckedMessaged", () => {
    test("No messages", () => {
      const messages: Message[] = [];
      const searchedItem = undefined;

      const missionStateHandler = new MissionStateHandler().create(swarm, occupiedSidesHandler);
      const contextData = createContextData(
        { type: MessageType.REPORT_STATUS, payload: ["data"] },
        missionStateHandler.getContextData(),
        0.5,
      );

      const interaction = new Interaction({
        fromRobotId: 1,
        toRobotId: 2,
        outcome: true,
        context: new ContextInformation(contextData),
      });

      leader.getTrustService().addInteractionAndUpdateTrust(interaction);
      const prevTrustLevel = leader.getTrustService().getTrustRecord(2)?.trustScore;

      const resolvedMessages = resolveUncheckedMessaged(messages, leader, searchedItem).filter((m) => m.resolved);
      expect(resolvedMessages.length).toBe(0);

      const trustScore = leader.getTrustService().getTrustRecord(2)?.trustScore;

      expect(trustScore).toBe(prevTrustLevel);
    });

    test("One message - searched item not found", () => {
      const messages: Message[] = [
        {
          content: { type: MessageType.MOVE_TO_LOCATION, payload: { x: 1, y: 2, fromLeader: false } },
          senderId: 1,
          receiverId: 2,
        },
      ];

      const searchedItem = undefined;

      const missionStateHandler = TestMissionState.create(swarm, occupiedSidesHandler);
      const contextData = createContextData(
        { type: MessageType.MOVE_TO_LOCATION, payload: { x: 1, y: 2, fromLeader: false } },
        missionStateHandler.getContextData(),
        0.5,
      );

      const interaction = new Interaction({
        fromRobotId: 1,
        toRobotId: 2,
        outcome: true,
        context: new ContextInformation(contextData),
      });

      leader.getTrustService().addInteractionAndUpdateTrust(interaction);
      const prevTrustLevel = leader.getTrustService().getTrustRecord(2)?.trustScore;

      const resolvedMessages = resolveUncheckedMessaged(messages, leader, searchedItem).filter((m) => m.resolved);
      expect(resolvedMessages.length).toBe(1);

      const trustScore = leader.getTrustService().getTrustRecord(2)?.trustScore;

      expect(trustScore!).toBeLessThan(prevTrustLevel!);
    });

    test("One message - searched item found", () => {
      const messages: Message[] = [
        {
          content: { type: MessageType.MOVE_TO_LOCATION, payload: { x: 1, y: 2, fromLeader: false } },
          senderId: 1,
          receiverId: 2,
        },
      ];

      const searchedItem = { getPosition: () => ({ x: 1, y: 2 }) } as Entity;

      const missionStateHandler = TestMissionState.create(swarm, occupiedSidesHandler);
      const contextData = createContextData(
        { type: MessageType.MOVE_TO_LOCATION, payload: { x: 1, y: 2, fromLeader: false } },
        missionStateHandler.getContextData(),
        0.5,
      );

      const interaction = new Interaction({
        fromRobotId: 1,
        toRobotId: 2,
        outcome: true,
        context: new ContextInformation(contextData),
      });

      leader.getTrustService().addInteractionAndUpdateTrust(interaction);
      const prevTrustLevel = leader.getTrustService().getTrustRecord(2)?.trustScore;

      const resolvedMessages = resolveUncheckedMessaged(messages, leader, searchedItem).filter((m) => m.resolved);
      expect(resolvedMessages.length).toBe(1);

      const trustScore = leader.getTrustService().getTrustRecord(2)?.trustScore;

      expect(trustScore!).toBeGreaterThan(prevTrustLevel!);
    });
  });
});
