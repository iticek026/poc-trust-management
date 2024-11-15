import { Line } from "react-chartjs-2";

import "chartjs-adapter-date-fns";
import { useEffect, useState } from "react";
import { ChartWrapper, ChartWrapperAuthority } from "../chartWrapper";
import { isValue } from "@/utils/checks";
import { DbData } from "@/logic/indexedDb/indexedDb";
import { AllRobotsReputationData, getAllRobotsReputationData } from "../dataSelectors/allRobotsReputationData";

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
    <ChartWrapperAuthority>
      {isLoading || !isValue(chartData) ? <div>Loading...</div> : <Line data={chartData} options={options} redraw />}
    </ChartWrapperAuthority>
  );
};
