import { Vector } from "matter-js";
import { Message, MessageResponse, MessageContent } from "../../../common/interfaces/task";
import { ObjectSide, RobotState } from "../../../common/interfaces/interfaces";
import { Entity } from "../../../common/entity";
import { TrustRobot } from "../../../tms/actors/trustRobot";

export interface BaseCommunicationControllerInterface
  extends SendingCommunicationControllerInterface,
    ReceivingCommunicationControllerInterface,
    CommandsMessagesInterface {
  addRobot(robot: TrustRobot): void;
}

export interface SendingCommunicationControllerInterface {
  /**
   * Send a message to the robot
   * @param message
   */
  sendMessage(receiverId: number, content: MessageContent, sender: TrustRobot): MessageResponse;

  /**
   * Broadcast a message to all robots
   * @param content
   */
  broadcastMessage(sender: TrustRobot, content: MessageContent, robotIds?: number[] | Entity[]): Respose;

  askLeaderToNotifyMembersToMove(sender: TrustRobot, searchedObject: Entity): void;
}

export interface CommandsMessagesInterface {
  /**
   * Notifies other robots in the swarm about the location or state of a searched object.
   * This is typically used when a robot finds an object and informs others of its discovery.
   *
   * @param searchedObject - The object that the robot has found.
   */
  notifyOtherMembersToMove(sender: TrustRobot, searchedObject: Entity, fromLeader: boolean): Respose;
}

export interface ReceivingCommunicationControllerInterface {
  /**
   * Receive a message from the robot
   * @param robot
   */
  receiveMessage(message: Message, action: (message: Message) => MessageResponse): MessageResponse;
}

export type DataReport = {
  data?: Vector | number;
  state?: RobotState;
  assignedSide?: ObjectSide;
};

export type Respose = { responses: MessageResponse[]; targetRobots: TrustRobot[] };
