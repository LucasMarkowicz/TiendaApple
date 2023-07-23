import React, { useState, useEffect, useContext } from "react";

const CartContext = React.createContext([]);

export const useCartContext = () => useContext(CartContext);

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(null); // Agregar estado para almacenar el ID del carrito

  useEffect(() => {
    // Obtener el ID del carrito de las cookies del navegador al cargar la página
    const savedCartId = getCartIdFromCookies();
    if (savedCartId) {
      setCartId(savedCartId);
    }
  }, []);

  
  // Obtener el ID del carrito de las cookies del navegador
  const getCartIdFromCookies = () => {
    const cookies = document.cookie.split("; ");
    const cartIdCookie = cookies.find((cookie) => cookie.startsWith("cartId="));
    if (cartIdCookie) {
      return cartIdCookie.split("=")[1];
    }
    return null;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId, // Agregar el ID del carrito al contexto
        setCartId, // Agregar la función para establecer el ID del carrito al contexto
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
