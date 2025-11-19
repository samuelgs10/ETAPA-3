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
  removeProductFromDB: () => {}
});

export function CartProvider({ children }) {
  const { session } = useContext(SessionContext);

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // -------------------------------------------------------
  // 🔥 BUSCAR PRODUTOS E CARRINHO DO SUPABASE
  // -------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function fetchProductsSupabase() {
      try {
        const { data, error: fetchError } = await supabase
          .from("product_2v")
          .select("*");

        if (!mounted) return;

        if (fetchError) {
          setError(fetchError.message);
          setProducts([]);
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        if (mounted) setError(String(err));
      }
    }

    async function fetchCartSupabase() {
      if (!session?.user?.id) {
        setCart([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("cart")
          .select("*")
          .eq("customer_id", session.user.id)
          .order("added_at", { ascending: false });

        if (!mounted) return;

        if (error) {
          setError(error.message);
          setCart([]);
        } else {
          setCart(data || []);
        }
      } catch (err) {
        if (mounted) setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    setLoading(true);
    fetchProductsSupabase();
    fetchCartSupabase();

    return () => (mounted = false);
  }, [session]);

  // -------------------------------------------------------
  // 🔥 ADICIONAR AO CARRINHO
  // -------------------------------------------------------

  const addToCart = async (product) => {
    const productId = product.id;

    // Atualiza local
    setCart((prev) => {
      const exists = prev.find((item) => item.product_id === productId);
      if (exists) {
        return prev.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, product_id: productId, quantity: 1 }];
    });

    if (!session) return;

    // Atualizar no Supabase
    const { data: existing } = await supabase
      .from("cart")
      .select("*")
      .eq("customer_id", session.user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("cart")
        .update({
          quantity: existing.quantity + 1,
          added_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart").insert({
        customer_id: session.user.id,
        product_id: productId,
        quantity: 1,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        description: product.description,
        added_at: new Date().toISOString(),
      });
    }
  };

  // -------------------------------------------------------
  // 🔥 DIMINUIR QUANTIDADE
  // -------------------------------------------------------

  const removeFromCart = async (productId) => {
    const item = cart.find((p) => p.product_id === productId);
    if (!item) return;

    // Atualizar local
    if (item.quantity > 1) {
      setCart((prev) =>
        prev.map((p) =>
          p.product_id === productId
            ? { ...p, quantity: p.quantity - 1 }
            : p
        )
      );
    } else {
      setCart((prev) => prev.filter((p) => p.product_id !== productId));
    }

    if (!session) return;

    // Atualizar no Supabase
    if (item.quantity > 1) {
      await supabase
        .from("cart")
        .update({
          quantity: item.quantity - 1,
          added_at: new Date().toISOString(),
        })
        .eq("customer_id", session.user.id)
        .eq("product_id", productId);
    } else {
      await supabase
        .from("cart")
        .delete()
        .eq("customer_id", session.user.id)
        .eq("product_id", productId);
    }
  };

  // -------------------------------------------------------
  // 🔥 REMOVER COMPLETAMENTE
  // -------------------------------------------------------

  const clearCart = async (productId) => {
    // Atualiza local
    setCart((prev) => prev.filter((item) => item.product_id !== productId));

    if (!session) return;

    await supabase
      .from("cart")
      .delete()
      .eq("customer_id", session.user.id)
      .eq("product_id", productId);
  };

  // -------------------------------------------------------
  // 🔥 GERAR LISTA ÚNICA PARA EXIBIÇÃO
  // -------------------------------------------------------

  const productMap = {};

  cart.forEach((product) => {
    const idKey = product.product_id;

    if (productMap[idKey]) {
      productMap[idKey].qty += product.quantity;
    } else {
      productMap[idKey] = {
        ...product,
        qty: product.quantity,
        id: idKey,
      };
    }
  });

  const uniqueProducts = Object.values(productMap);

  // -------------------------------------------------------
  // 🔥 PRODUTOS DO ADMIN
  // -------------------------------------------------------

  const addProduct = async (product) => {
    if (!session?.user?.user_metadata?.admin) {
      setError("Somente administradores podem adicionar produtos");
      return;
    }

    const payload = {
      title: product.title,
      price: product.price,
      description: product.description,
      thumbnail: product.thumbnail,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("product_2v")
      .insert(payload)
      .select()
      .single();

    if (data) setProducts((prev) => [...prev, data]);
    if (error) setError(error.message);
  };

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProduct = async (updated) => {
    if (!session?.user?.user_metadata?.admin) {
      setError("Somente administradores podem editar produtos");
      return;
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    );

    const payload = {
      title: updated.title,
      price: updated.price,
      description: updated.description,
      thumbnail: updated.thumbnail,
      updated_at: new Date().toISOString(),
    };

    await supabase.from("product_2v").update(payload).eq("id", updated.id);
  };

  const removeProductFromDB = async (id) => {
    if (!session?.user?.user_metadata?.admin) {
      setError("Somente administradores podem remover produtos");
      return;
    }

    await supabase.from("product_2v").delete().eq("id", id);
    removeProduct(id);
  };

  // -------------------------------------------------------

  const context = {
    products,
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    clearCart,
    uniqueProducts,
    addProduct,
    removeProduct,
    updateProduct,
    removeProductFromDB,
  };

  return (
    <CartContext.Provider value={context}>{children}</CartContext.Provider>
  );
}
