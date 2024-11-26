import { Fragment, useEffect, useState } from "react";

import { TrustDataProvider } from "../../logic/tms/trustDataProvider";
import { getRobotLabel } from "./utils";
import { BotIcon, ChevronDown, EyeIcon } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader } from "@/components/ui/sidebar";
import { AnalysisDrawer } from "../analysisDrawer/analysisDrawer";
import { Simulation } from "@/logic/simulation/simulation";

type Props = {
  trustDataProvider: TrustDataProvider;
  isSimRunning: boolean;
  simulation?: Simulation;
};

const RobotList: React.FC<Props> = ({ trustDataProvider, isSimRunning, simulation }) => {
  const [trustData, setTrustData] = useState(trustDataProvider.getTrustData());
  const getTrustColor = (value: number) => {
    if (value >= 70) return "#4CAF50"; // Green
    if (value >= 40) return "#FFC107"; // Yellow
    return "#F44336"; // Red
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const updateTrust = () => {
        const updatedTrustData = trustDataProvider.getTrustData();
        setTrustData(updatedTrustData);
      };
      updateTrust();
    }, 800);

    if (!isSimRunning) {
      clearInterval(timer);
      const updatedTrustData = trustDataProvider.getTrustData();
      setTrustData(updatedTrustData);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isSimRunning, trustDataProvider, simulation]);

  return (
    <Fragment>
      <Sidebar>
        <SidebarHeader className="flex flex-row justify-between items-center bg-gray-200">
          Trust Observations
          <AnalysisDrawer />
        </SidebarHeader>
        <ScrollArea>
          {trustData.map((robot) => (
            <Collapsible defaultOpen className="group/collapsible" key={robot.id}>
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger>
                    {robot.type === "authority" ? (
                      <EyeIcon className="mr-3 !h-5 !w-5" stroke={"#000000"} />
                    ) : (
                      <BotIcon
                        className="mr-3 !h-5 !w-5"
                        stroke={`${robot.type === "malicious" ? "#dc2626" : "#000000"}`}
                      />
                    )}

                    <span className="text-base">{getRobotLabel(robot.type, robot.label)}</span>
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    {robot.trustProperties.map((trust, index) => (
                      <div className="flex items-center m-1" key={index}>
                        <span className="text-sm">Trust in {trust.trustTo.label}:</span>
                        <div className=" ml-2 mr-2 h-2 bg-gray-200 rounded-sm relative flex-[2_2_0%]">
                          <div
                            className="h-full rounded-sm"
                            style={{
                              width: `${trust.trustValue * 100}%`,
                              backgroundColor: getTrustColor(trust.trustValue * 100),
                            }}
                          ></div>
                        </div>
                        <span className="text-sm">{(trust.trustValue * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ))}
        </ScrollArea>
      </Sidebar>
    </Fragment>
  );
};

export default RobotList;
