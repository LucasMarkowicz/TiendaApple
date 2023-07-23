import React from "react";
import Item from "./Item.jsx";

export default function ItemList({ data = { products: [] } }) {
  const { products } = data; // Desestructurar el array de productos de 'data'

  return (
    <div>
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {Array.isArray(products) && products.length > 0 ? (
          products.map((product) => (
            <Item key={product._id} info={product} />
          ))
        ) : (
          <p>No hay productos disponibles.</p>
        )}
      </div>
    </div>
  );
}
