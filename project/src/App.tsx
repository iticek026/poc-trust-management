import { useRef, useState, useEffect } from "react";
import "./App.css";
import { Canvas } from "./components/canvas/Canvas";
import { Stopwatch } from "./components/stopwatch/Stopwatch";
import { useStopwatch } from "./hooks/useStopwatch";
import { Simulation } from "./logic/simulation/simulation";
import simulationConfig from "./mockData/robots";
import { TrustDataProvider } from "./logic/tms/trustDataProvider";
import { AppContainer } from "./components/layout/AppContainer";
import { LeftSideBar } from "./components/layout/LeftSideBar";
import { MainContent } from "./components/layout/MainContent";
import { RightSideBar } from "./components/layout/RightSideBar";
import RobotList from "./components/trustVisualization/components/RobotList";
import { TopBar } from "./components/layout/TopBar";
import JsonConfig from "./components/jsonConfig/JsonConfig";
import { GridMap } from "./components/gridMap/GridMap";
import { SimulationSlot } from "./components/simulation/simulation";

function App() {
  const trustDataProvider = useRef(new TrustDataProvider());

  return (
    <AppContainer>
      <LeftSideBar title="Trust Observations">
        <RobotList />
      </LeftSideBar>
      <MainContent>
        <SimulationSlot trustDataProvider={trustDataProvider.current} />
      </MainContent>
      <RightSideBar>
        <GridMap />
        <JsonConfig />
      </RightSideBar>
    </AppContainer>
  );
}

export default App;
// {/* <Stopwatch stopwatch={stopwatch} handlePause={handlePause} handleReset={handleReset} handleStart={handleStart} />
// <TrustVisualization trustDataProvider={trustDataProvider.current} /> */}
