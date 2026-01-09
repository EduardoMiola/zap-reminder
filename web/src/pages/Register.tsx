import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { Lock, Mail, User, ArrowLeft } from "lucide-react";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiRequest("/auth/register", "POST", { name, email, password });
      alert("Account created successfully! Please login.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <Link
          to="/login"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            color: "var(--text-secondary)",
            textDecoration: "none",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <h2
          style={{
            color: "var(--color-deep-space)",
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          Create Account
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
          }}
        >
          Start managing your reminders today
        </p>

        {error && (
          <div
            style={{
              color: "var(--color-strawberry)",
              background: "#fff0f1",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleRegister}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {/* Name Field */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
              }}
            >
              Full Name
            </label>
            <div style={{ position: "relative" }}>
              <User
                size={18}
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "10px",
                  color: "var(--color-steel)",
                }}
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: "35px" }}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
              }}
            >
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "10px",
                  color: "var(--color-steel)",
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "35px" }}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "10px",
                  color: "var(--color-steel)",
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "35px" }}
                placeholder="******"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--color-steel)",
              color: "white",
              padding: "0.85rem",
              marginTop: "0.5rem",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
