import { useEffect, useRef, useState } from "react";
import "./App.css";
import { TrustDataProvider } from "./logic/tms/trustDataProvider";
import { AppContainer } from "./components/layout/AppContainer";
import { LeftSideBar } from "./components/layout/LeftSideBar";
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
    <AppContainer>
      <LeftSideBar title="Trust Observations">
        <RobotList trustDataProvider={trustDataProvider.current} />
      </LeftSideBar>
      <MainContent>
        {simulation ? (
          <SimulationSlot
            simulationConfig={jsonConfig.jsonConfig}
            trustDataProvider={trustDataProvider.current}
            newSimulation={() => {
              trustDataProvider.current.clearTrustData();
              setSimulation(
                new Simulation(jsonConfig.jsonConfig, trustDataProvider.current, simulationListener.current),
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
        <JsonConfig />
      </RightSideBar>
    </AppContainer>
  );
}

export default App;
