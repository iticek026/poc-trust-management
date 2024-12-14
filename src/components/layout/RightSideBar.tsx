import { PropsWithChildren } from "react";

export const RightSideBar: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="flex flex-col gap-2 max-w-[350px] min-w-[300px] mr-4 max-h-screen">{children}</div>;
};
