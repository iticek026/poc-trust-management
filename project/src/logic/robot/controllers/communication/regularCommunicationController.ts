import { RegularMessageContent } from "../../../common/interfaces/task";
import { Robot } from "../../robot";
import { CommunicationController } from "./comunicationController";

export class RegularCommunicationController extends CommunicationController {
  constructor(robot: Robot, robots: Robot[]) {
    super(robot, robots);
  }

  public broadcastMessage(content: RegularMessageContent) {
    super.broadcastMessage(content);
  }

  public sendMessage(receiverId: number, content: RegularMessageContent) {
    super.sendMessage(receiverId, content);
  }
}
