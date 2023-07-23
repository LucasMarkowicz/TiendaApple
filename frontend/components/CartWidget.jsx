import React from "react";
import { Link } from "react-router-dom";



export default function Cartwidget() {

  return (
    <div className='cart-container'>
      <Link to="/cart" className="notification">
        <img src="../public/images/cart.png"></img>
      </Link>
    </div>
  );
}
