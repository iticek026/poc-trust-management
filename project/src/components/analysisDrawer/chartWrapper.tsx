import { PropsWithChildren } from "react";

export const ChartWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="h-auto w-[max(350px,33%)] ">{children}</div>;
};

export const ChartWrapperAuthority: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="h-auto w-[max(550px,100%)] ">{children}</div>;
};

export const ChartWrapperComparing: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="h-auto w-[max(400px,100%)] ">{children}</div>;
};
