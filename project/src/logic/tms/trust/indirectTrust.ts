import { EntityCacheInstance } from "../../../utils/cache";
import { Authority } from "../actors/authority";
import { LeaderRobot } from "../actors/leaderRobot";
import { TrustRobot } from "../actors/trustRobot";
import { ConstantsInstance } from "../consts";
import { TrustCalculationData } from "../interfaces";
import { TrustService } from "../trustService";
import { erosion } from "./utils";

export class IndirectTrust {
  public static calculate(
    peerId: number,
    trustedPeers: Set<number>,
    otherPeers: Set<number>,
    authority: Authority,
    leader: LeaderRobot | null,
  ): TrustCalculationData {
    const w_a = ConstantsInstance.AUTHORITY_TRUST_WEIGHT;
    const w_l = ConstantsInstance.LEADER_TRUST_WEIGHT;
    const w_tp = ConstantsInstance.TRUSTED_PEERS_WEIGHT;
    const w_op = ConstantsInstance.OTHER_PEERS_WEIGHT;

    const T_a = this.getAuthorityTrust(peerId, authority);
    const T_l = this.getLeaderTrust(peerId, leader);
    const T_tp_bar = this.getPeersTrust(peerId, trustedPeers);
    const T_op_bar = this.getPeersTrust(peerId, otherPeers);

    let numerator = w_a * T_a;
    let denominator = w_a;

    if (T_l.wasApplied) {
      numerator += w_l * T_l.value;
      denominator += w_l;
    }

    if (T_tp_bar.wasApplied) {
      numerator += w_tp * T_tp_bar.value;
      denominator += w_tp;
    }

    if (T_op_bar.wasApplied) {
      numerator += w_op * T_op_bar.value;
      denominator += w_op;
    }

    const T_i = denominator > 0 ? numerator / denominator : 0;
    return { value: T_i, wasApplied: denominator > 0 };
  }

  private static getAuthorityTrust(peerId: number, authority: Authority): number {
    return authority.getReputation(peerId);
  }

  private static getLeaderTrust(peerId: number, leader: LeaderRobot | null): TrustCalculationData {
    return this.getPeersTrust(peerId, new Set([leader?.getId() ?? -1]));
  }

  private static getPeersTrust(peerId: number, peers: Set<number>): TrustCalculationData {
    const trustValues: number[] = [];
    peers.forEach((peer) => {
      const peerTrustService = this.getTrustService(peer);

      if (peerTrustService) {
        const record = peerTrustService.getTrustRecord(peerId);
        if (record) {
          const timestamp = record.lastUpdate;
          const trustValue = record.currentTrustLevel;
          trustValues.push(erosion(trustValue, timestamp, new Date()));
        }
      }
    });

    const peerTrust = trustValues.length > 0 ? trustValues.reduce((a, b) => a + b, 0) / trustValues.length : 0;
    return { value: peerTrust, wasApplied: trustValues.length > 0 };
  }

  private static getTrustService(peerId: number): TrustService | null {
    const peerRobot = EntityCacheInstance.getRobotById(peerId);
    if (peerRobot && peerRobot instanceof TrustRobot) {
      return peerRobot.getTrustService();
    }
    return null;
  }
}
