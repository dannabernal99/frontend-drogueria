import React, { useEffect, useState } from "react";
import "./Home.css";
import Navbar from "../../components/Navbar/Navbar";
import ProductCard from "../../components/ProductCard/ProductCard";
import Modal from "../../components/Modal/Modal";
import { useHttp } from "../../hooks/useHttp";
import type { ProductCatalog } from "../../types/ProductCatalog";

const Home: React.FC = () => {
  const { data: products, loading, error, sendRequest } = useHttp<ProductCatalog[]>();
  const { sendRequest: sendPurchaseRequest } = useHttp();
  
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    sendRequest({
      url: "/v1/productos/catalogo",
      method: "GET",
    });
  }, [sendRequest]);

  const showModal = (title: string, message: string) => {
    setModal({
      isOpen: true,
      title,
      message,
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      title: "",
      message: "",
    });
  };

  const handleAddToCart = async (productId: number, cantidad: number) => {
    try {
      await sendPurchaseRequest({
        url: "/v1/compras",
        method: "POST",
        body: {
          productoId: productId,
          cantidad: cantidad,
        },
      });

      showModal(
        "¡Compra exitosa!",
        `Tu compra de ${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'} ha sido realizada exitosamente.`
      );
      
      sendRequest({
        url: "/v1/productos/catalogo",
        method: "GET",
      });
    } catch (error) {
      showModal(
        "Error en la compra",
        "No se pudo completar tu compra. Por favor, intenta nuevamente."
      );
      console.error(error);
    }
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
                onAddToCart={(cantidad) => handleAddToCart(product.id, cantidad)}
              />
            ))
          ) : (
            <div className="no-products">
              <p>No hay productos disponibles en este momento</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
      />
    </>
  );
};

export default Home;