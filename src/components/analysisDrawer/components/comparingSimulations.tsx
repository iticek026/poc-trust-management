import { DatasetSelect } from "./datasetSelect";
import { DbSimulationData } from "@/logic/indexedDb/indexedDb";
import { memo, useEffect, useMemo, useState } from "react";
import { isValue } from "@/utils/checks";
import { ComparingChartSection } from "./chartSectionComparing";
import { RobotSelect } from "./robotSelect";
import { ComparingChartSectionSingleRobot } from "./chartSectionComparingSingleRobot";
import { AnalyticsCheckboxes } from "../analysisDrawer";

type Props = {
  simulations: DbSimulationData[];
  defferedMs: number;
  simulationsKeys: AnalyticsCheckboxes;
};

export const ComparingSimulations: React.FC<Props> = memo(({ simulations, defferedMs, simulationsKeys }) => {
  const [selectedDataset, setSelectedDataset] = useState<number>();
  const [selectedDataset2, setSelectedDataset2] = useState<number>();
  const [selectedRobot, setSelectedRobot] = useState<string>();

  const dataset = useMemo(
    () => simulations.filter((sim) => (sim.id as unknown as number) === selectedDataset).map((item) => item.data),
    [selectedDataset],
  );
  const dataset2 = useMemo(
    () => simulations.filter((sim) => (sim.id as unknown as number) === selectedDataset2).map((item) => item.data),
    [selectedDataset2],
  );

  const labels = useMemo(() => {
    if (dataset.length === 0) return { malicious: [], nonmalicious: [] };
    const nonMal = new Set<string>();
    const mal = new Set<string>();

    for (const key in dataset[0].data.authority) {
      if (dataset[0].data.authority[key].isMalicious) {
        mal.add(key);
        continue;
      }
      nonMal.add(key);
    }
    return { malicious: Array.from(mal), nonmalicious: Array.from(nonMal) };
  }, [dataset]);

  const [availableDatasets, setAvailableDatasets] = useState<{ id: number; label: string; seed: string }[]>([]);
  const [seedAvailableDatasets, setSeedAvailableDatasets] = useState<{ id: number; label: string; seed: string }[]>([]);

  useEffect(() => {
    const availableDatasets = [];

    for (const id in simulationsKeys) {
      const sim = simulationsKeys[id];
      availableDatasets.push({
        id: Number(id),
        label: sim.label,
        seed: sim.seed,
        analyticsGroupId: sim.analyticsGroupId,
      });
    }

    setAvailableDatasets(availableDatasets);
    setSelectedDataset2(undefined);

    if (dataset.length === 0) return;
    setSeedAvailableDatasets(availableDatasets.filter((available) => available.seed === dataset[0].seed));
  }, [simulationsKeys, selectedDataset]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 pb-3">
        <div className="flex flex-row gap-2">
          <DatasetSelect onValueChange={(e) => setSelectedDataset(Number(e))} availableOptions={availableDatasets} />
          <RobotSelect
            onValueChange={setSelectedRobot}
            availableOptions={[...labels.malicious, ...labels.nonmalicious]}
          />
        </div>
        <DatasetSelect
          onValueChange={(e) => setSelectedDataset2(Number(e))}
          availableOptions={seedAvailableDatasets}
          value={isValue(selectedDataset2) ? `${selectedDataset2}` : ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 overflow-auto h-full">
        {!isValue(dataset) ? (
          <div>Select simulation</div>
        ) : (
          <>
            {isValue(selectedRobot) && selectedRobot !== "None" ? (
              <>
                <ComparingChartSectionSingleRobot
                  dataset={dataset[0]}
                  labels={labels.nonmalicious}
                  defferedMs={defferedMs}
                  selectedRobot={selectedRobot}
                />
                {isValue(dataset2) && isValue(selectedDataset2) && (
                  <ComparingChartSectionSingleRobot
                    dataset={dataset2[0]}
                    labels={labels.nonmalicious}
                    defferedMs={defferedMs}
                    selectedRobot={selectedRobot}
                  />
                )}
              </>
            ) : (
              <>
                <ComparingChartSection datasets={dataset} labels={labels.nonmalicious} defferedMs={defferedMs} />
                {isValue(dataset2) && isValue(selectedDataset2) && (
                  <ComparingChartSection datasets={dataset2} labels={labels.nonmalicious} defferedMs={defferedMs} />
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
});
