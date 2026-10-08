import React, { useState } from "react";
import { X, Lock, Mail, User, Sparkles } from "lucide-react";
import { api, setToken } from "../api";

export function AuthModal({ isOpen, onClose, onAuthSuccess, fullScreen = false }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (isRegister) {
      const res = await api.register({ email, password, full_name: fullName });
      if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }
      const loginRes = await api.login({ email, password });
      if (loginRes.data?.access_token) {
        setToken(loginRes.data.access_token);
        await onAuthSuccess(loginRes.data.user);
        onClose();
      } else {
        setErrorMsg(loginRes.error || "Your account was created, but sign-in failed. Please sign in.");
      }
    } else {
      const res = await api.login({ email, password });
      if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }
      if (res.data?.access_token) {
        setToken(res.data.access_token);
        await onAuthSuccess(res.data.user);
        onClose();
      }
    }
    setLoading(false);
  };

  return (
    <div className={`modal-overlay${fullScreen ? " auth-screen" : ""}`}>
      <div className="glass-panel glass-panel-glow" style={{
        width: "100%",
        maxWidth: "420px",
        padding: "32px",
        position: "relative"
      }}>
        {!fullScreen && <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer"
          }}
        >
          <X size={20} />
        </button>}

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "50px",
            height: "50px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "12px"
          }}>
            <Sparkles size={26} color="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            {isRegister ? "Create your account to build a personal internship workspace" : "Sign in to continue to your internship workspace"}
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#FB7185",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            marginBottom: "16px"
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <User size={18} color="var(--text-dim)" style={{ position: "absolute", left: "14px", top: "14px" }} />
                <input
                  type="text"
                  required
                  placeholder="K. Lakshmi Priya"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: "42px" }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} color="var(--text-dim)" style={{ position: "absolute", left: "14px", top: "14px" }} />
              <input
                type="email"
                required
                placeholder="student@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="var(--text-dim)" style={{ position: "absolute", left: "14px", top: "14px" }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} disabled={loading}>
            {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={() => { setIsRegister(!isRegister); setErrorMsg(""); }}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary-cyan)",
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            {isRegister ? "Already have an account? Sign In" : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
