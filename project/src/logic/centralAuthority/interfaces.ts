import { Experience } from "../tms/interfaces";

export type AllRobotsHistory = {
  [robotId: string]: Experience[];
};
