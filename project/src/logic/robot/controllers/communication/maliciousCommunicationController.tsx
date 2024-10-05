import { Message, RegularMessageContent } from "../../../common/interfaces/task";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { SendingCommunicationController } from "./comunicationController";
import { ReceivingCommunicationControllerInterface, TaskResponse } from "./interface";

export class MaliciousCommunicationController
  extends SendingCommunicationController
  implements ReceivingCommunicationControllerInterface
{
  constructor(robot: TrustRobot, robots: TrustRobot[]) {
    super(robot, robots);
  }

  public broadcastMessage(content: RegularMessageContent, robotIds?: number[]) {
    return super.broadcastMessage(content, robotIds);
  }

  public sendMessage(receiverId: number, content: RegularMessageContent) {
    return super.sendMessage(receiverId, content);
  }

  public receiveMessage(message: Message): TaskResponse {
    return this.executeTask(message);
  }

  private executeTask(message: Message): TaskResponse {
    // TODO

    return {} as TaskResponse;
  }
}
