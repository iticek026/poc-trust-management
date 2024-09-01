import { RegularMessageContent } from "../../../common/interfaces/task";
import { Robot } from "../../robot";
import { CommunicationController } from "./comunicationController";

export class RegularCommunicationController extends CommunicationController {
  constructor(robot: Robot, robots: Robot[], cache: Map<number, Robot>) {
    super(robot, robots, cache);
  }

  public broadcastMessage(content: RegularMessageContent) {
    super.broadcastMessage(content);
  }

  public sendMessage(receiverId: number, content: RegularMessageContent) {
    super.sendMessage(receiverId, content);
  }
}
