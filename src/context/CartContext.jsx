import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../utils/supabase";
import { SessionContext } from "./SessionContext";

export const CartContext = createContext({
  products: [],
  cart: [],
  loading: false,
  error: null,
  addToCart: () => {},
  updateQty: () => {},
  clearCart: () => {},
  removeFromCart: () => {},
  uniqueProducts: [],
  addProduct: () => {},
  removeProduct: () => {},
  updateProduct: () => {},
});

export function CartProvider({ children }) {
  const { session } = useContext(SessionContext);

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  if (!session) {
    setProducts([]);
    setCart([]);
    setLoading(false);
    return;
  }

  let mounted = true;

  async function fetchProductsSupabase() {
    try {
      const { data, error: fetchError } = await supabase.from("product_2v").select("*");
      if (!mounted) return;
      if (fetchError) {
        console.error("fetchProductsSupabase error:", fetchError);
        setError(fetchError.message || JSON.stringify(fetchError));
        setProducts([]);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      console.error("fetchProductsSupabase exception:", err);
      if (mounted) setError(String(err));
      if (mounted) setProducts([]);
    }
  }

  async function fetchCartSupabase() {
    if (!session || !session.user || !session.user.id) {
      if (mounted) setCart([]);
      if (mounted) setLoading(false);
      return;
    }

    try {
      const { data, error: cartError } = await supabase
        .from("cart")
        .select("*")
        .eq("customer_id", session.user.id)
        .order("added_at", { ascending: false });

      if (!mounted) return;

      if (cartError) {
        console.error("fetchCartSupabase error:", cartError);
        setError(cartError.message || JSON.stringify(cartError));
        setCart([]);
      } else {
        setCart(data || []);
      }
    } catch (err) {
      console.error("fetchCartSupabase exception:", err);
      if (mounted) setError(String(err));
      if (mounted) setCart([]);
    } finally {
      if (mounted) setLoading(false);
    }
  }

  setLoading(true);
  fetchProductsSupabase();
  fetchCartSupabase();

  return () => {
    mounted = false;
  };
}, [session]);

  const updateProduct = async (updated) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));

    try {
      const payload = {
        title: updated.title,
        price: updated.price,
        description: updated.description,
        thumbnail: updated.thumbnail,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("product_2v").update(payload).eq("id", updated.id);
    } catch (err) {
      console.error("updateProduct exception:", err);
      setError(String(err));
    }
  };
  
  const addToCart = (product) => {
    setCart((prev) => [...prev, { ...product, quantity: 1 }]);

    async function addCartItem(prod) {
      if (!session) {
        setError("Entre em sua conta para modificar o carrinho");
        return;
      }
      try {
        const { data: existing, error: fetchErr } = await supabase
          .from("cart")
          .select("*")
          .eq("customer_id", session.user.id)
          .eq("product_id", prod.id)
          .maybeSingle();

        if (existing) {
          const newQty = existing.quantity + 1;
          const { error: updateErr } = await supabase
            .from("cart")
            .update({ quantity: newQty, added_at: new Date().toISOString() })
            .eq("customer_id", session.user.id)
            .eq("product_id", prod.id);
          return;
        }

        const { error: insertErr } = await supabase.from("cart").insert({
          customer_id: session.user.id,
          product_id: prod.id,
          quantity: 1,
          title: prod.title,
          price: prod.price,
          thumbnail: prod.thumbnail,
          description: prod.description,
          added_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error("addToCart exception:", err);
        setError(String(err));
      }
    }

    addCartItem(product);
  };

  const updateQty = async (product, qty) => {
    if (!session) {
      setError("Entre em sua conta para modificar o carrinho");
      return;
    }

    try {
      const productId = product.product_id ?? product.id;

      const { error } = await supabase
        .from("cart")
        .update({ quantity: qty, added_at: new Date().toISOString() })
        .eq("customer_id", session.user.id)
        .eq("product_id", productId);
    } catch (err) {
      console.error("updateQty exception:", err);
      setError(String(err));
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === product.id || item.product_id === product.id ? { ...item, quantity: qty } : item
      )
    );
  };

  const removeFromCart = async (product) => {
    const match = cart.find(
      (item) =>
        item.id === product.id ||
        item.product_id === product.id ||
        (product.product_id && item.product_id === product.product_id)
    );

    const currentQty = match.quantity;
    const rowId = match.id;
    const productId = match.product.id;


    if (currentQty > 1) {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === rowId || item.product_id === productId ? { ...item, quantity: (item.quantity ?? 1) - 1 } : item
        )
      );
    } else {
      setCart((prevCart) => {
        const index = prevCart.findIndex(
          (item) => item.id === rowId || item.product_id === productId || item.id === product.id
        );
        if (index === -1) return prevCart;
        const newCart = [...prevCart];
        newCart.splice(index, 1);
        return newCart;
      });
    }

    // persist change to supabase
    if (!session) {
      setError("Entre em sua conta para modificar o carrinho");
      return;
    }

    try {
      if (currentQty > 1) {
        const { error: updErr } = await supabase
          .from("cart")
          .update({ quantity: currentQty - 1, added_at: new Date().toISOString() })
          .eq("customer_id", session.user.id)
          .eq("product_id", productId);

      } else {
        const { error: delErr } = await supabase
          .from("cart")
          .delete()
          .eq("customer_id", session.user.id)
          .eq("product_id", productId);
      }
    } catch (err) {
      console.error("removeFromCart exception:", err);
      setError(String(err));
    }
  };

  const productMap = {};
  cart.forEach((product) => {
    const idKey = product.product_id ?? product.id;
    if (productMap[idKey]) {
      productMap[idKey].qty += product.quantity ?? 1;
    } else {
      productMap[idKey] = { ...product, qty: product.quantity ?? 1, id: idKey };
    }
  });

  const uniqueProducts = Object.values(productMap);

  const clearCart = async (product) => {
    if (!session) return;
    try {
      const { error } = await supabase.from("cart")
      .delete()
      .eq("customer_id", session.user.id)
      .eq("product_id", product.id);
    } catch (err) {
      console.error("clearCart exception:", err);
      setError(String(err));
    }
  };

  const addProduct = (product) => {
    setProducts((prev) => [...prev, { ...product, id: Date.now() }]);
  };

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const context = {
    products,
    cart,
    loading,
    error,
    addToCart,
    updateQty,
    clearCart,
    removeFromCart,
    uniqueProducts,
    addProduct,
    removeProduct,
    updateProduct,
  };

  return <CartContext.Provider value={context}>{children}</CartContext.Provider>;
}