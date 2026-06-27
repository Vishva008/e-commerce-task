import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async (currentUser) => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }

    const { data } = await supabase
      .from("admins")
      .select("id")
      .eq("email", currentUser.email)
      .single();

    setIsAdmin(!!data);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      setUser(currentUser);
      await checkAdmin(currentUser);

      if (isMounted) setLoading(false);
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkAdmin(currentUser);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const value = useMemo(
    () => ({ user, isAdmin, loading }),
    [user, isAdmin, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
