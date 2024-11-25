import { Dispatch, SetStateAction } from "react";
import { GroupCheckbox } from "../components/groupCheckbox";
import { AnalyticsGroupCheckboxes } from "./missionSuccessRateTab";
import { AnalyticsCheckboxes } from "../analysisDrawer";
import { isValue } from "@/utils/checks";
import { DbSimulationData } from "@/logic/indexedDb/indexedDb";

type Props = {
  setCheckboxes: Dispatch<SetStateAction<AnalyticsCheckboxes>>;
  groupKeys: AnalyticsGroupCheckboxes;
  setGroupsKeys: Dispatch<SetStateAction<AnalyticsGroupCheckboxes>>;
  setSimulations: Dispatch<SetStateAction<DbSimulationData[]>>;
};

export const AnalyticsGroupSelector: React.FC<Props> = ({
  setCheckboxes,
  groupKeys,
  setGroupsKeys,
  setSimulations,
}) => {
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
            setSimulations={setSimulations}
          />
        ) : null,
      )}
    </div>
  );
};
