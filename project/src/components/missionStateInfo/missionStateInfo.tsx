import { useState, useEffect } from "react";
import { useSimulationConfig } from "../../context/simulationConfig";
import { MissionStateHandlerInstance } from "../../logic/simulation/missionStateHandler";
import { EnvironmentGridSingleton } from "../../logic/visualization/environmentGrid";
import "./missionStateInfo.css";

export const MissionStateInfo: React.FC = () => {
  const jsonConfig = useSimulationConfig();

  const [coverage, setCoverage] = useState(EnvironmentGridSingleton.getExploredAreaFraction());
  const [availableMembers, setAvailablememver] = useState(jsonConfig.jsonConfig.robots.length);

  useEffect(() => {
    const timer = setInterval(() => {
      const updateState = () => {
        const explored = EnvironmentGridSingleton.getExploredAreaFraction();
        setCoverage(explored);
        setAvailablememver(MissionStateHandlerInstance.getAvailableRobots() ?? jsonConfig.jsonConfig.robots.length);
      };
      updateState();
    }, 300);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="info">
      <span>Explored area: {(Math.round(coverage * 10000) / 100).toFixed(2)}%</span>
      <span>Mission state: {MissionStateHandlerInstance.getMissionState()}</span>
      <span>
        Available members: {availableMembers} of {jsonConfig.jsonConfig.robots.length}
      </span>
    </div>
  );
};
