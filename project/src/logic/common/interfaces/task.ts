import { RobotState } from "./interfaces";

export enum Actions {
  OBSERVATION = "OBSERVATION",
}

export enum MessageType {
  MOVE_TO_LOCATION = "MOVE_TO_LOCATION",
  CHANGE_BEHAVIOR = "CHANGE_BEHAVIOR",
  LOCALIZATION = "LOCALIZATION",
  REPORT_STATUS = "REPORT_STATUS",
  OBSERVATION = "OBSERVATION",
  ALREADY_OCCUPIED = "ALREADY_OCCUPIED",
}

export type AlreadyOccipiedContent = {
  type: MessageType.ALREADY_OCCUPIED;
  payload: undefined;
};

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

export type ObservationContent = {
  type: MessageType.OBSERVATION;
  payload: undefined;
};

export type MessageContent =
  | MoveToLocationContent
  | ChangeBehaviourContent
  | LocalizationContent
  | ReportStatusContent
  | ObservationContent
  | AlreadyOccipiedContent;

type ReportStatusContentResponse = {
  type: MessageType.REPORT_STATUS;
  payload: { x: number; y: number };
};

type MoveToLocationContentResponse = MoveToLocationContent;

export type MessageResponse =
  | ({ id: number } & (
      | ReportStatusContentResponse
      | MoveToLocationContentResponse
      | AlreadyOccipiedContent
      | ChangeBehaviourContent
    ))
  | undefined;

export type Message = {
  senderId: number;
  receiverId: number;
  content: MessageContent;
};
