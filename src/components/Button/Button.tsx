import React from "react";
import "./Button.css";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger";
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  type = "button",
  variant = "primary",
}) => {
  return (
    <button className={`btn ${variant}`} type={type} onClick={onClick}>
      {text}
    </button>
  );
};

export default Button;