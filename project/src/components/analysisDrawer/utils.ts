import { AnalyticsData, AuthorityAnalyticsData, TrustScoreAnalyticsData } from "@/logic/analytics/interfaces";
import { isValue } from "@/utils/checks";
import { formatTime } from "@/utils/time";

export function getDuration(data: AuthorityAnalyticsData | TrustScoreAnalyticsData): {
  minTimestamp: number;
  maxTimestamp: number;
} {
  let maxTimestamp = 0;

  for (const targetRobotId in data) {
    const trustScores = "reputation" in data[targetRobotId] ? data[targetRobotId].reputation : data[targetRobotId];
    trustScores.forEach((entry) => {
      maxTimestamp = Math.max(maxTimestamp, entry.timestamp);
    });
  }

  return {
    minTimestamp: 0,
    maxTimestamp: maxTimestamp,
  };
}

export function getMaxMissionDuration(missions: AnalyticsData[], robotId?: string): number {
  let maxMissionDuration = 0;

  missions.forEach((sim) => {
    const { maxTimestamp } = isValue(robotId)
      ? getDuration(sim.robots[robotId].trustScores)
      : getDuration(sim.authority);
    maxMissionDuration = Math.max(maxMissionDuration, maxTimestamp);
  });

  return maxMissionDuration;
}

export function getLabelsAndRangesFromDuration(data: AuthorityAnalyticsData | TrustScoreAnalyticsData): {
  labels: string[];
  timestamps: number[];
} {
  const timestampSet = new Set<number>();
  for (const targetRobotId in data) {
    const trustScores = data[targetRobotId] as { timestamp: number }[];
    trustScores.forEach((entry) => {
      timestampSet.add(entry.timestamp);
    });
  }

  const timestamps = Array.from(timestampSet).sort((a, b) => a - b);
  const labels = timestamps.map((ts) => formatTime(ts));

  return { labels, timestamps };
}

export function generateColor(index: number): string {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue},70%,50%)`;
}

export function getMaliciousRobotIdsFromAnalyticsData(simData: AnalyticsData[]): Set<string> {
  const ids = new Set<string>();

  simData.forEach((sim) => {
    for (const id in sim.robots) {
      if (sim.robots[id].isMalicious) {
        ids.add(id);
      }
    }
  });
  return ids;
}
