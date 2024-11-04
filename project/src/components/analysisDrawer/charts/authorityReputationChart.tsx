import { AnalyticsData } from "@/logic/analytics/interfaces";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  Title,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { useMemo } from "react";
import { getLabelsAndRangesFromDuration } from "../utils";
import { ChartWrapper } from "../chartWrapper";
import { formatTime } from "@/utils/time";

function getAllRobotsReputationData(analyticsData: AnalyticsData): {
  labels: string[];
  datasets: {
    label: string;
    data: { x: string; y: number }[];
    borderColor: string;
    backgroundColor: string;
  }[];
} {
  const authorityData = analyticsData.authority;
  if (!authorityData) {
    throw new Error(`Authority data not found.`);
  }

  const datasets = [];

  const { labels, timestamps } = getLabelsAndRangesFromDuration(analyticsData.authority);

  let colorIndex = 0;

  for (const robotId in authorityData) {
    const robotReputationData = authorityData[robotId];
    if (!robotReputationData) {
      continue;
    }

    // const dataBySecond: { [second: number]: number[] } = {};

    // robotReputationData.forEach((entry) => {
    //   const timestamp = Math.floor(entry.timestamp / 1000);
    //   if (!dataBySecond[timestamp]) {
    //     dataBySecond[timestamp] = [];
    //   }
    //   dataBySecond[timestamp].push(entry.reputationScore);
    // });

    const dataPoints: { x: string; y: number }[] = timestamps.map((ts) => {
      const scores = robotReputationData.find((entry) => entry.timestamp === ts);
      if (scores) {
        return { y: scores.reputationScore, x: formatTime(ts) };
      } else {
        return { y: NaN, x: formatTime(ts) };
      }
    });

    const color = generateColor(colorIndex);

    datasets.push({
      label: `${robotId}`,
      data: dataPoints,
      borderColor: color,
      backgroundColor: color,
      fill: false,
      spanGaps: true,
      cubicInterpolationMode: "monotone",
      tension: 0.4,
    });

    colorIndex++;
  }

  return { datasets, labels };
}

function generateColor(index: number): string {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue},70%,50%)`;
}

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend, CategoryScale, Title);

type TrustEvolutionChartProps = {
  analyticsData: AnalyticsData;
};

export const TrustEvolutionChart: React.FC<TrustEvolutionChartProps> = ({ analyticsData }) => {
  const chartData = useMemo(() => getAllRobotsReputationData(analyticsData), [analyticsData]);

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
        text: "Trust Evolution",
      },
    },
  };

  return (
    <ChartWrapper>
      <Line data={chartData} options={options} />
    </ChartWrapper>
  );
};
