import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ItemDetail from "./ItemDetail.jsx";
import { useCartContext } from '../context/CartContext.jsx';

export default function ItemDetailContainer() {
  const { pid } = useParams();
  const [data, setData] = useState(null);
  const { cartId } = useCartContext(); 

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://api.tiendaappleimport.online/api/products/${pid}`, {
          method: 'GET', 
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        
        const json = await response.json();
        if (response.ok) {
          setData(json.product);
        } else {
          console.error(json);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
  
    fetchProduct();
  }, [pid]);
  

  const addToCart = async (quantity) => { 
    try {
      const response = await fetch(`https://api.tiendaappleimport.online/api/carts/${cartId}/products/${pid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ quantity }), 
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Product added to cart:", data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  return (
    <div>
      {data ? <ItemDetail data={data} addToCart={addToCart} /> : <p>Loading...</p>}
    </div>
  );
}
