type Props = {
  simulationRef: React.RefObject<HTMLDivElement>;
};

export const Canvas: React.FC<Props> = ({ simulationRef }) => {
  return (
    <>
      <div ref={simulationRef} style={{ width: "100%", height: "100%" }} />
      <canvas id="environmentCanvas" width="500" height="500"></canvas>
    </>
  );
};
