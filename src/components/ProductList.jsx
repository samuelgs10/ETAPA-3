import styles from "./ProductList.module.css";
import { Product } from "./Product.jsx";
import { CircularProgress } from "@mui/material";
import { useContext, useRef, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";

export function ProductList() {
  const { products, loading, error } = useContext(CartContext);
  
  const searchInput = useRef(null);
  var [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  return (
    <div className={styles.container}>
       <div className= {styles.main}>
        <div className= {styles.search}>
          <input 
          type="text"
          ref={searchInput}
          placeholder="Search products..."
          onChange={() => {
            const query = searchInput.current.value.toLowerCase();
            filteredProducts = products.filter(product =>
              product.title.toLowerCase().includes(query) || 
              product.description.toLowerCase().includes(query)
            );
            setFilteredProducts(filteredProducts);
          }}
          />
          <button onClick={() => {
            searchInput.current.value = "";
            setFilteredProducts(products);
          }}>Clear</button>
        </div>
       {filteredProducts.map((product) => (
      <Product key={product.id} product={product}/>
        
        ))}
        </div>
         {loading && (
        <div>
          <CircularProgress   
            // size="sm"
            thickness={5}
            style={{ margin: "2rem auto", display: "block" }}
            sx={{
              color: "#001111",
            }}
          />
          <p>Loading products...</p>
        </div>
      )}
      {error && <p>Error loading products: {error.message}</p>}
    </div>
  );
}