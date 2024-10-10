import { EntityCacheInstance } from "../../../utils/cache";
import { isValue } from "../../../utils/checks";
import { isNearFinalDestination } from "../../../utils/movement";
import { Context, createContextData } from "../../../utils/utils";
import { Entity } from "../../common/entity";
import { Interaction } from "../../common/interaction";
import { Message, MessageResponse } from "../../common/interfaces/task";
import { DataReport } from "../../robot/controllers/communication/interface";
import { MissionStateHandlerInstance } from "../../simulation/missionStateHandler";
import { EnvironmentGridSingleton } from "../../visualization/environmentGrid";
import { TrustRobot } from "../actors/trustRobot";
import { ConstantsInstance } from "../consts";
import { TrustCalculationData } from "../interfaces";
import { ContextInformation } from "./contextInformation";

export function calculateTrust(directTrust: TrustCalculationData, indirectTrust: TrustCalculationData): number {
  let numerator = 0;
  let denominator = 0;

  if (directTrust.wasApplied) {
    numerator += ConstantsInstance.DIRECT_TRUST_WEIGHT * directTrust.value;
    denominator += ConstantsInstance.DIRECT_TRUST_WEIGHT;
  }

  if (indirectTrust.wasApplied) {
    numerator += ConstantsInstance.INDIRECT_TRUST_WEIGHT * indirectTrust.value;
    denominator += ConstantsInstance.INDIRECT_TRUST_WEIGHT;
  }

  return denominator > 0 ? numerator / denominator : ConstantsInstance.INIT_TRUST_VALUE;
}

export function erosion(trustScore: number, interactionTimestamp: Date, currectSimTime: Date): number;
export function erosion(trustScore: number, diff: number): number;

export function erosion(trustScore: number, arg: Date | number, currectSimTime?: Date): number {
  let lambda = 0.01;

  if (typeof arg === "number") {
    return ConstantsInstance.INIT_TRUST_VALUE + (trustScore - ConstantsInstance.INIT_TRUST_VALUE) / (1 + lambda * arg);
  }

  const timeDifference = Math.round(
    Math.round((currectSimTime as Date).getTime() / 1000 - (arg as Date).getTime() / 1000),
  );
  return (
    ConstantsInstance.INIT_TRUST_VALUE +
    (trustScore - ConstantsInstance.INIT_TRUST_VALUE) / (1 + lambda * timeDifference)
  );
}

export function resolveUncheckedMessaged(messages: Message[], robot: TrustRobot, searchedItem?: Entity) {
  if (messages.length === 0) {
    return [];
  }

  return messages.map((message) => resolveUncheckedMessage(message, robot, searchedItem));
}

function resolveUncheckedMessage(message: Message, robot: TrustRobot, searchedItem?: Entity) {
  let resolved = false;
  switch (message.content.type) {
    case "MOVE_TO_LOCATION":
      const nearFinalDest = isNearFinalDestination(robot.getPosition(), message.content.payload, 25);
      if (nearFinalDest) {
        const contextData = createContextData(
          message.content,
          MissionStateHandlerInstance.getContextData(),
          EnvironmentGridSingleton.getExploredAreaFraction(),
        );

        const context = new ContextInformation(contextData);
        let interaction: Interaction;
        if (!searchedItem) {
          interaction = new Interaction({
            fromRobotId: message.senderId,
            toRobotId: message.receiverId ?? robot.getId(),
            outcome: false,
            context: context,
          });
        } else {
          interaction = new Interaction({
            fromRobotId: message.senderId,
            toRobotId: message.receiverId ?? robot.getId(),
            outcome: true,
            context: context,
          });
        }

        robot.getTrustService().addInteractionAndUpdateTrust(interaction);
        resolved = true;
      }

      break;
    case "CHANGE_BEHAVIOR":
    case "LOCALIZATION":
    case "REPORT_STATUS":
      break;
    default:
      console.log(`Unknown message type: ${message.content.type}`);
  }

  return { resolved: resolved, message };
}

export function createInteractionBasedOnMessage(
  fromRobotId: number,
  toRobotId: number,
  context: Context,
  response: MessageResponse,
): Interaction {
  switch (context.message.type) {
    case "MOVE_TO_LOCATION":
      return new Interaction({
        fromRobotId,
        toRobotId,
        outcome: isValue(response),
        context: new ContextInformation(context),
      });
    case "REPORT_STATUS":
      return new Interaction({
        fromRobotId,
        toRobotId,
        outcome: isValue(response),
        context: new ContextInformation(context),
        receivedValue: isDataReport(response?.payload) ? response?.payload.data : response?.payload,
        expectedValue: EntityCacheInstance.getRobotById(toRobotId)?.getPosition(),
      });
    case "CHANGE_BEHAVIOR":

    default:
      throw new Error(`Unknown message type: ${context.message.type}`);
  }
}

function isDataReport(report: any): report is DataReport {
  return isValue(report) && "data" in report;
}
