import { useRef, useEffect, useState } from "react";
import { Simulation } from "../../logic/simulation/simulation";
import { Canvas } from "../canvas/Canvas";
import { TopBar } from "../layout/TopBar";
import { Stopwatch } from "../stopwatch/Stopwatch";
import { SimulationConfig } from "../../logic/jsonConfig/parser";
import { EventEmitter, SimulationEvents } from "../../logic/common/eventEmitter";
import { TrustDataProvider } from "../../logic/tms/trustDataProvider";

type Props = {
  newSimulation: () => void;
  simulationConfig: SimulationConfig;
  simulationListener: EventEmitter<SimulationEvents>;
  trustDataProvider: TrustDataProvider;
};

export const SimulationSlot: React.FC<Props> = ({
  simulationConfig,
  newSimulation,
  simulationListener,
  trustDataProvider,
}) => {
  const [simulation, setSimulation] = useState(
    () => new Simulation(simulationConfig, trustDataProvider, simulationListener),
  );
  const simulationRunning = useRef(false);

  const simulationRef = useRef<HTMLDivElement>(null);

  const resize = () => {
    if (!simulationRef.current) return;

    const containerWidth = simulationRef.current.clientWidth;
    const containerHeight = simulationRef.current.clientHeight;

    const scaleX = containerWidth / simulationConfig.environment.width;
    const scaleY = containerHeight / simulationConfig.environment.height;

    const scale = Math.min(scaleX, scaleY, 0.95);

    simulation.resize(scale, containerWidth, containerHeight);
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
            setSimulation(new Simulation(simulationConfig, trustDataProvider, simulationListener));
          }}
          handleStartCallback={() => simulation.start()}
          handleResumeCallback={() => simulation.resume()}
          simulationListener={simulationListener}
        />
      </TopBar>
      <Canvas simulationRef={simulationRef} />
    </>
  );
};
