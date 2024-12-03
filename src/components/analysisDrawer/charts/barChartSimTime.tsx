import { memo, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { getSimulationFinishTimeBasedOnTrust } from "../dataSelectors/getSimulationsFinishTime";
import { ChartWrapperAuthority, ChartWrapperAuthoritySkeleton } from "../chartWrapper";
import { formatTime } from "@/utils/time";
import { TooltipItem } from "chart.js";
import { DbData } from "@/logic/indexedDb/indexedDb";
import { asyncWrapper } from "@/utils/async";
import { useAsync } from "react-use";
import { isValue } from "@/utils/checks";

type BarChartProps = {
  datasets: DbData[];
};

const BarMemo = memo(Bar);

export const BarChartSimTime = memo(({ datasets }: BarChartProps) => {
  const state = useAsync(async () => {
    const result = await asyncWrapper(() => getSimulationFinishTimeBasedOnTrust(datasets));
    return result;
  }, [datasets]);

  const options = useMemo(() => {
    return {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Runs",
          },
        },
        y: {
          title: {
            display: true,
            text: "Time",
          },
          ticks: {
            callback: (tickValue: string | number) => {
              return formatTime(Number(tickValue));
            },
          },
        },
      },

      plugins: {
        tooltip: {
          mode: "nearest" as const,
          intersect: false,
          callbacks: {
            label: (tooltip: TooltipItem<"bar">) => {
              return formatTime(tooltip.parsed.y);
            },
          },
        },
        legend: {
          display: true,
          position: "top" as const,
        },
        title: {
          display: true,
          text: "Simulation finish time based on enabling/disabling trust",
        },
      },
    };
  }, []);

  if (state.loading) {
    return <ChartWrapperAuthoritySkeleton />;
  }

  if (!isValue(state.value)) {
    return <div>No data</div>;
  }

  return (
    <ChartWrapperAuthority>
      <BarMemo data={state.value} options={options} />
    </ChartWrapperAuthority>
  );
});
