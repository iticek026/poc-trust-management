import { EntityCacheInstance } from "../../../../utils/cache";
import { pickProperties } from "../../../../utils/utils";
import { RobotState } from "../../../common/interfaces/interfaces";
import { RegularMessageContent, LeaderMessageContent } from "../../../common/interfaces/task";
import { Coordinates } from "../../../environment/coordinates";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { Respose, DataReport, TaskResponse, SendingCommunicationControllerInterface } from "./interface";

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

  protected handleMoveToLocation(location: Coordinates) {
    this.robot.move(location);
  }

  protected handleChangeBehavior(newBehavior: RobotState) {
    console.log(`Robot ${this.robot.getId()} changing behavior to:`, newBehavior);
    this.robot.updateState(newBehavior);
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
