import { DbSimulationData } from "@/logic/indexedDb/indexedDb";
import { DataSelector } from "../components/dataSelector";
import { MissionSuccessRateChart } from "../charts/missionSuccessRateChart";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { AnalyticsCheckboxes } from "../analysisDrawer";
import { AnalyticsGroupSelector } from "./analyticsGroupSelector";
import { Separator } from "@/components/ui/separator";
import { isValue } from "@/utils/checks";
import { getMissionSuccessRate } from "../dataSelectors/getMissionSuccessRate";
import { getMaliciousRobotsDetected } from "../dataSelectors/getMaliciousRobotDetected";
import { MalRobotsDetectedChart } from "../charts/malRobotsDetectedChart";

type Props = {
  simulations: DbSimulationData[];
  simulationsKeys: AnalyticsCheckboxes;
  setCheckboxes: Dispatch<SetStateAction<AnalyticsCheckboxes>>;
  setSimulations: Dispatch<SetStateAction<DbSimulationData[]>>;
};

export type AnalyticsGroupCheckboxes = {
  [key: string]: { checked: boolean };
};

export const MissionSuccessRateTab: React.FC<Props> = ({
  simulations,
  simulationsKeys,
  setCheckboxes,
  setSimulations,
}) => {
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

  const dataSuccessRate = useMemo(() => {
    const a = simulations
      .filter((item) => {
        const group = groupKeys[item.data.analyticsGroupId ?? "unknown"];

        if (!isValue(group)) {
          return false;
        }

        return group.checked;
      })
      .map((item) => item.data);

    return getMissionSuccessRate(a);
  }, [simulations, groupKeys]);

  const dataMalDetection = useMemo(() => {
    const a = simulations
      .filter((item) => {
        const group = groupKeys[item.data.analyticsGroupId ?? "unknown"];

        if (!isValue(group)) {
          return false;
        }

        return group.checked;
      })
      .map((item) => item.data);

    return getMaliciousRobotsDetected(a);
  }, [simulations, groupKeys]);

  return (
    <div className="flex flex-row overflow-auto h-[calc(100%)] ">
      <div className="flex pr-2 w-full flex-col gap-2">
        {Object.keys(groupKeys).length > 0 ? <MissionSuccessRateChart data={dataSuccessRate} /> : <div> No data </div>}
        {Object.keys(groupKeys).length > 0 ? <MalRobotsDetectedChart data={dataMalDetection} /> : <div> No data </div>}
      </div>
      <div className="w-96 h-full bg-gray-100 rounded-sm flex flex-col pt-1 pb-1 pl-2">
        <AnalyticsGroupSelector
          groupKeys={groupKeys}
          setGroupsKeys={setGroupsKeys}
          setCheckboxes={setCheckboxes}
          setSimulations={setSimulations}
        />
        <Separator />
        <DataSelector
          simulationsKeys={simulationsKeys}
          setCheckboxes={setCheckboxes}
          isGroupEditable
          setSimulations={setSimulations}
        />
      </div>
    </div>
  );
};
