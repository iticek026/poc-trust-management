import { TrustRecordInterface } from "../tms/trustRecord";
import { InteractionInterface } from "../common/interaction";
import { ContextInformationInterface } from "../tms/trust/contextInformation";
import {
  AuthorityConstants,
  EnvironmentConfig,
  LeaderRobotConfigSchema,
  MaliciousRobotConfigSchema,
  RegularRobotConfigSchema,
  RobotGeneralConfig,
  TrustConfig,
  TrustConstants,
} from "./schema";

export type RobotConfig = RegularRobotConfig | MaliciousRobotConfigSchema | LeaderRobotConfig;

export interface RegularRobotConfig extends RegularRobotConfigSchema {
  trustHistory?: TrustHistoryConfig;
}

export interface LeaderRobotConfig extends LeaderRobotConfigSchema {
  trustHistory?: TrustHistoryConfig;
}

export interface MaliciousRobotConfig extends MaliciousRobotConfigSchema {}

type ContextInformationSchema = ContextInformationInterface;

type InteractionConfig = Omit<InteractionInterface, "timestamp" | "context" | "fromRobotId" | "toRobotId"> & {
  timestamp: string;
  context: ContextInformationSchema;
  fromRobot: string;
  toRobot: string;
  trustScore: number;
};

type TrustRecordConfig = Omit<TrustRecordInterface, "interactions"> & {
  interactions: InteractionConfig[];
};

export type TrustHistoryConfig = Record<string, TrustRecordConfig>;

export interface SimulationConfig {
  seed: string | null;
  analyticsGroup: string | null;
  timeout: number | null;
  robotGeneral: RobotGeneralConfig;
  robots: RobotConfig[];
  authority: AuthorityConstants;
  environment: EnvironmentConfig;
  trust: TrustConstants & TrustConfig;
}
