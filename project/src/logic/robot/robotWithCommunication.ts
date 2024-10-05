import { Entity } from "../common/entity";
import { LeaderMessageContent, Message, RegularMessageContent } from "../common/interfaces/task";
import { CommunicationControllerInterface, Respose, TaskResponse } from "./controllers/communication/interface";
import { CommunicationInterface } from "./interface";
import { Robot } from "./robot";

export abstract class RobotWithCommunication extends Robot implements CommunicationInterface {
  protected communicationController?: CommunicationControllerInterface;

  sendMessage(receiverId: number, content: RegularMessageContent | LeaderMessageContent): TaskResponse {
    return this.communicationController?.sendMessage(receiverId, content);
  }

  broadcastMessage(content: RegularMessageContent | LeaderMessageContent, robotIds?: number[] | Entity[]): Respose {
    return this.communicationController!.broadcastMessage(content, robotIds);
  }

  receiveMessage(message: Message): TaskResponse {
    return this.communicationController?.receiveMessage(message);
  }

  notifyOtherMembersToMove(searchedObject: Entity): Respose {
    if (!this.communicationController) {
      throw new Error("Communication controller not set");
    }
    return this.communicationController?.notifyOtherMembersToMove(searchedObject);
  }

  getCommunicationController(): CommunicationControllerInterface | undefined {
    return this.communicationController;
  }

  setCommunicationController(communicationController: CommunicationControllerInterface): void {
    this.communicationController = communicationController;
  }

  abstract assignCommunicationController(robots: Robot[]): void;
}
