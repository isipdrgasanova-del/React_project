import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

function Dashboard() {
  const { theme } = useContext(ThemeContext);
  const textColor = theme === "dark" ? "#ffffff" : "#1a1a1a";

  return (
    <div style={{ color: textColor, textAlign: "center", marginTop: "40px" }}>
      <h2 style={{ color: textColor, marginBottom: "16px" }}>Панель управления</h2>
      <p style={{ color: textColor, fontSize: "18px" }}>Добро пожаловать в личный кабинет!</p>
    </div>
  );
}

export default Dashboard;