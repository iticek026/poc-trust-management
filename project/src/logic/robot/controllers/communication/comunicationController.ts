import { EntityCacheInstance } from "../../../../utils/cache";
import { Entity } from "../../../common/entity";
import { RobotState } from "../../../common/interfaces/interfaces";
import {
  RegularMessageContent,
  LeaderMessageContent,
  MessageResponse,
  Message,
  MessageType,
} from "../../../common/interfaces/task";
import { Coordinates } from "../../../environment/coordinates";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { BaseCommunicationControllerInterface, Respose } from "./interface";

export abstract class CommunicationController implements BaseCommunicationControllerInterface {
  protected robot: TrustRobot;
  protected robots: TrustRobot[];

  constructor(robot: TrustRobot, robots: TrustRobot[]) {
    this.robot = robot;
    this.robots = robots;
  }

  receiveMessage(message: Message, action: (message: Message) => MessageResponse): MessageResponse {
    return action(message);
  }

  sendMessage(receiverId: number, content: RegularMessageContent | LeaderMessageContent): MessageResponse {
    const receiver = EntityCacheInstance.getRobotById(receiverId);
    if (receiver) {
      return receiver.getCommunicationController()?.receiveMessage({
        senderId: this.robot.getId(),
        receiverId: receiverId,
        content: content,
      });
    }
  }

  broadcastMessage(content: RegularMessageContent | LeaderMessageContent, robotIds?: number[]): Respose {
    if (!this.robot.getCommunicationController()) {
      throw new Error("Robot must have a communication controller to broadcast messages");
    }

    let targetRobots = this.robots;

    if (robotIds && robotIds.length > 0) {
      targetRobots = robotIds.map((id) => EntityCacheInstance.getRobotById(id)) as TrustRobot[];
    }

    const responses: MessageResponse[] = [];
    targetRobots.forEach((targetRobot) => {
      if (targetRobot.getId() !== this.robot.getId()) {
        if (!targetRobot.getCommunicationController()) {
          throw new Error(`Robot ${targetRobot.getId()} does not have communication controller to broadcast messages`);
        }

        const response = targetRobot.getCommunicationController()?.receiveMessage({
          senderId: this.robot.getId(),
          receiverId: targetRobot.getId(),
          content: content,
        });

        responses.push(response);
      }
    });

    return { responses, targetRobots };
  }

  notifyOtherMembersToMove(searchedObject: Entity, fromLeader: boolean): Respose {
    return this.broadcastMessage({
      type: MessageType.MOVE_TO_LOCATION,
      payload: { x: searchedObject.getPosition().x, y: searchedObject.getPosition().y, fromLeader },
    });
  }

  handleMoveToLocation(location: Coordinates) {
    this.robot.move(location);
  }

  handleChangeBehavior(newBehavior: RobotState) {
    this.robot.updateState(newBehavior);
  }
}
