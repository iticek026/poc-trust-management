import { isValue } from "../../utils/checks";
import { LeaderRobotConfig, MaliciousRobotConfig, RegularRobotConfig, RobotConfig } from "../jsonConfig/parser";

export function isConfigOfMaliciousRobot(robotConfig: RobotConfig): robotConfig is MaliciousRobotConfig {
  return (robotConfig as MaliciousRobotConfig).isMalicious !== undefined;
}

export function isConfigOfLeaderRobot(robotConfig: RobotConfig): robotConfig is LeaderRobotConfig {
  const config = robotConfig as RegularRobotConfig;
  return isValue(config.isLeader) && config.isLeader;
}

export function isConfigOfRegularRobot(robotConfig: RobotConfig): robotConfig is RegularRobotConfig {
  return !isConfigOfMaliciousRobot(robotConfig) && !isConfigOfLeaderRobot(robotConfig);
}
