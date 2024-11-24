import { memo, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { SimulationFinishTimeData } from "../dataSelectors/getSimulationsFinishTime";
import { ChartWrapperAuthority } from "../chartWrapper";
import { formatTime } from "@/utils/time";
import { TooltipItem } from "chart.js";

type BarChartProps = {
  data: SimulationFinishTimeData;
};

const BarMemo = memo(Bar);

export const BarChartSimTime = memo(({ data }: BarChartProps) => {
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

  return (
    <ChartWrapperAuthority>
      <BarMemo data={data} options={options} />
    </ChartWrapperAuthority>
  );
});
