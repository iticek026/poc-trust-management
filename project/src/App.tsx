import { useRef, useState, useEffect } from "react";
import "./App.css";
import { Canvas } from "./components/canvas/Canvas";
import { Stopwatch } from "./components/stopwatch/Stopwatch";
import { useStopwatch } from "./hooks/useStopwatch";
import { Simulation } from "./logic/simulation/simulation";
import simulationConfig from "./mockData/robots";
import { TrustDataProvider } from "./logic/tms/trustDataProvider";
import { TrustVisualization } from "./components/trustVisualization/trustVisualization";
import { AppContainer } from "./components/layout/AppContainer";
import { LeftSideBar } from "./components/layout/LeftSideBar";
import { MainContent } from "./components/layout/MainContent";
import { RightSideBar } from "./components/layout/RightSideBar";
import RobotList from "./components/trustVisualization/components/RobotList";
import { TopBar } from "./components/layout/TopBar";
import JsonConfig from "./components/jsonConfig/JsonConfig";

function App() {
  const simulationRunning = useRef(false);

  const stopwatch = useStopwatch(simulationRunning.current);
  // const trustDataProvider = useRef(new TrustDataProvider());

  // const simulationRef = useRef<HTMLDivElement>(null);
  // const [simulation, setSimulation] = useState(new Simulation(simulationConfig, trustDataProvider.current));

  // const wasSimInitialized = useRef(false);

  // useEffect(() => {
  //   if (!wasSimInitialized.current) {
  //     simulation.init(simulationRef.current);
  //     wasSimInitialized.current = true;
  //   }
  //   if (simulationRunning.current) {
  //     simulation.start();
  //   }

  //   return () => {
  //     simulation.stop();
  //     wasSimInitialized.current = false;
  //   };
  // }, [simulation]);

  const handlePause = () => {
    // stopwatch.handlePause(() => simulation.pause());
  };

  const handleReset = () => {
    // stopwatch.handleReset(() => {
    //   simulation.reset();
    //   setSimulation(new Simulation(simulationConfig, trustDataProvider.current));
    // });
    // simulationRunning.current = false;
  };

  const handleStart = () => {
    // if (simulationRunning.current) {
    //   stopwatch.handleStart(() => simulation.resume());
    //   return;
    // }
    // simulationRunning.current = true;
    // stopwatch.handleStart(() => simulation.start());
  };

  return (
    <AppContainer>
      <LeftSideBar title="Trust Observations">
        <RobotList />
      </LeftSideBar>
      <MainContent>
        <TopBar>
          <Stopwatch
            stopwatch={stopwatch}
            handlePause={handlePause}
            handleReset={handleReset}
            handleStart={handleStart}
          />
        </TopBar>
      </MainContent>
      <RightSideBar>
        <JsonConfig />
      </RightSideBar>
    </AppContainer>
  );
}

export default App;
// {/* <Stopwatch stopwatch={stopwatch} handlePause={handlePause} handleReset={handleReset} handleStart={handleStart} />
// <Canvas simulationRef={simulationRef} />
// <TrustVisualization trustDataProvider={trustDataProvider.current} /> */}
