import { Entity } from "../../../common/entity";
import { Message, MessageResponse, MessageType, RegularMessageContent } from "../../../common/interfaces/task";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { CommunicationController } from "./comunicationController";
import { Respose } from "./interface";

export class MaliciousCommunicationController extends CommunicationController {
  constructor(robot: TrustRobot, robots: TrustRobot[]) {
    super(robot, robots);
  }

  public broadcastMessage(content: RegularMessageContent, robotIds?: number[]) {
    return super.broadcastMessage(content, robotIds);
  }

  public sendMessage(receiverId: number, content: RegularMessageContent) {
    return super.sendMessage(receiverId, content);
  }

  public receiveMessage(message: Message): MessageResponse {
    return this.executeTask(message);
  }

  public notifyOtherMembersToMove(searchedObject: Entity): Respose {
    return this.broadcastMessage({
      type: MessageType.MOVE_TO_LOCATION,
      payload: { x: searchedObject.getPosition().x, y: searchedObject.getPosition().y, fromLeader: false },
    });
  }

  private executeTask(message: Message): MessageResponse {
    switch (message.content.type) {
      case "MOVE_TO_LOCATION":
        break;
      case "CHANGE_BEHAVIOR":
        this.handleChangeBehavior(message.content.payload);
        break;
      case "REPORT_STATUS":
        return;
      default:
        console.log(`Unknown message type: ${message.content.type}`);
    }
  }
}
