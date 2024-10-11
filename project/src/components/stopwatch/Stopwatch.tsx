import { formatTime } from "../../utils/time";
import "./stopwatch.css";
import ImageButton from "../buttons/ImageButton";
import Play from "../../assets/play.svg";
import Pause from "../../assets/pause.svg";
import Stop from "../../assets/stop.svg";
import { EventEmitter, SimulationEvents, SimulationEventsEnum } from "../../logic/common/eventEmitter";
import { useEffect, useState } from "react";
import { Simulation } from "../../logic/simulation/simulation";

type Props = {
  handlePauseCallback: () => void;
  handleResetCallback: () => void;
  handleStartCallback: () => void;
  handleResumeCallback: () => void;
  simulationListener: EventEmitter<SimulationEvents>;
  simulation: Simulation;
};

export const Stopwatch: React.FC<Props> = ({
  handlePauseCallback,
  handleResetCallback,
  handleStartCallback,
  handleResumeCallback,
  simulationListener,
  simulation,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(simulation.timeStamp);

  useEffect(() => {
    simulationListener.on(SimulationEventsEnum.SIMULATION_ENDED, () => {
      setIsRunning(false);
    });

    return () => {
      simulationListener.dispose();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const updateTime = () => {
        setTime(simulation.timeStamp);
      };
      updateTime();
    }, 0);

    return () => {
      clearInterval(timer);
    };
  }, [isRunning]);

  const handlePause = () => {
    handlePauseCallback();
    setIsRunning(false);
  };

  const handleReset = () => {
    handleResetCallback();
    setIsRunning(false);
  };

  const handleStart = () => {
    if (isRunning) {
      handleResumeCallback();
      setIsRunning(true);
      return;
    }
    setIsRunning(true);

    handleStartCallback();
  };

  return (
    <>
      <div className="actions">
        {isRunning ? (
          <ImageButton
            src={Pause}
            alt="Pause simulation"
            onClick={handlePause}
            style={{ backgroundColor: "#FADC40" }}
            className="squre-button pause"
          />
        ) : (
          <ImageButton
            src={Play}
            alt="Start simulation"
            onClick={handleStart}
            style={{ backgroundColor: "#22B573" }}
            className="squre-button play"
          />
        )}

        <ImageButton
          src={Stop}
          alt="Stop simulation"
          onClick={handleReset}
          style={{ backgroundColor: "#E63946" }}
          className="squre-button stop"
        />
      </div>

      <span className="time-elapsed">Time Elapsed: {formatTime(time)}</span>
    </>
  );
};
