import { Checkbox } from "@/components/ui/checkbox";
import { useMemo } from "react";
import { MilisecondsInput } from "./milisecondsInput";

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
  const keys = useMemo(() => Object.keys(simulationsKeys), [simulationsKeys]);

  const renderCheckbox = (key: string) => {
    return (
      <div className="flex items-center space-x-2" key={key}>
        <Checkbox
          itemID={key}
          onCheckedChange={() => {
            toggleCheckbox(key);
          }}
          checked={simulationsKeys[key].checked}
        ></Checkbox>
        <label
          htmlFor={key}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {simulationsKeys[key].label} <span className="text-xs">({simulationsKeys[key].seed})</span>
        </label>
      </div>
    );
  };
  const renderSimulations = () => {
    return <div className="flex flex-col gap-2 p-4">{keys.map((key) => renderCheckbox(key))}</div>;
  };

  return (
    <div className="w-72 h-full bg-gray-100 rounded-sm flex flex-col">
      <MilisecondsInput onChange={setMs} value={defferedMs} />
      {keys.length > 0 ? renderSimulations() : <span>No simulations available</span>}
    </div>
  );
};
