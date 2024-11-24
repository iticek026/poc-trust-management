import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { GroupCheckbox } from "../components/groupCheckbox";
import { AnalyticsGroupCheckboxes } from "./missionSuccessRateTab";
import { AnalyticsCheckboxes } from "../analysisDrawer";
import { isValue } from "@/utils/checks";

type Props = {
  simulationsKeys: AnalyticsCheckboxes;
  setCheckboxes: Dispatch<SetStateAction<AnalyticsCheckboxes>>;
};

export const AnalyticsGroupSelector: React.FC<Props> = ({ simulationsKeys, setCheckboxes }) => {
  const [groupKeys, setGroupsKeys] = useState<AnalyticsGroupCheckboxes>({});

  useEffect(() => {
    const uniqueGroupKeys = new Set<string>();
    for (const id in simulationsKeys) {
      const sim = simulationsKeys[id];
      uniqueGroupKeys.add(sim.analyticsGroupId ?? "unknown");
    }

    const newGroupKeys: AnalyticsGroupCheckboxes = {};
    uniqueGroupKeys.forEach((key) => {
      if (isValue(groupKeys[key])) {
        newGroupKeys[key] = { checked: groupKeys[key].checked };
      } else {
        newGroupKeys[key] = { checked: false };
      }
    });

    setGroupsKeys(newGroupKeys);
  }, [simulationsKeys]);

  return (
    <div className="max-h-40 overflow-auto gap-2 p-4 flex flex-col">
      <span>Groups</span>
      {Object.keys(groupKeys).map((key) =>
        isValue(groupKeys[key]) ? (
          <GroupCheckbox
            groupId={key}
            key={key}
            groups={groupKeys}
            updateCheckbox={setCheckboxes}
            updateGroupCheckbox={setGroupsKeys}
          />
        ) : null,
      )}
    </div>
  );
};
