type Props = {
  simulationRef: React.RefObject<HTMLDivElement>;
};

export const Canvas: React.FC<Props> = ({ simulationRef }) => {
  return <div className="flex-1 flex h-[calc(100%-52px-1.5rem)]" ref={simulationRef} style={{ width: "100%" }} />;
};
