import { formatTime } from "../../utils/time";
import { StopwatchType } from "../../hooks/useStopwatch";
import "./stopwatch.css";

type Props = {
  stopwatch: StopwatchType;
  handlePause: () => void;
  handleReset: () => void;
  handleStart: () => void;
};

export const Stopwatch: React.FC<Props> = ({ stopwatch, handlePause, handleReset, handleStart }) => {
  const { time } = stopwatch;
  return (
    <>
      <div className="actions">
        <button onClick={handleStart}>Start</button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleReset}>Reset</button>
      </div>

      <span className="time-elapsed">Time Elapsed: {formatTime(time)}</span>
    </>
  );
};
