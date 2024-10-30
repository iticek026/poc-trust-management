import { SimulationConfig } from "../../../logic/jsonConfig/parser";
import { MemberHistory } from "../../../logic/tms/trustService";

export const simulationInit: SimulationConfig = {
  seed: null,
  authority: {
    AUTHORITY_DISCONNECT_THRESHOLD: 0.3,
    AUTHORITY_ACCEPT_THRESHOLD: 0.5,
  },
  robotGeneral: {
    DETECTION_RADIUS: 90,
  },
  robots: [
    {
      label: "Coco CH",
      coordinates: { x: 100, y: 100 },
      isLeader: true,
    },

    { label: "Sea", coordinates: { x: 100, y: 200 }, isMalicious: true, falseProvidingInfoThreshold: 1 },
    { label: "Pika", coordinates: { x: 300, y: 300 }, isMalicious: false },
    { label: "Cobra", coordinates: { x: 200, y: 200 } },
    { label: "Pika 2", coordinates: { x: 900, y: 900 } },
  ],
  environment: {
    height: 1000,
    width: 1200,
    base: {
      height: 400,
      width: 400,
      coordinates: {
        x: 1100,
        y: 1000,
      },
    },
    searchedObject: {
      height: 50,
      width: 50,
      coordinates: {
        x: 200,
        y: 200,
      },
    },
    obstacles: [
      {
        height: 90,
        width: 90,
        coordinates: { x: 550, y: 700 },
      },
      {
        height: 90,
        width: 90,
        coordinates: { x: 300, y: 700 },
      },
      {
        height: 90,
        width: 90,
        coordinates: { x: 800, y: 300 },
      },
      {
        height: 90,
        width: 90,
        coordinates: { x: 700, y: 550 },
      },
    ],
  },
  trust: {
    trustErosionEnabled: true,
    enableTrustBasedBroadcasting: false,
    INIT_TRUST_VALUE: 0.5,
    DIRECT_TRUST_WEIGHT: 2,
    INDIRECT_TRUST_WEIGHT: 1,
    AUTHORITY_TRUST_WEIGHT: 1,
    LEADER_TRUST_WEIGHT: 1,
    TRUSTED_PEERS_WEIGHT: 1,
    OTHER_PEERS_WEIGHT: 1,
    PAST_CONTEXT_WEIGHT: 1,
    PAST_TRUSTEE_WEIGHT: 1,
    COMMUNICATION_TRUST_WEIGHT: 1,
    OBSERVATION_TRUST_WEIGHT: 1,
    PRESENT_TRUST_WEIGHT: 1,
    PAST_TRUST_WEIGHT: 1,
    STATE_OF_TRUSTOR_WEIGHT: 1,
    EXPLORED_AREA_WEIGHT: 1,
    WAS_OBJECT_FOUND_WEIGHT: 1,
    AVAILABLE_MEMBERS_WEIGHT: 1,
    TIME_LEFT_WEIGHT: 1,
    DATA_SENSITIVITY_WEIGHT: 1,
  },
};

export const memberHistories: MemberHistory[] = [
  {
    id: 6,
    history: new Map([
      [
        14,
        {
          currentTrustLevel: 0.6813426651072307,
          lastUpdate: new Date("2023-10-01T00:00:00Z"),
          interactions: [
            {
              fromRobotId: 6,
              toRobotId: 14,
              outcome: true,
              timestamp: new Date("2023-10-01T00:00:00Z"),
              context: {
                k_factors: {},
                exploredAreaFraction: 0.1,
                wasObjectFound: true,
                availableMembers: 2,
                sensitivityLevel: 0.1,
                theta_base: 0.5,
                numberOfMaliciousRobotsDetected: 2,
                numberOfNeededRobots: 4,
                totalMembers: 4,
              },
              expectedValue: {
                x: 1135.9817490625983,
                y: 386.86182974355023,
              },
              receivedValue: {
                x: 303.1739705243922,
                y: 1091.0361043477878,
              },
              trustScore: 0.7164046045567652,
            },
          ],
        },
      ],
      [
        18,
        {
          currentTrustLevel: 0.7254166479880104,
          lastUpdate: new Date("2023-10-01T02:00:00Z"),
          interactions: [
            {
              fromRobotId: 6,
              toRobotId: 18,
              outcome: false,
              timestamp: new Date("2023-10-01T02:00:00Z"),
              context: {
                theta_base: 0.5,
                k_factors: {},
                exploredAreaFraction: 0.1,
                wasObjectFound: false,
                availableMembers: 3,
                sensitivityLevel: 0.2,
                numberOfMaliciousRobotsDetected: 2,
                numberOfNeededRobots: 4,
                totalMembers: 4,
              },
              observedBehaviors: [true, false, true],
              trustScore: 0.44,
            },
          ],
        },
      ],
      [
        "Misterious" as unknown as number,
        {
          currentTrustLevel: 0.7538012847804736,
          lastUpdate: new Date("2023-10-01T02:00:00.000Z"),
          interactions: [
            {
              fromRobotId: 6,
              toRobotId: -1,
              toRobotLabel: "Misterious",
              outcome: true,
              timestamp: new Date("2023-10-01T02:00:00.000Z"),
              context: {
                exploredAreaFraction: 0.1,
                wasObjectFound: true,
                availableMembers: 2,
                sensitivityLevel: 0.1,
                theta_base: 0.5,
                numberOfMaliciousRobotsDetected: 2,
                numberOfNeededRobots: 4,
                totalMembers: 4,
              },
              expectedValue: {
                x: 610.3719735099515,
                y: 308.46734689455127,
              },
              receivedValue: {
                x: 878.9535778287694,
                y: 677.1406944734277,
              },
              trustScore: 0.6,
            },
          ],
        },
      ],
    ]),
    label: "Coco CH",
  },
  {
    id: 10,
    label: "Sea",
    history: {} as MemberHistory["history"],
  },
  {
    id: 14,
    history: {} as MemberHistory["history"],
    label: "Pika",
  },
  {
    id: 18,
    history: {} as MemberHistory["history"],
    label: "Cobra",
  },
  {
    id: 22,
    history: {} as MemberHistory["history"],
    label: "Pika 2",
  },
];
