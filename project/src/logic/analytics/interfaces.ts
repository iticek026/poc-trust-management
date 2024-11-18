import { Trust } from "../tms/trustService";

export type ReputationAnalyticsData = { reputationScore: number; timestamp: number }[];

export type AuthorityAnalyticsData = {
  [id: string]: { reputation: ReputationAnalyticsData; isMalicious: boolean };
};

export type TrustScoreAnalyticsData = {
  [id: string]: { trust: Trust; timestamp: number; isTransporting: boolean }[];
};

export type RobotAnalyticsData = {
  [id: string]: { trustScores: TrustScoreAnalyticsData; isMalicious: boolean };
};

export type ReceiveMessagesAnalyticsData = { isFromMalicious: boolean; wasAccepted: boolean; timestamp: number }[];

export type AnalyticsData = {
  authority: AuthorityAnalyticsData;
  robots: RobotAnalyticsData;
  time: number;
  isTrustApplied: boolean;
  messages: ReceiveMessagesAnalyticsData;
};
