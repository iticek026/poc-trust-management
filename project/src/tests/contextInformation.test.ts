import { ContextInformation } from "../logic/tms/trust/contextInformation";

describe("ContextInformation", () => {
  describe("Constructor", () => {
    it("should initialize properties with provided contextData", () => {
      const contextData = {
        k1: 2,
        k2: 3,
        k3: 4,
        k4: 5,
        k5: 6,
        k6: 7,
        numberOfMaliciousRobotsDetected: 1,
        numberOfNeededRobots: 5,
        exploredAreaFraction: 0.6,
        wasObjectFound: true,
        availableMembers: 3,
        totalMembers: 4,
        sensitivityLevel: 2,
      };
      const contextInfo = new ContextInformation(contextData);

      expect(contextInfo.getContextInformation()).toEqual({
        theta_base: 0.5,
        numberOfMaliciousRobotsDetected: 1,
        numberOfNeededRobots: 5,
        exploredAreaFraction: 0.6,
        wasObjectFound: true,
        availableMembers: 3,
        totalMembers: 4,
        sensitivityLevel: 2,
      });
    });

    it("should use default values when contextData properties are not provided", () => {
      const contextData = {};
      const contextInfo = new ContextInformation(contextData);

      expect(contextInfo.getContextInformation()).toEqual({
        theta_base: 0.5,
        numberOfMaliciousRobotsDetected: 0,
        numberOfNeededRobots: 4,
        exploredAreaFraction: 0,
        wasObjectFound: false,
        availableMembers: 1,
        totalMembers: 1,
        sensitivityLevel: 0,
      });
    });
  });

  describe("getThreshold", () => {
    it("should calculate the correct threshold", () => {
      const contextData = {
        k1: 1,
        k2: 1,
        k3: 1,
        k4: 1,
        k6: 1,
        numberOfMaliciousRobotsDetected: 7,
        numberOfNeededRobots: 4,
        exploredAreaFraction: 0.2,
        wasObjectFound: true,
        availableMembers: 3,
        totalMembers: 10,
        sensitivityLevel: 0.0,
      };
      const contextInfo = new ContextInformation(contextData);

      const threshold = contextInfo.getThreshold();

      const k1 = 1;
      const k2 = 1;
      const k3 = 1;
      const k4 = 1;
      const k6 = 1;
      const sum_k = k1 + k2 + k3 + k4 + k6; // 5

      const C_stateOfTheTrustor = k1 * 0.8802; // 0.88
      const C_missionState = k2 * 0.2 + k3 * 1 + k4 * (3 / 10); // 0.2 + 1 + 0.3 = 1.5
      const C_dataSensitivity = k6 * 0.0; // 0

      const C_m = (C_stateOfTheTrustor + C_missionState + C_dataSensitivity) / sum_k; // 2.38 / 5 = 0.476

      expect(threshold).toBeCloseTo(C_m, 3);
    });
  });

  describe("getContextComponent", () => {
    it("should return low value for stateOfTheTrustor", () => {
      const contextData = {
        k1: 2,
        numberOfMaliciousRobotsDetected: 1,
        totalMembers: 5,
      };
      const contextInfo = new ContextInformation(contextData);

      const componentValue = contextInfo.getContextComponent("stateOfTheTrustor");

      expect(componentValue).toBeLessThan(0.16);
    });

    it("should return high value for stateOfTheTrustor", () => {
      const contextData = {
        k1: 2,
        numberOfMaliciousRobotsDetected: 4,
        totalMembers: 5,
      };
      const contextInfo = new ContextInformation(contextData);

      const componentValue = contextInfo.getContextComponent("stateOfTheTrustor");

      expect(componentValue).toBeGreaterThan(0.9);
    });

    it("should return correct value for missionState", () => {
      const contextData = {
        k2: 3,
        k3: 4,
        k4: 5,
        exploredAreaFraction: 0.6,
        wasObjectFound: true,
        availableMembers: 3,
        totalMembers: 4,
      };
      const contextInfo = new ContextInformation(contextData);

      const componentValue = contextInfo.getContextComponent("missionState");
      const expectedValue = 3 * 0.6 + 4 * 1 + 5 * (3 / 4); // 1.8 + 4 + 3.75 = 9.55

      expect(componentValue).toBeCloseTo(expectedValue, 5);
    });

    it("should return correct value for dataSensitivity", () => {
      const contextData = {
        k6: 7,
        sensitivityLevel: 2,
      };
      const contextInfo = new ContextInformation(contextData);

      const componentValue = contextInfo.getContextComponent("dataSensitivity");
      const expectedValue = 7 * 2; // 14

      expect(componentValue).toBeCloseTo(expectedValue, 5);
    });

    it("should return 0 for unknown component", () => {
      const contextInfo = new ContextInformation({});
      const componentValue = contextInfo.getContextComponent("unknownComponent");

      expect(componentValue).toBe(0);
    });
  });
});
