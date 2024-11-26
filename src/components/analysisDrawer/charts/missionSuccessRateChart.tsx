import { memo, useMemo } from "react";
import { ChartWrapperAuthority } from "../chartWrapper";
import { Bar } from "react-chartjs-2";
import { MissionSuccessRateData } from "../dataSelectors/getMissionSuccessRate";

type Props = {
  data: MissionSuccessRateData;
};

const BarMemo = memo(Bar);

export const MissionSuccessRateChart: React.FC<Props> = ({ data }) => {
  const options = useMemo(() => {
    return {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Runs in format <malicious count> - <non-malicious count>",
          },
          stacked: true,
        },
        y: {
          title: {
            display: true,
            text: "Number of runs",
          },
          stacked: true,
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
          text: "Mission success rate for different number of malicious and non-malicious robots",
        },
      },
    };
  }, []);

  return (
    <ChartWrapperAuthority>
      <BarMemo data={data} options={options} />
    </ChartWrapperAuthority>
  );
};
