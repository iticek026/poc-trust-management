import { useEffect, useState } from "react";
import "./styles.css";
import RobotIcon from "../../assets/robot.svg";
import Expanded from "../../assets/expanded.svg";
import Collapsed from "../../assets/collapsed.svg";

import { TrustDataProvider } from "../../logic/tms/trustDataProvider";
import { getRobotLabel } from "./utils";

type ExpandList = {
  [id: number]: boolean;
};

type Props = {
  trustDataProvider: TrustDataProvider;
};

const RobotList: React.FC<Props> = ({ trustDataProvider }) => {
  const [trustData, setTrustData] = useState(trustDataProvider.getTrustData());
  const [expandedRobots, setExpandedRobots] = useState<ExpandList>({});

  const toggleExpand = (robotId: number) => {
    setExpandedRobots((prevState) => ({
      ...prevState,
      [robotId]: !prevState[robotId],
    }));
  };

  const getTrustColor = (value: number) => {
    if (value >= 70) return "#4CAF50"; // Green
    if (value >= 40) return "#FFC107"; // Yellow
    return "#F44336"; // Red
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const updateTrust = () => {
        const updatedTrustData = trustDataProvider.getTrustData();
        setTrustData(updatedTrustData);
      };
      updateTrust();
    }, 800);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="robot-list">
      <div className="list-container">
        {trustData.map((robot) => (
          <details key={robot.id} className="robot-entry">
            <summary className="robot-header" onClick={() => toggleExpand(robot.id)}>
              <img className="expand-icon" src={expandedRobots[robot.id] ? Expanded : Collapsed} />
              <img
                src={RobotIcon} // Placeholder for robot avatar
                alt={getRobotLabel(robot.type, robot.label)}
                className={`robot-avatar ${robot.type === "malicious" ? "malicious" : ""}`}
              />
              <span className="robot-name">{getRobotLabel(robot.type, robot.label)}</span>
            </summary>
            <div className="trust-properties-container">
              <div className={`trust-properties-contract ${expandedRobots[robot.id] && "expanded"}`}>
                {robot.trustProperties.map((trust, index) => (
                  <div key={index} className="trust-entry">
                    <span className="trust-target">Trust in {trust.trustTo.label}:</span>
                    <div className="trust-bar-container">
                      <div
                        className="trust-bar-fill"
                        style={{
                          width: `${trust.trustValue * 100}%`,
                          backgroundColor: getTrustColor(trust.trustValue * 100),
                        }}
                      ></div>
                    </div>
                    <span className="trust-value">{(trust.trustValue * 100).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default RobotList;
