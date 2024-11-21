import { memo, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  getSimulationFinishTimeBasedOnTrust,
  SimulationFinishTimeData,
} from "../dataSelectors/getSimulationsFinishTime";
import { DbData } from "@/logic/indexedDb/indexedDb";
import { isValue } from "@/utils/checks";
import { ChartWrapperAuthority } from "../chartWrapper";
import { formatTime } from "@/utils/time";
import { TooltipItem } from "chart.js";

type BarChartProps = {
  analyticsData: DbData[];
};

export const BarChartSimTime = ({ analyticsData }: BarChartProps) => {
  const [chartData, setChartData] = useState<SimulationFinishTimeData>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setChartData(getSimulationFinishTimeBasedOnTrust(analyticsData));
      setIsLoading(false);
    }, 0);
  }, [analyticsData]);

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
      {isLoading || !isValue(chartData) ? <div>Loading...</div> : <Bar data={chartData} options={options} redraw />}
    </ChartWrapperAuthority>
  );
};
