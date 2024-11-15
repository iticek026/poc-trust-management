import { AnalyticsData } from "@/logic/analytics/interfaces";
import { formatTime } from "@/utils/time";

export type AggregatedDirectIndirectTrustData = {
  labels: string[];
  directTrustData: { y: number; x: string }[];
  indirectTrustData: { y: number; x: string }[];
  boxes: { xMin: number; xMax: number }[];
};

export function getAggregatedDirectIndirectTrustDataBase(
  robotId: string,
  simData: AnalyticsData[],
  originData: AnalyticsData[],
  missionDuration: number,
  timeIntervalInMs: number,
): AggregatedDirectIndirectTrustData {
  const aggregatedDirectTrust: { [time: number]: number[] } = {};
  const aggregatedIndirectTrust: { [time: number]: number[] } = {};

  const timestamps: number[] = [];
  const isTransporting: { [time: number]: boolean } = {};

  for (let i = 0; i < missionDuration + 500; i += timeIntervalInMs) {
    timestamps.push(i);
    aggregatedDirectTrust[i] = [];
    aggregatedIndirectTrust[i] = [];
    isTransporting[i] = false;
  }

  originData.forEach((analyticsData) => {
    const robotData = analyticsData.robots[robotId];
    const trustScoresData = robotData.trustScores;
    for (const targetRobotId in trustScoresData) {
      const trustScores = trustScoresData[targetRobotId];

      trustScores.forEach((entry) => {
        const timeInterval = Math.floor(entry.timestamp / timeIntervalInMs) * timeIntervalInMs;

        if (entry.isTransporting) {
          isTransporting[timeInterval] = true;
        }
      });
    }
  });

  simData.forEach((analyticsData) => {
    const robotData = analyticsData.robots[robotId];
    const trustScoresData = robotData.trustScores;

    for (const targetRobotId in trustScoresData) {
      const trustScores = trustScoresData[targetRobotId];

      trustScores.forEach((entry) => {
        const timeInterval = Math.floor(entry.timestamp / timeIntervalInMs) * timeIntervalInMs;

        if (aggregatedDirectTrust[timeInterval] !== undefined) {
          aggregatedDirectTrust[timeInterval].push(entry.trust.directTrust.value);
        }

        if (aggregatedIndirectTrust[timeInterval] !== undefined) {
          aggregatedIndirectTrust[timeInterval].push(entry.trust.indirectTrust.value);
        }
      });
    }
  });

  const labels: string[] = [];
  const directTrustData: { y: number; x: string }[] = [];
  const indirectTrustData: { y: number; x: string }[] = [];
  const boxes: { xMin: number; xMax: number }[] = [];

  let minX = 0;
  timestamps.forEach((time, index) => {
    labels.push(formatTime(time));

    const directValues = aggregatedDirectTrust[time];
    const indirectValues = aggregatedIndirectTrust[time];

    const directAverage =
      directValues.length > 0 ? directValues.reduce((sum, val) => sum + val, 0) / directValues.length : NaN;

    const indirectAverage =
      indirectValues.length > 0 ? indirectValues.reduce((sum, val) => sum + val, 0) / indirectValues.length : NaN;

    directTrustData.push({ x: formatTime(time), y: directAverage });
    indirectTrustData.push({ x: formatTime(time), y: indirectAverage });

    if (isTransporting[time] && minX === 0) {
      minX = index;
    }

    if (!isTransporting[time] && minX !== 0) {
      boxes.push({ xMin: minX, xMax: index - 1 });
      minX = 0;
    } else if (index === timestamps.length - 1 && minX !== 0) {
      boxes.push({ xMin: minX, xMax: index - 1 });
    }
  });

  return { labels, directTrustData, indirectTrustData, boxes: simData.length > 1 ? [] : boxes };
}
