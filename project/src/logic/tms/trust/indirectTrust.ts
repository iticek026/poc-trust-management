import { EntityCacheInstance } from "../../../utils/cache";
import { Authority } from "../actors/authority";
import { LeaderRobot } from "../actors/leaderRobot";
import { TrustRobot } from "../actors/trustRobot";
import { AUTHORITY_TRUST_WEIGHT, LEADER_TRUST_WEIGHT, OTHER_PEERS_WEIGHT, TRUSTED_PEERS_WEIGHT } from "../consts";
import { Trust } from "../trust";
import { TrustService } from "../trustService";

export class IndirectTrust extends Trust {
  private trustedPeers: Set<number>;
  private otherPeers: Set<number>;
  private authority: Authority;
  private leader: LeaderRobot | null;

  constructor(authority: Authority, leader: LeaderRobot | null) {
    super();
    this.trustedPeers = new Set();
    this.otherPeers = new Set();
    this.authority = authority;
    this.leader = leader;
  }

  public calculate(peerId: number): number {
    const w_a = AUTHORITY_TRUST_WEIGHT;
    const w_l = LEADER_TRUST_WEIGHT;
    const w_tp = TRUSTED_PEERS_WEIGHT;
    const w_op = OTHER_PEERS_WEIGHT;

    const T_a = this.getAuthorityTrust(peerId);
    const T_l = this.getLeaderTrust(peerId);
    const T_tp_array = this.getPeersTrust(peerId, this.trustedPeers);
    const T_op_array = this.getPeersTrust(peerId, this.otherPeers);

    const n = T_tp_array.length;
    const m = T_op_array.length;

    const T_tp_bar = n > 0 ? T_tp_array.reduce((a, b) => a + b, 0) / n : 0;
    const T_op_bar = m > 0 ? T_op_array.reduce((a, b) => a + b, 0) / m : 0;

    const numerator = w_a * T_a + w_l * T_l + w_tp * T_tp_bar + w_op * T_op_bar;
    const denominator = w_a + w_l + w_tp + w_op;

    const T_i = denominator > 0 ? numerator / denominator : 0;
    return T_i;
  }

  private getAuthorityTrust(peerId: number): number {
    return this.authority.getReputation(peerId);
  }

  private getLeaderTrust(peerId: number): number {
    return this.leader?.provideTrustOpinion(peerId) ?? 0;
  }

  private getPeersTrust(peerId: number, peers: Set<number>): number[] {
    const trustValues: number[] = [];
    peers.forEach((peer) => {
      const peerTrustService = this.getPeerTrustService(peer);
      if (peerTrustService) {
        const trustValue = peerTrustService.getTrustRecord(peerId)?.currentTrustLevel || 0;
        trustValues.push(trustValue);
      }
    });
    return trustValues;
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
