export class ContextInformation {
  private theta_base: number;
  private k_factors: Map<string, number>;
  private numberOfMaliciousRobotsDetected: number;
  private numberOfNeededRobots: number;
  private exploredAreaFraction: number;
  private wasObjectFound: boolean;
  private availableMembers: number;
  private totalMembers: number;
  private timeLeftMinutes: number;
  private sensitivityLevel: number;

  constructor(contextData: any) {
    this.theta_base = 0.5;
    this.k_factors = new Map([
      ["k1", contextData.k1 ?? 1],
      ["k2", contextData.k2 ?? 1],
      ["k3", contextData.k3 ?? 1],
      ["k4", contextData.k4 ?? 1],
      ["k5", contextData.k5 ?? 1],
      ["k6", contextData.k6 ?? 1],
    ]);
    this.numberOfMaliciousRobotsDetected = contextData.numberOfMaliciousRobotsDetected ?? 0;
    this.numberOfNeededRobots = contextData.numberOfNeededRobots ?? 1;
    this.exploredAreaFraction = contextData.exploredAreaFraction ?? 0;
    this.wasObjectFound = contextData.wasObjectFound ?? false;
    this.availableMembers = contextData.availableMembers ?? 1;
    this.totalMembers = contextData.totalMembers ?? 1;
    this.timeLeftMinutes = contextData.timeLeftMinutes ?? 1;
    this.sensitivityLevel = contextData.sensitivityLevel ?? 0;
  }

  private calculateContextAdjustment(): number {
    const k1 = this.k_factors.get("k1")!;
    const k2 = this.k_factors.get("k2")!;
    const k3 = this.k_factors.get("k3")!;
    const k4 = this.k_factors.get("k4")!;
    const k5 = this.k_factors.get("k5")!;
    const k6 = this.k_factors.get("k6")!;

    const sum_k = k1 + k2 + k3 + k4 + k5 + k6;

    const C_stateOfTheTrustor = k1 * (this.numberOfMaliciousRobotsDetected / this.numberOfNeededRobots);

    const C_missionState =
      k2 * this.exploredAreaFraction +
      k3 * (this.wasObjectFound ? 1 : 0) +
      k4 * (this.availableMembers / this.totalMembers);

    const C_timeLeft = k5 * (1 / this.timeLeftMinutes);

    const C_dataSensitivity = k6 * this.sensitivityLevel;

    const C_m = (C_stateOfTheTrustor + C_missionState - C_timeLeft + C_dataSensitivity) / sum_k;

    return C_m;
  }

  public getThreshold(): number {
    const C_m = this.calculateContextAdjustment();
    const theta_mn = Math.min(Math.max(this.theta_base + C_m, 0), 1);
    return theta_mn;
  }
}
