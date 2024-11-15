import { DatasetSelect } from "./datasetSelect";
import { DbSimulationData } from "@/logic/indexedDb/indexedDb";
import { memo, useEffect, useMemo, useState } from "react";
import { isValue } from "@/utils/checks";
import { ComparingChartSection } from "./chartSectionComparing";

type Props = {
  simulations: DbSimulationData[];
  defferedMs: number;
};

export const ComparingSimulations: React.FC<Props> = memo(({ simulations, defferedMs }) => {
  const [selectedDataset, setSelectedDataset] = useState<string>();
  const [selectedDataset2, setSelectedDataset2] = useState<string>();

  const dataset = useMemo(
    () => simulations.filter((sim) => sim.id === selectedDataset).map((item) => item.data),
    [selectedDataset],
  );
  const dataset2 = useMemo(
    () => simulations.filter((sim) => sim.id === selectedDataset2).map((item) => item.data),
    [selectedDataset2],
  );

  const labels = useMemo(() => {
    const setNames = new Set<string>();

    if (dataset.length === 0) return [];

    for (const key in dataset[0].data.authority) {
      if (dataset[0].data.authority[key].isMalicious) continue;
      setNames.add(key);
    }
    return Array.from(setNames);
  }, [dataset]);

  const [availableDatasets, setAvailableDatasets] = useState<{ id: string; label: string; seed: string }[]>([]);
  const [seedAvailableDatasets, setSeedAvailableDatasets] = useState<{ id: string; label: string; seed: string }[]>([]);

  useEffect(() => {
    const availableDatasets = simulations.map((sim) => ({ id: sim.id, label: sim.data.label, seed: sim.data.seed }));
    setAvailableDatasets(availableDatasets);
    setSelectedDataset2(undefined);

    if (dataset.length === 0) return;
    setSeedAvailableDatasets(availableDatasets.filter((available) => available.seed === dataset[0].seed));
  }, [simulations, selectedDataset]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 pb-3">
        <DatasetSelect onValueChange={setSelectedDataset} availableOptions={availableDatasets} />
        <DatasetSelect
          onValueChange={setSelectedDataset2}
          availableOptions={seedAvailableDatasets}
          value={selectedDataset2 ?? ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 overflow-auto h-full">
        {!isValue(dataset) ? (
          <div>Select simulation</div>
        ) : (
          <>
            <ComparingChartSection datasets={dataset} labels={labels} defferedMs={defferedMs} />
            {isValue(dataset2) && isValue(selectedDataset2) && (
              <ComparingChartSection datasets={dataset2} labels={labels} defferedMs={defferedMs} />
            )}
          </>
        )}
      </div>
    </>
  );
});
