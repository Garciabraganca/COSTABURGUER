"use client";

export default function Home() {
  return (
    <main style={{
      padding: "40px",
      fontFamily: "sans-serif",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      maxWidth: "500px",
      margin: "0 auto",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>🍔 Costa-Burger</h1>
      <p>Monte seu hambúrguer em camadas e acompanhe seu pedido em tempo real.</p>

      <a
        href="/montar"
        style={{
          background: "#b22222",
          padding: "16px 22px",
          borderRadius: "8px",
          color: "white",
          textDecoration: "none",
          fontWeight: "bold",
          fontSize: "18px",
        }}
      >
        Começar Pedido →
      </a>
    </main>
  );
}
