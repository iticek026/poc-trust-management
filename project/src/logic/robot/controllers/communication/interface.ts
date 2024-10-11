import { Vector } from "matter-js";
import { LeaderMessageContent, Message, MessageResponse, RegularMessageContent } from "../../../common/interfaces/task";
import { ObjectSide, RobotState } from "../../../common/interfaces/interfaces";
import { Entity } from "../../../common/entity";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { Coordinates } from "../../../environment/coordinates";

export interface BaseCommunicationControllerInterface
  extends SendingCommunicationControllerInterface,
    ReceivingCommunicationControllerInterface,
    CommandsMessagesInterface,
    ActionsInterface {}

export interface ConcreateCommunicationControllerInterface
  extends Omit<BaseCommunicationControllerInterface, "receiveMessage" | "notifyOtherMembersToMove"> {
  receiveMessage(message: Message): MessageResponse;
  notifyOtherMembersToMove(searchedObject: Entity): Respose;
}

export interface SendingCommunicationControllerInterface {
  /**
   * Send a message to the robot
   * @param message
   */
  sendMessage(receiverId: number, content: RegularMessageContent | LeaderMessageContent): MessageResponse;

  /**
   * Broadcast a message to all robots
   * @param content
   */
  broadcastMessage(content: RegularMessageContent | LeaderMessageContent, robotIds?: number[] | Entity[]): Respose;
}

export interface CommandsMessagesInterface {
  /**
   * Notifies other robots in the swarm about the location or state of a searched object.
   * This is typically used when a robot finds an object and informs others of its discovery.
   *
   * @param searchedObject - The object that the robot has found.
   */
  notifyOtherMembersToMove(searchedObject: Entity, fromLeader: boolean): Respose;
}

export interface ReceivingCommunicationControllerInterface {
  /**
   * Receive a message from the robot
   * @param robot
   */
  receiveMessage(message: Message, action: (message: Message) => MessageResponse): MessageResponse;
}

interface ActionsInterface {
  handleMoveToLocation(location: Coordinates): void;

  handleChangeBehavior(newBehavior: RobotState): void;
}

export type DataReport = {
  data?: Vector | number;
  state?: RobotState;
  assignedSide?: ObjectSide;
};

export type Respose = { responses: MessageResponse[]; targetRobots: TrustRobot[] };
