import React, { useState } from "react";
import "../styles/styles.css";

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

const RobotList = () => {
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

  return (
    <div className="robot-list">
      <div className="list-container">
        {robotsData.map((robot) => (
          <div key={robot.id} className="robot-entry">
            <div className="robot-header" onClick={() => toggleExpand(robot.id)}>
              <span className="expand-icon">{expandedRobots[robot.id] ? "▼" : "▶️"}</span>
              <img
                src={`/${robot.id}.png`} // Placeholder for robot avatar
                alt={`Robot ${robot.id}`}
                className="robot-avatar"
              />
              <span className="robot-name">{`Robot ${robot.id}`}</span>
            </div>
            {expandedRobots[robot.id] && (
              <div className="trust-properties">
                {robot.trustProperties.map((trust, index) => (
                  <div key={index} className="trust-entry">
                    <span className="trust-target">Trust in {trust.target}:</span>
                    <div className="trust-bar-container">
                      <div
                        className="trust-bar-fill"
                        style={{
                          width: `${trust.value}%`,
                          backgroundColor: getTrustColor(trust.value),
                        }}
                      ></div>
                    </div>
                    <span className="trust-value">{trust.value}%</span>
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
