import React from "react";
import "./imageButton.css";

interface ImageButtonProps {
  src: string;
  alt: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  title?: string;
}

const ImageButton: React.FC<ImageButtonProps> = ({
  src,
  alt,
  onClick,
  className = "",
  disabled = false,
  style,
  title,
}) => {
  return (
    <button className={`image-button ${className}`} onClick={onClick} disabled={disabled} style={style} title={title}>
      <img src={src} alt={alt} />
    </button>
  );
};

export default ImageButton;
