import React from "react";
import { Sparkles, Briefcase, Columns, CheckCircle2, TrendingUp, Award, ArrowUpRight, Zap, Target, FileText } from "lucide-react";

export function DashboardView({ analytics, profile, onNavigate }) {
  const stats = [
    {
      title: "Total Tracked Applications",
      value: analytics?.total_applications ?? 0,
      change: "Saved in your tracker",
      icon: Briefcase,
      color: "#8B5CF6"
    },
    {
      title: "Interview Conversion",
      value: `${analytics?.conversion_rate ?? 0}%`,
      change: "Based on your tracked applications",
      icon: TrendingUp,
      color: "#06B6D4"
    },
    {
      title: "Offer Rate",
      value: `${analytics?.offer_rate ?? 0}%`,
      change: "Based on your tracked applications",
      icon: Award,
      color: "#10B981"
    },
    {
      title: "Avg AI Match Score",
      value: `${analytics?.average_match_score ?? 0}%`,
      change: "Across your tracked applications",
      icon: Sparkles,
      color: "#F59E0B"
    }
  ];
  const profileItems = [
    { label: profile?.skills ? `Technical skills: ${profile.skills}` : "Add your technical skills", complete: Boolean(profile?.skills) },
    { label: profile?.resume_text ? "Personal resume uploaded" : "Upload your resume", complete: Boolean(profile?.resume_text) },
    { label: profile?.target_roles ? `Target internships: ${profile.target_roles}` : "Set target internship roles", complete: Boolean(profile?.target_roles) }
  ];
  const profileFields = [
    profile?.skills,
    profile?.resume_text,
    profile?.target_roles,
    profile?.college,
    profile?.degree,
    profile?.bio,
    profile?.experience_summary,
    profile?.location
  ];
  const profileCompleteness = Math.round(profileFields.filter(Boolean).length / profileFields.length * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Banner / Hero Card */}
      <div className="glass-panel glass-panel-glow" style={{
        padding: "32px",
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }} className="badge badge-purple">
            <Zap size={14} /> AI Application Copilot Active
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "12px", marginBottom: "8px" }}>
            Welcome to <span className="gradient-text-purple">InternFlow AI</span>
          </h1>
          <p style={{ color: "var(--text-muted)", maxWidth: "600px", lineHeight: "1.5" }}>
            Your automated agent for discovering tech internships, scoring resume fits, generating customized cover letters & cold outreach, and practicing AI mock interviews.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => onNavigate("jobs")} className="btn-primary">
            <Briefcase size={18} />
            <span>Find Internships</span>
          </button>
          <button onClick={() => onNavigate("kanban")} className="btn-secondary">
            <Columns size={18} />
            <span>View Board</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px"
      }}>
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass-panel" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{s.title}</span>
                <div style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: `${s.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Icon size={20} color={s.color} />
                </div>
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "10px", marginBottom: "4px" }}>
                {s.value}
              </h2>
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: "500" }}>
                {s.change}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quick Launchers & Insights */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Quick Copilot Tools */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={20} color="var(--primary-purple)" />
            AI Copilot Studio Launchpad
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div
              onClick={() => onNavigate("resume")}
              className="glass-panel"
              style={{
                padding: "20px",
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.02)",
                transition: "transform 0.2s ease"
              }}
            >
              <FileText size={24} color="var(--primary-purple)" style={{ marginBottom: "12px" }} />
              <h4 style={{ fontSize: "1.05rem", fontWeight: "600" }}>Resume & Skill Parser</h4>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Extract technical skills and generate professional bio summary automatically.
              </p>
            </div>

            <div
              onClick={() => onNavigate("generator")}
              className="glass-panel"
              style={{
                padding: "20px",
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.02)"
              }}
            >
              <Zap size={24} color="var(--primary-cyan)" style={{ marginBottom: "12px" }} />
              <h4 style={{ fontSize: "1.05rem", fontWeight: "600" }}>Cover Letter & Cold Email</h4>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Tailor application messages to recruiter roles in seconds.
              </p>
            </div>

            <div
              onClick={() => onNavigate("interview")}
              className="glass-panel"
              style={{
                padding: "20px",
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.02)"
              }}
            >
              <Target size={24} color="var(--primary-emerald)" style={{ marginBottom: "12px" }} />
              <h4 style={{ fontSize: "1.05rem", fontWeight: "600" }}>AI Mock Interview Coach</h4>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Practice technical questions & get STAR framework feedback scores.
              </p>
            </div>

            <div
              onClick={() => onNavigate("kanban")}
              className="glass-panel"
              style={{
                padding: "20px",
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.02)"
              }}
            >
              <Columns size={24} color="var(--primary-amber)" style={{ marginBottom: "12px" }} />
              <h4 style={{ fontSize: "1.05rem", fontWeight: "600" }}>Kanban Tracker</h4>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Organize pipeline across saved, applied, interviewing, and offers.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Readiness & Skill Summary */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px" }}>
            Candidate Profile Health
          </h3>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
              <span>Profile Completeness</span>
              <span style={{ fontWeight: "700", color: "var(--primary-emerald)" }}>{profileCompleteness}%</span>
            </div>
            <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${profileCompleteness}%`, height: "100%", background: "linear-gradient(90deg, #10B981, #06B6D4)" }}></div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
            {profileItems.map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                <CheckCircle2 size={16} color={item.complete ? "var(--primary-emerald)" : "var(--text-dim)"} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
