import { Coordinates } from "../environment/coordinates";
import { TrustRobot } from "./trustRobot";

export type Experience = {
  timestamp: Date;
  location: Coordinates;
  urgency: number;
  trustDelta: number;
  trustee: TrustRobot;
  // action: Action; // TODO: Maybe??? - define Action
};

export type Reputation = number;
