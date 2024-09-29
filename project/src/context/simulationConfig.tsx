import { createContext, PropsWithChildren, useContext, useState } from "react";
import DefaultConfig from "../logic/jsonConfig/default.json";
import { SimulationConfig } from "../logic/jsonConfig/parser";

type SimulationConfigState = { jsonConfig: SimulationConfig; updateSimulationConfig: (newConfig: string) => void };
const SimulationConfigContext = createContext<SimulationConfigState>(undefined as never);

export const SimulationConfigProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [jsonConfig, setJsonConfig] = useState<SimulationConfig>(DefaultConfig);

  const updateSimulationConfig = (newConfig: string) => {
    const parsedConfig = JSON.parse(newConfig);
    setJsonConfig(parsedConfig);
  };

  return (
    <SimulationConfigContext.Provider value={{ jsonConfig, updateSimulationConfig }}>
      {children}
    </SimulationConfigContext.Provider>
  );
};

export const useSimulationConfig = (): SimulationConfigState => useContext(SimulationConfigContext);
