import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import products from "./ProductsData";
import { CartContext } from "./CartContext";
import { ThemeContext } from "./ThemeContext";

function Home() {
  const { addToCart } = useContext(CartContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    addToCart(product);
    navigate("/cart");
  };

  const textColor = theme === "dark" ? "#ffffff" : "#1a1a1a";

  return (
    <div style={{ color: textColor }}>
      <h2 style={{ color: textColor, textAlign: "center", marginBottom: "24px" }}>
        Каталог товаров
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "20px"
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              padding: "16px",
              border: theme === "dark" ? "1px solid #555" : "1px solid #e0e0e0",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              backgroundColor: theme === "dark" ? "#2d2d2d" : "#ffffff"
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "140px",
                height: "140px",
                objectFit: "contain",
                marginBottom: "12px"
              }}
            />
            <div style={{ flexGrow: 1, marginBottom: "12px" }}>
              <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "6px" }}>
                {product.name}
              </div>
              <div style={{ color: theme === "dark" ? "#bbb" : "#666", fontSize: "15px" }}>
                {product.price} руб.
              </div>
            </div>
            <button
              onClick={() => handleAddToCart(product)}
              style={{
                width: "100%",
                padding: "10px",
                cursor: "pointer",
                backgroundColor: theme === "dark" ? "#555" : "#4caf50",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold"
              }}
            >
              В корзину
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;