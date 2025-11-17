import styles from "./Estoque.module.css";
import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

export function Estoque() {
  const { products, addProduct, removeProduct } = useContext(CartContext);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  function handleAdd(e) {
    e.preventDefault();
    if (!title || !price) return;
    addProduct({
      title,
      price: Number(price),
      description,
      thumbnail: thumbnail || "https://via.placeholder.com/150"
    });
    setTitle("");
    setPrice("");
    setDescription("");
    setThumbnail("");
  }

  return (
    <div className={styles.container}>
      <h1>Controle de Produtos</h1>
      <div className={styles.main}>
        <form onSubmit={handleAdd} className={styles.form}>
          <h2>Adicionar Produto</h2>
          <input
            type="text"
            placeholder="Nome"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={styles.input}
          />
          <input
            type="number"
            placeholder="Preço"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="URL da imagem"
            value={thumbnail}
            onChange={e => setThumbnail(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>Adicionar Produto</button>
        </form>
        <div className={styles.produtos}>
          <h2>Produtos Existentes</h2>
          <ul className={styles.lista}>
            {products.map((p) => (
              <li key={p.id} className={styles.item}>
                <img src={p.thumbnail} alt={p.title} className={styles.img} />
                <div>
                  <span className={styles.title}>{p.title}</span>
                  <span className={styles.price}>R$ {p.price}</span>
                  <p className={styles.desc}>{p.description}</p>
                </div>
                <button className={styles.remove} onClick={() => removeProduct(p.id)}>
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}