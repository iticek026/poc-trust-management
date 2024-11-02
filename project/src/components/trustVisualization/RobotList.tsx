import { useEffect, useState } from "react";

import { TrustDataProvider } from "../../logic/tms/trustDataProvider";
import { getRobotLabel } from "./utils";
import { BotIcon, ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader } from "@/components/ui/sidebar";

type Props = {
  trustDataProvider: TrustDataProvider;
};

const RobotList: React.FC<Props> = ({ trustDataProvider }) => {
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

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Sidebar>
      <SidebarHeader>Trust Observations</SidebarHeader>
      <ScrollArea>
        {trustData.map((robot) => (
          <Collapsible defaultOpen className="group/collapsible" key={robot.id}>
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  <BotIcon
                    className="mr-3 !h-5 !w-5"
                    stroke={`${robot.type === "malicious" ? "#dc2626" : "#000000"}`}
                  />
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
    // <div className="robot-list">
    //   <div className="list-container">
    //     {trustData.map((robot) => (
    //       <details key={robot.id} className="robot-entry">
    //         <summary className="robot-header" onClick={() => toggleExpand(robot.id)}>
    //           <img className="expand-icon" src={expandedRobots[robot.id] ? Expanded : Collapsed} />
    //           <BotIcon className="mr-3" stroke={`${robot.type === "malicious" ? "#dc2626" : "#000000"}`} />
    //           <span className="robot-name">{getRobotLabel(robot.type, robot.label)}</span>
    //         </summary>
    //         <div className="trust-properties-container">
    //           <div className={`trust-properties-contract ${expandedRobots[robot.id] && "expanded"}`}>
    //             {robot.trustProperties.map((trust, index) => (
    // <div key={index} className="trust-entry">
    //   <span className="trust-target">Trust in {trust.trustTo.label}:</span>
    //   <div className="trust-bar-container">
    //     <div
    //       className="trust-bar-fill"
    //       style={{
    //         width: `${trust.trustValue * 100}%`,
    //         backgroundColor: getTrustColor(trust.trustValue * 100),
    //       }}
    //     ></div>
    //   </div>
    //   <span className="trust-value">{(trust.trustValue * 100).toFixed(2)}%</span>
    // </div>
    //             ))}
    //           </div>
    //         </div>
    //       </details>
    //     ))}
    //   </div>
    // </div>
  );
};

export default RobotList;
