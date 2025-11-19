import { createContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabase";

export const SessionContext = createContext({
  handleSignUp: () => {},
  handleSignIn: () => {},
  handleSignOut: () => {},
  session: null,
  sessionLoading: false,
  sessionMessage: null,
  sessionError: null,
});

export function SessionProvider({ children }) {
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionMessage, setSessionMessage] = useState(null);
  const [sessionError, setSessionError] = useState(null);
  const [session, setSession] = useState(null);

  // ---------------------------------------------------------
  // 1) Carregar sessão no carregamento do app
  // ---------------------------------------------------------
  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session || null);
    }

    getSession();

    // Listener de mudanças no auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ---------------------------------------------------------
  // 2) SIGN UP — NÃO cria admin, sempre cria usuário comum
  // ---------------------------------------------------------
  async function handleSignUp(email, password, username) {
    setSessionLoading(true);
    setSessionError(null);
    setSessionMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            admin: false, // <--- admin só no Supabase manualmente
          },
          emailRedirectTo: `${window.location.origin}/signin`,
        },
      });

      if (error) throw error;

      if (data?.user) {
        setSessionMessage("Cadastro realizado! Verifique seu e-mail.");
      }
    } catch (error) {
      setSessionError(error.message);
    } finally {
      setSessionLoading(false);
    }
  }

  // ---------------------------------------------------------
  // 3) SIGN IN — puxa user_metadata.admin corretamente
  // ---------------------------------------------------------
  async function handleSignIn(email, password) {
    setSessionLoading(true);
    setSessionError(null);
    setSessionMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Atualiza sessão no estado
        setSession(data.session);
        setSessionMessage("Login realizado!");
      }
    } catch (error) {
      setSessionError(error.message);
    } finally {
      setSessionLoading(false);
    }
  }

  // ---------------------------------------------------------
  // 4) SIGN OUT
  // ---------------------------------------------------------
  async function handleSignOut() {
    setSessionLoading(true);
    setSessionError(null);
    setSessionMessage(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setSessionMessage("Você saiu da conta.");
      window.location.href = "/";
    } catch (error) {
      setSessionError(error.message);
    } finally {
      setSessionLoading(false);
    }
  }

  const context = {
    handleSignUp,
    handleSignIn,
    handleSignOut,
    session,
    sessionLoading,
    sessionMessage,
    sessionError,
  };

  return (
    <SessionContext.Provider value={context}>
      {children}
    </SessionContext.Provider>
  );
}
