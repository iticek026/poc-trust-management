import { useRef, useState, useEffect } from "react";
import { useStopwatch } from "../../hooks/useStopwatch";
import { Simulation } from "../../logic/simulation/simulation";
import { TrustDataProvider } from "../../logic/tms/trustDataProvider";
import simulationConfig from "../../mockData/robots";
import { Canvas } from "../canvas/Canvas";
import { TopBar } from "../layout/TopBar";
import { Stopwatch } from "../stopwatch/Stopwatch";

type Props = {
  trustDataProvider: TrustDataProvider;
};

export const SimulationSlot: React.FC<Props> = ({ trustDataProvider }) => {
  const simulationRunning = useRef(false);

  const stopwatch = useStopwatch(simulationRunning.current);

  const simulationRef = useRef<HTMLDivElement>(null);
  const [simulation, setSimulation] = useState(new Simulation(simulationConfig, trustDataProvider));

  const wasSimInitialized = useRef(false);

  useEffect(() => {
    if (!wasSimInitialized.current) {
      simulation.init(simulationRef.current);
      wasSimInitialized.current = true;
    }
    if (simulationRunning.current) {
      simulation.start();
    }

    return () => {
      simulation.stop();
      wasSimInitialized.current = false;
    };
  }, [simulation]);

  const handlePause = () => {
    stopwatch.handlePause(() => simulation.pause());
  };

  const handleReset = () => {
    stopwatch.handleReset(() => {
      simulation.reset();
      setSimulation(new Simulation(simulationConfig, trustDataProvider));
    });
    simulationRunning.current = false;
  };

  const handleStart = () => {
    if (simulationRunning.current) {
      stopwatch.handleStart(() => simulation.resume());
      return;
    }
    simulationRunning.current = true;
    stopwatch.handleStart(() => simulation.start());
  };

  return (
    <>
      <TopBar>
        <Stopwatch
          stopwatch={stopwatch}
          handlePause={handlePause}
          handleReset={handleReset}
          handleStart={handleStart}
        />
      </TopBar>
      <Canvas simulationRef={simulationRef} />
    </>
  );
};
