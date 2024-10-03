import { useEffect, useRef, useState } from "react";
// import { useCellSize } from "../../hooks/useCellSize";
import "./gridMap.css";
import { useSimulationConfig } from "../../context/simulationConfig";
import { adjustCoordinateToGrid } from "../../utils/environment";
import { isValue } from "../../utils/checks";
import { EnvironmentGridSingleton } from "../../logic/visualization/environmentGrid";
import { MissionStateHandlerInstance } from "../../logic/simulation/missionStateHandler";

type Props = {
  setIsMounted: (isMounted: boolean) => void;
};
export const GridMap: React.FC<Props> = ({ setIsMounted }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setIsMounted(true);
    }

    return () => {
      setIsMounted(false);
    };
  }, []);

  return (
    <div className="grid-map" ref={ref}>
      <div id="canvas-wrapper">
        <canvas id="environmentCanvas"></canvas>
      </div>
    </div>
  );
};
