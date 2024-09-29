import { formatTime } from "../../utils/time";
import { useStopwatch } from "../../hooks/useStopwatch";
import "./stopwatch.css";
import ImageButton from "../buttons/ImageButton";
import Play from "../../assets/play.svg";
import Pause from "../../assets/pause.svg";
import Stop from "../../assets/stop.svg";
import { EventEmitter, SimulationEvents, SimulationEventsEnum } from "../../logic/common/eventEmitter";
import { useEffect } from "react";

type Props = {
  simIsRunning: React.MutableRefObject<boolean>;
  handlePauseCallback: () => void;
  handleResetCallback: () => void;
  handleStartCallback: () => void;
  handleResumeCallback: () => void;
  simulationListener: EventEmitter<SimulationEvents>;
};

export const Stopwatch: React.FC<Props> = ({
  simIsRunning,
  handlePauseCallback,
  handleResetCallback,
  handleStartCallback,
  handleResumeCallback,
  simulationListener,
}) => {
  const stopwatch = useStopwatch(simIsRunning.current);

  useEffect(() => {
    simulationListener.on(SimulationEventsEnum.SIMULATION_ENDED, () => {
      stopwatch.handlePause(() => {
        simIsRunning.current = false;
      });
    });

    return () => {
      simulationListener.dispose();
    };
  }, []);

  const handlePause = () => {
    stopwatch.handlePause(() => handlePauseCallback());
  };

  const handleReset = () => {
    stopwatch.handleReset(() => {
      handleResetCallback();
    });
    simIsRunning.current = false;
  };

  const handleStart = () => {
    if (simIsRunning.current) {
      stopwatch.handleStart(() => handleResumeCallback());
      return;
    }
    simIsRunning.current = true;
    stopwatch.handleStart(() => handleStartCallback());
  };

  return (
    <>
      <div className="actions">
        <ImageButton
          src={Play}
          alt="Start simulation"
          onClick={handleStart}
          style={{ backgroundColor: "#22B573" }}
          className="squre-button play"
        />
        <ImageButton
          src={Pause}
          alt="Pause simulation"
          onClick={handlePause}
          style={{ backgroundColor: "#FADC40" }}
          className="squre-button pause"
        />
        <ImageButton
          src={Stop}
          alt="Stop simulation"
          onClick={handleReset}
          style={{ backgroundColor: "#E63946" }}
          className="squre-button stop"
        />
      </div>

      <span className="time-elapsed">Time Elapsed: {formatTime(stopwatch.time)}</span>
    </>
  );
};
