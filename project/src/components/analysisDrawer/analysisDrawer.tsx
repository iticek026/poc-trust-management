type AnalysisDrawerProps = {
  dataProvider: TrustDataProvider;
};
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { ChartAreaIcon } from "lucide-react";
import { TrustDataProvider } from "@/logic/tms/trustDataProvider";
import { TrustEvolutionChart } from "./charts/authorityReputationChart";
import { useEffect, useMemo, useState } from "react";
import { isValue } from "@/utils/checks";
import { DirectIndirectTrustChart } from "./charts/directIndirectTrustChart";

import { DbSimulationData, getAllSimulations } from "@/logic/indexedDb/indexedDb";
import { AnalyticsSimulationSelector } from "./components/analyticsSimulationSelector";

export const AnalysisDrawer: React.FC<AnalysisDrawerProps> = ({ dataProvider }) => {
  const [hasOpened, setHasOpened] = useState(false);
  const isEverythingReady = useMemo(() => dataProvider.isReady() && hasOpened, [dataProvider, hasOpened]);
  const [checkboxes, setCheckboxes] = useState<{ [key: string]: boolean }>({});

  const [simulations, setSimulations] = useState<DbSimulationData[]>([]);

  const analyticsData = useMemo(() => {
    if (isEverythingReady) {
      return dataProvider.getAnalysisData();
    }
  }, [isEverythingReady]);

  const labels = useMemo(() => {
    if (isEverythingReady) {
      return dataProvider.getLabels();
    }
  }, [isEverythingReady]);

  const datasets = useMemo(
    () => simulations.filter((sim) => checkboxes[sim.seed]).map((sim) => sim.data),
    [checkboxes],
  );

  useEffect(() => {
    if (isEverythingReady) {
      (async () => {
        const data = await getAllSimulations();

        setSimulations(data);

        const newCheckboxes: { [key: string]: boolean } = {};
        data.forEach((item) => {
          newCheckboxes[item.seed] = false;
        });

        setCheckboxes((prev) => ({ ...newCheckboxes, ...prev }));
      })();
    }
  }, [isEverythingReady]);

  const toggleCheckbox = (key: string) => {
    setCheckboxes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Sheet onOpenChange={(e) => setHasOpened(e)}>
      <SheetTrigger
        disabled={!dataProvider.isReady()}
        className="bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 w-9 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      >
        <ChartAreaIcon />
      </SheetTrigger>
      {dataProvider.isReady() && isValue(analyticsData) && (
        <SheetContent side={"left"} className="w-[calc(100vw-5rem)] max-w-[calc(100vw-5rem)]">
          <SheetHeader>
            <SheetTitle>Simulation Analysis</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          <div className="flex flex-row h-[calc(100%-36px)]">
            <div className="overflow-auto flex flex-wrap h-[calc(100%-36px)] flex-1">
              <TrustEvolutionChart analyticsData={datasets} />
              {labels &&
                labels.map((label) => (
                  <DirectIndirectTrustChart key={label} simulationRunsData={datasets} robotId={label} />
                ))}
            </div>
            <AnalyticsSimulationSelector simulationsKeys={checkboxes} toggleCheckbox={toggleCheckbox} />
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
};
