import { useEffect, useRef } from "react";
import { useCellSize } from "../../hooks/useCellSize";
import { EnvironmentGridSingleton } from "../../logic/visualization/environmentGrid";
import simulationConfig from "../../mockData/robots";
import "./gridMap.css";

type Props = {
  setIsMounted: (isMounted: boolean) => void;
};
export const GridMap: React.FC<Props> = ({ setIsMounted }) => {
  const ref = useRef<HTMLDivElement>(null);
  const cellSize = useCellSize(
    simulationConfig.environment.width,
    simulationConfig.environment.height,
    EnvironmentGridSingleton.getWidth(),
    EnvironmentGridSingleton.getHeight(),
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
