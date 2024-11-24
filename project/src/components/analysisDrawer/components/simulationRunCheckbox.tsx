import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useClickOutside } from "@/hooks/useClickOutside";
import { updateGroupName, updateRecordName } from "@/logic/indexedDb/indexedDb";
import { Trash2, Pencil } from "lucide-react";
import { Dispatch, memo, SetStateAction, useEffect, useRef, useState } from "react";
import { AnalyticsCheckboxes } from "../analysisDrawer";

type Props = {
  id: string;
  deleteSimulation: () => Promise<void>;
  simulationsKeys: AnalyticsCheckboxes;
  updateCheckbox: Dispatch<SetStateAction<AnalyticsCheckboxes>>;
  isGroupEditable: boolean;
};

export const SimulationRunCheckbox: React.FC<Props> = memo(
  ({ id, simulationsKeys, deleteSimulation, isGroupEditable, updateCheckbox }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isInEditMode, setIsInEditMode] = useState(false);
    const [groupLabel, setGroupLabel] = useState(simulationsKeys[id].analyticsGroupId);

    useEffect(() => {
      setGroupLabel(simulationsKeys[id].analyticsGroupId);
    }, [simulationsKeys[id].analyticsGroupId]);

    useClickOutside(ref, async () => {
      setIsInEditMode(false);
      await updateRecordName(id, simulationsKeys[id].label);

      if (simulationsKeys[id].analyticsGroupId === groupLabel) return;
      await updateGroupName(id, groupLabel);
      updateCheckbox((prev) => ({ ...prev, [id]: { ...prev[id], analyticsGroupId: groupLabel } }));
    }, [simulationsKeys[id].label, groupLabel, simulationsKeys[id].analyticsGroupId]);

    const toggleCheckbox = (key: string) => {
      updateCheckbox((prev) => ({ ...prev, [key]: { ...prev[key], checked: !prev[key].checked } }));
    };

    return (
      <div className="flex justify-between gap-2" key={id} ref={ref}>
        <div className="flex items-center space-x-2 w-full">
          <Checkbox
            itemID={id}
            onCheckedChange={() => {
              toggleCheckbox(id);
            }}
            checked={simulationsKeys[id].checked}
          ></Checkbox>
          {isInEditMode ? (
            <div className="flex flex-col gap-2 w-full">
              <Input
                value={simulationsKeys[id].label}
                onChange={(e) => updateCheckbox((prev) => ({ ...prev, [id]: { ...prev[id], label: e.target.value } }))}
              />
              {isGroupEditable && <Input value={groupLabel} onChange={(e) => setGroupLabel(e.target.value)} />}
            </div>
          ) : (
            <label
              htmlFor={id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {simulationsKeys[id].label}{" "}
              <span className="text-xs">
                ({simulationsKeys[id].seed}
                {isGroupEditable ? `, ${simulationsKeys[id].analyticsGroupId}` : ""})
              </span>
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
