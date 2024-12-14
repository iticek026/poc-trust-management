import { AnalyticsData } from "@/logic/analytics/interfaces";
import { getAggregatedDirectIndirectTrustDataBase } from "./aggregatedDirectIndirectTrustDataBase";
import { getMaxMissionDuration, observedData } from "../utils";

export function getAggregatedDirectIndirectTrustDataSpecificRobot(
  robotId: string,
  simData: AnalyticsData[],
  timeIntervalInMs: number = 250,
  observedId: string,
) {
  const observedSimData: AnalyticsData[] = observedData(simData, new Set([observedId]));
  const maxMissionDuration = getMaxMissionDuration(simData, robotId);

  return getAggregatedDirectIndirectTrustDataBase(
    robotId,
    observedSimData,
    simData,
    maxMissionDuration,
    timeIntervalInMs,
  );
}
