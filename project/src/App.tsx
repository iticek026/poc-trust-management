import { useEffect, useRef, useState } from "react";
import { TrustDataProvider } from "./logic/tms/trustDataProvider";
import { AppContainer } from "./components/layout/AppContainer";
import { MainContent } from "./components/layout/MainContent";
import { RightSideBar } from "./components/layout/RightSideBar";
import RobotList from "./components/trustVisualization/RobotList";
import JsonConfig from "./components/jsonConfig/JsonConfig";
import { GridMap } from "./components/gridMap/GridMap";
import { SimulationSlot } from "./components/simulation/simulation";
import { useSimulationConfig } from "./context/simulationConfig";
import { EventEmitter, SimulationEvents } from "./logic/common/eventEmitter";
import { MissionStateInfo } from "./components/missionStateInfo/missionStateInfo";
import { Simulation } from "./logic/simulation/simulation";
import { SimulationConfig } from "./logic/jsonConfig/config";
import { SidebarProvider } from "./components/ui/sidebar";

function App() {
  const trustDataProvider = useRef(new TrustDataProvider());
  const [isGridMapMounted, setIsGridMapMounted] = useState(false);
  const jsonConfig = useSimulationConfig();
  const simulationListener = useRef(new EventEmitter<SimulationEvents>());

  const [simulation, setSimulation] = useState<Simulation | undefined>();

  useEffect(() => {
    if (isGridMapMounted) {
      setSimulation(new Simulation(jsonConfig.jsonConfig, trustDataProvider.current, simulationListener.current));
    }
  }, [isGridMapMounted]);

  return (
    <SidebarProvider>
      <AppContainer>
        <RobotList trustDataProvider={trustDataProvider.current} />
        <MainContent>
          {simulation ? (
            <SimulationSlot
              simulationConfig={jsonConfig.jsonConfig}
              trustDataProvider={trustDataProvider.current}
              newSimulation={(config?: SimulationConfig) => {
                trustDataProvider.current.clearTrustData();
                setSimulation(
                  new Simulation(
                    config ?? jsonConfig.jsonConfig,
                    trustDataProvider.current,
                    simulationListener.current,
                  ),
                );
              }}
              simulation={simulation}
              simulationListener={simulationListener.current}
            />
          ) : (
            <div>Simulation is loading...</div>
          )}
        </MainContent>
        <RightSideBar>
          <GridMap setIsMounted={setIsGridMapMounted} />
          <MissionStateInfo />
          <JsonConfig jsonConfig={jsonConfig} />
        </RightSideBar>
      </AppContainer>
    </SidebarProvider>
  );
}

export default App;
