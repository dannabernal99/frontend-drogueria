import React, { useEffect } from "react";
import "./Home.css";
import Navbar from "../../components/Navbar/Navbar";
import ProductCard from "../../components/ProductCard/ProductCard";
import { useHttp } from "../../hooks/useHttp";
import type { ProductCatalog } from "../../types/ProductCatalog";

const Home: React.FC = () => {
  const { data: products, loading, error, sendRequest } = useHttp<ProductCatalog[]>();

  useEffect(() => {
    sendRequest({
      url: "/v1/productos/catalogo",
      method: "GET",
    });
  }, [sendRequest]);

  const handleAddToCart = (productId: number) => {
    console.log(`Producto ${productId} agregado al carrito`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="home-container">
          <div className="loading-message">
            <p>Cargando catálogo...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="home-container">
          <div className="error-message">
            <p>Error al cargar el catálogo: {error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="home-container">
        <div className="home-header">
          <h1 className="home-title">Catálogo de Productos</h1>
          <p className="home-subtitle">Encuentra los mejores productos para ti</p>
        </div>

        <div className="home-catalog">
          {products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.nombre}
                price={product.precio}
                categoryName={product.categoriaNombre}
                quantity={product.cantidad}
                onAddToCart={() => handleAddToCart(product.id)}
              />
            ))
          ) : (
            <div className="no-products">
              <p>No hay productos disponibles en este momento</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;