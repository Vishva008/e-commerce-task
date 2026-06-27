import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(null);

  const loadCart = useCallback(async (id) => {
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        products (
          id,
          name,
          description,
          price,
          image_url
        )
      `)
      .eq("cart_id", id);

    if (error) {
      console.error(error);
      return;
    }

    const items = (data || []).map((item) => ({
      cartItemId: item.id,
      id: item.products.id,
      name: item.products.name,
      description: item.products.description,
      price: item.products.price,
      image_url: item.products.image_url,
      quantity: item.quantity,
    }));

    setCart(items);
  }, []);

  const getOrCreateCart = useCallback(
    async (userId) => {
      const { data: carts, error } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error(error);
        return;
      }

      if (carts && carts.length > 0) {
        setCartId(carts[0].id);
        loadCart(carts[0].id);
        return;
      }

      const { data: newCart, error: createError } = await supabase
        .from("carts")
        .insert([{ user_id: userId }])
        .select("id")
        .single();

      if (createError) {
        console.error(createError);
        return;
      }

      setCartId(newCart.id);
      loadCart(newCart.id);
    },
    [loadCart]
  );

  useEffect(() => {
    if (user) {
      getOrCreateCart(user.id);
    } else {
      setCart([]);
      setCartId(null);
    }
  }, [user, getOrCreateCart]);

  const addToCart = useCallback(
    async (product) => {
      if (!user) {
        alert("Please login first.");
        return;
      }

      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id")
        .eq("cart_id", cartId)
        .eq("product_id", product.id)
        .single();

      if (existingItem) {
        alert("Product is already added to the cart.");
        return;
      }

      const { error } = await supabase.from("cart_items").insert([
        {
          cart_id: cartId,
          product_id: product.id,
          quantity: 1,
        },
      ]);

      if (error) {
        console.error(error);
        return;
      }

      loadCart(cartId);
    },
    [user, cartId, loadCart]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      const item = cart.find((item) => item.id === productId);

      if (!item) return;

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", item.cartItemId);

      if (error) {
        console.error(error);
        return;
      }

      loadCart(cartId);
    },
    [cart, cartId, loadCart]
  );

  const increaseQuantity = useCallback(
    async (productId) => {
      const item = cart.find((item) => item.id === productId);

      if (!item) return;

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: item.quantity + 1 })
        .eq("id", item.cartItemId);

      if (error) {
        console.error(error);
        return;
      }

      loadCart(cartId);
    },
    [cart, cartId, loadCart]
  );

  const decreaseQuantity = useCallback(
    async (productId) => {
      const item = cart.find((item) => item.id === productId);

      if (!item) return;

      if (item.quantity === 1) {
        await removeFromCart(productId);
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: item.quantity - 1 })
        .eq("id", item.cartItemId);

      if (error) {
        console.error(error);
        return;
      }

      loadCart(cartId);
    },
    [cart, cartId, loadCart, removeFromCart]
  );

  const clearCart = useCallback(async () => {
    if (!cartId) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);

    if (error) {
      console.error(error);
      return;
    }

    setCart([]);
  }, [cartId]);

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      cart,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
