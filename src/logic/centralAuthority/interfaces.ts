import { Experience } from "@/logic/tms/interfaces";

export type AllRobotsHistory = {
  [robotId: string]: Experience[];
};
