import { useState, useEffect, FormEvent } from "react";
import QRCode from "react-qr-code"; // Biblioteca visual

// Tipagem do retorno da API
interface WhatsappStatus {
  status: "DISCONNECTED" | "STARTING" | "QRCODE" | "CONNECTED";
  qrcode: string | null;
  name: string;
}

function App() {
  // --- STATES ---
  const [content, setContent] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  // State da Conexão
  const [connection, setConnection] = useState<WhatsappStatus>({
    status: "DISCONNECTED",
    qrcode: null,
    name: "",
  });

  // --- EFFECT: POLLING (Verifica status a cada 2 segundos) ---
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("http://localhost:3333/whatsapp/status");
        const data = await response.json();
        setConnection(data);
      } catch (error) {
        console.error("Erro ao buscar status:", error);
      }
    };

    // Roda imediatamente e depois a cada 2s
    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval); // Limpa ao fechar a tela
  }, []);

  // --- HANDLER: Enviar Lembrete ---
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const targetDate = new Date(date).toISOString();

      const response = await fetch("http://localhost:3333/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          phone,
          date: targetDate,
        }),
      });

      if (!response.ok) throw new Error("Failed to create reminder");

      alert("✅ Reminder scheduled successfully!");
      setContent("");
      setDate("");
    } catch (error) {
      console.error(error);
      alert("❌ Error creating reminder.");
    } finally {
      setLoading(false);
    }
  }

  // --- RENDERIZAÇÃO CONDICIONAL ---
  return (
    <div className="container">
      <h1>Zap Reminder ⚡</h1>

      {/* ÁREA DE CONEXÃO DO WHATSAPP */}
      <div
        style={{
          background: "#333",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          textAlign: "center",
          border:
            connection.status === "CONNECTED"
              ? "1px solid #4caf50"
              : "1px solid #444",
        }}
      >
        {connection.status === "QRCODE" && connection.qrcode && (
          <div>
            <p style={{ marginBottom: "10px" }}>Scan to Connect:</p>
            {/* Fundo branco para o QR Code ser legível */}
            <div
              style={{
                background: "white",
                padding: "10px",
                display: "inline-block",
                borderRadius: "8px",
              }}
            >
              <QRCode value={connection.qrcode} size={200} />
            </div>
          </div>
        )}

        {connection.status === "CONNECTED" && (
          <div style={{ color: "#4caf50", fontWeight: "bold" }}>
            🟢 WhatsApp Connected: {connection.name}
          </div>
        )}

        {(connection.status === "DISCONNECTED" ||
          connection.status === "STARTING") && (
          <p>🟡 Starting WhatsApp Service...</p>
        )}
      </div>

      {/* FORMULÁRIO (Só habilita se estiver conectado - Opcional) */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          opacity: connection.status === "CONNECTED" ? 1 : 0.5,
        }}
      >
        {/* Message Input */}
        <div className="input-group">
          <label htmlFor="content">Message</label>
          <input
            id="content"
            type="text"
            placeholder="Ex: Drink water"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={connection.status !== "CONNECTED"}
            required
          />
        </div>

        {/* Phone Input */}
        <div className="input-group">
          <label htmlFor="phone">Phone (With Country Code)</label>
          <input
            id="phone"
            type="tel"
            placeholder="Ex: 554699999999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={connection.status !== "CONNECTED"}
            required
          />
        </div>

        {/* Date Input */}
        <div className="input-group">
          <label htmlFor="date">When?</label>
          <input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={connection.status !== "CONNECTED"}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || connection.status !== "CONNECTED"}
        >
          {loading ? "Scheduling..." : "Schedule Reminder"}
        </button>
      </form>
    </div>
  );
}

export default App;
