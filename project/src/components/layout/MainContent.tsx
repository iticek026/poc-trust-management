import { PropsWithChildren } from "react";

export const MainContent: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="flex-1 flex flex-col overflow-hidden m-2">{children}</div>;
};
