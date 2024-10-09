import { DataReport } from "../../robot/controllers/communication/interface";
import { RobotState } from "./interfaces";

// TODO separate into different types which will contain only related types
export enum MessageType {
  MOVE_TO_LOCATION = "MOVE_TO_LOCATION",
  CHANGE_BEHAVIOR = "CHANGE_BEHAVIOR",
  LOCALIZATION = "LOCALIZATION",
  REPORT_STATUS = "REPORT_STATUS",
  OBSERVATION = "OBSERVATION",
  LEADER_REPORT_STATUS = "LEADER_REPORT_STATUS",
}

enum LeaderMessage {
  LEADER_REPORT_STATUS = "LEADER_REPORT_STATUS",
}

export type LeaderMessageType = MessageType | LeaderMessage;
export type ReceivedMessage = LeaderMessageType;

export type MoveToLocationContent = {
  type: MessageType.MOVE_TO_LOCATION;
  payload: { x: number; y: number; fromLeader: boolean };
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
  payload: ["data"];
};

export type ReportWholeStatusContent = {
  type: LeaderMessage.LEADER_REPORT_STATUS;
  payload: (keyof DataReport)[];
};

export type ObservationContent = {
  type: MessageType.OBSERVATION;
  payload: undefined;
};

export type RegularMessageContent =
  | MoveToLocationContent
  | ChangeBehaviourContent
  | LocalizationContent
  | ReportStatusContent
  | ObservationContent;

export type LeaderMessageContent = ReportWholeStatusContent | RegularMessageContent;

type ReportStatusContentResponse = {
  type: MessageType.REPORT_STATUS;
  payload: { x: number; y: number };
};

type ReportWholeStatusContentResponse = {
  type: MessageType.LEADER_REPORT_STATUS;
  payload: DataReport;
};

type MoveToLocationContentResponse = MoveToLocationContent;

export type MessageResponse =
  | ({ id: number } & (ReportStatusContentResponse | MoveToLocationContentResponse | ReportWholeStatusContentResponse))
  | undefined;

export type Message = {
  senderId: number;
  receiverId: number;
  content: LeaderMessageContent;
};
