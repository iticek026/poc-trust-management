import { LeaderMessageContent, Message, RegularMessageContent } from "../../../common/interfaces/task";

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
  broadcastMessage(content: RegularMessageContent | LeaderMessageContent): void;
}
