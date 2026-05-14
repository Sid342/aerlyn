import React, { useState, useRef } from "react";

const CartDropdown = ({ cartItems, handleCheckout }) => {
  //console.log("Cart Items,",cartItems);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div>
      <div style={{ cursor: "pointer" }} onClick={toggleDropdown}>
        <span role="img" aria-label="cart" style={{ fontSize: "24px" }}>
          🛒
        </span>
        <span
          style={{
            background: "red",
            color: "white",
            borderRadius: "50%",
            padding: "2px 8px",
            marginLeft: "8px",
            fontSize: "14px",
          }}
        >
          {cartItems.length}
        </span>
      </div>
      {isDropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "0",
            width: "30%",
            background: "white",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            borderRadius: "4px",
            zIndex: "1000",
          }}
        >
          <div style={{ padding: "10px" }}>
            {cartItems.length > 0 ? (
              <>
                <div>
                  {cartItems.map((item, index) => (
                    <div id={`order-summarys-${index}`}>
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          textAlign: "left",
                          marginBottom: "1rem",
                          padding: "0.75rem",
                          border: "1px solid #e5e7eb",
                          borderRadius: "0.5rem",
                        }}
                      >
                        {/* Left Section: Order Details */}
                        <div style={{ flex: 1, marginRight: "1rem" }}>
                          <div
                            style={{ fontSize: ".875rem", fontWeight: "700" }}
                          >
                            Order {index + 1}
                          </div>
                          <div
                            style={{ fontSize: ".75rem", marginTop: ".5rem" }}
                          >
                            <strong>Material:</strong> {item.material}
                          </div>
                          <div style={{ fontSize: ".75rem" }}>
                            <strong>Size:</strong> {item.size}
                          </div>
                          <div style={{ fontSize: ".75rem" }}>
                            <strong>Quantity:</strong> {item.quantity}
                          </div>
                        </div>

                        {/* Right Section: Image */}
                        <div>
                          <img src={item.image} alt="Cart Item" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Checkout Button */}
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <button
                    style={{
                      backgroundColor: "#4CAF50",
                      color: "white",
                      padding: "0.75rem 1.5rem",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontSize: ".875rem",
                      fontWeight: "700",
                    }}
                    onClick={handleCheckout}
                  >
                    Checkout
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "10px" }}>
                No items in the cart.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDropdown;
