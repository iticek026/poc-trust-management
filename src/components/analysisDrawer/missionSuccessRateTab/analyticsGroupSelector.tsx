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
    <div className="min-h-48 gap-2 flex flex-col">
      <span className="sticky px-4 pt-2">Groups</span>
      <div className="overflow-auto flex  mb-2">
        <div className="gap-2 flex flex-col w-full px-4 py-2">
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
      </div>
    </div>
  );
};
