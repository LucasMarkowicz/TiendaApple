import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import "./App.css";
import ItemListContainer from "../components/ItemListContainer.jsx";
import ItemDetailContainer from "../components/ItemDetailContainer.jsx";
import Cart from "../components/Cart.jsx";
import CartProvider from "../context/CartContext.jsx";
import Login from "../pages/logins/Login.jsx";
import Register from "../pages/logins/Register.jsx";
import Navbar from "../components/Navbar.jsx";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('https://tienda-apple-import.onrender.com/api/users/current', { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        setIsLoggedIn(data.isLoggedIn);
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <CartProvider>
        {isLoggedIn ? (
          <div>
            <Navbar setIsLoggedIn={setIsLoggedIn} />
            <Routes>
              {/* Ruta para mostrar todos los productos */}
              <Route path="/products" element={<ItemListContainer />} />
              {/* Ruta para mostrar categoría específica */}
              <Route path="/:category" element={<ItemListContainer />} />
              <Route path="/data/:pid" element={<ItemDetailContainer />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="*" element={<Navigate to="/products" />} />
            </Routes>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </CartProvider>
    </div>
  );
}

export default App;
