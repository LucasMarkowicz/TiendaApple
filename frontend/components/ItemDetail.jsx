import React, { useState } from "react";
import ItemCount from './ItemCount.jsx';
import { Link } from 'react-router-dom';

export default function ItemDetail({ data, addToCart }) {
  const [goToCart, setGoToCart] = useState(false);

  const onAdd = (quantity) => {
    setTimeout(() => {
      setGoToCart(true);
    }, 1000);

    addToCart(quantity);
  };

  return (
    <div>
      <h2 className="text-center mt-5 mb-5">Product detail</h2>
      <div className="container">
        <div className="card mb-3 maximo-card">
          <div className="row g-0">
            <div className="col-md-4">
              <img
                src={data.thumbnail}
                className="img-fluid rounded-start"
                alt="..."
              />
            </div>
            <div className="col-md-8">
              <div className="card-body">
                <h5 className="card-title">{data.title}</h5>
                <p className="card-title">Price: {data.price}$</p>
                <p className="card-title">Category: {data.category}</p>
                <p className="card-text">Description: {data.description}</p>
                <p>{data.stock > 0 ? "In stock" : "Unavailable"}</p>
                <div></div>
                {goToCart ? (
                  <button className="btn btn-primary">
                    <Link to="/cart">Go to Cart</Link>
                  </button>
                ) : (
                  <ItemCount initial={1} stock={data.stock} onAdd={onAdd} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
