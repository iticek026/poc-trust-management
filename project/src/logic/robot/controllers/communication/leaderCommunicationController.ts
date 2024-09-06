import { LeaderMessageContent } from "../../../common/interfaces/task";
import { Robot } from "../../robot";
import { CommunicationController } from "./comunicationController";

export class LeaderCommunicationController extends CommunicationController {
  constructor(robot: Robot, robots: Robot[]) {
    super(robot, robots);
  }

  public broadcastMessage(content: LeaderMessageContent) {
    super.broadcastMessage(content);
  }

  public sendMessage(receiverId: number, content: LeaderMessageContent) {
    super.sendMessage(receiverId, content);
  }
}
