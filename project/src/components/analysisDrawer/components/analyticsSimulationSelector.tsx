import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";

type Props = {
  simulationsKeys: { [key: string]: boolean };
  toggleCheckbox: (seed: string) => void;
  setMs: (ms: number) => void;
};

export const AnalyticsSimulationSelector: React.FC<Props> = ({ simulationsKeys, toggleCheckbox, setMs }) => {
  const seeds = useMemo(() => Object.keys(simulationsKeys), [simulationsKeys]);

  const renderCheckbox = (key: string) => {
    return (
      <div className="flex items-center space-x-2" key={key}>
        <Checkbox
          itemID={key}
          onCheckedChange={() => {
            toggleCheckbox(key);
          }}
          checked={simulationsKeys[key]}
        ></Checkbox>
        <label
          htmlFor={key}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {key}
        </label>
      </div>
    );
  };
  const renderSimulations = () => {
    return <div className="flex flex-col gap-2 p-4">{seeds.map((key) => renderCheckbox(key))}</div>;
  };

  return (
    <div className="w-72 h-full bg-gray-100 rounded-sm flex flex-col">
      <Input
        type="number"
        placeholder="Miliseconds graph scale"
        onChange={(e) => setMs(parseInt(e.currentTarget.value))}
        min={100}
      />
      {seeds.length > 0 ? renderSimulations() : <span>No simulations available</span>}
    </div>
  );
};
