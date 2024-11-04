import { Trust } from "../tms/trustService";

export type AuthorityAnalyticsData = {
  [id: string]: { reputationScore: number; timestamp: number }[];
};

export type TrustScoreAnalyticsData = {
  [id: string]: { trust: Trust; timestamp: number }[];
};

export type RobotAnalyticsData = {
  [id: string]: { trustScores: TrustScoreAnalyticsData };
};

export type AnalyticsData = {
  authority: AuthorityAnalyticsData;
  robots: RobotAnalyticsData;
};
