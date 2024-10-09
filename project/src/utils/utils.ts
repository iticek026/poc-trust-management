import { Vector } from "matter-js";
import { MessageType, RegularMessageContent } from "../logic/common/interfaces/task";
import { MissionContextData, EnvironmentContextData, RobotContextData } from "../logic/tms/interfaces";
import { isVector } from "./checks";

export function pickProperties<T>(obj: T, keys: (keyof T)[]): Partial<T> {
  const newObj: Partial<T> = {};
  keys.forEach((key) => {
    newObj[key] = obj[key];
  });
  return newObj;
}

export function calculateRE(expected: number | Vector, received: number | Vector): number {
  if (typeof expected === "number" && typeof received === "number") {
    return Math.abs(expected - received) / (Math.abs(expected) + Math.abs(received) + 1e-6);
  }
  if (isVector(expected) && isVector(received)) {
    return (
      Math.abs(Vector.magnitude(expected) - Vector.magnitude(received)) /
      (Math.abs(Vector.magnitude(expected)) + Math.abs(Vector.magnitude(received)) + 1e-6)
    );
  }
  return 0;
}

export type Context = {
  missionContextData: MissionContextData;
  environmentContextData: EnvironmentContextData;
  robotContextData: RobotContextData;
  message: RegularMessageContent;
};

export function createContextData(
  message: RegularMessageContent,
  missionContextData: MissionContextData,
  exploredAreaFraction: number,
): Context {
  const environmentContextData: EnvironmentContextData = {
    exploredAreaFraction: exploredAreaFraction,
  };
  const robotContextData: RobotContextData = {
    sensitivityLevel: message.type === MessageType.LOCALIZATION ? 0.2 : 0,
  };

  return {
    missionContextData,
    environmentContextData,
    robotContextData,
    message: message,
  };
}
