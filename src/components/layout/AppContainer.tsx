import { PropsWithChildren } from "react";

export const AppContainer: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="app-container glass">{children}</div>;
};
