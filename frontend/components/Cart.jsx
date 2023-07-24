import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ItemCart from "./ItemCart.jsx";
import { useCartContext } from "../context/CartContext";
import { initMercadoPago } from '@mercadopago/sdk-react';

initMercadoPago('TEST-76e32fd7-554b-469f-bc75-5dc38bfa7939');

export default function Cart() {
  const { cartId } = useCartContext();
  const [cartData, setCartData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const response = await fetch(
          `https://api.tiendaappleimport.online/api/carts/${cartId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const json = await response.json();
        if (response.ok) {
          setCartData(json);
        } else {
          console.error(json);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    if (cartId) {
      fetchCartData();
    }
  }, [cartId]);

  const handleClick = async () => {
    try {
      const response = await fetch("https://api.tiendaappleimport.online/api/carts/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartId: cartId,
          total: cartData.total,
        }),
        credentials: "include",
      });

      if (response.ok) {
        const { preferenceId } = await response.json();
        // Redireccionar al usuario a la página de pago de MercadoPago
        window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?preference_id=${preferenceId}`;
      } else {
        console.error("Error creating preference:", response);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };

  if (!cartData || cartData.products.length === 0) {
    return (
      <div className="text-left mt-3">
        <p>Your cart is empty</p>
        <button className="btn btn-primary">
          <Link to="/">Continue shopping</Link>
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-center mt-5 mb-5">Your Cart</h2>
      <div>
        {cartData.products.map((product) => (
          <ItemCart key={product.product._id} product={product} />
        ))}
        <h5 className="container">Total buy: ${cartData.total}</h5>
        <div className="container">
          <button className="buyNowButton btn btn-primary" onClick={handleClick}>
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}