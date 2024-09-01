import { RobotState } from "./interfaces";

export enum MessageType {
  MOVE_TO_LOCATION = "MOVE_TO_LOCATION",
  CHANGE_BEHAVIOR = "CHANGE_BEHAVIOR",
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

export type ChangeBehaviourContent = {
  type: MessageType.CHANGE_BEHAVIOR;
  payload: RobotState;
};

export type ReportStatusContent = {
  type: LeaderMessage.REPORT_STATUS;
};

export type RegularMessageContent = MoveToLocationContent | ChangeBehaviourContent;
export type LeaderMessageContent = ReportStatusContent | RegularMessageContent;

export type Message = {
  senderId: number;
  receiverId?: number;
  content: LeaderMessageContent;
};
