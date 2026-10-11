import React, { useState } from "react";
import { X, Lock, Mail, User, Sparkles, KeyRound, CheckCircle2 } from "lucide-react";
import { api, setToken } from "../api";

export function AuthModal({ isOpen, onClose, onAuthSuccess, fullScreen = false }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (mode === "register") {
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
    } else if (mode === "login") {
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
    } else if (mode === "forgot") {
      if (password.length < 8) {
        setErrorMsg("Password must be at least 8 characters long.");
        setLoading(false);
        return;
      }
      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        setErrorMsg("Password must contain at least one letter and one number.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        setLoading(false);
        return;
      }

      const res = await api.forgotPassword({ email, new_password: password });
      if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }

      setSuccessMsg("Password updated successfully! You can now sign in with your new password.");
      setPassword("");
      setConfirmPassword("");
    }
    setLoading(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMsg("");
    setSuccessMsg("");
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
            background: mode === "forgot"
              ? "linear-gradient(135deg, #06B6D4 0%, #10B981 100%)"
              : "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "12px"
          }}>
            {mode === "forgot" ? <KeyRound size={26} color="#FFFFFF" /> : <Sparkles size={26} color="#FFFFFF" />}
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>
            {mode === "register" ? "Create Account" : mode === "forgot" ? "Reset Password" : "Welcome Back"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            {mode === "register"
              ? "Create your account to access your personalized internship workspace"
              : mode === "forgot"
              ? "Enter your account email and choose a new password"
              : "Sign in to continue to your internship workspace"}
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

        {successMsg && (
          <div style={{
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            color: "#34D399",
            padding: "12px 14px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            marginBottom: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
            <button
              type="button"
              className="btn-primary"
              style={{ width: "fit-content", padding: "6px 14px", fontSize: "0.8rem", alignSelf: "flex-end" }}
              onClick={() => switchMode("login")}
            >
              Sign In Now
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mode === "register" && (
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {mode === "forgot" ? "New Password" : "Password"}
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary-cyan)",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="var(--text-dim)" style={{ position: "absolute", left: "14px", top: "14px" }} />
              <input
                type="password"
                required
                placeholder={mode === "forgot" ? "New password (min 8 characters)" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          {mode === "forgot" && (
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                Confirm New Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} color="var(--text-dim)" style={{ position: "absolute", left: "14px", top: "14px" }} />
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: "42px" }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "4px" }}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : mode === "register"
              ? "Create Account"
              : mode === "forgot"
              ? "Update Password"
              : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {mode === "forgot" ? (
            <button
              onClick={() => switchMode("login")}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary-cyan)",
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              Remembered your password? Sign In
            </button>
          ) : (
            <button
              onClick={() => switchMode(mode === "register" ? "login" : "register")}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary-cyan)",
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              {mode === "register" ? "Already have an account? Sign In" : "Don't have an account? Register"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
