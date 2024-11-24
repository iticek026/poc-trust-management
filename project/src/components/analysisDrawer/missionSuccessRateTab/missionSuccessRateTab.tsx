import { DbSimulationData } from "@/logic/indexedDb/indexedDb";
import { DataSelector } from "../components/dataSelector";
import { MissionSuccessRateChart } from "../charts/missionSuccessRateChart";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AnalyticsCheckboxes } from "../analysisDrawer";
import { AnalyticsGroupSelector } from "./analyticsGroupSelector";
import { Separator } from "@/components/ui/separator";

type Props = {
  simulations: DbSimulationData[];
  simulationsKeys: AnalyticsCheckboxes;
  setCheckboxes: Dispatch<SetStateAction<AnalyticsCheckboxes>>;
};

export type AnalyticsGroupCheckboxes = {
  [key: string]: { checked: boolean };
};

export const MissionSuccessRateTab: React.FC<Props> = ({ simulations, simulationsKeys, setCheckboxes }) => {
  return (
    <div className="flex flex-row overflow-auto h-[calc(100%)] ">
      <MissionSuccessRateChart />
      <div className="w-96 h-full bg-gray-100 rounded-sm flex flex-col pt-1 pb-1">
        <AnalyticsGroupSelector simulationsKeys={simulationsKeys} setCheckboxes={setCheckboxes} />
        <Separator />
        <DataSelector simulationsKeys={simulationsKeys} setCheckboxes={setCheckboxes} isGroupEditable />
      </div>
    </div>
  );
};
