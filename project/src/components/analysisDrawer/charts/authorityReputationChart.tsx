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
import { useEffect, useState } from "react";
import { getMaxMissionDuration } from "../utils";
import { ChartWrapper } from "../chartWrapper";
import { formatTime } from "@/utils/time";
import { isValue } from "@/utils/checks";
import { DbData } from "@/logic/indexedDb/indexedDb";
import annotationPlugin from "chartjs-plugin-annotation";

type AllRobotsReputationData = {
  labels: string[];
  datasets: {
    label: string;
    data: { x: string; y: number }[];
    borderColor: string;
    backgroundColor: string;
  }[];
};

function getAllRobotsReputationData(simData: AnalyticsData[], timeIntervalInMs: number = 250): AllRobotsReputationData {
  const maxMissionDuration = getMaxMissionDuration(simData);

  const reputation: { [time: number]: { [id: string]: number[] } } = {};
  const boxes: { x: string; y: number }[] = [];
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
          reputation[timeInterval][reputationRecordId].push(record.reputationScore);
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

function generateColor(index: number): string {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue},70%,50%)`;
}

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  Title,
  annotationPlugin,
);

type TrustEvolutionChartProps = {
  analyticsData: DbData[];
  ms: number;
};

export const TrustEvolutionChart: React.FC<TrustEvolutionChartProps> = ({ analyticsData, ms }) => {
  const [chartData, setChartData] = useState<AllRobotsReputationData>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const data = analyticsData.map((sim) => sim.data);
      setChartData(getAllRobotsReputationData(data, ms));
      setIsLoading(false);
    }, 0);
  }, [analyticsData, ms]);

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
      {isLoading || !isValue(chartData) ? <div>Loading...</div> : <Line data={chartData} options={options} redraw />}
    </ChartWrapper>
  );
};
