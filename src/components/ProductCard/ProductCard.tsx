import React from "react";
import "./ProductCard.css";

interface ProductCardProps {
  name: string;
  price: number;
  categoryName: string;
  quantity: number;
  onAddToCart?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  price,
  categoryName,
  quantity,
  onAddToCart,
}) => {
  const isOutOfStock = quantity === 0;

  return (
    <div className={`product-card ${isOutOfStock ? "out-of-stock" : ""}`}>
      <div className="product-card-header">
        <span className="product-category">{categoryName}</span>
        <span className={`product-stock ${isOutOfStock ? "no-stock" : ""}`}>
          {isOutOfStock ? "Agotado" : `Stock: ${quantity}`}
        </span>
      </div>
      
      <div className="product-card-body">
        <h3 className="product-name">{name}</h3>
        <p className="product-price">${price.toLocaleString("es-CO")}</p>
      </div>
      
      <div className="product-card-footer">
        {!isOutOfStock && onAddToCart && (
          <button className="add-to-cart-btn" onClick={onAddToCart}>
            Comprar
          </button>
        )}
        {isOutOfStock && (
          <button className="add-to-cart-btn disabled" disabled>
            No disponible
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;