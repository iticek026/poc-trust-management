import { AnalyticsData, RobotAnalyticsData, TrustScoreAnalyticsData } from "@/logic/analytics/interfaces";
import { getAggregatedDirectIndirectTrustDataBase } from "./aggregatedDirectIndirectTrustDataBase";
import { getMaliciousRobotIdsFromAnalyticsData, getMaxMissionDuration } from "../utils";

export function getAggregatedDirectIndirectTrustDataNonMalicious(
  robotId: string,
  simData: AnalyticsData[],
  timeIntervalInMs: number = 250,
) {
  const maliciousIds = getMaliciousRobotIdsFromAnalyticsData(simData);

  const nonMaliciousSimData: AnalyticsData[] = simData.map((sim) => {
    const robots: RobotAnalyticsData = {};
    for (const id in sim.robots) {
      const robotAnalytics = sim.robots[id];
      const newTrustScores: TrustScoreAnalyticsData = {};

      for (const record in robotAnalytics.trustScores) {
        if (!maliciousIds.has(record)) {
          newTrustScores[record] = robotAnalytics.trustScores[record];
        }
      }

      robots[id] = { ...robotAnalytics, trustScores: newTrustScores };
    }
    return { authority: sim.authority, robots };
  });

  const maxMissionDuration = getMaxMissionDuration(simData, robotId);

  return getAggregatedDirectIndirectTrustDataBase(
    robotId,
    nonMaliciousSimData,
    simData,
    maxMissionDuration,
    timeIntervalInMs,
  );
}
