import { AnalyticsData } from "@/logic/analytics/interfaces";
import { formatTime } from "@/utils/time";
import { generateColor, getMaxMissionDuration } from "../utils";

export type AllRobotsReputationData = {
  labels: string[];
  datasets: {
    label: string;
    data: { x: string; y: number }[];
    borderColor: string;
    backgroundColor: string;
  }[];
};

export function getAllRobotsReputationData(
  simData: AnalyticsData[],
  timeIntervalInMs: number = 250,
): AllRobotsReputationData {
  const maxMissionDuration = getMaxMissionDuration(simData);

  const reputation: { [time: number]: { [id: string]: number[] } } = {};
  const timestamps: number[] = [];
  for (let i = 0; i < maxMissionDuration + 500; i += timeIntervalInMs) {
    timestamps.push(i);

    reputation[i] = {};
  }

  simData.forEach((analyticsData) => {
    const robotData = analyticsData.authority;

    for (const reputationRecordId in robotData) {
      robotData[reputationRecordId].reputation.forEach((record) => {
        const timeInterval = Math.floor(record.timestamp / timeIntervalInMs) * timeIntervalInMs;

        if (reputation[timeInterval] !== undefined) {
          if (!reputation[timeInterval][reputationRecordId]) {
            reputation[timeInterval][reputationRecordId] = [];
          }
          reputation[timeInterval][reputationRecordId].push(record.trustScore);
        }
      });
    }
  });

  const labels: string[] = [];
  const reputationData: { [id: string]: { y: number; x: string }[] } = {};

  timestamps.forEach((time) => {
    labels.push(formatTime(time));

    const reputationValues = reputation[time];

    for (const robotId in reputationValues) {
      const reputationAverage =
        reputationValues[robotId].length > 0
          ? reputationValues[robotId].reduce((sum, val) => sum + val, 0) / reputationValues[robotId].length
          : NaN;

      if (!reputationData[robotId]) {
        reputationData[robotId] = [];
      }
      reputationData[robotId].push({ x: formatTime(time), y: reputationAverage });
    }
  });

  const datasets = [];
  let colorIndex = 0;

  for (const robotId in reputationData) {
    const color = generateColor(colorIndex);

    datasets.push({
      label: robotId,
      data: reputationData[robotId],
      borderColor: color,
      backgroundColor: color,
      fill: false,
      cubicInterpolationMode: "monotone",
      tension: 0.4,
      spanGaps: true,
    });

    colorIndex++;
  }

  return { labels, datasets };
}
