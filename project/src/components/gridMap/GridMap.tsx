import { useEffect, useRef } from "react";
import { useCellSize } from "../../hooks/useCellSize";
import "./gridMap.css";
import { useSimulationConfig } from "../../context/simulationConfig";
import { adjustCoordinateToGrid } from "../../utils/environment";

type Props = {
  setIsMounted: (isMounted: boolean) => void;
};
export const GridMap: React.FC<Props> = ({ setIsMounted }) => {
  const jsonConfig = useSimulationConfig();

  const ref = useRef<HTMLDivElement>(null);
  const cellSize = useCellSize(
    jsonConfig.jsonConfig.environment.width,
    jsonConfig.jsonConfig.environment.height,
    adjustCoordinateToGrid(jsonConfig.jsonConfig.environment.width),
    adjustCoordinateToGrid(jsonConfig.jsonConfig.environment.height),
    ref.current,
  );

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
      <canvas id="environmentCanvas" cell-size={cellSize}></canvas>
      <div className="info"></div>
    </div>
  );
};
