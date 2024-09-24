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

function App() {
  const trustDataProvider = useRef(new TrustDataProvider());
  // const gridMapRef = useRef<HTMLDivElement>(null);

  const [isGridMapMounted, setIsGridMapMounted] = useState(false);

  return (
    <AppContainer>
      <LeftSideBar title="Trust Observations">
        <RobotList />
      </LeftSideBar>
      <MainContent>{isGridMapMounted && <SimulationSlot trustDataProvider={trustDataProvider.current} />}</MainContent>
      <RightSideBar>
        <GridMap setIsMounted={setIsGridMapMounted} />
        <JsonConfig />
      </RightSideBar>
    </AppContainer>
  );
}

export default App;
