import styles from "./Product.module.css";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export function Product({ product }) {

  const { addToCart } = useContext(CartContext);

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
        <p className={styles.productPrice}>${product.price}</p>
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