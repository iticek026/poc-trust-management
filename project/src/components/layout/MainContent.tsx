import { PropsWithChildren } from "react";

export const MainContent: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="main-content">{children}</div>;
};
