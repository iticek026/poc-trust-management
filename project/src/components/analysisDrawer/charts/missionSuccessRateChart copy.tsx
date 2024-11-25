import { memo, useMemo } from "react";
import { ChartWrapperAuthority } from "../chartWrapper";
import { Bar } from "react-chartjs-2";
import { DetectedMaliciousRobotsData } from "../dataSelectors/getMaliciousRobotDetected";

type Props = {
  data: DetectedMaliciousRobotsData;
};

const BarMemo = memo(Bar);

export const MalRobotsDetectedChart: React.FC<Props> = ({ data }) => {
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
          stacked: true,
        },
        y: {
          title: {
            display: true,
            text: "Number of malicious robots",
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
          text: "Malicious robots detection",
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
