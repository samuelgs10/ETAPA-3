import styles from "./Product.module.css";
import { useState } from "react";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export function Product({ product }) {

  const { addToCart } = useContext(CartContext);
  const [qty, setQty] = useState(0);
  return (
    <div className={styles.productCard}>
      <img
        src={product.thumbnail}
        alt={product.title}
        className={styles.productImage}
      />
      <h2 className={styles.productTitle}>{product.title}</h2>
      <p className={styles.productDescription}>{product.description}</p>
      <div className={styles.productQty}>
        { qty === 0 ? <p className={styles.productPrice}>${product.price}</p> : <p className={styles.productPrice}>${(product.price * qty).toFixed(2)}</p> }
      </div>
      <button
        className={styles.productButton}
        onClick={() => {
          addToCart(product);
        }}
      >
        ADD TO CART
      </button>
    </div>
  );
}