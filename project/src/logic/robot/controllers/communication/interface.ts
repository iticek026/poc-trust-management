import { Vector } from "matter-js";
import { LeaderMessageContent, Message, RegularMessageContent } from "../../../common/interfaces/task";
import { ObjectSide, RobotState } from "../../../common/interfaces/interfaces";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { Entity } from "../../../common/entity";

export interface CommunicationControllerInterface {
  /**
   * Send a message to the robot
   * @param message
   */
  sendMessage(receiverId: number, content: RegularMessageContent | LeaderMessageContent): void;

  /**
   * Receive a message from the robot
   * @param robot
   */
  receiveMessage(message: Message): void;

  /**
   * Broadcast a message to all robots
   * @param content
   */
  broadcastMessage(content: RegularMessageContent | LeaderMessageContent, robotIds?: number[] | Entity[]): void;
}

export type StateReport = {
  id: number;
  position?: Vector;
  state?: RobotState;
  assignedSide?: ObjectSide;
};

export type TaskResponse = StateReport | undefined;
export type Respose = { responses: TaskResponse[]; targetRobots: TrustRobot[] };
