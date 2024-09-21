import { useState, useRef, useEffect } from "react";

export type StopwatchType = {
  time: number;
  isRunning: boolean;
  handleStart: (callback: () => void) => void;
  handlePause: (callback: () => void) => void;
  handleReset: (callback: () => void) => void;
};

export const useStopwatch = (init: boolean = false): StopwatchType => {
  const [isRunning, setIsRunning] = useState(init);
  const [time, setTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const startTimeRef = useRef(init ? Date.now() : 0);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 0);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleStart = (callback: () => void) => {
    setIsRunning(true);
    startTimeRef.current = Date.now() - time;
    callback();
  };

  const handlePause = (callback: () => void) => {
    setIsRunning(false);
    callback();
  };

  const handleReset = (callback: () => void) => {
    clearInterval(intervalRef.current as NodeJS.Timeout);
    setIsRunning(false);
    setTime(0);
    callback();
  };

  return {
    time,
    isRunning,
    handleStart,
    handlePause,
    handleReset,
  };
};
