import { memo, Suspense, useMemo } from "react";
import { TrustEvolutionChart } from "../charts/authorityReputationChart";
import { DirectIndirectTrustChart } from "../charts/directIndirectTrustChart";
import { DbData } from "@/logic/indexedDb/indexedDb";
import { getAggregatedDirectIndirectTrustData } from "../dataSelectors/aggregatedDirectIndirectTrustData";
import { getAggregatedDirectIndirectTrustDataMalicious } from "../dataSelectors/aggregatedDirectIndirectTrustDataMalicious";
import { getAggregatedDirectIndirectTrustDataNonMalicious } from "../dataSelectors/aggregatedDirectIndirectTrustDataNonMalicious";
import { BarChartSimTime } from "../charts/barChartSimTime";
import { MessagesCountChart } from "../charts/messagesCountChart";
import { getAllRobotsReputationData } from "../dataSelectors/allRobotsReputationData";
import { getSimulationFinishTimeBasedOnTrust } from "../dataSelectors/getSimulationsFinishTime";
import { getAllRobotsMessageCountData } from "../dataSelectors/getMessagesComparison";

type Props = {
  datasets: DbData[];
  labels: string[];
  defferedMs: number;
  scrollable?: boolean;
};

export const BasicChartSection: React.FC<Props> = memo(({ datasets, labels, defferedMs, scrollable = false }) => {
  const dataset = useMemo(() => datasets.map((item) => item.data), [datasets]);
  return (
    <Suspense fallback={<h2>Loading...</h2>}>
      <div className={`${scrollable ? "overflow-auto" : ""} flex flex-wrap flex-1`}>
        {defferedMs < 100 ? (
          <h2>Graph scale is too small</h2>
        ) : (
          <>
            <div className="flex flex-row gap-2 w-full">
              <TrustEvolutionChart data={getAllRobotsReputationData(dataset, defferedMs)} />
              <BarChartSimTime data={getSimulationFinishTimeBasedOnTrust(datasets)} />
              <MessagesCountChart data={getAllRobotsMessageCountData(dataset, defferedMs)} />
            </div>
            {labels &&
              labels.map((label) => (
                <div className="flex flex-col w-full" key={label}>
                  <span>{label}</span>
                  <div className="flex flex-row">
                    <DirectIndirectTrustChart
                      data={getAggregatedDirectIndirectTrustData(label, dataset, defferedMs)}
                      chartLabel="Direct and Indirect Trust"
                    />
                    <DirectIndirectTrustChart
                      data={getAggregatedDirectIndirectTrustDataMalicious(label, dataset, defferedMs)}
                      chartLabel="Direct and Indirect Trust with Malicious"
                    />
                    <DirectIndirectTrustChart
                      data={getAggregatedDirectIndirectTrustDataNonMalicious(label, dataset, defferedMs)}
                      chartLabel="Direct and Indirect Trust with Non-Malicious"
                    />
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
    </Suspense>
  );
});
