import { Line } from "react-chartjs-2";

import "chartjs-adapter-date-fns";
import { useEffect, useState } from "react";
import { ChartWrapperAuthority } from "../chartWrapper";
import { isValue } from "@/utils/checks";
import { DbData } from "@/logic/indexedDb/indexedDb";
import { AllRobotsReputationData } from "../dataSelectors/allRobotsReputationData";
import { getAllRobotsMessageCountData } from "../dataSelectors/getMessagesComparison";

type TrustEvolutionChartProps = {
  analyticsData: DbData[];
  ms: number;
};

export const MessagesCountChart: React.FC<TrustEvolutionChartProps> = ({ analyticsData, ms }) => {
  const [chartData, setChartData] = useState<AllRobotsReputationData>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const data = analyticsData.map((sim) => sim.data);
      setChartData(getAllRobotsMessageCountData(data, ms));
      setIsLoading(false);
    }, 0);
  }, [analyticsData, ms]);

  const options = {
    parsing: false as const,
    maintainAspectRatio: false,
    responsive: true,
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
          text: "Message count",
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
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Message count comparison",
      },
    },
  };

  return (
    <ChartWrapperAuthority>
      {isLoading || !isValue(chartData) ? <div>Loading...</div> : <Line data={chartData} options={options} redraw />}
    </ChartWrapperAuthority>
  );
};
