import { Entity } from "../../../common/entity";
import { MessageType } from "../../../common/interfaces/task";
import { TrustRobot } from "../../../tms/actors/trustRobot";
import { Respose } from "./interface";
import { CommunicationController } from "./comunicationController";

export class RegularCommunicationController extends CommunicationController {
  notifyOtherMembersToMove(sender: TrustRobot, searchedObject: Entity): Respose {
    return this.broadcastMessage(sender, {
      type: MessageType.MOVE_TO_LOCATION,
      payload: { x: searchedObject.getPosition().x, y: searchedObject.getPosition().y, fromLeader: false },
    });
  }
}
