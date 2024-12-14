import { Line } from "react-chartjs-2";

import "chartjs-adapter-date-fns";
import { memo } from "react";
import { ChartWrapperAuthority, ChartWrapperAuthoritySkeleton } from "../chartWrapper";
import { asyncWrapper } from "@/utils/async";
import { useAsync } from "react-use";
import { getAllRobotsMessageCountData } from "../dataSelectors/getMessagesComparison";
import { AnalyticsData } from "@/logic/analytics/interfaces";
import { isValue } from "@/utils/checks";

type TrustEvolutionChartProps = {
  dataset: AnalyticsData[];
  defferedMs: number;
};

const LineMemo = memo(Line);

export const MessagesCountChart: React.FC<TrustEvolutionChartProps> = memo(({ dataset, defferedMs }) => {
  const state = useAsync(async () => {
    const result = await asyncWrapper(() => getAllRobotsMessageCountData(dataset, defferedMs));
    return result;
  }, [dataset]);

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
