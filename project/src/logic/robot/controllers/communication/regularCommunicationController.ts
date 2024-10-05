import { Entity } from "../../../common/entity";
import { Message, MessageType, RegularMessageContent } from "../../../common/interfaces/task";
import { Coordinates } from "../../../environment/coordinates";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { SendingCommunicationController } from "./comunicationController";
import {
  CommandsMessagesInterface,
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

  public notifyOtherMembersToMove(searchedObject: Entity): Respose {
    return this.broadcastMessage({
      type: MessageType.MOVE_TO_LOCATION,
      payload: { x: searchedObject.getPosition().x, y: searchedObject.getPosition().y, fromLeader: false },
    });
  }

  private executeTask(message: Message) {
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
}
