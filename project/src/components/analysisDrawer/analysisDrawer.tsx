import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { ChartAreaIcon } from "lucide-react";
import { TrustEvolutionChart } from "./charts/authorityReputationChart";
import { memo, Suspense, useDeferredValue, useEffect, useMemo, useState } from "react";
import { DirectIndirectTrustChart } from "./charts/directIndirectTrustChart";

import { DbSimulationData, getAllSimulations } from "@/logic/indexedDb/indexedDb";
import { AnalyticsSimulationSelector } from "./components/analyticsSimulationSelector";

type AnalysisDrawerProps = {
  //   labels: string[];
};

export const AnalysisDrawer: React.FC<AnalysisDrawerProps> = memo(() => {
  const [hasOpened, setHasOpened] = useState(false);
  const [checkboxes, setCheckboxes] = useState<{ [key: string]: boolean }>({});
  const [ms, setMs] = useState<number>(500);
  const defferedMs = useDeferredValue(ms);

  const [simulations, setSimulations] = useState<DbSimulationData[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  const datasets = useMemo(
    () => simulations.filter((sim) => checkboxes[sim.seed]).map((sim) => sim.data),
    [checkboxes],
  );

  useEffect(() => {
    (async () => {
      const data = await getAllSimulations();

      setSimulations(data);

      const setNames = new Set<string>();
      data.forEach((item) => {
        for (const key in item.data.authority) {
          setNames.add(key);
        }
      });
      setLabels(Array.from(setNames));

      const newCheckboxes: { [key: string]: boolean } = {};
      data.forEach((item) => {
        newCheckboxes[item.seed] = false;
      });

      setCheckboxes((prev) => ({ ...newCheckboxes, ...prev }));
    })();
  }, [hasOpened]);

  const toggleCheckbox = (key: string) => {
    setCheckboxes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Sheet onOpenChange={(e) => setHasOpened(e)}>
      <SheetTrigger className="bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 w-9 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
        <ChartAreaIcon />
      </SheetTrigger>

      <SheetContent side={"left"} className="w-[calc(100vw-5rem)] max-w-[calc(100vw-5rem)]">
        <SheetHeader>
          <SheetTitle>Simulation Analysis</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="flex flex-row h-[calc(100%-36px)]">
          <Suspense fallback={<h2>Loading...</h2>}>
            <div className="overflow-auto flex flex-wrap h-[calc(100%-36px)] flex-1">
              {defferedMs < 100 ? (
                <h2>Graph scale is too small</h2>
              ) : (
                <>
                  <TrustEvolutionChart analyticsData={datasets} ms={defferedMs} />
                  {labels &&
                    labels.map((label) => (
                      <DirectIndirectTrustChart
                        key={label}
                        simulationRunsData={datasets}
                        robotId={label}
                        ms={defferedMs}
                      />
                    ))}
                </>
              )}
            </div>
          </Suspense>

          <AnalyticsSimulationSelector simulationsKeys={checkboxes} toggleCheckbox={toggleCheckbox} setMs={setMs} />
        </div>
      </SheetContent>
    </Sheet>
  );
});
