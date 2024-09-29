import { describe, test, expect } from "@jest/globals";
import { TrustService } from "../logic/tms/trustService";
import { Authority } from "../logic/tms/actors/authority";
import { Interaction } from "../logic/common/interaction";
import { RobotBuilder } from "../logic/robot/robotBuilder";
import { TrustRobot } from "../logic/tms/actors/trustRobot";
import { environmentBuilder } from "../logic/simulation/simulationConfigParser";
import { LeaderRobot } from "../logic/tms/actors/leaderRobot";
import { PlanningController } from "../logic/robot/controllers/planningController";
import { ContextInformation } from "../logic/tms/trust/contextInformation";
import { MessageType } from "../logic/common/interfaces/task";
import { createContextData } from "../utils/utils";
import { MissionStateHandler } from "../logic/simulation/missionStateHandler";
import { Engine } from "matter-js";
import { RobotSwarm } from "../logic/robot/swarm";
import { OccupiedSidesHandler } from "../logic/simulation/occupiedSidesHandler";
import { TrustDataProvider } from "../logic/tms/trustDataProvider";
import { erosion } from "../logic/tms/trust/utils";
import DefaultSimulationConfig from "../logic/jsonConfig/default.json";

const authority = new Authority();
const environment = environmentBuilder(DefaultSimulationConfig.environment);
const planningController = new PlanningController(environment.base);

const engine = {} as Engine;

const trustDataProvider = new TrustDataProvider();

const leader: LeaderRobot = new RobotBuilder("robot1", { x: 4, y: 4 }, trustDataProvider)
  .setMovementControllerArgs({ environment })
  .setDetectionControllerArgs({ engine })
  .setPlanningController(planningController)
  .build(LeaderRobot);

const robot = new RobotBuilder("robot1", { x: 1, y: 2 }, trustDataProvider, leader)
  .setMovementControllerArgs({ environment })
  .setDetectionControllerArgs({ engine })
  .setPlanningController(planningController)
  .build(TrustRobot);

const swarm = new RobotSwarm([leader, robot], planningController);
const occupiedSidesHandler = new OccupiedSidesHandler();

const trustService2 = new TrustService(robot, authority, null);

describe("Trust", () => {
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
      expect(trustRecord?.currentTrustLevel).toBeGreaterThan(0.5);
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
    expect(trustRecord?.currentTrustLevel).toBeLessThan(0.5);
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

    const currentTrustLevel1 = trustService1.getTrustRecord(2)?.currentTrustLevel as number;
    expect(currentTrustLevel1).toBeLessThan(0.5);

    trustService1.addInteractionAndUpdateTrust(interaction);
    const currentTrustLevel2 = trustService1.getTrustRecord(2)?.currentTrustLevel as number;
    expect(currentTrustLevel2).toBeLessThan(currentTrustLevel1);
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
    expect(trustRecord?.currentTrustLevel).toBeLessThan(0.5);
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
});
