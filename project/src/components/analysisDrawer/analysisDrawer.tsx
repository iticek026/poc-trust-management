type AnalysisDrawerProps = {
  dataProvider: TrustDataProvider;
};
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { ChartAreaIcon } from "lucide-react";
import { TrustDataProvider } from "@/logic/tms/trustDataProvider";
import { TrustEvolutionChart } from "./charts/authorityReputationChart";
import { useMemo, useState } from "react";
import { isValue } from "@/utils/checks";
import { DirectIndirectTrustChart } from "./charts/directIndirectTrustChart";
import { ScrollArea } from "@radix-ui/react-scroll-area";

export const AnalysisDrawer: React.FC<AnalysisDrawerProps> = ({ dataProvider }) => {
  const [hasOpened, setHasOpened] = useState(false);
  const analyticsData = useMemo(() => {
    if (dataProvider.isReady() && hasOpened) {
      return dataProvider.getAnalysisData();
    }
  }, [dataProvider, hasOpened]);

  const labels = useMemo(() => {
    if (dataProvider.isReady() && hasOpened) {
      return dataProvider.getLabels();
    }
  }, [dataProvider, hasOpened]);

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
          {/* <ScrollArea className="flex"> */}
          <div className="overflow-auto flex flex-wrap h-[calc(100%-36px)]">
            <TrustEvolutionChart analyticsData={analyticsData} />
            {labels &&
              labels.map((label) => (
                <DirectIndirectTrustChart key={label} analyticsData={analyticsData} robotId={label} />
              ))}
          </div>
          {/* </ScrollArea> */}
        </SheetContent>
      )}
    </Sheet>
  );
};
