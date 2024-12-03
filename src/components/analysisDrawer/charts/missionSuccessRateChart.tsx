import { memo, useMemo } from "react";
import { ChartWrapperAuthority } from "../chartWrapper";
import { Bar } from "react-chartjs-2";
import { getMissionSuccessRate } from "../dataSelectors/getMissionSuccessRate";
import { DbSimulationData } from "@/logic/indexedDb/indexedDb";
import { AnalyticsGroupCheckboxes } from "../missionSuccessRateTab/missionSuccessRateTab";
import { isValue } from "@/utils/checks";

type Props = {
  simulations: DbSimulationData[];
  simulationsKeys: AnalyticsGroupCheckboxes;
};

const BarMemo = memo(Bar);

export const MissionSuccessRateChart: React.FC<Props> = ({ simulations, simulationsKeys }) => {
  const dataSuccessRate = useMemo(() => {
    const a = simulations
      .filter((item) => {
        const group = simulationsKeys[item.data.analyticsGroupId ?? "unknown"];

        if (!isValue(group)) {
          return false;
        }

        return group.checked;
      })
      .map((item) => item.data);

    return getMissionSuccessRate(a);
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
      <BarMemo data={dataSuccessRate} options={options} />
    </ChartWrapperAuthority>
  );
};
