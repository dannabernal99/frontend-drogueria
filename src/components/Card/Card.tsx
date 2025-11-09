import React from "react";
import "./Card.css";

interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="card" style={{ borderTopColor: color || "#3498db" }}>
      <div className="card-icon">{icon}</div>
      <div className="card-info">
        <h3 className="card-title">{title}</h3>
        <p className="card-value">{value}</p>
      </div>
    </div>
  );
};

export default Card;