import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { ChartAreaIcon } from "lucide-react";
import { memo, useDeferredValue, useEffect, useMemo, useState } from "react";
import { DbSimulationData, getAllSimulations } from "@/logic/indexedDb/indexedDb";
import { AnalyticsSimulationSelector } from "./components/analyticsSimulationSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComparingSimulations } from "./components/comparingSimulations";
import { BasicChartSection } from "./components/chartSection";
import "./initChart";
import { isValue } from "@/utils/checks";
import { MissionSuccessRateTab } from "./missionSuccessRateTab/missionSuccessRateTab";

export type AnalyticsCheckboxes = {
  [key: string]: { checked: boolean; label: string; seed: string; analyticsGroupId: string };
};

export const AnalysisDrawer: React.FC = memo(() => {
  const [hasOpened, setHasOpened] = useState(false);
  const [checkboxes, setCheckboxes] = useState<AnalyticsCheckboxes>({});
  const [ms, setMs] = useState<number>(500);
  const defferedMs = useDeferredValue(ms);

  const [simulations, setSimulations] = useState<DbSimulationData[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  const datasets = useMemo(
    () => simulations.filter((sim) => isValue(checkboxes[sim.id]) && checkboxes[sim.id].checked).map((sim) => sim.data),
    [checkboxes],
  );

  useEffect(() => {
    if (hasOpened) {
      (async () => {
        const data = await getAllSimulations();

        if (!data) return;

        setSimulations(data);

        const setNames = new Set<string>();
        data.forEach((item) => {
          for (const key in item.data.data.authority) {
            if (item.data.data.authority[key].isMalicious) continue;
            setNames.add(key);
          }
        });
        setLabels(Array.from(setNames));

        const newCheckboxes: AnalyticsCheckboxes = {};
        data.forEach((item) => {
          newCheckboxes[item.id] = {
            checked: false,
            label: item.data.label,
            seed: item.data.seed,
            analyticsGroupId: item.data.analyticsGroupId ?? "unknown",
          };
        });

        setCheckboxes(newCheckboxes);
      })();
    }
  }, [hasOpened]);

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
        <Tabs defaultValue="basic-analysis" className="flex flex-col h-[calc(100%-72px)] ">
          <TabsList className="w-[500px]">
            <TabsTrigger value="basic-analysis" className="w-2/6">
              Basic Analysis
            </TabsTrigger>
            <TabsTrigger value="comparison" className="w-2/6">
              Comparing
            </TabsTrigger>
            <TabsTrigger value="success-rate" className="w-2/6">
              Mission Success Rate
            </TabsTrigger>
          </TabsList>
          <TabsContent value="basic-analysis" className="overflow-auto h-full">
            <div className="h-[calc(100%)] flex flex-row overflow-auto">
              <BasicChartSection datasets={datasets} labels={labels} scrollable defferedMs={defferedMs} />
              <AnalyticsSimulationSelector
                defferedMs={defferedMs}
                simulationsKeys={checkboxes}
                setCheckboxes={setCheckboxes}
                setMs={setMs}
                setSimulations={setSimulations}
              />
            </div>
          </TabsContent>
          <TabsContent value="comparison" className="h-[calc(100%-72px)]">
            <ComparingSimulations defferedMs={defferedMs} simulations={simulations} simulationsKeys={checkboxes} />
          </TabsContent>
          <TabsContent value="success-rate" className="overflow-auto h-full">
            <MissionSuccessRateTab
              simulations={simulations}
              simulationsKeys={checkboxes}
              setCheckboxes={setCheckboxes}
              setSimulations={setSimulations}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
});
