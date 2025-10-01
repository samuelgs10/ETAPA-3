import styles from "./Cart.module.css";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export function Cart() {
  const { cart, updateQtyCart, clearCart } = useContext(CartContext);

  return (
    <div className={styles.cart}>
      <h2>Shopping Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cart.map((product, index) => (
            <li key={index} className={styles.cartItem}>
              <img src={product.thumbnail} alt={product.title} />
              <h3>{product.title}</h3>
              <p>${product.price.toFixed(2)}</p>
              <div className={styles.quantity}>
                <button
                  onClick={() =>
                    updateQtyCart(product.id, product.quantity - 1)
                  }
                  disabled={product.quantity <= 1}
                >
                  -
                </button>
                <span>{product.quantity}</span>
                <button
                  onClick={() =>
                    updateQtyCart(product.id, product.quantity + 1)
                  }
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}