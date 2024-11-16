import { AnalyticsData } from "@/logic/analytics/interfaces";
import { getAggregatedDirectIndirectTrustDataBase } from "./aggregatedDirectIndirectTrustDataBase";
import { getMaxMissionDuration, getRobotIdsFromAnalyticsData, observedData } from "../utils";

export function getAggregatedDirectIndirectTrustDataMalicious(
  robotId: string,
  simData: AnalyticsData[],
  timeIntervalInMs: number = 250,
) {
  const maliciousIds = getRobotIdsFromAnalyticsData(simData, true);
  const maliciousSimData: AnalyticsData[] = observedData(simData, maliciousIds);
  const maxMissionDuration = getMaxMissionDuration(simData, robotId);

  return getAggregatedDirectIndirectTrustDataBase(
    robotId,
    maliciousSimData,
    simData,
    maxMissionDuration,
    timeIntervalInMs,
  );
}
