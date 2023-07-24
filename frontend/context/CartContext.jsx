import React, { useState, useEffect, useContext } from "react";

const CartContext = React.createContext([]);

export const useCartContext = () => useContext(CartContext);

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(null); 

  useEffect(() => {
    const savedCartId = getCartIdFromCookies();
    if (savedCartId) {
      setCartId(savedCartId);
    }
  }, []);

  
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
        cartId, 
        setCartId, 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
