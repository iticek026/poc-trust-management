import { useRef, useState, useEffect } from "react";

// TODO render grid map here, in simulation just fill colors.

export const useCellSize = (simulationWidth: number, simulationHeight: number, numColumns: number, numRows: number) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });

  const calculateCellSize = () => {
    if (!gridRef.current) return;

    const containerWidth = gridRef.current.clientWidth;
    const containerHeight = gridRef.current.clientHeight;

    const scaleX = containerWidth / simulationWidth;
    const scaleY = containerHeight / simulationHeight;
    const scale = Math.min(scaleX, scaleY);

    const adjustedCellWidth = (simulationWidth / numColumns) * scale;
    const adjustedCellHeight = (simulationHeight / numRows) * scale;

    setCellSize({
      width: adjustedCellWidth,
      height: adjustedCellHeight,
    });
  };

  useEffect(() => {
    calculateCellSize();
    window.addEventListener("resize", calculateCellSize);
    return () => {
      window.removeEventListener("resize", calculateCellSize);
    };
  }, [simulationWidth, simulationHeight, numColumns, numRows]);

  return cellSize;
};
