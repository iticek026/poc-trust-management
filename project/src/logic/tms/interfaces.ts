import { Coordinates } from "../environment/coordinates";
import { TrustRobot } from "./actors/trustRobot";

export type Experience = {
  timestamp: Date;
  location: Coordinates;
  urgency: number;
  trustDelta: number;
  trustee: TrustRobot;
  // action: Action; // TODO: Maybe??? - define Action
};

export type Reputation = number;

export type MissionContextData = {
  k1: number;
  k2: number;
  k3: number;
  k4: number;
  k5: number;
  k6: number;
  numberOfMaliciousRobotsDetected: number;
  numberOfNeededRobots: number;
  wasObjectFound: boolean;
  totalMembers: number;
  timeLeftMinutes: number;
  availableMembers: number;
};

export type RobotContextData = {
  sensitivityLevel: number;
};

export type EnvironmentContextData = {
  exploredAreaFraction: number;
};

export type ContextData = MissionContextData & RobotContextData & EnvironmentContextData;
