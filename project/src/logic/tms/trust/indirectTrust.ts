import { EntityCacheInstance } from "../../../utils/cache";
import { isValue } from "../../../utils/checks";
import { Authority } from "../actors/authority";
import { LeaderRobot } from "../actors/leaderRobot";
import { TrustRobot } from "../actors/trustRobot";
import { AUTHORITY_TRUST_WEIGHT, LEADER_TRUST_WEIGHT, OTHER_PEERS_WEIGHT, TRUSTED_PEERS_WEIGHT } from "../consts";
import { TrustCalculationData } from "../interfaces";
import { TrustService } from "../trustService";

export class IndirectTrust {
  private trustedPeers: Set<number>;
  private otherPeers: Set<number>;
  private authority: Authority;
  private leader: LeaderRobot | null;

  constructor(authority: Authority, leader: LeaderRobot | null) {
    this.trustedPeers = new Set();
    this.otherPeers = new Set();
    this.authority = authority;
    this.leader = leader;
  }

  public calculate(peerId: number): TrustCalculationData {
    const w_a = AUTHORITY_TRUST_WEIGHT;
    const w_l = LEADER_TRUST_WEIGHT;
    const w_tp = TRUSTED_PEERS_WEIGHT;
    const w_op = OTHER_PEERS_WEIGHT;

    const T_a = this.getAuthorityTrust(peerId);
    const T_l = this.getLeaderTrust(peerId);
    const T_tp_bar = this.getPeersTrust(peerId, this.trustedPeers);
    const T_op_bar = this.getPeersTrust(peerId, this.otherPeers);

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

  private getAuthorityTrust(peerId: number): number {
    return this.authority.getReputation(peerId);
  }

  private getLeaderTrust(peerId: number): TrustCalculationData {
    const leaderOpinion = this.leader?.provideTrustOpinion(peerId);

    return { value: leaderOpinion ?? 0, wasApplied: isValue(leaderOpinion) };
  }

  private getPeersTrust(peerId: number, peers: Set<number>): TrustCalculationData {
    const trustValues: number[] = [];
    peers.forEach((peer) => {
      const peerTrustService = this.getPeerTrustService(peer);
      if (peerTrustService) {
        const trustValue = peerTrustService.getTrustRecord(peerId)?.currentTrustLevel || 0;
        trustValues.push(trustValue);
      }
    });

    const peerTrust = trustValues.length > 0 ? trustValues.reduce((a, b) => a + b, 0) / trustValues.length : 0;
    return { value: peerTrust, wasApplied: trustValues.length > 0 };
  }

  private getPeerTrustService(peerId: number): TrustService | null {
    const peerRobot = EntityCacheInstance.getRobotById(peerId);
    if (peerRobot && peerRobot instanceof TrustRobot) {
      return peerRobot.getTrustService();
    }
    return null;
  }

  public addTrustedPeer(peerId: number): void {
    this.trustedPeers.add(peerId);
  }

  public removeTrustedPeer(peerId: number): void {
    this.trustedPeers.delete(peerId);
  }
}
