import { LeaderMessageContent } from "../../../common/interfaces/task";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { CommunicationController } from "./comunicationController";

export class LeaderCommunicationController extends CommunicationController {
  constructor(robot: TrustRobot, robots: TrustRobot[]) {
    super(robot, robots);
  }

  public broadcastMessage(content: LeaderMessageContent) {
    super.broadcastMessage(content);
  }

  public sendMessage(receiverId: number, content: LeaderMessageContent) {
    super.sendMessage(receiverId, content);
  }
}
