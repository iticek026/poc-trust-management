import { memo, Suspense } from "react";
import { TrustEvolutionChart } from "../charts/authorityReputationChart";
import { DirectIndirectTrustChart } from "../charts/directIndirectTrustChart";
import { DbData } from "@/logic/indexedDb/indexedDb";
import { getAggregatedDirectIndirectTrustDataSpecificRobot } from "../dataSelectors/aggregatedDirectIndirectTrustDataSpecificRobot";
import { MessagesCountChart } from "../charts/messagesCountChart";
import { getAllRobotsReputationData } from "../dataSelectors/allRobotsReputationData";
import { getAllRobotsMessageCountData } from "../dataSelectors/getMessagesComparison";

type Props = {
  dataset: DbData;
  labels: string[];
  defferedMs: number;
  selectedRobot: string;
  scrollable?: boolean;
};

export const ComparingChartSectionSingleRobot: React.FC<Props> = memo(
  ({ dataset, labels, defferedMs, selectedRobot, scrollable = false }) => {
    return (
      <Suspense fallback={<h2>Loading...</h2>}>
        <div className={`${scrollable ? "overflow-auto" : ""} flex flex-wrap flex-1 flex-col`}>
          {defferedMs < 100 ? (
            <h2>Graph scale is too small</h2>
          ) : (
            <>
              <TrustEvolutionChart data={getAllRobotsReputationData([dataset.data], defferedMs)} />
              <MessagesCountChart data={getAllRobotsMessageCountData([dataset.data], defferedMs)} />
              {labels &&
                labels
                  .filter((label) => label !== selectedRobot)
                  .map((label) => (
                    <div className="flex flex-col w-full" key={label}>
                      <span>
                        {label} to {selectedRobot}
                      </span>
                      <div className="flex flex-col">
                        <DirectIndirectTrustChart
                          data={getAggregatedDirectIndirectTrustDataSpecificRobot(
                            label,
                            dataset.data,
                            selectedRobot,
                            defferedMs,
                          )}
                          isComparingLayout
                          chartLabel="Direct and Indirect Trust"
                        />
                      </div>
                    </div>
                  ))}
            </>
          )}
        </div>
      </Suspense>
    );
  },
);
