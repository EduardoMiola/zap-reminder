import { useState, FormEvent } from "react";

function App() {
  // 1. State Management (Controlled Components)
  // We keep the form data in React state.
  const [content, setContent] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");

  // To handle loading/success states
  const [loading, setLoading] = useState(false);

  // 2. The Submit Handler
  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); // Prevents the page from refreshing
    setLoading(true);

    try {
      // Backend expects an ISO Date (2026-01-08T14:00:00.000Z)
      // The input gives us a local string (2026-01-08T14:00)
      const targetDate = new Date(date).toISOString();

      const response = await fetch("http://localhost:3333/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          phone, // Ensure this is just numbers in your backend logic later
          date: targetDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create reminder");
      }

      alert("✅ Reminder scheduled successfully!");

      // Clear form
      setContent("");
      setDate("");
    } catch (error) {
      console.error(error);
      alert("❌ Error creating reminder. Check if the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>Zap Reminder ⚡</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
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
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Scheduling..." : "Schedule Reminder"}
        </button>
      </form>
    </div>
  );
}

export default App;
