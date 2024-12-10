import { Line } from "react-chartjs-2";
import { useAsync } from "react-use";
import "chartjs-adapter-date-fns";
import { memo } from "react";
import { ChartWrapperAuthority, ChartWrapperAuthoritySkeleton } from "../chartWrapper";
import { getAllRobotsReputationData } from "../dataSelectors/allRobotsReputationData";
import { AnalyticsData } from "@/logic/analytics/interfaces";
import { isValue } from "@/utils/checks";
import { asyncWrapper } from "@/utils/async";

type TrustEvolutionChartProps = {
  defferedMs: number;
  dataset: AnalyticsData[];
};

const LineMemo = memo(Line);

export const TrustEvolutionChart: React.FC<TrustEvolutionChartProps> = memo(({ defferedMs, dataset }) => {
  const state = useAsync(async () => {
    const result = await asyncWrapper(() => getAllRobotsReputationData(dataset, defferedMs));
    return result;
  }, [defferedMs, dataset]);

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
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Trust Evolution",
      },
    },
  };

  if (state.loading) {
    return <ChartWrapperAuthoritySkeleton />;
  }

  if (!isValue(state.value)) {
    return <div>No data</div>;
  }

  return (
    <ChartWrapperAuthority>
      <LineMemo data={state.value} options={options} />
    </ChartWrapperAuthority>
  );
});
