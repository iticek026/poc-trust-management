import { RegularMessageContent } from "../../../common/interfaces/task";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { CommunicationController } from "./comunicationController";

export class RegularCommunicationController extends CommunicationController {
  constructor(robot: TrustRobot, robots: TrustRobot[]) {
    super(robot, robots);
  }

  public broadcastMessage(content: RegularMessageContent, robotIds?: number[]) {
    return super.broadcastMessage(content, robotIds);
  }

  public sendMessage(receiverId: number, content: RegularMessageContent) {
    return super.sendMessage(receiverId, content);
  }
}
