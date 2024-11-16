import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useClickOutside } from "@/hooks/useClickOutside";
import { updateRecordName } from "@/logic/indexedDb/indexedDb";
import { Trash2, Pencil } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

type Props = {
  id: string;
  deleteSimulation: () => Promise<void>;
  simulationsKeys: { [key: string]: { checked: boolean; label: string; seed: string } };
  toggleCheckbox: () => void;
};

export const SimulationRunCheckbox: React.FC<Props> = memo(
  ({ id, simulationsKeys, toggleCheckbox, deleteSimulation }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isInEditMode, setIsInEditMode] = useState(false);

    const [label, setLabel] = useState(simulationsKeys[id].label);

    useClickOutside(ref, async () => {
      setIsInEditMode(false);
      await updateRecordName(id, label);
    }, [label]);

    return (
      <div className="flex justify-between" key={id} ref={ref}>
        <div className="flex items-center space-x-2">
          <Checkbox
            itemID={id}
            onCheckedChange={() => {
              toggleCheckbox();
            }}
            checked={simulationsKeys[id].checked}
          ></Checkbox>
          {isInEditMode ? (
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          ) : (
            <label
              htmlFor={id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label} <span className="text-xs">({simulationsKeys[id].seed})</span>
            </label>
          )}
        </div>

        <div className="flex flex-row gap-2 items-center">
          <Trash2 size={18} onClick={async () => await deleteSimulation()} className="cursor-pointer" />
          <Pencil size={18} onClick={() => setIsInEditMode(true)} className="cursor-pointer" />
        </div>
      </div>
    );
  },
);
