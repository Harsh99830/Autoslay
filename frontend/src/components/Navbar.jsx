import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

export default function Navbar({ onLogout }) {
  const { user } = useAuth();

  const initials = (user?.name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <div className="navbar__logo-mark">⚡</div>
        AUTOSLAY
      </div>

      <div className="navbar__right">
        <div className="navbar__avatar" title={user?.name}>
          {initials}
        </div>
        <div className="navbar__name">{user?.name?.split(" ")[0]}</div>
        <button className="navbar__logout" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
