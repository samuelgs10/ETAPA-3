import { useContext, useState } from "react";
import { SessionContext } from "../context/SessionContext";
import { CartContext } from "../context/CartContext";
import styles from "./User.module.css";
import { supabase } from "../utils/supabase";

export function User() {
  const { session, handleSignOut } = useContext(SessionContext);
  const { products, addProduct, removeProduct, updateProduct } = useContext(CartContext);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title || !price) return;

    if (editingId) {
      return salvarEdicao(e);
    }

    let nextId;
    try {
      const { data: last, error: lastErr } = await supabase
        .from("product_2v")
        .select("id")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastErr) {
        console.error("Erro ao obter último id:", lastErr);
        nextId = Date.now();
      } else {
        nextId = (last?.id ?? 0) + 1;
      }
    } catch (err) {
      console.error("Exceção ao buscar último id:", err);
      nextId = Date.now();
    }

    const newProduct = {
      id: nextId,
      title,
      description,
      price: Number(price),
      thumbnail: thumbnail || "https://via.placeholder.com/150",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.from("product_2v").insert([newProduct]).select().maybeSingle();
      if (error) {
        console.error("Supabase insert error:", error);
        addProduct(newProduct);
      } else {
        addProduct(data ?? newProduct);
      }
    } catch (err) {
      console.error("handleAdd exception:", err);
      addProduct(newProduct);
    }

    setTitle("");
    setPrice("");
    setDescription("");
    setThumbnail("");
  }

  function iniciarEdicao(produto) {
    setEditingId(produto.id);
    setTitle(produto.title ?? "");
    setPrice(produto.price ?? "");
    setDescription(produto.description ?? "");
    setThumbnail(produto.thumbnail ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvarEdicao(e) {
    e.preventDefault();
    if (!editingId) return;

    const updated = {
      id: editingId,
      title,
      price: Number(price),
      description,
      thumbnail: thumbnail || "https://via.placeholder.com/150",
      updated_at: new Date().toISOString(),
    };

    try {
      await updateProduct(updated);
    } catch (err) {
      console.error("salvarEdicao error:", err);
    }

    setEditingId(null);
    setTitle("");
    setPrice("");
    setDescription("");
    setThumbnail("");
  }

  function cancelarEdicao() {
    setEditingId(null);
    setTitle("");
    setPrice("");
    setDescription("");
    setThumbnail("");
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>
          {session?.user?.user_metadata?.admin ? "Admin Account" : "User Account"}
        </h1>

        {session ? (
          <>
            <h2 className={styles.username}>
              Welcome, {session.user.user_metadata?.username || session.user.email}!
            </h2>
            <div className={styles.details}>
              <p>User ID: {session.user.id}</p>
              <p>Email: {session.user.email}</p>
              <p>
                Created At: {new Date(session.user.created_at).toLocaleDateString()}
              </p>
            </div>
            <button className={styles.signoutButton} onClick={() => handleSignOut()}>
              Sign Out
            </button>
          </>
        ) : (
          <h2>Please log in.</h2>
        )}
      </div>

      {session?.user?.user_metadata?.admin ? (
        <section className={styles.estoque}>
          <h2>Controle de Produtos</h2>
          <div className={styles.estoqueMain}>
            <form onSubmit={handleAdd} className={styles.estoqueForm}>
              <h3>{editingId ? "Editar Produto" : "Adicionar Produto"}</h3>
              <input
                className={styles.estoqueInput}
                type="text"
                placeholder="Nome"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className={styles.estoqueInput}
                type="number"
                placeholder="Preço"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <input
                className={styles.estoqueInput}
                type="text"
                placeholder="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input
                className={styles.estoqueInput}
                type="text"
                placeholder="URL da imagem"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                <button type="submit" className={styles.estoqueButton}>
                  {editingId ? "Salvar" : "Adicionar Produto"}
                </button>
                {editingId && (
                  <button type="button" className={styles.estoqueButton} onClick={cancelarEdicao}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className={styles.estoqueProdutos}>
              <h3>Produtos Existentes</h3>
              <ul className={styles.estoqueLista}>
                {products?.map((p) => (
                  <li key={p.id} className={styles.estoqueItem}>
                    <img src={p.thumbnail} alt={p.title} className={styles.estoqueImg} />
                    <div className={styles.estoqueInfo}>
                      <span className={styles.estoqueTitle}>{p.title}</span>
                      <span className={styles.estoquePrice}>R$ {p.price}</span>
                      {p.description && <p className={styles.estoqueDesc}>{p.description}</p>}
                    </div>
                    <button className={styles.estoqueButton} onClick={() => iniciarEdicao(p)}>
                      Editar
                    </button>
                    <button className={styles.estoqueRemove} onClick={() => removeProduct(p.id)}>
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}