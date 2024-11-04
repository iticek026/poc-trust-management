import { AnalyticsData } from "@/logic/analytics/interfaces";
import { Line } from "react-chartjs-2";
import { ChartWrapper } from "../chartWrapper";
import { formatTime } from "@/utils/time";
import { getLabelsAndRangesFromDuration } from "../utils";

function getAggregatedDirectIndirectTrustData(
  robotId: string,
  analyticsData: AnalyticsData,
): {
  labels: string[];
  directTrustData: { y: number; x: string }[];
  indirectTrustData: { y: number; x: string }[];
} {
  const robotData = analyticsData.robots[robotId];
  if (!robotData) {
    throw new Error(`Robot with ID ${robotId} not found.`);
  }

  const trustScoresData = robotData.trustScores;
  if (!trustScoresData) {
    throw new Error(`No trust scores found for Robot ID ${robotId}.`);
  }

  //   const timestampSet = new Set<number>();
  //   for (const targetRobotId in trustScoresData) {
  //     const trustScores = trustScoresData[targetRobotId];
  //     trustScores.forEach((entry) => {
  //       timestampSet.add(entry.timestamp);
  //     });
  //   }

  //   const timestamps = Array.from(timestampSet).sort((a, b) => a - b);
  //   const labels = timestamps.map((ts) => formatTime(ts));

  const { labels, timestamps } = getLabelsAndRangesFromDuration(trustScoresData);

  const directTrustData: { y: number; x: string }[] = [];
  const indirectTrustData: { y: number; x: string }[] = [];

  timestamps.forEach((timestamp) => {
    let directTrustSum = 0;
    let indirectTrustSum = 0;
    let count = 0;

    for (const targetRobotId in trustScoresData) {
      const trustScores = trustScoresData[targetRobotId];
      const trustEntry = trustScores.find((entry) => entry.timestamp === timestamp);
      if (trustEntry) {
        directTrustSum += trustEntry.trust.directTrust.value;
        indirectTrustSum += trustEntry.trust.indirectTrust.value;
        count++;
      }
    }

    if (count > 0) {
      directTrustData.push({ y: directTrustSum / count, x: formatTime(timestamp) });
      indirectTrustData.push({ y: indirectTrustSum / count, x: formatTime(timestamp) });
    } else {
      directTrustData.push({ y: NaN, x: formatTime(timestamp) });
      indirectTrustData.push({ y: NaN, x: formatTime(timestamp) });
    }
  });

  return { labels, directTrustData, indirectTrustData };
}

type DirectIndirectTrustChartProps = {
  analyticsData: AnalyticsData;
  robotId: string;
};

export const DirectIndirectTrustChart: React.FC<DirectIndirectTrustChartProps> = ({ analyticsData, robotId }) => {
  const { labels, directTrustData, indirectTrustData } = getAggregatedDirectIndirectTrustData(robotId, analyticsData);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Direct Trust",
        data: directTrustData,
        borderColor: "rgba(54, 162, 235, 1)",
        fill: false,
      },
      {
        label: "Indirect Trust",
        data: indirectTrustData,
        borderColor: "rgba(255, 206, 86, 1)",
        fill: false,
      },
    ],
  };

  const options = {
    parsing: false as const,
    maintainAspectRatio: true,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        suggestedMin: 0,
        suggestedMax: 1,
        title: {
          display: true,
          text: "Reputation Score",
        },
      },
    },
    plugins: {
      tooltip: {
        mode: "nearest" as const,
        intersect: false,
      },
      legend: {
        display: true,
        position: "right" as const,
      },
      title: {
        display: true,
        text: `${robotId}: Direct and Indirect Trust Impact`,
      },
    },
  };

  return (
    <ChartWrapper>
      <Line data={chartData} options={options} />{" "}
    </ChartWrapper>
  );
};
