import { PropsWithChildren } from "react";

export const RightSideBar: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="right-sidebar">{children}</div>;
};
