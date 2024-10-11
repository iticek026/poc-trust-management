import { Vector } from "matter-js";
import { pickProperties } from "../../../../utils/utils";
import { Entity } from "../../../common/entity";
import { Message, MessageResponse, MessageType, RegularMessageContent } from "../../../common/interfaces/task";
import { Coordinates } from "../../../environment/coordinates";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { DataReport, Respose } from "./interface";
import { CommunicationController } from "./comunicationController";

export class RegularCommunicationController extends CommunicationController {
  constructor(robot: TrustRobot, robots: TrustRobot[]) {
    super(robot, robots);
  }

  receiveMessage(message: Message): MessageResponse {
    return this.executeTask(message);
  }

  broadcastMessage(content: RegularMessageContent, robotIds?: number[]) {
    return super.broadcastMessage(content, robotIds);
  }

  sendMessage(receiverId: number, content: RegularMessageContent) {
    return super.sendMessage(receiverId, content);
  }

  notifyOtherMembersToMove(searchedObject: Entity): Respose {
    return this.broadcastMessage({
      type: MessageType.MOVE_TO_LOCATION,
      payload: { x: searchedObject.getPosition().x, y: searchedObject.getPosition().y, fromLeader: false },
    });
  }

  protected executeTask(message: Message): MessageResponse {
    switch (message.content.type) {
      case "MOVE_TO_LOCATION":
        const finalDestination = new Coordinates(message.content.payload.x, message.content.payload.y);
        this.handleMoveToLocation(finalDestination);
        break;
      case "CHANGE_BEHAVIOR":
        this.handleChangeBehavior(message.content.payload);
        break;
      case "REPORT_STATUS":
        return {
          id: this.robot.getId(),
          type: MessageType.REPORT_STATUS,
          payload: this.reportStatus(message.content.payload).data as Vector,
        };
      case "LEADER_REPORT_STATUS":
        return {
          id: this.robot.getId(),
          type: MessageType.LEADER_REPORT_STATUS,
          payload: this.reportStatus(message.content.payload),
        };
      default:
        console.log(`Unknown message type: ${message.content.type}`);
    }
  }

  private reportStatus(properties: (keyof DataReport)[]): DataReport {
    const report = {
      data: this.robot.getPosition(),
      state: this.robot.getState(),
      assignedSide: this.robot.getAssignedSide(),
    };
    return pickProperties(report, [...properties]) as DataReport;
  }
}
