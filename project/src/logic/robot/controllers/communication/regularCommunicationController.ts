import { pickProperties } from "../../../../utils/utils";
import { Entity } from "../../../common/entity";
import { Message, MessageType, RegularMessageContent } from "../../../common/interfaces/task";
import { Coordinates } from "../../../environment/coordinates";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { SendingCommunicationController } from "./comunicationController";
import {
  CommandsMessagesInterface,
  DataReport,
  ReceivingCommunicationControllerInterface,
  Respose,
  TaskResponse,
} from "./interface";

export class RegularCommunicationController
  extends SendingCommunicationController
  implements ReceivingCommunicationControllerInterface, CommandsMessagesInterface
{
  constructor(robot: TrustRobot, robots: TrustRobot[]) {
    super(robot, robots);
  }

  receiveMessage(message: Message): TaskResponse {
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

  protected executeTask(message: Message) {
    switch (message.content.type) {
      case "MOVE_TO_LOCATION":
        const finalDestination = new Coordinates(message.content.payload.x, message.content.payload.y);
        this.handleMoveToLocation(finalDestination);
        break;
      case "CHANGE_BEHAVIOR":
        this.handleChangeBehavior(message.content.payload);
        break;
      case "REPORT_STATUS":
        return this.reportStatus(message.content.payload);
      default:
        console.log(`Unknown message type: ${message.content.type}`);
    }
  }

  private reportStatus(properties: (keyof DataReport)[]): DataReport {
    const report = {
      id: this.robot.getId(),
      data: this.robot.getPosition(),
      state: this.robot.getState(),
      assignedSide: this.robot.getAssignedSide(),
    };
    return pickProperties(report, ["id", ...properties]) as DataReport;
  }
}
