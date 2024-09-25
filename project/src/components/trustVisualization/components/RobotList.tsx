import { useEffect, useState } from "react";
import "../styles/styles.css";
import RobotIcon from "../../../assets/robot.svg";
import { TrustDataProvider } from "../../../logic/tms/trustDataProvider";

const robotsData = [
  {
    id: 1,
    trustProperties: [
      { target: 2, value: 85 },
      { target: 3, value: 45 },
      { target: 4, value: 20 },
    ],
  },
  {
    id: 2,
    trustProperties: [
      { target: 1, value: 75 },
      { target: 3, value: 65 },
    ],
  },
  // Add more robot data as needed
];

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
          <div key={robot.id} className="robot-entry">
            <div className="robot-header" onClick={() => toggleExpand(robot.id)}>
              <span className="expand-icon">{expandedRobots[robot.id] ? "▼" : "▶️"}</span>
              <img
                src={RobotIcon} // Placeholder for robot avatar
                alt={`Robot ${robot.label}`}
                className="robot-avatar"
              />
              <span className="robot-name">{`Robot ${robot.label}`}</span>
            </div>
            {expandedRobots[robot.id] && (
              <div className="trust-properties">
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RobotList;
