import React from "react";
import { Sparkles, Briefcase, LayoutDashboard, Columns, Mail, MessageSquare, LogIn, LogOut, User, Sun, Moon } from "lucide-react";

export function Header({ activeTab, setActiveTab, user, onOpenAuth, onLogout, theme, onToggleTheme }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "jobs", label: "Internship Finder", icon: Briefcase },
    { id: "kanban", label: "Application Tracker", icon: Columns },
    { id: "profile", label: "Profile", icon: User },
    { id: "generator", label: "Cover & Cold Email", icon: Mail },
    { id: "interview", label: "Interview Prep", icon: MessageSquare },
  ];

  return (
    <header style={{
      borderBottom: "1px solid var(--border-color)",
      background: "var(--surface-strong)",
      backdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      padding: "14px 24px"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => setActiveTab("dashboard")}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
          }}>
            <Sparkles size={22} color="#FFFFFF" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" }}>
              InternFlow <span className="gradient-text-purple">AI</span>
            </h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
              AI Internship Copilot & Tracker
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id || (t.id === "profile" && activeTab === "resume");
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "9px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: isActive ? "rgba(139, 92, 246, 0.15)" : "transparent",
                  color: isActive ? "var(--nav-active)" : "var(--text-muted)",
                  fontWeight: isActive ? "600" : "500",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  outline: "none"
                }}
              >
                <Icon size={18} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User / Auth Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onToggleTheme}
            className="btn-secondary theme-toggle"
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            <span>{theme === "dark" ? "Light" : "Dark"} mode</span>
          </button>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  cursor: "pointer",
                  color: "inherit",
                  fontFamily: "inherit"
                }}
                title="View Profile & Update Resume"
              >
                <User size={16} color="var(--primary-cyan)" />
                <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{user.full_name || user.email}</span>
              </button>
              <button onClick={onLogout} className="btn-secondary" style={{ padding: "8px 12px" }} title="Log out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-primary">
              <LogIn size={18} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
