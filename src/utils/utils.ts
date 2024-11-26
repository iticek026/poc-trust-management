import { Vector } from "matter-js";
import { MessageType, MessageContent } from "../logic/common/interfaces/task";
import { MissionContextData, EnvironmentContextData, RobotContextData, ContextData } from "../logic/tms/interfaces";
import { isVector } from "./checks";

export function pickProperties<T>(obj: T, keys: (keyof T)[]): Partial<T> {
  const newObj: Partial<T> = {};
  keys.forEach((key) => {
    newObj[key] = obj[key];
  });
  return newObj;
}

export function calculateRE(expected: number | Vector, received: number | Vector | undefined): number {
  if (!received) {
    return 1;
  }

  if (typeof expected === "number" && typeof received === "number") {
    return Math.abs(expected - received) / (Math.abs(expected) + Math.abs(received) + 1e-6);
  }
  if (isVector(expected) && isVector(received)) {
    const reX = calculateRE(expected.x, received.x);
    const reY = calculateRE(expected.y, received.y);
    const combinedRE = (reX + reY) / 2;
    return combinedRE;
  }
  return 0;
}

export type Context = ContextData & {
  message: MessageContent;
};

export function createContextData(
  message: MessageContent,
  missionContextData: MissionContextData,
  exploredAreaFraction: number,
): Context {
  const environmentContextData: EnvironmentContextData = {
    exploredAreaFraction: exploredAreaFraction,
  };
  const robotContextData: RobotContextData = {
    sensitivityLevel: message.type === MessageType.LOCALIZATION ? 1 : 0,
  };

  return {
    ...missionContextData,
    ...environmentContextData,
    ...robotContextData,
    message: message,
  };
}

export function groupBy<T, K>(list: K[], keyGetter: (arg: K) => T): Map<T, K[]> {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}
