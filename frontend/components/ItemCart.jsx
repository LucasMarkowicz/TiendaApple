import React from "react";
import { useCartContext } from "../context/CartContext";

export default function ItemCart({ product }) {
  const { cartId } = useCartContext();

  const removeProduct = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/carts/${cartId}/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        // If the product was successfully removed from the cart, reload the cart data
        window.location.reload();
      } else {
        console.error("Failed to delete item from cart.");
      }
    } catch (error) {
      console.error("Error deleting item from cart:", error);
    }
  };


  return (
    <div className="itemCart">
      <div className="container">
        <div className="card mb-3 maximo-card">
          <div className="row g-0">
            <div className="col-md-3">
              <img
                src={product.product.thumbnail} 
                className="img-fluid rounded-start"
                alt="..."
              />
            </div>
            <div className="col-md-9">
              <div className="card-body">
                <h5 className="card-title">{product.product.title}</h5> 
                <p className="card-title">Unitary Price: ${product.product.price}</p> 
                <p className="card-title">Quantity: {product.quantity}</p> 
                <p className="card-title">Subtotal Price: ${product.subtotal}</p> 
                
                <button
                  className="btn btn-primary"
                  onClick={() => removeProduct(product.product._id)} 
                >
                  Delete Items
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
