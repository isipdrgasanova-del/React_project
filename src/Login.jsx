import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";

function Login() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const textColor = theme === "dark" ? "#ffffff" : "#1a1a1a";

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div style={{ color: textColor, textAlign: "center", marginTop: "40px" }}>
      <h2 style={{ color: textColor, marginBottom: "20px" }}>Вход в систему</h2>
      <button
        onClick={handleLogin}
        style={{
          padding: "10px 24px",
          fontSize: "16px",
          backgroundColor: theme === "dark" ? "#555555" : "#666666",
          color: "#ffffff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Войти
      </button>
    </div>
  );
}

export default Login;