import { useEffect, useState, useContext } from "react";
import QRCode from "react-qr-code";
import { AuthContext } from "../contexts/AuthContext";
import { apiRequest } from "../services/api";
import {
  LogOut,
  PlusCircle,
  Smartphone,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export function Dashboard() {
  const { logout } = useContext(AuthContext);

  // States
  const [reminders, setReminders] = useState<any[]>([]);

  const [whatsappStatus, setWhatsappStatus] = useState<any>({
    status: "DISCONNECTED",
    qrcode: null,
    name: "",
  });

  const [newReminder, setNewReminder] = useState({
    content: "",
    phone: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);

  // --- FUNÇÕES AUXILIARES ---

  // Busca a lista de lembretes do backend
  const fetchReminders = async () => {
    try {
      const data = await apiRequest("/reminders");
      if (Array.isArray(data)) {
        setReminders(data);
      }
    } catch (err) {
      console.error("Erro ao buscar lembretes:", err);
    }
  };

  // --- EFEITOS (Data Fetching) ---

  // 1. Busca Status do WhatsApp (Polling a cada 3s)
  useEffect(() => {
    const fetchWpp = async () => {
      try {
        const data = await apiRequest("/whatsapp/status");
        setWhatsappStatus(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWpp();
    const interval = setInterval(fetchWpp, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. Busca Lembretes Iniciais (Ao carregar a tela)
  useEffect(() => {
    fetchReminders();
  }, []);

  // --- HANDLERS ---

  async function handleCreateReminder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest("/reminders", "POST", {
        ...newReminder,
        date: new Date(newReminder.date).toISOString(),
      });

      alert("Reminder scheduled successfully.");

      // Limpa o formulário
      setNewReminder({ content: "", phone: "", date: "" });

      // Atualiza a lista imediatamente
      fetchReminders();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
    }
    
    async function handleStartSession() {
      try {
        setWhatsappStatus({ status: "STARTING", qrcode: null });

        // CORREÇÃO AQUI: Adicione o {} como terceiro parâmetro
        await apiRequest("/whatsapp", "POST", {});
      } catch (err: any) {
        alert("Error starting session: " + err.message);
      }
    }

  // --- RENDER ---

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "3rem",
        }}
      >
        <h1
          style={{
            color: "var(--color-deep-space)",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          Zap Reminder Admin
        </h1>
        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "transparent",
            color: "var(--color-strawberry)",
          }}
        >
          <LogOut size={18} /> Sign Out
        </button>
      </header>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}
      >
        {/* Coluna da Esquerda: Status & Conexão */}
        <aside>
          <div
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              textAlign: "center",
              minHeight: "300px", // Garante altura fixa para não pular layout
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h3 style={{ marginBottom: "1.5rem", color: "var(--color-steel)" }}>
              Device Status
            </h3>

            {/* CASO 1: AGUARDANDO LEITURA (MOSTRA O QR) */}
            {whatsappStatus.status === "QRCODE" && whatsappStatus.qrcode && (
              <div style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                <div
                  style={{
                    background: "white",
                    padding: "15px",
                    border: "2px dashed var(--color-steel)",
                    borderRadius: "8px",
                    display: "inline-block",
                  }}
                >
                  <QRCode
                    value={whatsappStatus.qrcode}
                    size={180}
                    fgColor="#1D3557"
                  />
                </div>
                <p
                  style={{
                    marginTop: "15px",
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  Open WhatsApp &gt; Menu &gt; Linked Devices
                </p>
              </div>
            )}

            {/* CASO 2: CONECTADO */}
            {whatsappStatus.status === "CONNECTED" && (
              <div
                style={{
                  color: "#2a9d8f",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "15px",
                  animation: "fadeIn 0.5s",
                }}
              >
                <div
                  style={{
                    background: "#e8f5e9",
                    padding: "20px",
                    borderRadius: "50%",
                  }}
                >
                  <CheckCircle size={64} />
                </div>
                <div>
                  <span
                    style={{
                      fontWeight: "700",
                      display: "block",
                      fontSize: "1.2rem",
                    }}
                  >
                    System Online
                  </span>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Ready to send messages
                  </span>
                </div>
              </div>
            )}

            {/* CASO 3: DESCONECTADO (SEM SESSÃO) */}
            {whatsappStatus.status === "DISCONNECTED" && (
              <div
                style={{
                  color: "var(--color-steel)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div style={{ opacity: 0.5 }}>
                  <Smartphone size={64} />
                </div>

                <div>
                  <span style={{ fontWeight: "600", display: "block" }}>
                    No Connection Found
                  </span>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Click below to start a new session
                  </span>
                </div>

                {/* BOTÃO PARA INICIAR O BAILEYS */}
                <button
                  onClick={handleStartSession}
                  style={{
                    marginTop: "10px",
                    fontSize: "0.9rem",
                    padding: "10px 20px",
                    background: "var(--color-steel)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Smartphone size={16} /> Connect Device
                </button>
              </div>
            )}

            {/* CASO 4: INICIANDO (AGUARDANDO SERVIDOR) */}
            {whatsappStatus.status === "STARTING" && (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--color-steel)",
                }}
              >
                <p style={{ fontWeight: "bold" }}>Starting Service...</p>
                <p style={{ fontSize: "0.8rem" }}>Please wait for QR Code</p>
              </div>
            )}
          </div>
        </aside>

        {/* Coluna da Direita: Novo Agendamento + Lista */}
        <main>
          {/* Formulário de Criação */}
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              marginBottom: "2rem",
            }}
          >
            {/* CORREÇÃO APLICADA AQUI ABAIXO */}
            <h2
              style={{
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "var(--color-deep-space)",
              }}
            >
              <PlusCircle /> New Schedule
            </h2>

            <form
              onSubmit={handleCreateReminder}
              style={{ display: "grid", gap: "1.5rem" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  Message Content
                </label>
                <input
                  type="text"
                  placeholder="Ex: Invoice #102 is due"
                  value={newReminder.content}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, content: e.target.value })
                  }
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                    }}
                  >
                    Target Phone
                  </label>
                  <div style={{ position: "relative" }}>
                    <Smartphone
                      size={18}
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "10px",
                        color: "var(--color-steel)",
                      }}
                    />
                    <input
                      type="tel"
                      placeholder="5511999999999"
                      value={newReminder.phone}
                      onChange={(e) =>
                        setNewReminder({
                          ...newReminder,
                          phone: e.target.value,
                        })
                      }
                      style={{ paddingLeft: "35px" }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                    }}
                  >
                    Schedule Date
                  </label>
                  <div style={{ position: "relative" }}>
                    <Calendar
                      size={18}
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "10px",
                        color: "var(--color-steel)",
                      }}
                    />
                    <input
                      type="datetime-local"
                      value={newReminder.date}
                      onChange={(e) =>
                        setNewReminder({ ...newReminder, date: e.target.value })
                      }
                      style={{ paddingLeft: "35px" }}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || whatsappStatus.status !== "CONNECTED"}
                style={{
                  background:
                    whatsappStatus.status === "CONNECTED"
                      ? "var(--color-steel)"
                      : "#ccc",
                  color: "white",
                  padding: "1rem",
                  marginTop: "1rem",
                  cursor:
                    whatsappStatus.status === "CONNECTED"
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                {loading ? "Processing..." : "Schedule Reminder"}
              </button>
            </form>
          </div>

          {/* LISTA DE LEMBRETES (Histórico) */}
          <div style={{ marginTop: "2rem" }}>
            <h3
              style={{
                marginBottom: "1rem",
                color: "var(--color-deep-space)",
                fontSize: "1.1rem",
              }}
            >
              Scheduled Messages
            </h3>

            {reminders.length === 0 ? (
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  fontStyle: "italic",
                }}
              >
                No reminders found.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {reminders.map((reminder: any) => (
                  <div
                    key={reminder.id}
                    style={{
                      background: "white",
                      padding: "1rem",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderLeft: reminder.isSent
                        ? "4px solid #4caf50"
                        : "4px solid var(--color-steel)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          color: "var(--color-deep-space)",
                        }}
                      >
                        {reminder.content}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                          marginTop: "4px",
                        }}
                      >
                        To: {reminder.phone} •{" "}
                        {new Date(reminder.targetDate).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      {reminder.isSent ? (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            background: "#e8f5e9",
                            color: "#2e7d32",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                          }}
                        >
                          SENT
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            background: "#e3f2fd",
                            color: "#1565c0",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                          }}
                        >
                          PENDING
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
