import { DbSimulationData, deleteSimulation } from "@/logic/indexedDb/indexedDb";
import { Dispatch, SetStateAction } from "react";
import { SimulationRunCheckbox } from "./simulationRunCheckbox";
import { AnalyticsCheckboxes } from "../analysisDrawer";

type Props = {
  simulationsKeys: AnalyticsCheckboxes;
  setCheckboxes: Dispatch<SetStateAction<AnalyticsCheckboxes>>;
  isGroupEditable?: boolean;
  setSimulations: Dispatch<SetStateAction<DbSimulationData[]>>;
};

export const DataSelector: React.FC<Props> = ({
  simulationsKeys,
  setCheckboxes,
  isGroupEditable = false,
  setSimulations,
}) => {
  const renderSimulations = () => {
    return (
      <div className="flex flex-col gap-2 p-4 overflow-auto">
        {Object.keys(simulationsKeys).map((key) => (
          <SimulationRunCheckbox
            isGroupEditable={isGroupEditable}
            id={key}
            key={key}
            simulationsKeys={simulationsKeys}
            updateCheckbox={setCheckboxes}
            setSimulations={setSimulations}
            deleteSimulation={async () => {
              await deleteSimulation(key);
              setCheckboxes((prev) => {
                const { [key]: _, ...rest } = prev;
                return rest;
              });
            }}
          />
        ))}
      </div>
    );
  };

  return <>{Object.keys(simulationsKeys).length > 0 ? renderSimulations() : <span>No simulations available</span>}</>;
};
