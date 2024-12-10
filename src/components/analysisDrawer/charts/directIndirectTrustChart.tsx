import { Line } from "react-chartjs-2";
import { ChartWrapper, ChartWrapperComparing, ChartWrapperComparingSkeleton } from "../chartWrapper";

import { memo, ReactNode, useMemo } from "react";

import { AggregatedDirectIndirectTrustData } from "../dataSelectors/aggregatedDirectIndirectTrustDataBase";
import { AnalyticsData } from "@/logic/analytics/interfaces";
import { asyncWrapper } from "@/utils/async";
import { useAsync } from "react-use";
import { isValue } from "@/utils/checks";

type DirectIndirectTrustChartProps = {
  robotId: string;
  dataset: AnalyticsData[];
  defferedMs: number;
  func: (
    robotId: string,
    simData: AnalyticsData[],
    timeIntervalInMs: number,
    observedId?: string,
  ) => AggregatedDirectIndirectTrustData;
  chartLabel: string;
  isComparingLayout?: boolean;
  selectedRobot?: string;
};

type ChartProps = {
  data: AggregatedDirectIndirectTrustData;
  chartLabel: string;
  isComparingLayout?: boolean;
};

const Chart: React.FC<ChartProps> = ({ data, chartLabel, isComparingLayout }) => {
  const chart = useMemo(
    () => ({
      labels: data?.labels,
      datasets: [
        {
          label: "Direct Trust",
          data: data?.directTrustData,
          borderColor: "rgba(54, 162, 235, 1)",
          fill: false,
          spanGaps: true,
        },
        {
          label: "Indirect Trust",
          data: data?.indirectTrustData,
          borderColor: "rgba(255, 206, 86, 1)",
          fill: false,
          spanGaps: true,
        },
        {
          label: "Context",
          data: data?.contextData,
          borderColor: "rgba(34, 138, 65, 1)",
          fill: false,
          spanGaps: true,
        },
      ],
    }),
    [data],
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

    data?.boxes.forEach((item, key) => {
      annotations["box" + key] = {
        type: "box",
        xMin: item.xMin,
        xMax: item.xMax,
        backgroundColor: "rgba(255, 66, 1, 0.25)",
      };
    });

    return {
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
          text: chartLabel,
        },
        annotation: {
          annotations: { ...annotations },
        },
      },
    };
  }, [data]);

  const renderChart = (): ReactNode => {
    return <LineMemo data={chart} options={options} />;
  };

  return isComparingLayout ? (
    <ChartWrapperComparing>{renderChart()}</ChartWrapperComparing>
  ) : (
    <ChartWrapper>{renderChart()}</ChartWrapper>
  );
};

export const DirectIndirectTrustChart: React.FC<DirectIndirectTrustChartProps> = ({
  chartLabel,
  robotId,
  dataset,
  defferedMs,
  func,
  isComparingLayout = false,
  selectedRobot,
}) => {
  const state = useAsync(async () => {
    const result = await asyncWrapper(() => func(robotId, dataset, defferedMs, selectedRobot));
    return result;
  }, [robotId, dataset, defferedMs]);

  if (state.loading) {
    return <ChartWrapperComparingSkeleton />;
  }

  if (!isValue(state.value)) {
    return <div>No data</div>;
  }

  return <Chart isComparingLayout={isComparingLayout} data={state.value} chartLabel={chartLabel} />;
};

const LineMemo = memo(Line);
