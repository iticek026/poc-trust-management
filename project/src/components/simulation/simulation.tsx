import { useRef, useEffect } from "react";
import { Simulation } from "../../logic/simulation/simulation";
import { Canvas } from "../canvas/Canvas";
import { TopBar } from "../layout/TopBar";
import { Stopwatch } from "../stopwatch/Stopwatch";
import { SimulationConfig } from "../../logic/jsonConfig/parser";

type Props = {
  simulation: Simulation;
  newSimulation: () => void;
  simulationConfig: SimulationConfig;
};

export const SimulationSlot: React.FC<Props> = ({ simulationConfig, simulation, newSimulation }) => {
  const simulationRunning = useRef(false);

  const simulationRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    window.addEventListener("resize", resize);

    simulation.init(simulationRef.current);
    resize();

    if (simulationRunning.current) {
      simulation.start();
    }
    return () => {
      window.removeEventListener("resize", resize);
      simulation.stop();
    };
  }, [simulationRunning.current, simulation]);

  return (
    <>
      <TopBar>
        <Stopwatch
          simIsRunning={simulationRunning}
          handlePauseCallback={() => simulation.pause()}
          handleResetCallback={() => {
            simulation.reset();
            newSimulation();
          }}
          handleStartCallback={() => simulation.start()}
          handleResumeCallback={() => simulation.resume()}
        />
      </TopBar>
      <Canvas simulationRef={simulationRef} />
    </>
  );
};
