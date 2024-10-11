import { useRef, useEffect, useLayoutEffect } from "react";
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
  simulation: Simulation;
};

export const SimulationSlot: React.FC<Props> = ({
  simulationConfig,
  newSimulation,
  simulationListener,
  simulation,
}) => {
  const simulationRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const resize = () => {
      if (!simulationRef.current) return;

      const containerWidth = simulationRef.current.clientWidth;
      const containerHeight = simulationRef.current.clientHeight;

      const scaleX = containerWidth / simulationConfig.environment.width;
      const scaleY = containerHeight / simulationConfig.environment.height;

      const scale = Math.min(scaleX, scaleY, 0.95);

      simulation.resize(scale, containerWidth, containerHeight);
    };

    window.addEventListener("resize", resize);

    simulation.init(simulationRef.current);
    resize();

    return () => {
      window.removeEventListener("resize", resize);
      simulation.stop();
    };
  }, [simulation]);

  return (
    <>
      <TopBar>
        <Stopwatch
          handlePauseCallback={() => simulation.pause()}
          handleResetCallback={() => {
            simulation.reset();
            newSimulation();
          }}
          handleStartCallback={() => simulation.start()}
          handleResumeCallback={() => simulation.resume()}
          simulationListener={simulationListener}
          simulation={simulation}
        />
      </TopBar>
      <Canvas simulationRef={simulationRef} />
    </>
  );
};
