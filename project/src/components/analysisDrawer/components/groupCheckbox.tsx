import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useClickOutside } from "@/hooks/useClickOutside";
import { DbSimulationData, updateGroupNameToAll } from "@/logic/indexedDb/indexedDb";
import { Pencil } from "lucide-react";
import { Dispatch, memo, SetStateAction, useRef, useState } from "react";
import { AnalyticsGroupCheckboxes } from "../missionSuccessRateTab/missionSuccessRateTab";
import { AnalyticsCheckboxes } from "../analysisDrawer";

type Props = {
  groupId: string;
  groups: AnalyticsGroupCheckboxes;
  updateGroupCheckbox: Dispatch<SetStateAction<AnalyticsGroupCheckboxes>>;
  updateCheckbox: Dispatch<SetStateAction<AnalyticsCheckboxes>>;
  setSimulations: Dispatch<SetStateAction<DbSimulationData[]>>;
};

export const GroupCheckbox: React.FC<Props> = memo(
  ({ groupId, groups, updateCheckbox, updateGroupCheckbox, setSimulations }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isInEditMode, setIsInEditMode] = useState(false);
    const [groupLabel, setGroupLabel] = useState(groupId);

    useClickOutside(ref, async () => {
      setIsInEditMode(false);
      if (groupId === groupLabel) return;

      updateCheckbox((prev) => {
        const updated: AnalyticsCheckboxes = {};
        for (const id in prev) {
          const item = {
            ...prev[id],
            analyticsGroupId: prev[id].analyticsGroupId === groupId ? groupLabel : prev[id].analyticsGroupId,
          };

          updated[id] = item;
        }
        return updated;
      });

      setSimulations((prev) => {
        const simulations: DbSimulationData[] = [];
        prev.forEach((sim) => {
          if (sim.data.analyticsGroupId === groupId) {
            sim.data.analyticsGroupId = groupLabel;
          }
          simulations.push(sim);
        });

        return simulations;
      });

      await updateGroupNameToAll(groupId, groupLabel);
    }, [groupLabel, groupId]);

    const toggleCheckbox = (key: string, value: boolean) => {
      updateGroupCheckbox((prev) => ({ ...prev, [key]: { ...prev[key], checked: value } }));
      updateCheckbox((prev) => {
        const updated: AnalyticsCheckboxes = {};
        for (const id in prev) {
          const item = {
            ...prev[id],
            checked: prev[id].analyticsGroupId === key ? value : prev[id].checked,
          };

          updated[id] = item;
        }
        return updated;
      });
    };

    return (
      <div className="flex justify-between gap-2" ref={ref}>
        <div className="flex items-center space-x-2 w-full">
          <Checkbox
            itemID={groupId}
            onCheckedChange={(value) => {
              toggleCheckbox(groupId, value as boolean);
            }}
            checked={groups[groupId].checked}
          ></Checkbox>
          {isInEditMode ? (
            <div className="flex flex-col gap-2 w-full">
              <Input value={groupLabel} onChange={(e) => setGroupLabel(e.target.value)} />
            </div>
          ) : (
            <label
              htmlFor={groupId}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {groupLabel}
            </label>
          )}
        </div>

        <div className="flex flex-row gap-2 items-center">
          <Pencil size={18} onClick={() => setIsInEditMode(true)} className="cursor-pointer" />
        </div>
      </div>
    );
  },
);
