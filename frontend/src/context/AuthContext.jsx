import { createContext, useContext, useState, useEffect } from "react";
import { supabase, API_BASE } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUser(session.access_token);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUser(session.access_token);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUser(token) {
    try {
      const res = await fetch(`${API_BASE}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      syncWithExtension(data, token);
      setUser(data);
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // ─── Sync user data to the Chrome extension safely ──────────────────────
  // Wrapped in its own function so any extension errors NEVER propagate
  // up into the save/upload flows and cause false "Failed to save" toasts.
  function syncWithExtension(userData, token) {
    try {
      // postMessage bridge (content script listens for this)
      window.postMessage(
        { type: "AUTOSLAY_SAVE_USER", user: userData, token },
        window.location.origin
      );
    } catch (_) {
      // Silently ignore — extension may not be installed
    }

    try {
      if (
        typeof window !== "undefined" &&
        window.chrome &&
        typeof window.chrome.runtime?.sendMessage === "function"
      ) {
        window.chrome.runtime.sendMessage({
          type: "SAVE_USER_DATA",
          user: userData,
          token,
        });
      }
    } catch (_) {
      // Silently ignore — extension may not be installed or ID may differ
    }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  }

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }

  async function signup(name, email, password) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw new Error(error.message);
  }

  async function updateUser(updates) {
    if (!session?.access_token) throw new Error("Not authenticated");

    const res = await fetch(`${API_BASE}/user/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || "Update failed");
    }

    const updated = await res.json();
    setUser(updated);

    // Sync with extension — errors here must NOT bubble up to the UI
    syncWithExtension(updated, session.access_token);

    return updated;
  }

  async function uploadResume(file) {
    if (!session?.access_token) throw new Error("Not authenticated");

    const formData = new FormData();
    formData.append("resume", file);
    const res = await fetch(`${API_BASE}/upload-resume`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: formData,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || "Upload failed");
    }

    const result = await res.json();
    await fetchUser(session.access_token);
    return result;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);

    try {
      window.postMessage({ type: "AUTOSLAY_LOGOUT" }, window.location.origin);
    } catch (_) {}
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        signup,
        logout,
        updateUser,
        uploadResume,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
