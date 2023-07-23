import React, { useEffect, useState } from "react";


export default function ItemCount({initial, stock, onAdd}) {
    const [count, setCount] = useState(parseInt(initial));

    const decrease = () => {
        setCount(count - 1);
    }

    const increase = () => {
        setCount(count + 1);
    }

    useEffect(() => {
        setCount(parseInt(initial));
    }, [initial])

  return (
    <div className="counter">
      <div className="counterButton">
      <button disabled={count <= 1} onClick={decrease}>-</button>
      <span>{count}</span>
      <button disabled={count == stock} onClick={increase}>+</button>
      </div>
      <div>
        <button className="btn btn-primary" disabled={stock = 0} onClick={() => onAdd(count)}> Add to cart</button>
      </div>
    </div>
  );
}