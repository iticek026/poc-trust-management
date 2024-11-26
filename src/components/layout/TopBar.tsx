import React, { PropsWithChildren } from "react";

export const TopBar: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="mb-2">{children}</div>;
};
