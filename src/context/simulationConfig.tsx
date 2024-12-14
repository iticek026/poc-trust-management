import { createContext, PropsWithChildren, useContext, useState } from "react";
import DefaultConfig from "../logic/jsonConfig/default.json";
import { SimulationConfig } from "../logic/jsonConfig/config";

export type SimulationConfigState = {
  jsonConfig: SimulationConfig;
  updateSimulationConfig: (newConfig: string) => void;
  error: string | null;
  setError: (val: string | null) => void;
};
const SimulationConfigContext = createContext<SimulationConfigState>(undefined as never);

export const SimulationConfigProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [jsonConfig, setJsonConfig] = useState<SimulationConfig>(DefaultConfig);
  const [error, setError] = useState<string | null>(null);

  const updateSimulationConfig = (newConfig: string) => {
    const parsedConfig = JSON.parse(newConfig);
    setJsonConfig(parsedConfig);
  };

  return (
    <SimulationConfigContext.Provider value={{ jsonConfig, updateSimulationConfig, error, setError }}>
      {children}
    </SimulationConfigContext.Provider>
  );
};

export const useSimulationConfig = (): SimulationConfigState => useContext(SimulationConfigContext);
