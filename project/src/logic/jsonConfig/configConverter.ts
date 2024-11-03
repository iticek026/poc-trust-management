import { isValue } from "../../utils/checks";
import { RobotSwarm } from "../robot/swarm";
import { isConfigOfLeaderRobot, isConfigOfMaliciousRobot } from "../simulation/utils";
import { MemberHistory } from "../tms/trustService";
import { SimulationConfig, RobotConfig, RegularRobotConfig, TrustHistoryConfig } from "./config";

export function convertSimulationTrustResultWithConfig(
  simulationConfig: SimulationConfig,
  memberHistories: MemberHistory[],
  swarm: RobotSwarm,
): SimulationConfig {
  const robots: RobotConfig[] = simulationConfig.robots.map((robot) => {
    if (isConfigOfMaliciousRobot(robot) && robot.isMalicious) {
      return {
        ...robot,
      };
    }

    const trustHistory = memberHistories.find((history) => history.label === robot.label);

    const trustHistorySchema: TrustHistoryConfig = {};

    if (isValue(trustHistory?.history) && trustHistory.history.size > 0) {
      trustHistory?.history.forEach((value, key) => {
        const toRobot = swarm.allRobots.find((r) => r.getId() === key);

        const toRobotLabel = toRobot?.getLabel() ?? (key as string);
        trustHistorySchema[toRobotLabel] = {
          interactions: value.interactions.map((interaction) => ({
            fromRobot: trustHistory.label,
            toRobot: toRobotLabel,
            timestamp: interaction.timestamp.toISOString(),
            trustScore: interaction.trustScore as number,
            outcome: interaction.outcome,
            context: {
              availableMembers: interaction.context.availableMembers,
              exploredAreaFraction: interaction.context.exploredAreaFraction,
              numberOfMaliciousRobotsDetected: interaction.context.numberOfMaliciousRobotsDetected,
              numberOfNeededRobots: interaction.context.numberOfNeededRobots,
              sensitivityLevel: interaction.context.sensitivityLevel,
              theta_base: interaction.context.theta_base,
              totalMembers: interaction.context.totalMembers,
              wasObjectFound: interaction.context.wasObjectFound,
            },
            ...(isValue(interaction.expectedValue) && { expectedValue: interaction.expectedValue }),
            ...(isValue(interaction.receivedValue) && { receivedValue: interaction.receivedValue }),
            ...(isValue(interaction.observedBehaviors) && { observedBehaviors: interaction.observedBehaviors }),
          })),
          currentTrustLevel: value.currentTrustLevel,
          lastUpdate: value.lastUpdate,
        };
      });
    }

    if (isConfigOfLeaderRobot(robot) && robot.isLeader) {
      return {
        ...robot,
        isLeader: true,
        trustHistory: trustHistorySchema,
      };
    }

    return {
      ...robot,
      trustHistory: trustHistorySchema,
    } as RegularRobotConfig;
  });

  return {
    ...simulationConfig,
    robots: robots,
  };
}
