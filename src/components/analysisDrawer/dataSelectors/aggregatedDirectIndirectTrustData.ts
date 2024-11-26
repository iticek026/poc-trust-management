import { AnalyticsData } from "@/logic/analytics/interfaces";
import { getMaxMissionDuration } from "../utils";
import { getAggregatedDirectIndirectTrustDataBase } from "./aggregatedDirectIndirectTrustDataBase";

export function getAggregatedDirectIndirectTrustData(
  robotId: string,
  simData: AnalyticsData[],
  timeIntervalInMs: number = 250,
) {
  const maxMissionDuration = getMaxMissionDuration(simData, robotId);

  return getAggregatedDirectIndirectTrustDataBase(robotId, simData, simData, maxMissionDuration, timeIntervalInMs);
}
