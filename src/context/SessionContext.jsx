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

  useEffect(() => {
    async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session || null);
    }

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session || null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
            admin: false,
          },
          emailRedirectTo: `${window.location.origin}/signin`,
        },
      });
      if (error) throw error;

      if (data?.user) {
        setSessionMessage(
          "Registration successful! Check your email for confirmation."
        );
      }
    } catch (error) {
      setSessionError(error.message);
    } finally {
      setSessionLoading(false);
    }
  }

  async function handleSignIn(email, password) {
    console.log("HandleSignIn called");
    setSessionLoading(true);
    setSessionError(null);
    setSessionMessage(null);
    console.log("SetSessions");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.log("Error 81");
        throw error;
      }

      if (data.session) {
        setSession(data.session);
        setSessionMessage("Sign in Successful!");
        console.log("SignIn successful");
      }
    } catch (error) {
      console.log("Error", error.message);
      setSessionError(error.message);
    } finally {
      console.log("SignIn process ended");
      setSessionLoading(false);
    }
  }

  async function handleSignOut() {
    setSessionLoading(true);
    setSessionError(null);
    setSessionMessage(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setSessionMessage("Sign out successful!");
      window.location.href = "/";
    } catch (error) {
      setSessionError(error.message);
    } finally {
      setSessionLoading(false);
    }
  }
  const context = {
    handleSignUp: handleSignUp,
    handleSignIn: handleSignIn,
    handleSignOut: handleSignOut,
    session: session,
    sessionLoading: sessionLoading,
    sessionMessage: sessionMessage,
    sessionError: sessionError,
  };
  return (
    <SessionContext.Provider value={context}>
      {children}
    </SessionContext.Provider>
  );
}