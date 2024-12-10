import { PropsWithChildren } from "react";
import { Skeleton } from "../ui/skeleton";

const ChartWrapperAuthorityClassNames = "h-[300px] w-[max(550px,100%)]";

const ChartWrapperClassNames = "h-[300px] w-[max(350px,33%)] ";

const ChartWrapperComparingClassNames = "h-[300px] w-[max(400px,100%)] ";

export const ChartWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className={ChartWrapperClassNames}>{children}</div>;
};

export const ChartWrapperAuthority: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className={ChartWrapperAuthorityClassNames}>{children}</div>;
};

export const ChartWrapperComparing: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className={ChartWrapperComparingClassNames}>{children}</div>;
};

export const ChartWrapperSkeleton: React.FC = () => {
  return <Skeleton className={ChartWrapperClassNames} />;
};

export const ChartWrapperAuthoritySkeleton: React.FC = () => {
  return <Skeleton className={ChartWrapperAuthorityClassNames} />;
};

export const ChartWrapperComparingSkeleton: React.FC = () => {
  return <Skeleton className={ChartWrapperComparingClassNames} />;
};
