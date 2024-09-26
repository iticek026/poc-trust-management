type Props = {
  simulationRef: React.RefObject<HTMLDivElement>;
};

export const Canvas: React.FC<Props> = ({ simulationRef }) => {
  return <div className="canvas-container" ref={simulationRef} style={{ width: "100%", height: "100%" }} />;
};