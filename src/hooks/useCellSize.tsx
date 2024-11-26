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
