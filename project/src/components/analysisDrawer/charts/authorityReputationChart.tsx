import { Line } from "react-chartjs-2";

import "chartjs-adapter-date-fns";
import { memo } from "react";
import { ChartWrapperAuthority } from "../chartWrapper";
import { AllRobotsReputationData } from "../dataSelectors/allRobotsReputationData";

type TrustEvolutionChartProps = {
  data: AllRobotsReputationData;
};

const LineMemo = memo(Line);

export const TrustEvolutionChart: React.FC<TrustEvolutionChartProps> = memo(({ data }) => {
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
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Trust Evolution",
      },
    },
  };

  return (
    <ChartWrapperAuthority>
      <LineMemo data={data} options={options} />
    </ChartWrapperAuthority>
  );
});
