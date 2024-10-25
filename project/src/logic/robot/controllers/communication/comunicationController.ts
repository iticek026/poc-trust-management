import { EntityCacheInstance } from "../../../../utils/cache";
import { Entity } from "../../../common/entity";
import { MessageContent, MessageResponse, Message, MessageType } from "../../../common/interfaces/task";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { BaseCommunicationControllerInterface, Respose } from "./interface";

export class CommunicationController implements BaseCommunicationControllerInterface {
  private robots: TrustRobot[] = [];

  addRobot(robot: TrustRobot): void {
    this.robots.push(robot);
  }

  receiveMessage(message: Message, action: (message: Message) => MessageResponse): MessageResponse {
    return action(message);
  }

  sendMessage(receiverId: number, content: MessageContent, sender: TrustRobot): MessageResponse {
    const receiver = EntityCacheInstance.getRobotById(receiverId);
    if (receiver) {
      return receiver.receiveMessage({
        senderId: sender.getId(),
        receiverId: receiverId,
        content: content,
      });
    }
  }

  broadcastMessage(sender: TrustRobot, content: MessageContent, robotIds?: number[]): Respose {
    let targetRobots = this.robots;

    if (robotIds && robotIds.length > 0) {
      targetRobots = robotIds.map((id) => EntityCacheInstance.getRobotById(id)) as TrustRobot[];
    }

    const responses: MessageResponse[] = [];
    targetRobots.forEach((targetRobot) => {
      if (targetRobot.getId() !== sender.getId()) {
        const response = targetRobot.receiveMessage({
          senderId: sender.getId(),
          receiverId: targetRobot.getId(),
          content: content,
        });

        responses.push(response);
      }
    });

    return { responses, targetRobots };
  }

  notifyOtherMembersToMove(sender: TrustRobot, searchedObject: Entity, fromLeader: boolean): Respose {
    return this.broadcastMessage(sender, {
      type: MessageType.MOVE_TO_LOCATION,
      payload: { x: searchedObject.getPosition().x, y: searchedObject.getPosition().y, fromLeader },
    });
  }
}
