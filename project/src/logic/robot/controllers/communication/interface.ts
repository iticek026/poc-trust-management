import { Vector } from "matter-js";
import { LeaderMessageContent, Message, RegularMessageContent } from "../../../common/interfaces/task";
import { ObjectSide, RobotState } from "../../../common/interfaces/interfaces";
import { Entity } from "../../../common/entity";
import { TrustRobot } from "../../../tms/actors/trustRobot";

export interface CommunicationControllerInterface
  extends SendingCommunicationControllerInterface,
    ReceivingCommunicationControllerInterface {}

export interface SendingCommunicationControllerInterface {
  /**
   * Send a message to the robot
   * @param message
   */
  sendMessage(receiverId: number, content: RegularMessageContent | LeaderMessageContent): TaskResponse;

  /**
   * Broadcast a message to all robots
   * @param content
   */
  broadcastMessage(content: RegularMessageContent | LeaderMessageContent, robotIds?: number[] | Entity[]): Respose;
}

export interface ReceivingCommunicationControllerInterface {
  /**
   * Receive a message from the robot
   * @param robot
   */
  receiveMessage(message: Message): TaskResponse;
}

export type DataReport = {
  id: number;
  data?: Vector | number;
  state?: RobotState;
  assignedSide?: ObjectSide;
};

export type TaskResponse = DataReport | undefined;
export type Respose = { responses: TaskResponse[]; targetRobots: TrustRobot[] };
