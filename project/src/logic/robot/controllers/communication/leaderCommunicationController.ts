import { Entity } from "../../../common/entity";
import { MessageType } from "../../../common/interfaces/task";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { Respose } from "./interface";
import { RegularCommunicationController } from "./regularCommunicationController";

export class LeaderCommunicationController extends RegularCommunicationController {
  constructor(robot: TrustRobot, robots: TrustRobot[]) {
    super(robot, robots);
  }

  public notifyOtherMembersToMove(searchedObject: Entity): Respose {
    return this.broadcastMessage({
      type: MessageType.MOVE_TO_LOCATION,
      payload: { x: searchedObject.getPosition().x, y: searchedObject.getPosition().y, fromLeader: true },
    });
  }
}
