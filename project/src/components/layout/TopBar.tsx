import React, { PropsWithChildren } from "react";

export const TopBar: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="top-bar-wrapper">
      <div className="top-bar">{children}</div>
    </div>
  );
};
