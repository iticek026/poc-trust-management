import { memo, Suspense, useMemo } from "react";
import { TrustEvolutionChart } from "../charts/authorityReputationChart";
import { DirectIndirectTrustChart } from "../charts/directIndirectTrustChart";
import { DbData } from "@/logic/indexedDb/indexedDb";
import { getAggregatedDirectIndirectTrustData } from "../dataSelectors/aggregatedDirectIndirectTrustData";
import { getAggregatedDirectIndirectTrustDataMalicious } from "../dataSelectors/aggregatedDirectIndirectTrustDataMalicious";
import { getAggregatedDirectIndirectTrustDataNonMalicious } from "../dataSelectors/aggregatedDirectIndirectTrustDataNonMalicious";
import { MessagesCountChart } from "../charts/messagesCountChart";

type Props = {
  datasets: DbData[];
  labels: string[];
  defferedMs: number;
  scrollable?: boolean;
};

export const ComparingChartSection: React.FC<Props> = memo(({ datasets, labels, defferedMs, scrollable = false }) => {
  const dataset = useMemo(() => datasets.map((item) => item.data), [datasets]);

  return (
    <Suspense fallback={<h2>Loading...</h2>}>
      <div className={`${scrollable ? "overflow-auto" : ""} flex flex-wrap flex-1 flex-col gap-2`}>
        {defferedMs < 100 ? (
          <h2>Graph scale is too small</h2>
        ) : (
          <>
            <TrustEvolutionChart dataset={dataset} defferedMs={defferedMs} />
            <MessagesCountChart dataset={dataset} defferedMs={defferedMs} />
            {labels &&
              labels.map((label) => (
                <div className="flex flex-col w-full" key={label}>
                  <span>{label}</span>
                  <div className="flex flex-col gap-2">
                    <DirectIndirectTrustChart
                      robotId={label}
                      dataset={dataset}
                      defferedMs={defferedMs}
                      func={getAggregatedDirectIndirectTrustData}
                      chartLabel="Direct and Indirect Trust"
                      isComparingLayout
                    />
                    <DirectIndirectTrustChart
                      robotId={label}
                      dataset={dataset}
                      defferedMs={defferedMs}
                      func={getAggregatedDirectIndirectTrustDataMalicious}
                      chartLabel="Direct and Indirect Trust with Malicious"
                      isComparingLayout
                    />
                    <DirectIndirectTrustChart
                      robotId={label}
                      dataset={dataset}
                      defferedMs={defferedMs}
                      func={getAggregatedDirectIndirectTrustDataNonMalicious}
                      chartLabel="Direct and Indirect Trust with Non-Malicious"
                      isComparingLayout
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
