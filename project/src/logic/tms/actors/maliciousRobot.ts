import { RandomizerInstance } from "../../../utils/random/randomizer";
import { getRobotIds } from "../../../utils/robotUtils";
import { pickProperties } from "../../../utils/utils";
import { Entity } from "../../common/entity";
import { MessageContent, Message, MessageResponse, MessageType } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import {
  BaseCommunicationControllerInterface,
  DataReport,
  Respose,
} from "../../robot/controllers/communication/interface";
import { DetectionController } from "../../robot/controllers/detectionController";
import { RobotUpdateCycle } from "../../robot/controllers/interfaces";
import { MovementController } from "../../robot/controllers/movementController";
import { PlanningController } from "../../robot/controllers/planningController";
import { Robot } from "../../robot/robot";
import { StateMachineDefinition } from "../../stateMachine/stateMachine";
import { TrustService } from "../trustService";
import { RobotType, TrustManagementRobotInterface } from "./interface";
import { TrustRobot } from "./trustRobot";
import { executeTask, executeTaskMaliciously } from "./taskExecution";
import { EntityCacheInstance } from "../../../utils/cache";
import { Logger } from "../../logger/logger";
import { AuthorityInstance } from "./authority";
import { ObjectSide } from "../../common/interfaces/interfaces";
import { getOppositeAssignedSide } from "../../stateMachine/utils";

export class MaliciousRobot extends TrustRobot implements TrustManagementRobotInterface {
  public falseProvidingInfoThreshold: number;
  constructor(
    label: string,
    position: Coordinates,
    movementControllerFactory: (robot: Robot) => MovementController,
    detectionControllerFactory: (robot: Robot) => DetectionController,
    planningControllerFactory: (robot: Robot) => PlanningController,
    stateMachineDefinition: StateMachineDefinition<MaliciousRobot>,
    communicationController: BaseCommunicationControllerInterface,
    falseProvidingInfoThreshold: number,
  ) {
    super(
      label,
      position,
      movementControllerFactory,
      detectionControllerFactory,
      planningControllerFactory,
      stateMachineDefinition,
      communicationController,
    );
    this.falseProvidingInfoThreshold = falseProvidingInfoThreshold;
  }

  assignTrustService(trustService: TrustService): void {
    this.trustService = trustService;
  }

  getTrustService(): TrustService {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }
    return this.trustService;
  }

  protected create(position: Coordinates) {
    return super.create(position, { render: { fillStyle: "red" } });
  }

  update(args: RobotUpdateCycle): { searchedItem?: Entity; obstacles: Entity[] } {
    const applyArgs = super.updateCircle(this);
    return applyArgs(args);
  }

  sendMessage(receiverId: number, content: MessageContent) {
    return this.communicationController.sendMessage(receiverId, content, this);
  }

  receiveMessage(message: Message) {
    return this.communicationController.receiveMessage(message, this.executeTask.bind(this));
  }

  broadcastMessage(content: MessageContent, robotIds?: number[] | Entity[]): Respose {
    const ids = getRobotIds(robotIds);
    const robots = EntityCacheInstance.retrieveEntitiesByIds(ids);

    Logger.logBroadcast(this, robots as TrustRobot[]);

    const responses = this.communicationController.broadcastMessage(this, content, ids);

    if (content.type === MessageType.REPORT_STATUS) {
      this.reportToAuthorityWrogly(responses.targetRobots);
    }

    return responses;
  }

  getAssignedSide(): ObjectSide {
    const shouldActMaliciously = RandomizerInstance.shouldRandomize(this.falseProvidingInfoThreshold);

    let side: ObjectSide = this.assignedSide as ObjectSide;
    if (shouldActMaliciously) {
      side = getOppositeAssignedSide(this.assignedSide as ObjectSide);
    }

    return side;
  }

  getActualAssignedSide(): ObjectSide {
    return this.assignedSide as ObjectSide;
  }

  private reportToAuthorityWrogly(robots: TrustRobot[]): void {
    robots.forEach((robot) => {
      const reputation = AuthorityInstance.getReputation(robot.getId());
      if (robot.getRobotType() === "malicious") {
        AuthorityInstance.receiveTrustUpdate(this.getId(), robot.getId(), Math.min(reputation + 0.1, 1));
      } else {
        AuthorityInstance.receiveTrustUpdate(this.getId(), robot.getId(), Math.max(reputation - 0.1, 0));
      }
    });
  }

  notifyOtherMembersToMove(searchedObject: Entity): void {
    this.communicationController.notifyOtherMembersToMove(this, searchedObject, false);
  }

  getRobotType(): RobotType {
    return "malicious";
  }

  private executeTask(message: Message): MessageResponse {
    const shouldActMaliciously = RandomizerInstance.shouldRandomize(this.falseProvidingInfoThreshold);

    if (shouldActMaliciously) {
      return executeTaskMaliciously(this, message);
    }
    return executeTask(this, message);
  }

  public reportStatus(properties: (keyof DataReport)[]): DataReport {
    const randomizedPosition = RandomizerInstance.randomizePosition(this.getPosition() as Coordinates, [-200, 200]);
    const report = {
      data: randomizedPosition,
      state: this.getState(),
      assignedSide: this.getActualAssignedSide(),
    };
    return pickProperties(report, [...properties]) as DataReport;
  }
}
