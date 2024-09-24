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
    const resize = () => {
      if (!simulationRef.current) return;

      const containerWidth = simulationRef.current.clientWidth;
      const containerHeight = simulationRef.current.clientHeight;

      const scaleX = containerWidth / simulationConfig.environment.width;
      const scaleY = containerHeight / simulationConfig.environment.height;

      const scale = Math.min(scaleX, scaleY, 0.95);

      const devicePixelRatio = window.devicePixelRatio || 1;

      simulation.resize(scale, devicePixelRatio, containerWidth, containerHeight);
    };

    window.addEventListener("resize", resize);

    if (!wasSimInitialized.current) {
      simulation.init(simulationRef.current);
      resize();

      wasSimInitialized.current = true;
    }

    if (simulationRunning.current) {
      simulation.start();
    }
    return () => {
      window.removeEventListener("resize", resize);
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
