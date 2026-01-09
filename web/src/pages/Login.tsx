import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { apiRequest } from "../services/api";
import { Lock, Mail } from "lucide-react"; // Ícones Profissionais

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = await apiRequest("/auth/sessions", "POST", {
        email,
        password,
      });
      login(data.token);
      navigate("/"); // Vai para o Dashboard
    } catch (err: any) {
      setError(err.message);
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
        <h2
          style={{
            color: "var(--color-deep-space)",
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          Access Portal
        </h2>

        {error && (
          <div
            style={{
              color: "var(--color-strawberry)",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
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
                required
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: "var(--color-steel)",
              color: "white",
              padding: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            Sign In
          </button>
        </form>

        <p
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            fontSize: "0.9rem",
          }}
        >
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--color-steel)" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
