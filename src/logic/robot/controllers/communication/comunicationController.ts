import { LeaderRobot } from "@/logic/tms/actors/leaderRobot";
import { EntityCacheInstance } from "../../../../utils/cache";
import { Entity } from "../../../common/entity";
import { MessageContent, MessageResponse, Message, MessageType } from "../../../common/interfaces/task";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { BaseCommunicationControllerInterface, Respose } from "./interface";
import { isValue } from "@/utils/checks";

export class CommunicationController implements BaseCommunicationControllerInterface {
  private robots: TrustRobot[] = [];
  private leader?: LeaderRobot;

  addRobot(robot: TrustRobot): void {
    this.robots.push(robot);
    if (robot.getRobotType() === "leader") {
      this.leader = robot as LeaderRobot;
    }
  }

  removeRobot(robot: TrustRobot): void {
    this.robots = this.robots.filter((r) => r.getId() !== robot.getId());
  }

  receiveMessage(message: Message, action: (message: Message) => MessageResponse): MessageResponse {
    return action(message);
  }

  unassignLeader() {
    this.leader = undefined;
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

  private getTargetRobots(sender: TrustRobot, robotIds?: number[]) {
    let targetRobots = this.robots.filter((r) => r.getId() !== sender.getId());

    if (isValue(robotIds)) {
      targetRobots = robotIds.map((id) => EntityCacheInstance.getRobotById(id)) as TrustRobot[];
    }

    return targetRobots;
  }

  broadcastMessage(sender: TrustRobot, content: MessageContent, robotIds?: number[]): Respose {
    const targetRobots = this.getTargetRobots(sender, robotIds);

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

  askLeaderToNotifyMembersToMove(sender: TrustRobot, searchedObject: Entity): void {
    if (!this.leader) {
      return;
    }
    const targetRobots = this.getTargetRobots(sender);

    this.leader.sendMostTrustedRobotsToObject(targetRobots, 0.2, searchedObject);
  }

  notifyOtherMembersToMove(sender: TrustRobot, searchedObject: Entity, fromLeader: boolean): Respose {
    return this.broadcastMessage(sender, {
      type: MessageType.LOCALIZATION,
      payload: { x: searchedObject.getPosition().x, y: searchedObject.getPosition().y, fromLeader },
    });
  }
}
