export interface ContextInformationInterface {
  theta_base: number;
  numberOfMaliciousRobotsDetected: number;
  numberOfNeededRobots: number;
  exploredAreaFraction: number;
  wasObjectFound: boolean;
  availableMembers: number;
  totalMembers: number;
  sensitivityLevel: number;
}

export class ContextInformation implements ContextInformationInterface {
  theta_base: number;
  private k_factors: Map<string, number>;
  numberOfMaliciousRobotsDetected: number;
  numberOfNeededRobots: number;
  exploredAreaFraction: number;
  wasObjectFound: boolean;
  availableMembers: number;
  totalMembers: number;
  sensitivityLevel: number;

  constructor(contextData?: any) {
    this.theta_base = 0.5;
    this.k_factors = new Map([
      ["k1", contextData?.k1 ?? 1],
      ["k2", contextData?.k2 ?? 1],
      ["k3", contextData?.k3 ?? 1],
      ["k4", contextData?.k4 ?? 1],
      ["k5", contextData?.k5 ?? 1],
      ["k6", contextData?.k6 ?? 1],
    ]);
    this.numberOfMaliciousRobotsDetected = contextData?.numberOfMaliciousRobotsDetected ?? 0;
    this.numberOfNeededRobots = contextData?.numberOfNeededRobots ?? 4;
    this.exploredAreaFraction = contextData?.exploredAreaFraction ?? 0;
    this.wasObjectFound = contextData?.wasObjectFound ?? false;
    this.availableMembers = contextData?.availableMembers ?? 1;
    this.totalMembers = contextData?.totalMembers ?? 1;
    this.sensitivityLevel = contextData?.sensitivityLevel ?? 0;
  }

  getContextInformation(): any {
    return {
      theta_base: this.theta_base,
      numberOfMaliciousRobotsDetected: this.numberOfMaliciousRobotsDetected,
      numberOfNeededRobots: this.numberOfNeededRobots,
      exploredAreaFraction: this.exploredAreaFraction,
      wasObjectFound: this.wasObjectFound,
      availableMembers: this.availableMembers,
      totalMembers: this.totalMembers,
      sensitivityLevel: this.sensitivityLevel,
    };
  }

  private calculateContextAdjustment(): number {
    const k1 = this.k_factors.get("k1")!;
    const k2 = this.k_factors.get("k2")!;
    const k3 = this.k_factors.get("k3")!;
    const k6 = this.k_factors.get("k6")!;

    let sum_k = k1 + k2 + k3 + k6;

    const C_stateOfTheTrustor = this.calculateStateOfTheTrustor();

    const C_missionState = this.calculateMissionState();

    const C_dataSensitivity = this.calculateSensitivityLevel();

    const C_m = (C_stateOfTheTrustor + C_missionState + C_dataSensitivity) / sum_k;

    return C_m;
  }

  private calculateStateOfTheTrustor(): number {
    const fraction = this.numberOfMaliciousRobotsDetected / this.totalMembers;
    const impact = 1 / (1 + Math.exp(-10 * (fraction - 0.2))); // Sigmoid centered at 0.5
    return this.k_factors.get("k1")! * impact;
  }

  private calculateMissionState(): number {
    return (
      this.k_factors.get("k2")! * this.exploredAreaFraction + this.k_factors.get("k3")! * (this.wasObjectFound ? 1 : 0)
    );
  }

  private calculateSensitivityLevel(): number {
    return this.k_factors.get("k6")! * this.sensitivityLevel;
  }

  public getThreshold(): number {
    const C_m = this.calculateContextAdjustment();
    return C_m;
  }

  public getContextComponent(componentName: string): number {
    switch (componentName) {
      case "stateOfTheTrustor":
        return this.calculateStateOfTheTrustor();
      case "missionState":
        return this.calculateMissionState();
      case "timeLeft":
        return 0;
      case "dataSensitivity":
        return this.calculateSensitivityLevel();
      default:
        return 0;
    }
  }
}
