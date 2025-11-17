// src/components/Confirmacao.jsx
import React from "react";

export function Confirmacao() {
  const order = JSON.parse(localStorage.getItem("order"));

  if (!order) return <p>Nenhum pedido encontrado.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pedido Confirmado!</h1>
      <h2>Cliente: {order.customerName}</h2>
      <h3>Forma de pagamento: {order.paymentMethod}</h3>
      {order.paymentMethod === "Crédito" && (
        <p>Parcelas: {order.installments}x</p>
      )}
      <h3>Produtos:</h3>
      <ul>
        {order.items.map((item) => (
          <li key={item.id}>
            {item.title} — {item.qty}x — ${(
              item.price * item.qty
            ).toFixed(2)}
          </li>
        ))}
      </ul>
      <h2>Total: ${order.total.toFixed(2)}</h2>
    </div>
  );
}
