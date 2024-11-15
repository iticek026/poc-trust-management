import { Line } from "react-chartjs-2";
import { ChartWrapper, ChartWrapperComparing } from "../chartWrapper";

import { memo, ReactNode, useEffect, useMemo, useState } from "react";
import { isValue } from "@/utils/checks";
import { DbData } from "@/logic/indexedDb/indexedDb";

import { AggregatedDirectIndirectTrustData } from "../dataSelectors/aggregatedDirectIndirectTrustDataBase";
import { AnalyticsData } from "@/logic/analytics/interfaces";

type DirectIndirectTrustChartProps = {
  simulationRunsData: DbData[];
  robotId: string;
  ms: number;
  selector: (robotId: string, data: AnalyticsData[], ms: number) => AggregatedDirectIndirectTrustData;
  chartLabel: string;
  isComparingLayout?: boolean;
};

export const DirectIndirectTrustChart: React.FC<DirectIndirectTrustChartProps> = ({
  simulationRunsData,
  robotId,
  ms,
  selector,
  chartLabel,
  isComparingLayout = false,
}) => {
  const [chartData, setChartData] = useState<AggregatedDirectIndirectTrustData>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const data = simulationRunsData.map((sim) => sim.data);
      setChartData(selector(robotId, data, ms));
      setIsLoading(false);
    }, 0);
  }, [simulationRunsData, ms]);

  const chart = useMemo(
    () => ({
      labels: chartData?.labels,
      datasets: [
        {
          label: "Direct Trust",
          data: chartData?.directTrustData,
          borderColor: "rgba(54, 162, 235, 1)",
          fill: false,
          spanGaps: true,
        },
        {
          label: "Indirect Trust",
          data: chartData?.indirectTrustData,
          borderColor: "rgba(255, 206, 86, 1)",
          fill: false,
          spanGaps: true,
        },
      ],
    }),
    [chartData, ms],
  );

  const options = useMemo(() => {
    const annotations: {
      [key: string]: {
        type: "box";
        xMin: number;
        xMax: number;
        backgroundColor: string;
      };
    } = {};

    chartData?.boxes.forEach((item, key) => {
      annotations["box" + key] = {
        type: "box",
        xMin: item.xMin,
        xMax: item.xMax,
        backgroundColor: "rgba(255, 66, 1, 0.25)",
      };
    });

    return {
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
          position: "right" as const,
        },
        title: {
          display: true,
          text: chartLabel,
        },
        annotation: {
          annotations: { ...annotations },
        },
      },
    };
  }, [chartData]);

  const renderChart = (): ReactNode => {
    return isLoading || !isValue(chartData) ? (
      <div>Loading...</div>
    ) : (
      <>
        <LineMemo data={chart} options={options} />
      </>
    );
  };

  return isComparingLayout ? (
    <ChartWrapperComparing>{renderChart()}</ChartWrapperComparing>
  ) : (
    <ChartWrapper>{renderChart()}</ChartWrapper>
  );
};

const LineMemo = memo(Line);
