export class TrustUpdateRecord {
  public fromRobotId: number;
  public toRobotId: number;
  public trustValue: number;
  public timestamp: Date;

  constructor(fromRobotId: number, toRobotId: number, trustValue: number) {
    this.fromRobotId = fromRobotId;
    this.toRobotId = toRobotId;
    this.trustValue = trustValue;
    this.timestamp = new Date();
  }
}
