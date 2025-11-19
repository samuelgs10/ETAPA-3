import styles from "./Header.module.css";
import { ShoppingBasket, CircleUserRound, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { SessionContext } from "../context/SessionContext";

export function Header() {
  const { cart } = useContext(CartContext);
  const { session } = useContext(SessionContext);

  // Verifica se o usuário logado é admin
  const isAdmin = session?.user?.user_metadata?.admin === true;

  return (
    <header className={styles.header1}>
      <Link to="/" className={styles.title}>LOJA TECH</Link>

      <div className={styles.cart}>

        {/* ---- BOTÃO ADMIN ---- */}
        {/* Aparece para todos */}
        <Link
          to="/admin"
          className={styles.adminButton}
          title={isAdmin ? "Painel do Administrador" : "Apenas administradores podem acessar"}
        >
          <ShieldCheck />
        </Link>

        {/* ---- CARRINHO ---- */}
        <Link to="/cart"><ShoppingBasket /></Link>
        {cart.length === 0 ? <h5></h5> : <p>{cart.length}</p>}

        {/* ---- LOGIN / USER ---- */}
        {session != null ? (
          <Link to="/user"><CircleUserRound /></Link>
        ) : (
          <Link to="/login"><CircleUserRound /></Link>
        )}
      </div>
    </header>
  );
}
