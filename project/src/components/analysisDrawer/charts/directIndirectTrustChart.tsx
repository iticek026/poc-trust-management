import { Line } from "react-chartjs-2";
import { ChartWrapper, ChartWrapperComparing } from "../chartWrapper";

import { memo, ReactNode, useMemo } from "react";

import { AggregatedDirectIndirectTrustData } from "../dataSelectors/aggregatedDirectIndirectTrustDataBase";

type DirectIndirectTrustChartProps = {
  data: AggregatedDirectIndirectTrustData;
  chartLabel: string;
  isComparingLayout?: boolean;
};

export const DirectIndirectTrustChart: React.FC<DirectIndirectTrustChartProps> = ({
  data,
  chartLabel,
  isComparingLayout = false,
}) => {
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
  }, [data]);

  const renderChart = (): ReactNode => {
    // return isLoading || !isValue(data) ? (
    //   <div>Loading...</div>
    // ) : (
    //   <>
    return <LineMemo data={chart} options={options} />;
    //   </>
    // );
  };

  return isComparingLayout ? (
    <ChartWrapperComparing>{renderChart()}</ChartWrapperComparing>
  ) : (
    <ChartWrapper>{renderChart()}</ChartWrapper>
  );
};

const LineMemo = memo(Line);
