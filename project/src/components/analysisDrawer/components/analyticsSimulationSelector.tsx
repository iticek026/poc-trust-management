import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { MilisecondsInput } from "./milisecondsInput";
import { deleteSimulation } from "@/logic/indexedDb/indexedDb";
import { SimulationRunCheckbox } from "./simulationRunCheckbox";

type Props = {
  simulationsKeys: { [key: string]: { checked: boolean; label: string; seed: string } };
  setCheckboxes: Dispatch<
    SetStateAction<{
      [key: string]: {
        checked: boolean;
        label: string;
        seed: string;
      };
    }>
  >;
  setMs: (ms: number) => void;
  defferedMs: number;
};

export const AnalyticsSimulationSelector: React.FC<Props> = ({ simulationsKeys, setCheckboxes, setMs, defferedMs }) => {
  const [keys, setKeys] = useState<string[]>(Object.keys(simulationsKeys));

  useEffect(() => {
    setKeys(Object.keys(simulationsKeys));
  }, [simulationsKeys]);

  const toggleCheckbox = (key: string) => {
    setCheckboxes((prev) => ({ ...prev, [key]: { ...prev[key], checked: !prev[key].checked } }));
  };

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

  return (
    <div className="w-72 h-full bg-gray-100 rounded-sm flex flex-col">
      <MilisecondsInput onChange={setMs} value={defferedMs} />
      {keys.length > 0 ? renderSimulations() : <span>No simulations available</span>}
    </div>
  );
};
