import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ItemList from "./ItemList.jsx";
import { useCartContext } from "../context/CartContext";

const ItemListContainer = () => {
  const { category } = useParams();
  const [data, setData] = useState([]);
  const { setCartId } = useCartContext();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const queryParams = category ? `?category=${category}` : "";
        const response = await fetch(`https://api.tiendaappleimport.online/api/products${queryParams}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const products = await response.json();
        setData(products);

        console.log(products); 

        const createCart = async () => {
          try {
            const response = await fetch("https://api.tiendaappleimport.online/api/carts", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            });

            if (!response.ok) {
              throw new Error("Network response was not ok");
            }

            const data = await response.json();
            console.log("ID del carrito:", data.cartId);
            setCartId(data.cartId); 

            document.cookie = `cartId=${data.cartId}; path=/;`;
          } catch (error) {
            console.error("Error al crear el carrito:", error);
          }
        };

        createCart();
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [category, setCartId]);

  return (
    <div>
      <h2 className="text-center mt-5 mb-5">Apple Products</h2>
      <div className="container">
        <ItemList data={data}></ItemList>
      </div>
    </div>
  );
};

export default ItemListContainer;
