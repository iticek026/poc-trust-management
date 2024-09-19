import { StateReport } from "../../robot/controllers/communication/interface";
import { RobotState } from "./interfaces";

export enum MessageType {
  MOVE_TO_LOCATION = "MOVE_TO_LOCATION",
  CHANGE_BEHAVIOR = "CHANGE_BEHAVIOR",
  LOCALIZATION = "LOCALIZATION",
  REPORT_STATUS = "REPORT_STATUS",
}

enum LeaderMessage {
  REPORT_STATUS = "REPORT_STATUS",
}

export type LeaderMessageType = MessageType | LeaderMessage;
export type ReceivedMessage = LeaderMessageType;

export type MoveToLocationContent = {
  type: MessageType.MOVE_TO_LOCATION;
  payload: { x: number; y: number };
};

export type LocalizationContent = {
  type: MessageType.LOCALIZATION;
  payload: { x: number; y: number };
};

export type ChangeBehaviourContent = {
  type: MessageType.CHANGE_BEHAVIOR;
  payload: RobotState;
};

export type ReportStatusContent = {
  type: MessageType.REPORT_STATUS;
  payload: ["position"];
};

export type ReportWholeStatusContent = {
  type: LeaderMessage.REPORT_STATUS;
  payload: (keyof StateReport)[];
};

export type RegularMessageContent =
  | MoveToLocationContent
  | ChangeBehaviourContent
  | LocalizationContent
  | ReportStatusContent;

export type LeaderMessageContent = ReportWholeStatusContent | RegularMessageContent;

export type Message = {
  senderId: number;
  receiverId?: number;
  content: LeaderMessageContent;
};
