import { AnalyticsData } from "@/logic/analytics/interfaces";
import { Line } from "react-chartjs-2";
import { ChartWrapper } from "../chartWrapper";
import { formatTime } from "@/utils/time";
import { getMaxMissionDuration } from "../utils";
import { memo, useEffect, useMemo, useState } from "react";
import { isValue } from "@/utils/checks";

type AggregatedDirectIndirectTrustData = {
  labels: string[];
  directTrustData: { y: number; x: string }[];
  indirectTrustData: { y: number; x: string }[];
};

function getAggregatedDirectIndirectTrustData(
  robotId: string,
  simData: AnalyticsData[],
  timeIntervalInMs: number = 250,
): AggregatedDirectIndirectTrustData {
  const maxMissionDuration = getMaxMissionDuration(simData, robotId);

  const aggregatedDirectTrust: { [time: number]: number[] } = {};
  const aggregatedIndirectTrust: { [time: number]: number[] } = {};

  const timestamps: number[] = [];
  for (let i = 0; i < maxMissionDuration + 500; i += timeIntervalInMs) {
    timestamps.push(i);
    aggregatedDirectTrust[i] = [];
    aggregatedIndirectTrust[i] = [];
  }

  simData.forEach((analyticsData) => {
    const robotData = analyticsData.robots[robotId];
    const trustScoresData = robotData.trustScores;

    for (const targetRobotId in trustScoresData) {
      const trustScores = trustScoresData[targetRobotId];

      trustScores.forEach((entry) => {
        const timeInterval = Math.floor(entry.timestamp / timeIntervalInMs) * timeIntervalInMs;

        if (aggregatedDirectTrust[timeInterval] !== undefined) {
          aggregatedDirectTrust[timeInterval].push(entry.trust.directTrust.value);
          aggregatedIndirectTrust[timeInterval].push(entry.trust.indirectTrust.value);
        }
      });
    }
  });

  const labels: string[] = [];
  const directTrustData: { y: number; x: string }[] = [];
  const indirectTrustData: { y: number; x: string }[] = [];

  timestamps.forEach((time) => {
    labels.push(formatTime(time));

    const directValues = aggregatedDirectTrust[time];
    const indirectValues = aggregatedIndirectTrust[time];

    const directAverage =
      directValues.length > 0 ? directValues.reduce((sum, val) => sum + val, 0) / directValues.length : NaN;

    const indirectAverage =
      indirectValues.length > 0 ? indirectValues.reduce((sum, val) => sum + val, 0) / indirectValues.length : NaN;

    directTrustData.push({ x: formatTime(time), y: directAverage });
    indirectTrustData.push({ x: formatTime(time), y: indirectAverage });
  });

  return { labels, directTrustData, indirectTrustData };
}

type DirectIndirectTrustChartProps = {
  simulationRunsData: AnalyticsData[];
  robotId: string;
  ms: number;
};

export const DirectIndirectTrustChart: React.FC<DirectIndirectTrustChartProps> = ({
  simulationRunsData,
  robotId,
  ms,
}) => {
  const [chartData, setChartData] = useState<AggregatedDirectIndirectTrustData>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setChartData(getAggregatedDirectIndirectTrustData(robotId, simulationRunsData, ms));
      setIsLoading(false);
    }, 0);
  }, [simulationRunsData, ms]);

  const chart = useMemo(
    () => ({
      labels: chartData?.labels,
      datasets: [
        {
          label: "Direct Trust",
          data: chartData?.directTrustData,
          borderColor: "rgba(54, 162, 235, 1)",
          fill: false,
          spanGaps: true,
        },
        {
          label: "Indirect Trust",
          data: chartData?.indirectTrustData,
          borderColor: "rgba(255, 206, 86, 1)",
          fill: false,
          spanGaps: true,
        },
      ],
    }),
    [chartData, ms],
  );

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
          text: "Trust Score",
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
      {isLoading || !isValue(chartData) ? <div>Loading...</div> : <LineMemo data={chart} options={options} />}
    </ChartWrapper>
  );
};

const LineMemo = memo(Line);
