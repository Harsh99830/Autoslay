import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/auth.css";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for Supabase to process the OAuth callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, "Session:", session);
      
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      } else if (event === "USER_UPDATED" && session) {
        navigate("/dashboard");
      }
    });

    // Fallback: check session after a short delay
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow--1" />
      <div className="auth-glow auth-glow--2" />
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-logo">⚡ AutoSlay</div>
        <h1 className="auth-title">Completing sign in...</h1>
        <div style={{ marginTop: "24px" }}>
          <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      </div>
    </div>
  );
}
