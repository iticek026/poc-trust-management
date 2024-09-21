import { useRef, useState, useEffect } from "react";
import "./App.css";
import { Canvas } from "./components/Canvas";
import { Stopwatch } from "./components/stopwatch/Stopwatch";
import { useStopwatch } from "./hooks/useStopwatch";
import { Simulation } from "./logic/simulation/simulation";
import simulationConfig from "./mockData/robots";

function App() {
  const simulationRunning = useRef(false);

  const stopwatch = useStopwatch(simulationRunning.current);
  const simulationRef = useRef<HTMLDivElement>(null);
  const [simulation, setSimulation] = useState(new Simulation(simulationConfig));

  useEffect(() => {
    if (!simulationRunning.current) return;
    simulation.start(simulationRef.current);

    return () => simulation.stop();
  }, [simulation]);

  const handlePause = () => {
    stopwatch.handlePause(() => simulation.pause());
  };

  const handleReset = () => {
    stopwatch.handleReset(() => {
      simulation.reset();
      setSimulation(new Simulation(simulationConfig));
    });
    simulationRunning.current = false;
  };

  const handleStart = () => {
    if (simulationRunning.current) {
      stopwatch.handleStart(() => simulation.resume());
      return;
    }
    simulationRunning.current = true;
    stopwatch.handleStart(() => simulation.start(simulationRef.current));
  };

  return (
    <>
      <Stopwatch stopwatch={stopwatch} handlePause={handlePause} handleReset={handleReset} handleStart={handleStart} />

      <Canvas simulationRef={simulationRef} />
    </>
  );
}

export default App;
