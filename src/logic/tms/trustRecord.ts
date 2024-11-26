import { Interaction, InteractionInterface } from "../common/interaction";
import { timestamp } from "../simulation/simulation";
import { ConstantsInstance } from "./consts";
import { ContextInformation } from "./trust/contextInformation";
import { Trust } from "./trustService";
import { TrustValue } from "./trustValue";

export interface TrustRecordInterface {
  trustScore: number;
  lastUpdate: Date;
  interactions: InteractionInterface[];
}

export class TrustRecord extends TrustValue implements TrustRecordInterface {
  public interactions: Interaction[];
  public trustScores: { trust: Trust; timestamp: number; isTransporting: boolean }[] = [
    {
      trust: {
        value: ConstantsInstance.INIT_TRUST_VALUE,
        directTrust: {
          value: ConstantsInstance.INIT_TRUST_VALUE,
          wasApplied: true,
          pastExperience: {
            value: ConstantsInstance.INIT_TRUST_VALUE,
            wasApplied: true,
          },
          presentExperience: {
            value: ConstantsInstance.INIT_TRUST_VALUE,
            wasApplied: true,
          },
        },
        indirectTrust: {
          value: ConstantsInstance.INIT_TRUST_VALUE,
          wasApplied: true,
          authorityTrust: {
            value: ConstantsInstance.INIT_TRUST_VALUE,
            wasApplied: true,
          },
          leaderTrust: {
            value: ConstantsInstance.INIT_TRUST_VALUE,
            wasApplied: true,
          },
          trustedPeersTrust: {
            value: ConstantsInstance.INIT_TRUST_VALUE,
            wasApplied: true,
          },
          otherPeersTrust: {
            value: ConstantsInstance.INIT_TRUST_VALUE,
            wasApplied: true,
          },
        },
        contextInformation: {
          context: new ContextInformation(),
          value: new ContextInformation().getThreshold(),
        },
      },
      timestamp: 0,
      isTransporting: false,
    },
  ];

  constructor(lastUpdate?: Date) {
    super(ConstantsInstance.INIT_TRUST_VALUE, lastUpdate ?? new Date());
    this.interactions = [];
  }

  public addInteraction(interaction: Interaction): void {
    this.interactions.push(interaction);
    this.lastUpdate = interaction.timestamp;
  }

  public updateAnalyticsData(trust: Trust, isTransporting: boolean): void {
    this.trustScores.push({
      trust: {
        ...trust,
        value: this.trustScore,
      },
      timestamp,
      isTransporting,
    });
  }

  public updateTrust(trust: number): void {
    this.trustScore = trust;
  }
}
