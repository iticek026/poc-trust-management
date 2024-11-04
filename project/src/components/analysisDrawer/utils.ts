import { AnalyticsData, AuthorityAnalyticsData, TrustScoreAnalyticsData } from "@/logic/analytics/interfaces";
import { formatTime } from "@/utils/time";

export function getDuration(analyticsData: AnalyticsData): { minTimestamp: number; maxTimestamp: number } {
  const maxTimestamp = Math.max(
    ...Object.values(analyticsData.authority).map((robot) => {
      return Math.max(...robot.map((score) => score.timestamp / 1000));
    }),
  );

  return {
    minTimestamp: 0,
    maxTimestamp: maxTimestamp,
  };
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
