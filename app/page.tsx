"use client";

export default function Home() {
  return (
    <main
      style={{
        padding: "40px",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        maxWidth: "520px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>🍔 Costa-Burger</h1>
      <p>
        Monte seu hambúrguer em camadas e acompanhe o pedido em tempo real. Esse
        é o ponto de partida do fluxo de pedidos.
      </p>

      <a
        href="/montar"
        style={{
          backgroundColor: "#b22222",
          color: "#fff",
          padding: "16px 22px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold",
          fontSize: "18px",
        }}
      >
        Começar pedido →
      </a>
    </main>
  );
}
