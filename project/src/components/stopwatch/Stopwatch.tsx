import { formatTime } from "../../utils/time";
import ImageButton from "../buttons/ImageButton";

import { EventEmitter, SimulationEvents, SimulationEventsEnum } from "../../logic/common/eventEmitter";
import { useEffect, useState } from "react";
import { Simulation, timestamp } from "../../logic/simulation/simulation";
import { Play } from "../icons/play";
import { Iteration } from "../icons/iteration";
import { Stop } from "../icons/stop";
import { Pause } from "../icons/pause";

import { Card, CardContent } from "@/components/ui/card";
import { RandomizerInstance } from "@/utils/random/randomizer";

type Props = {
  handlePauseCallback: () => void;
  handleResetCallback: () => void;
  handleStartCallback: () => void;
  handleResumeCallback: () => void;
  handleContinuousSimulationCallback: () => void;
  simulationListener: EventEmitter<SimulationEvents>;
  simulation: Simulation;
  isSimRunning: boolean;
  setIsSimRunning: (isRunning: boolean) => void;
};

export const Stopwatch: React.FC<Props> = ({
  handlePauseCallback,
  handleResetCallback,
  handleStartCallback,
  handleResumeCallback,
  handleContinuousSimulationCallback,
  simulationListener,
  isSimRunning,
  setIsSimRunning,
}) => {
  const [time, setTime] = useState(timestamp);
  const [hasSimEnded, setHasSimEnded] = useState(false);

  useEffect(() => {
    simulationListener.on(SimulationEventsEnum.SIMULATION_ENDED, () => {
      setIsSimRunning(false);
      setHasSimEnded(true);
    });

    return () => {
      simulationListener.dispose();
      setHasSimEnded(false);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const updateTime = () => {
        setTime(timestamp);
      };
      updateTime();
    }, 0);

    return () => {
      clearInterval(timer);
    };
  }, [isSimRunning]);

  const handlePause = () => {
    handlePauseCallback();
    setIsSimRunning(false);
  };

  const handleReset = () => {
    handleResetCallback();
    setIsSimRunning(false);
  };

  const handleStart = () => {
    setHasSimEnded(false);
    if (isSimRunning) {
      handleResumeCallback();
      setIsSimRunning(true);
      return;
    }
    setIsSimRunning(true);
    handleStartCallback();
  };

  const handleContinuousSimulation = () => {
    handleContinuousSimulationCallback();
  };

  return (
    <Card className="ml-2 mr-2 bg-gray-100">
      <CardContent className="p-2 flex flex-row items-center justify-between">
        <div className="flex gap-2">
          {isSimRunning ? (
            <ImageButton onClick={handlePause} style={{ backgroundColor: "#FADC40" }} className="[&>svg]:!size-6">
              <Pause />
            </ImageButton>
          ) : (
            <ImageButton onClick={handleStart} style={{ backgroundColor: "#22B573" }}>
              <Play />
            </ImageButton>
          )}

          <ImageButton
            disabled={isSimRunning}
            onClick={handleReset}
            style={{ backgroundColor: "#E63946" }}
            className="[&>svg]:!size-6"
          >
            <Stop />
          </ImageButton>

          <ImageButton
            disabled={!hasSimEnded}
            onClick={handleContinuousSimulation}
            style={{ backgroundColor: "#7E60BF" }}
            className="[&>svg]:!size-5"
          >
            <Iteration />
          </ImageButton>
        </div>

        <div className="flex flex-row gap-2">
          <span className="content-center">Seed: {RandomizerInstance.getSeed()}</span>
          <span className="content-center">Time Elapsed: {formatTime(time)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
