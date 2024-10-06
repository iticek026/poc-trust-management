import { pickProperties } from "../../../../utils/utils";
import { Entity } from "../../../common/entity";
import { LeaderMessageContent, Message, MessageType } from "../../../common/interfaces/task";
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

export class LeaderCommunicationController
  extends SendingCommunicationController
  implements ReceivingCommunicationControllerInterface, CommandsMessagesInterface
{
  constructor(robot: TrustRobot, robots: TrustRobot[]) {
    super(robot, robots);
  }

  public broadcastMessage(content: LeaderMessageContent, robotIds?: number[]) {
    return super.broadcastMessage(content, robotIds);
  }

  public sendMessage(receiverId: number, content: LeaderMessageContent) {
    return super.sendMessage(receiverId, content);
  }

  public receiveMessage(message: Message): TaskResponse {
    return this.executeTask(message);
  }

  public notifyOtherMembersToMove(searchedObject: Entity): Respose {
    return this.broadcastMessage({
      type: MessageType.MOVE_TO_LOCATION,
      payload: { x: searchedObject.getPosition().x, y: searchedObject.getPosition().y, fromLeader: true },
    });
  }

  private executeTask(message: Message) {
    switch (message.content.type) {
      case "MOVE_TO_LOCATION":
        const coordinates = new Coordinates(message.content.payload.x, message.content.payload.y);
        this.handleMoveToLocation(coordinates);
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

  protected reportStatus(properties: (keyof DataReport)[]): DataReport {
    const report = {
      id: this.robot.getId(),
      data: this.robot.getPosition(),
      state: this.robot.getState(),
      assignedSide: this.robot.getAssignedSide(),
    };
    return pickProperties(report, ["id", ...properties]) as DataReport;
  }
}
