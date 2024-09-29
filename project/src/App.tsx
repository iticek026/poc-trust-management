import { useRef, useState } from "react";
import "./App.css";
import { TrustDataProvider } from "./logic/tms/trustDataProvider";
import { AppContainer } from "./components/layout/AppContainer";
import { LeftSideBar } from "./components/layout/LeftSideBar";
import { MainContent } from "./components/layout/MainContent";
import { RightSideBar } from "./components/layout/RightSideBar";
import RobotList from "./components/trustVisualization/components/RobotList";
import JsonConfig from "./components/jsonConfig/JsonConfig";
import { GridMap } from "./components/gridMap/GridMap";
import { SimulationSlot } from "./components/simulation/simulation";
import { useSimulationConfig } from "./context/simulationConfig";
import { EventEmitter, SimulationEvents } from "./logic/common/eventEmitter";

function App() {
  const trustDataProvider = useRef(new TrustDataProvider());
  const [isGridMapMounted, setIsGridMapMounted] = useState(false);
  const jsonConfig = useSimulationConfig();
  const simulationListener = useRef(new EventEmitter<SimulationEvents>());

  return (
    <AppContainer>
      <LeftSideBar title="Trust Observations">
        <RobotList trustDataProvider={trustDataProvider.current} />
      </LeftSideBar>
      <MainContent>
        {isGridMapMounted && jsonConfig.jsonConfig && (
          <SimulationSlot
            simulationConfig={jsonConfig.jsonConfig}
            trustDataProvider={trustDataProvider.current}
            newSimulation={() => {
              trustDataProvider.current.clearTrustData();
            }}
            simulationListener={simulationListener.current}
          />
        )}
      </MainContent>
      <RightSideBar>
        <GridMap setIsMounted={setIsGridMapMounted} />
        <JsonConfig />
      </RightSideBar>
    </AppContainer>
  );
}

export default App;
