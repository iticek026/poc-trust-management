import { formatTime } from "../../utils/time";
import { StopwatchType } from "../../hooks/useStopwatch";
import "./stopwatch.css";
import ImageButton from "../buttons/ImageButton";
import Play from "../../assets/play.svg";
import Pause from "../../assets/pause.svg";
import Stop from "../../assets/stop.svg";

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

      <span className="time-elapsed">Time Elapsed: {formatTime(time)}</span>
    </>
  );
};
