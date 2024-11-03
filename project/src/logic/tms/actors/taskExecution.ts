import { Vector } from "matter-js";
import { Message, MessageResponse, MessageType } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import { TrustRobot } from "./trustRobot";

export function executeTask(trustRobot: TrustRobot, message: Message): MessageResponse {
  const id = trustRobot.getId();
  switch (message.content.type) {
    case "MOVE_TO_LOCATION":
      const finalDestination = new Coordinates(message.content.payload.x, message.content.payload.y);
      trustRobot.move(finalDestination);
      return {
        id,
        type: MessageType.MOVE_TO_LOCATION,
        payload: message.content.payload,
      };
    case "CHANGE_BEHAVIOR":
      trustRobot.updateState(message.content.payload);
      return {
        id,
        type: MessageType.CHANGE_BEHAVIOR,
        payload: message.content.payload,
      };
    case "REPORT_STATUS":
      return {
        id,
        type: MessageType.REPORT_STATUS,
        payload: trustRobot.reportStatus(message.content.payload).data as Vector,
      };
    case "ALREADY_OCCUPIED":
      trustRobot.move(trustRobot.getMovementController().randomDestination());
      return {
        id,
        type: MessageType.ALREADY_OCCUPIED,
        payload: undefined,
      };
    case "LOCALIZATION":
      trustRobot.move(new Coordinates(message.content.payload.x, message.content.payload.y));
      return {
        id,
        type: MessageType.LOCALIZATION,
        payload: message.content.payload,
      };
    default:
      console.log(`Unknown message type: ${message.content.type}`);
  }
}

export function executeTaskMaliciously(trustRobot: TrustRobot, message: Message): MessageResponse {
  const id = trustRobot.getId();

  switch (message.content.type) {
    case "MOVE_TO_LOCATION":
      break;
    case "CHANGE_BEHAVIOR":
      trustRobot.updateState(message.content.payload);
      break;
    case "LOCALIZATION":
      trustRobot.move(new Coordinates(message.content.payload.x, message.content.payload.y));
      return {
        id,
        type: MessageType.LOCALIZATION,
        payload: message.content.payload,
      };
    case "REPORT_STATUS":
      return {
        id,
        type: MessageType.REPORT_STATUS,
        payload: trustRobot.reportStatus(message.content.payload).data as Vector,
      };
    case "ALREADY_OCCUPIED":
      trustRobot.move(trustRobot.getMovementController().randomDestination());
      return {
        id,
        type: MessageType.ALREADY_OCCUPIED,
        payload: undefined,
      };
    default:
      console.log(`Unknown message type: ${message.content.type}`);
  }
}
