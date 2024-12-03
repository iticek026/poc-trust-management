import { memo, useMemo } from "react";
import { ChartWrapperAuthority } from "../chartWrapper";
import { Bar } from "react-chartjs-2";
import { getMaliciousRobotsDetected } from "../dataSelectors/getMaliciousRobotDetected";
import { DbSimulationData } from "@/logic/indexedDb/indexedDb";
import { AnalyticsGroupCheckboxes } from "../missionSuccessRateTab/missionSuccessRateTab";
import { isValue } from "@/utils/checks";

type Props = {
  simulations: DbSimulationData[];
  simulationsKeys: AnalyticsGroupCheckboxes;
};

const BarMemo = memo(Bar);

export const MalRobotsDetectedChart: React.FC<Props> = ({ simulations, simulationsKeys }) => {
  const dataMalDetection = useMemo(() => {
    const a = simulations
      .filter((item) => {
        const group = simulationsKeys[item.data.analyticsGroupId ?? "unknown"];

        if (!isValue(group)) {
          return false;
        }

        return group.checked;
      })
      .map((item) => item.data);

    return getMaliciousRobotsDetected(a);
  }, [simulations, simulationsKeys]);

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
        },
        y: {
          title: {
            display: true,
            text: "Percentage",
          },
          min: 0,
          max: 100,
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
          text: "Average of detected malicious robots",
        },
      },
    };
  }, []);

  return (
    <ChartWrapperAuthority>
      <BarMemo data={dataMalDetection} options={options} />
    </ChartWrapperAuthority>
  );
};
