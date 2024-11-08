import { Trust } from "../tms/trustService";

export type ReputationAnalyticsData = { reputationScore: number; timestamp: number }[];

export type AuthorityAnalyticsData = {
  [id: string]: { reputation: ReputationAnalyticsData; isMalicious: boolean };
};

export type TrustScoreAnalyticsData = {
  [id: string]: { trust: Trust; timestamp: number }[];
};

export type RobotAnalyticsData = {
  [id: string]: { trustScores: TrustScoreAnalyticsData; isMalicious: boolean };
};

export type AnalyticsData = {
  authority: AuthorityAnalyticsData;
  robots: RobotAnalyticsData;
};
