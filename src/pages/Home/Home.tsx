import React from "react";
import "./Home.css";
import Navbar from "../../components/Navbar/Navbar";

const Home: React.FC = () => {

  return (
    <>
      <Navbar />
      <div className="home-container">
        <h1 className="home-title">Bienvenido a la App</h1>
          <div className="home-buttons">
            
          </div>
      </div>
    </>
  );
};

export default Home;
