import { EntityCacheInstance } from "../../../../utils/cache";
import { RegularMessageContent, Message, LeaderMessageContent } from "../../../common/interfaces/task";
import { Robot } from "../../robot";
import { CommunicationControllerInterface } from "./interface";

export abstract class CommunicationController implements CommunicationControllerInterface {
  protected robot: Robot;
  protected robots: Robot[];

  constructor(robot: Robot, robots: Robot[]) {
    this.robot = robot;
    this.robots = robots;
  }

  public broadcastMessage(content: RegularMessageContent | LeaderMessageContent) {
    if (!this.robot.getCommunicationController()) {
      throw new Error("Robot must have a communication controller to broadcast messages");
    }

    this.robots.forEach((targetRobot) => {
      if (targetRobot.getId() !== this.robot.getId()) {
        if (!targetRobot.getCommunicationController()) {
          throw new Error(`Robot ${targetRobot.getId()} does not have communication controller to broadcast messages`);
        }

        targetRobot.getCommunicationController()?.receiveMessage({
          senderId: this.robot.getId(),
          content: content,
        });
      }
    });
  }

  public sendMessage(receiverId: number, content: RegularMessageContent | LeaderMessageContent) {
    const receiver = EntityCacheInstance.getRobotById(receiverId);
    if (receiver) {
      receiver.getCommunicationController()?.receiveMessage({
        senderId: this.robot.getId(),
        receiverId: receiverId,
        content: content,
      });
    }
  }

  public receiveMessage(message: Message) {
    console.log(`Robot ${this.robot.getId()} received message from ${message.senderId}:`, message.content);
    this.robot.executeTask(message);
  }
}
