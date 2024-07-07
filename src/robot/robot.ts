class Robot {
  id: number;
  position: Coordinates;
  batteryLevel: number = 100;
  health: number = 100;
  communication: RobotCommunicationClient;
  constructor(id: number, position: Coordinates) {
    this.id = id;
    this.position = position;
    this.communication = new RobotCommunicationClient(
      new RobotCommunicationFactory()
    );
  }
}
