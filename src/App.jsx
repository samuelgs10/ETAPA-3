import "./styles/theme.css";
import "./styles/global.css";
import { Header } from "./components/Header";
import { Routes, Route } from "react-router";
import { CartProvider } from "./context/CartContext";
import { Cart } from "./components/Cart";
import { ProductList } from "./components/ProductList";
import { Login } from "./components/Login";
import { Estoque } from "./components/Estoque";
import { ToastContainer } from 'react-toastify';
import { User } from "./components/User";
import { SessionProvider} from "./context/SessionContext";

export default function App() {
  return (
    <>
      <ToastContainer />
      <SessionProvider>
        <CartProvider>
          <Header />
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/stock" element={<Estoque />} />
            <Route path="/user" element={<User />} />
          </Routes>
        </CartProvider>
      </SessionProvider>
    </>
  );
}