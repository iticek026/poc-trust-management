import { describe, test, expect } from "@jest/globals";
import { TrustService } from "../logic/tms/trustService";
import { Authority } from "../logic/tms/actors/authority";
import { Interaction } from "../logic/common/interaction";
import { RobotBuilder } from "../logic/robot/robotBuilder";
import { TrustRobot } from "../logic/tms/actors/trustRobot";
import simulationConfig from "../mockData/robots";
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

const authority = new Authority();
const environment = environmentBuilder(simulationConfig.environment);
const planningController = new PlanningController(environment.base);

const engine = {} as Engine;

const leader: LeaderRobot = new RobotBuilder({ x: 4, y: 4 })
  .setMovementControllerArgs({ environment })
  .setDetectionControllerArgs({ engine })
  .setPlanningController(planningController)
  .build(LeaderRobot);

const robot = new RobotBuilder({ x: 1, y: 2 }, leader)
  .setMovementControllerArgs({ environment })
  .setDetectionControllerArgs({ engine })
  .setPlanningController(planningController)
  .build(TrustRobot);

const swarm = new RobotSwarm([leader, robot], planningController);
const occupiedSidesHandler = new OccupiedSidesHandler();

const trustService1 = new TrustService(1, authority, null);
const trustService2 = new TrustService(2, authority, null);

describe("Trust", () => {
  test("Add interaction and update trust", () => {
    const missionStateHandler = new MissionStateHandler().create(swarm, occupiedSidesHandler);
    const contextData = createContextData(MessageType.REPORT_STATUS, missionStateHandler.getContextData(), 0.5);

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
