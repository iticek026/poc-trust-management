import { Dispatch, SetStateAction } from "react";
import { MilisecondsInput } from "./milisecondsInput";
import { DataSelector } from "./dataSelector";
import { AnalyticsCheckboxes } from "../analysisDrawer";

type Props = {
  simulationsKeys: AnalyticsCheckboxes;
  setCheckboxes: Dispatch<SetStateAction<AnalyticsCheckboxes>>;
  setMs: (ms: number) => void;
  defferedMs: number;
};

export const AnalyticsSimulationSelector: React.FC<Props> = ({ simulationsKeys, setCheckboxes, setMs, defferedMs }) => {
  return (
    <div className="w-72 h-full bg-gray-100 rounded-sm flex flex-col">
      <MilisecondsInput onChange={setMs} value={defferedMs} />
      <DataSelector simulationsKeys={simulationsKeys} setCheckboxes={setCheckboxes} />
    </div>
  );
};
