import React, { useState } from "react";
import { Mail, Sparkles, Copy, Check, FileText, Zap } from "lucide-react";
import { api } from "../api";

export function GeneratorStudioView({ profile, onNavigate }) {
  const [activeType, setActiveType] = useState("cover"); // "cover" or "email"
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [recruiterName, setRecruiterName] = useState("Hiring Manager");
  const [tone, setTone] = useState("Professional");

  const [loading, setLoading] = useState(false);
  const [outputResult, setOutputResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const profileReady = Boolean(profile?.resume_text?.trim() && profile?.skills?.trim());

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCopied(false);
    setErrorMessage("");

    try {
      if (activeType === "cover") {
        const res = await api.generateCoverLetter({
          company_name: companyName,
          role_title: roleTitle,
          tone: tone
        });
        if (!res.data?.cover_letter) throw new Error(res.error || "Could not generate a cover letter.");
        setOutputResult(res.data.cover_letter);
      } else {
        const res = await api.generateColdEmail({
          company_name: companyName,
          role_title: roleTitle,
          recruiter_name: recruiterName,
          tone: tone
        });
        if (!res.data?.email_body) throw new Error(res.error || "Could not generate an outreach email.");
        setOutputResult(`SUBJECT: ${res.data.subject_line}\n\n${res.data.email_body}`);
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not generate this document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profileReady) {
    return (
      <div className="glass-panel profile-required">
        <FileText size={28} color="var(--primary-purple)" />
        <h2>Complete your profile first</h2>
        <p>Upload your resume and add your technical skills to create application materials based on your actual background.</p>
        <button className="btn-primary" onClick={() => onNavigate?.("resume")}>Add resume and skills</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>
          AI Cover Letter & Recruiter Cold Outreach Generator
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Generated using the resume and technical details saved in your profile. No sample experience is added.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
        {/* Generator Controls Form */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Toggle Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              onClick={() => setActiveType("cover")}
              className={activeType === "cover" ? "btn-primary" : "btn-secondary"}
              style={{ justifyContent: "center" }}
            >
              <FileText size={16} /> Cover Letter
            </button>
            <button
              onClick={() => setActiveType("email")}
              className={activeType === "email" ? "btn-cyan" : "btn-secondary"}
              style={{ justifyContent: "center" }}
            >
              <Mail size={16} /> Cold Outreach Email
            </button>
          </div>

          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "10px" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Target Company Name</label>
              <input required type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input-field" placeholder="e.g. Google, Microsoft, TechFlow" />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Role Title</label>
              <input required type="text" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} className="input-field" placeholder="e.g. Software Engineer Intern" />
            </div>

            {activeType === "email" && (
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Recruiter / Contact Name</label>
                <input type="text" value={recruiterName} onChange={(e) => setRecruiterName(e.target.value)} className="input-field" placeholder="e.g. Sarah Jenkins" />
              </div>
            )}

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Writing Tone & Style</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="input-field">
                <option value="Professional">Professional & Formal</option>
                <option value="Enthusiastic">High Energy & Passionate</option>
                <option value="Startup/Bold">Startup / Direct & Bold</option>
                <option value="Conversational">Conversational</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: "center", padding: "12px", marginTop: "8px" }} disabled={loading}>
              {loading ? (
                <>
                  <Sparkles size={18} style={{ animation: "spin 1s linear infinite" }} /> Generating AI Text...
                </>
              ) : (
                <>
                  <Zap size={18} /> Generate {activeType === "cover" ? "Cover Letter" : "Cold Email"}
                </>
              )}
            </button>
          </form>
          {errorMessage && <div role="alert" className="profile-error">{errorMessage}</div>}
        </div>

        {/* Output Display Panel */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} color="var(--primary-cyan)" /> AI Output Preview
            </h3>
            {outputResult && (
              <button onClick={handleCopy} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                {copied ? <Check size={14} color="var(--primary-emerald)" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
            )}
          </div>

          <textarea
            readOnly
            className="input-field"
            style={{
              minHeight: "360px",
              lineHeight: "1.6",
              fontSize: "0.9rem",
              fontFamily: "var(--font-body)",
              background: "var(--code-bg)",
              color: "var(--code-text)"
            }}
            value={outputResult || "Click 'Generate' on the left panel to produce your customized text using AI."}
          />
        </div>
      </div>
    </div>
  );
}
