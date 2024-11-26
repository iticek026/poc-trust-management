import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  title: string;
};

export const LeftSideBar: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="left-sidebar">
      <h2 className="sidebar-header">{title}</h2>
      {children}
    </div>
  );
};
