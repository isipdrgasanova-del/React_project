import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { CartContext } from "./CartContext";
import { ThemeContext } from "./ThemeContext";

function Menu() {
  const { cart } = useContext(CartContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isDark = theme === "dark";
  const textColor = isDark ? "#ffffff" : "#1a1a1a";
  const borderColor = isDark ? "#444444" : "#e0e0e0";

  return (
    <header style={{ width: "100%", marginBottom: "30px" }}>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "50px"
        }}
      >
        <div style={{ flex: 1 }} />

        <nav style={{ display: "flex", gap: "24px" }}>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              color: isActive ? "#ff4757" : textColor,
              textDecoration: "none",
              fontWeight: "600"
            })}
          >
            Каталог
          </NavLink>
          <NavLink
            to="/cart"
            style={({ isActive }) => ({
              color: isActive ? "#ff4757" : textColor,
              textDecoration: "none",
              fontWeight: "600"
            })}
          >
            Корзина ({totalCount})
          </NavLink>
          <NavLink
            to="/login"
            style={({ isActive }) => ({
              color: isActive ? "#ff4757" : textColor,
              textDecoration: "none",
              fontWeight: "600"
            })}
          >
            Войти
          </NavLink>
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              color: isActive ? "#ff4757" : textColor,
              textDecoration: "none",
              fontWeight: "600"
            })}
          >
            Панель управления
          </NavLink>
        </nav>

        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={toggleTheme}
            style={{
              background: "transparent",
              border: `1px solid ${isDark ? "#555555" : "#cccccc"}`,
              borderRadius: "20px",
              padding: "6px 14px",
              color: textColor,
              cursor: "pointer",
              fontSize: "13px",
              opacity: 0.8
            }}
          >
            {isDark ? "☀️ Светлая" : "🌙 Тёмная"}
          </button>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: "1px",
          backgroundColor: borderColor,
          marginTop: "15px"
        }}
      />
    </header>
  );
}

export default Menu;