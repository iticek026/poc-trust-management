import { useEffect, useRef } from "react";
import "./gridMap.css";

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
