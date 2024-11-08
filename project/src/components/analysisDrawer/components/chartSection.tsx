import { memo, Suspense } from "react";
import { TrustEvolutionChart } from "../charts/authorityReputationChart";
import { DirectIndirectTrustChart } from "../charts/directIndirectTrustChart";
import { DbData } from "@/logic/indexedDb/indexedDb";

type Props = {
  datasets: DbData[];
  labels: string[];
  defferedMs: number;
  scrollable?: boolean;
};

export const ChartSection: React.FC<Props> = memo(({ datasets, labels, defferedMs, scrollable = false }) => {
  return (
    <Suspense fallback={<h2>Loading...</h2>}>
      <div className={`${scrollable ? "overflow-auto" : ""} flex flex-wrap flex-1`}>
        {defferedMs < 100 ? (
          <h2>Graph scale is too small</h2>
        ) : (
          <>
            <TrustEvolutionChart analyticsData={datasets} ms={defferedMs} />
            {labels &&
              labels.map((label) => (
                <DirectIndirectTrustChart key={label} simulationRunsData={datasets} robotId={label} ms={defferedMs} />
              ))}
          </>
        )}
      </div>
    </Suspense>
  );
});
