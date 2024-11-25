import { Dispatch, SetStateAction } from "react";
import { MilisecondsInput } from "./milisecondsInput";
import { DataSelector } from "./dataSelector";
import { AnalyticsCheckboxes } from "../analysisDrawer";
import { DbSimulationData } from "@/logic/indexedDb/indexedDb";

type Props = {
  simulationsKeys: AnalyticsCheckboxes;
  setCheckboxes: Dispatch<SetStateAction<AnalyticsCheckboxes>>;
  setMs: (ms: number) => void;
  defferedMs: number;
  setSimulations: Dispatch<SetStateAction<DbSimulationData[]>>;
};

export const AnalyticsSimulationSelector: React.FC<Props> = ({
  simulationsKeys,
  setCheckboxes,
  setMs,
  defferedMs,
  setSimulations,
}) => {
  return (
    <div className="w-72 h-full bg-gray-100 rounded-sm flex flex-col">
      <MilisecondsInput onChange={setMs} value={defferedMs} />
      <DataSelector simulationsKeys={simulationsKeys} setCheckboxes={setCheckboxes} setSimulations={setSimulations} />
    </div>
  );
};
