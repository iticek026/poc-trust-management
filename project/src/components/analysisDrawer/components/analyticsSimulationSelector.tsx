import { useEffect, useState } from "react";
import { MilisecondsInput } from "./milisecondsInput";
import { deleteSimulation } from "@/logic/indexedDb/indexedDb";
import { SimulationRunCheckbox } from "./simulationRunCheckbox";

type Props = {
  simulationsKeys: { [key: string]: { checked: boolean; label: string; seed: string } };
  toggleCheckbox: (seed: string) => void;
  setMs: (ms: number) => void;
  defferedMs: number;
};

export const AnalyticsSimulationSelector: React.FC<Props> = ({
  simulationsKeys,
  toggleCheckbox,
  setMs,
  defferedMs,
}) => {
  const [keys, setKeys] = useState<string[]>(Object.keys(simulationsKeys));

  useEffect(() => {
    setKeys(Object.keys(simulationsKeys));
  }, [simulationsKeys]);

  const renderSimulations = () => {
    return (
      <div className="flex flex-col gap-2 p-4">
        {keys.map((key) => (
          <SimulationRunCheckbox
            id={key}
            key={key}
            toggleCheckbox={() => toggleCheckbox(key)}
            simulationsKeys={simulationsKeys}
            deleteSimulation={async () => {
              await deleteSimulation(key);
              setKeys((prev) => prev.filter((k) => k !== key));
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-72 h-full bg-gray-100 rounded-sm flex flex-col">
      <MilisecondsInput onChange={setMs} value={defferedMs} />
      {keys.length > 0 ? renderSimulations() : <span>No simulations available</span>}
    </div>
  );
};
