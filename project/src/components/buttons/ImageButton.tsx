import React from "react";
import { Button } from "@/components/ui/button";
import { PropsWithChildren } from "react";

interface ImageButtonProps extends PropsWithChildren {
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const ImageButton: React.FC<ImageButtonProps> = ({ onClick, className = "", disabled = false, children, style }) => {
  return (
    <Button size="icon" onClick={onClick} disabled={disabled} className={`${className}`} style={style}>
      {children}
    </Button>
  );
};

export default ImageButton;
