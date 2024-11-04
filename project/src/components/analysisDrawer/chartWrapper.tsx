import { PropsWithChildren } from "react";

export const ChartWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="h-auto w-[600px]">{children}</div>;
};
