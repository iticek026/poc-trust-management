import { RegularMessageContent } from "../../../common/interfaces/task";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { CommunicationController } from "./comunicationController";

export class RegularCommunicationController extends CommunicationController {
  constructor(robot: TrustRobot, robots: TrustRobot[]) {
    super(robot, robots);
  }

  public broadcastMessage(content: RegularMessageContent) {
    super.broadcastMessage(content);
  }

  public sendMessage(receiverId: number, content: RegularMessageContent) {
    super.sendMessage(receiverId, content);
  }
}
