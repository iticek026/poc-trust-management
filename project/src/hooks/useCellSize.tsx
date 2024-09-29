// import { useState, useEffect } from "react";

// export const useCellSize = (
//   simulationWidth: number,
//   simulationHeight: number,
//   numColumns: number,
//   numRows: number,
//   gridRef: HTMLDivElement | null,
// ) => {
//   const [cellSize, setCellSize] = useState<number | null>(0);

//   const calculateCellSize = () => {
//     if (!gridRef) {
//       setCellSize(null);
//       return;
//     }

//     const containerWidth = gridRef.clientWidth;
//     const containerHeight = gridRef.clientHeight;

//     const scaleX = containerWidth / simulationWidth;
//     const scaleY = containerHeight / simulationHeight;
//     const scale = Math.min(scaleX, scaleY);

//     const adjustedCellWidth = (simulationWidth / numColumns) * scale;
//     const adjustedCellHeight = (simulationHeight / numRows) * scale;

//     setCellSize(Math.min(adjustedCellWidth, adjustedCellHeight));
//   };

//   useEffect(() => {
//     calculateCellSize();
//     window.addEventListener("resize", calculateCellSize);
//     return () => {
//       window.removeEventListener("resize", calculateCellSize);
//     };
//   }, [simulationWidth, simulationHeight, numColumns, numRows, gridRef]);

//   return cellSize;
// };

export const calculateCellSize = (
  simulationWidth: number,
  simulationHeight: number,
  numColumns: number,
  numRows: number,
  gridRef: HTMLDivElement,
) => {
  const containerWidth = gridRef.clientWidth;
  const containerHeight = gridRef.clientHeight;

  const scaleX = containerWidth / simulationWidth;
  const scaleY = containerHeight / simulationHeight;
  const scale = Math.min(scaleX, scaleY);

  const adjustedCellWidth = (simulationWidth / numColumns) * scale;
  const adjustedCellHeight = (simulationHeight / numRows) * scale;

  return Math.min(adjustedCellWidth, adjustedCellHeight);
};
