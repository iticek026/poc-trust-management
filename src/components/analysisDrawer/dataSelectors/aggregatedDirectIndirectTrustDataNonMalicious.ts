import { AnalyticsData } from "@/logic/analytics/interfaces";
import { getAggregatedDirectIndirectTrustDataBase } from "./aggregatedDirectIndirectTrustDataBase";
import { getMaxMissionDuration, getRobotIdsFromAnalyticsData, observedData } from "../utils";

export function getAggregatedDirectIndirectTrustDataNonMalicious(
  robotId: string,
  simData: AnalyticsData[],
  timeIntervalInMs: number = 250,
) {
  const nonmaliciousIds = getRobotIdsFromAnalyticsData(simData, false);
  const nonMaliciousSimData: AnalyticsData[] = observedData(simData, nonmaliciousIds);
  const maxMissionDuration = getMaxMissionDuration(simData, robotId);

  return getAggregatedDirectIndirectTrustDataBase(
    robotId,
    nonMaliciousSimData,
    simData,
    maxMissionDuration,
    timeIntervalInMs,
  );
}
