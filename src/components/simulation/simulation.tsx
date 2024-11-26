import { useRef, useLayoutEffect } from "react";
import { Simulation } from "../../logic/simulation/simulation";
import { Canvas } from "../canvas/Canvas";
import { TopBar } from "../layout/TopBar";
import { Stopwatch } from "../stopwatch/Stopwatch";
import { EventEmitter, SimulationEvents } from "../../logic/common/eventEmitter";
import { TrustDataProvider } from "../../logic/tms/trustDataProvider";
import { useSimulationConfig } from "../../context/simulationConfig";
import { convertSimulationTrustResultWithConfig } from "../../logic/jsonConfig/configConverter";
import { SimulationConfig } from "../../logic/jsonConfig/config";

type Props = {
  newSimulation: (config?: SimulationConfig) => void;
  simulationConfig: SimulationConfig;
  simulationListener: EventEmitter<SimulationEvents>;
  trustDataProvider: TrustDataProvider;
  simulation: Simulation;
  isSimRunning: boolean;
  setIsSimRunning: (isRunning: boolean) => void;
};

export const SimulationSlot: React.FC<Props> = ({
  simulationConfig,
  newSimulation,
  simulationListener,
  trustDataProvider,
  simulation,
  isSimRunning,
  setIsSimRunning,
}) => {
  const simulationRef = useRef<HTMLDivElement>(null);
  const jsonConfig = useSimulationConfig();
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
          isSimRunning={isSimRunning}
          setIsSimRunning={setIsSimRunning}
          handlePauseCallback={() => simulation.pause()}
          handleResetCallback={() => {
            simulation.reset();
            newSimulation();
          }}
          handleStartCallback={() => simulation.start()}
          handleResumeCallback={() => simulation.resume()}
          simulationListener={simulationListener}
          handleContinuousSimulationCallback={() => {
            simulation.reset();
            const newConfig = convertSimulationTrustResultWithConfig(
              jsonConfig.jsonConfig,
              trustDataProvider.getTrustHistories(),
              simulation.swarm,
            );
            newSimulation(newConfig);
          }}
          simulation={simulation}
        />
      </TopBar>
      <Canvas simulationRef={simulationRef} />
    </>
  );
};
