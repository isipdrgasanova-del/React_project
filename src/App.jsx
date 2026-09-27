import { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, ThemeContext } from "./ThemeContext";
import { CartProvider } from "./CartContext";
import Menu from "./Menu";
import Home from "./Home";
import Cart from "./Cart";
import Login from "./Login";
import Dashboard from "./Dashboard";

function AppContent() {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
        transition: "background-color 0.3s ease"
      }}
    >
      <Menu />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;