import React, { useState } from "react";
import "./ProductCard.css";

interface ProductCardProps {
  name: string;
  price: number;
  categoryName: string;
  quantity: number;
  onAddToCart?: (cantidad: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  price,
  categoryName,
  quantity,
  onAddToCart,
}) => {
  const [cantidadCompra, setCantidadCompra] = useState(1);
  const isOutOfStock = quantity === 0;

  const handleIncrement = () => {
    if (cantidadCompra < quantity) {
      setCantidadCompra(cantidadCompra + 1);
    }
  };

  const handleDecrement = () => {
    if (cantidadCompra > 1) {
      setCantidadCompra(cantidadCompra - 1);
    }
  };

  const handleComprar = () => {
    if (onAddToCart) {
      onAddToCart(cantidadCompra);
    }
  };

  return (
    <div className={`product-card ${isOutOfStock ? "out-of-stock" : ""}`}>
      <div className="product-card-header">
        <span className="product-category">{categoryName}</span>
        <span className={`product-stock ${isOutOfStock ? "no-stock" : ""}`}>
          {isOutOfStock ? "Agotado" : `Disponible: ${quantity}`}
        </span>
      </div>
      
      <div className="product-card-body">
        <h3 className="product-name">{name}</h3>
        <p className="product-price">${price.toLocaleString("es-CO")}</p>
      </div>
      
      {!isOutOfStock && (
        <div className="quantity-selector">
          <button 
            className="quantity-btn" 
            onClick={handleDecrement}
            disabled={cantidadCompra <= 1}
          >
            -
          </button>
          <span className="quantity-value">{cantidadCompra}</span>
          <button 
            className="quantity-btn" 
            onClick={handleIncrement}
            disabled={cantidadCompra >= quantity}
          >
            +
          </button>
        </div>
      )}
      
      <div className="product-card-footer">
        {!isOutOfStock && onAddToCart && (
          <button className="add-to-cart-btn" onClick={handleComprar}>
            Comprar ({cantidadCompra})
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