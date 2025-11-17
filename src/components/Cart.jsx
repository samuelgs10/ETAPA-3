import styles from "./Cart.module.css";
import { useState } from "react";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export function Cart() {
  const { uniqueProducts, removeFromCart, addToCart, clearCart } = useContext(CartContext);
  

  return (
    <div className={styles.cart}>
      <h2 className={styles.title}>Shopping Cart</h2>
      {uniqueProducts.length === 0 ? (
        <p className={styles.empty}>Your cart is empty</p>
      ) : (
        <>
          <ul className={styles.cartList}>
            {uniqueProducts.map((product) => (
              <li key={product.id}>
                <div className={styles.cartItem}>
                  <img src={product.thumbnail} alt={product.title} />
                  <h3>{product.title}</h3>
                  <button
                    onClick={() => removeFromCart(product)}
                    disabled={product.qty === 1}
                  >
                    -
                  </button>
                  <p>{product.qty}</p>
                  <button onClick={() => addToCart(product)}>+</button>
                  <p>${(product.price * product.qty).toFixed(2)}</p>
                  <button
                    onClick={() => {
                      clearCart(product);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.checkout}>
            <h1>Resumo: </h1> <br />
            <ul>
              {uniqueProducts.map((product) => (
                <li
                  key={product.id}
                  style={{ fontSize: "2rem", marginBottom: "1rem" }}
                >
                  <strong>{product.title}</strong> — {product.qty}x — $
                  {(product.price * product.qty).toFixed(2)}
                </li>
              ))}
            </ul>{" "}
            <br />
            <h3>
              Total: $
              {uniqueProducts
                .reduce(
                  (total, product) => total + product.price * product.qty,
                  0
                )
                .toFixed(2)}
            </h3>{" "}
            <br />
            <button>Continuar</button>
          </div>
        </>
      )}
    </div>
  );
}