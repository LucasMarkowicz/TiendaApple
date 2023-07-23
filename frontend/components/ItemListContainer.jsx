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
        const response = await fetch(`http://localhost:8080/api/products${queryParams}`, {
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

        console.log(products); // Imprimir el arreglo de productos en la consola

        // Realizar el fetch POST para la creación del carrito
        const createCart = async () => {
          try {
            const response = await fetch("http://localhost:8080/api/carts", {
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
            setCartId(data.cartId); // Guardar el ID del carrito en el contexto

            // Guardar el ID del carrito en las cookies del navegador
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
