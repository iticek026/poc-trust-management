type Experience = {
  timestamp: Date;
  location: Coordinates;
  urgency: number;
  trustDelta: number;
  trustee: TrustRobot;
  // action: Action; // TODO: Maybe??? - define Action
};

type Reputation = number;
