import { EntityCacheInstance } from "../../../../utils/cache";
import { pickProperties } from "../../../../utils/utils";
import { RobotState } from "../../../common/interfaces/interfaces";
import { RegularMessageContent, Message, LeaderMessageContent } from "../../../common/interfaces/task";
import { Coordinates } from "../../../environment/coordinates";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { CommunicationControllerInterface, Respose, StateReport, TaskResponse } from "./interface";

export abstract class CommunicationController implements CommunicationControllerInterface {
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

    const responses: TaskResponse[] = [];
    targetRobots.forEach((targetRobot) => {
      if (targetRobot.getId() !== this.robot.getId()) {
        if (!targetRobot.getCommunicationController()) {
          throw new Error(`Robot ${targetRobot.getId()} does not have communication controller to broadcast messages`);
        }

        const response = targetRobot.receiveMessage({
          senderId: this.robot.getId(),
          content: content,
        });

        responses.push(response);
      }
    });

    return { responses, targetRobots };
  }

  public sendMessage(receiverId: number, content: RegularMessageContent | LeaderMessageContent) {
    const receiver = EntityCacheInstance.getRobotById(receiverId);
    if (receiver) {
      return receiver.receiveMessage({
        senderId: this.robot.getId(),
        receiverId: receiverId,
        content: content,
      });
    }
  }

  public receiveMessage(message: Message): TaskResponse {
    console.log(`Robot ${this.robot.getId()} received message from ${message.senderId}:`, message.content);
    return this.executeTask(message);
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

  private handleMoveToLocation(location: Coordinates) {
    console.log(`Robot ${this.robot.getId()} moving to location:`, location);
    this.robot.move(location);
  }

  private handleChangeBehavior(newBehavior: RobotState) {
    console.log(`Robot ${this.robot.getId()} changing behavior to:`, newBehavior);
    this.robot.updateState(newBehavior);
  }

  private reportStatus(properties: (keyof StateReport)[]): StateReport {
    const report = {
      id: this.robot.getId(),
      position: this.robot.getPosition(),
      state: this.robot.getState(),
      assignedSide: this.robot.getAssignedSide(),
    };
    return pickProperties(report, ["id", ...properties]) as StateReport;
  }
}
