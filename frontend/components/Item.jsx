import React from "react";
import { Link } from "react-router-dom";

export default function Item({ info }) {
  return (
    <div className="col">
      <div className="card">
        <img src={info.thumbnail} alt="" className="imagen-card" />
        <div className="card-body">
          <h5 className="card-title">{info.title}</h5>
          <p className="card-text">USD ${info.price}</p>
          <Link to={`/data/${info._id}`}>
            <button className="btn btn-primary">View product</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
