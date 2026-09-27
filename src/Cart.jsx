import { useContext } from "react";
import { CartContext } from "./CartContext";
import { ThemeContext } from "./ThemeContext";

function Cart() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, totalPrice } = useContext(CartContext);
  const { theme } = useContext(ThemeContext);

  const textColor = theme === "dark" ? "#ffffff" : "#1a1a1a";

  return (
    <div style={{ color: textColor }}>
      <h2 style={{ color: textColor, textAlign: "center", marginBottom: "24px" }}>
        Корзина
      </h2>
      {cart.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "18px" }}>Корзина пуста</p>
      ) : (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {cart.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  border: theme === "dark" ? "1px solid #555" : "1px solid #e0e0e0",
                  borderRadius: "10px",
                  backgroundColor: theme === "dark" ? "#2d2d2d" : "#ffffff"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "160px" }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "contain",
                      marginBottom: "8px"
                    }}
                  />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>
                      {item.name}
                    </div>
                    <div style={{ color: theme === "dark" ? "#bbb" : "#666", fontSize: "14px" }}>
                      {item.price} руб.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    onClick={() => decreaseQuantity(index)}
                    style={{ padding: "6px 12px", cursor: "pointer" }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {item.quantity} шт.
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    style={{ padding: "6px 12px", cursor: "pointer" }}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(index)}
                    style={{
                      padding: "8px 14px",
                      cursor: "pointer",
                      backgroundColor: "#ff4757",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "4px",
                      marginLeft: "12px"
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
          <h3 style={{ color: textColor, textAlign: "center", marginTop: "32px" }}>
            Итоговая сумма: {totalPrice} руб.
          </h3>
        </div>
      )}
    </div>
  );
}

export default Cart;