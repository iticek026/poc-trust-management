import { EntityCacheInstance } from "../../../../utils/cache";
import { RobotState } from "../../../common/interfaces/interfaces";
import { RegularMessageContent, LeaderMessageContent, Message, MessageResponse } from "../../../common/interfaces/task";
import { Coordinates } from "../../../environment/coordinates";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { Respose, SendingCommunicationControllerInterface } from "./interface";

export abstract class SendingCommunicationController implements SendingCommunicationControllerInterface {
  protected robot: TrustRobot;
  protected robots: TrustRobot[];

  constructor(robot: TrustRobot, robots: TrustRobot[]) {
    this.robot = robot;
    this.robots = robots;
  }

  public broadcastMessage(content: RegularMessageContent | LeaderMessageContent, robotIds?: number[]): Respose {
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

        const response = targetRobot.receiveMessage({
          senderId: this.robot.getId(),
          receiverId: targetRobot.getId(),
          content: content,
        });

        responses.push(response);
      }
    });

    return { responses, targetRobots };
  }

  public sendMessage(receiverId: number, content: RegularMessageContent | LeaderMessageContent): MessageResponse {
    const receiver = EntityCacheInstance.getRobotById(receiverId);
    if (receiver) {
      return receiver.receiveMessage({
        senderId: this.robot.getId(),
        receiverId: receiverId,
        content: content,
      });
    }
  }

  protected handleMoveToLocation(location: Coordinates) {
    this.robot.move(location);
  }

  protected handleChangeBehavior(newBehavior: RobotState) {
    console.log(`Robot ${this.robot.getId()} changing behavior to:`, newBehavior);
    this.robot.updateState(newBehavior);
  }
}
