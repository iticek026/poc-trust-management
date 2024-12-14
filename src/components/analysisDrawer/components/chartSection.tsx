import { memo, Suspense, useMemo } from "react";
import { TrustEvolutionChart } from "../charts/authorityReputationChart";
import { DirectIndirectTrustChart } from "../charts/directIndirectTrustChart";
import { DbSimulationData } from "@/logic/indexedDb/indexedDb";
import { getAggregatedDirectIndirectTrustData } from "../dataSelectors/aggregatedDirectIndirectTrustData";
import { getAggregatedDirectIndirectTrustDataMalicious } from "../dataSelectors/aggregatedDirectIndirectTrustDataMalicious";
import { getAggregatedDirectIndirectTrustDataNonMalicious } from "../dataSelectors/aggregatedDirectIndirectTrustDataNonMalicious";
import { BarChartSimTime } from "../charts/barChartSimTime";
import { MessagesCountChart } from "../charts/messagesCountChart";
import { isValue } from "@/utils/checks";
import { AnalyticsCheckboxes } from "../analysisDrawer";

type Props = {
  simulations: DbSimulationData[];
  defferedMs: number;
  scrollable?: boolean;
  simulationsKeys: AnalyticsCheckboxes;
};

export const BasicChartSection: React.FC<Props> = memo(
  ({ simulations, simulationsKeys, defferedMs, scrollable = false }) => {
    const datasets = useMemo(
      () =>
        simulations
          .filter((sim) => isValue(simulationsKeys[sim.id]) && simulationsKeys[sim.id].checked)
          .map((sim) => sim.data),
      [simulationsKeys],
    );

    const dataset = useMemo(() => datasets.map((item) => item.data), [datasets]);

    const labels = useMemo(() => {
      const setNames = new Set<string>();
      datasets.forEach((item) => {
        for (const key in item.data.authority) {
          if (item.data.authority[key].isMalicious) continue;
          setNames.add(key);
        }
      });
      return Array.from(setNames);
    }, [datasets]);

    return (
      <Suspense fallback={<h2>Loading...</h2>}>
        <div className={`${scrollable ? "overflow-auto" : ""} flex flex-wrap flex-1`}>
          {defferedMs < 100 ? (
            <h2>Graph scale is too small</h2>
          ) : (
            <>
              <div className="flex flex-row gap-2 w-full">
                <TrustEvolutionChart dataset={dataset} defferedMs={defferedMs} />
                <BarChartSimTime datasets={datasets} />
                <MessagesCountChart dataset={dataset} defferedMs={defferedMs} />
              </div>
              {labels &&
                labels.map((label) =>
                  dataset.find((item) => isValue(item.robots[label])) ? (
                    <div className="flex flex-col w-full" key={label}>
                      <span>{label}</span>
                      <div className="flex flex-row gap-2">
                        <DirectIndirectTrustChart
                          robotId={label}
                          dataset={dataset}
                          defferedMs={defferedMs}
                          func={getAggregatedDirectIndirectTrustData}
                          chartLabel="Direct and Indirect Trust"
                        />
                        <DirectIndirectTrustChart
                          robotId={label}
                          dataset={dataset}
                          defferedMs={defferedMs}
                          func={getAggregatedDirectIndirectTrustDataMalicious}
                          chartLabel="Direct and Indirect Trust with Malicious"
                        />
                        <DirectIndirectTrustChart
                          robotId={label}
                          dataset={dataset}
                          defferedMs={defferedMs}
                          func={getAggregatedDirectIndirectTrustDataNonMalicious}
                          chartLabel="Direct and Indirect Trust with Non-Malicious"
                        />
                      </div>
                    </div>
                  ) : null,
                )}
            </>
          )}
        </div>
      </Suspense>
    );
  },
);
