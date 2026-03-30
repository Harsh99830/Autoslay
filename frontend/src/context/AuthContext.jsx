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
      // Sync with extension via postMessage (bridge.js content script will forward to background)
      window.postMessage({
        type: 'AUTOSLAY_SAVE_USER',
        user: data,
        token: token,
      }, window.location.origin);
      setUser(data);
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
    } finally {
      setLoading(false);
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
  }

  async function signup(name, email, password) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
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
    if (!res.ok) throw new Error("Update failed");
    const updated = await res.json();
    setUser(updated);

    if (window.chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: "SAVE_USER_DATA",
        user: updated,
        token: session.access_token,
      });
    }

    // Also postMessage for extension bridge
    window.postMessage({
      type: 'AUTOSLAY_SAVE_USER',
      user: updated,
      token: session.access_token,
    }, window.location.origin);
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
    if (!res.ok) throw new Error("Upload failed");
    const result = await res.json();
    await fetchUser(session.access_token);
    return result;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    
    window.postMessage({ type: 'AUTOSLAY_LOGOUT' }, window.location.origin);
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
