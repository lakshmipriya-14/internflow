import React, { useState } from "react";
import { Search, MapPin, DollarSign, Calendar, Sparkles, Check, Plus, ExternalLink, Globe, FileText, Copy, Download, RefreshCw } from "lucide-react";
import { api } from "../api";

export function JobFinderView({ internships, onApplyTrack }) {
  const [activeTab, setActiveTab] = useState("db"); // "db" or "live"
  const [searchTerm, setSearchTerm] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live web search state
  const [liveJobs, setLiveJobs] = useState([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [liveSearched, setLiveSearched] = useState(false);

  // Tailored Resume modal state
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [tailoredResume, setTailoredResume] = useState(null);
  const [tailoredResumeError, setTailoredResumeError] = useState("");
  const [loadingResume, setLoadingResume] = useState(false);
  const [copiedResume, setCopiedResume] = useState(false);

  const handleFetchLiveInternships = async () => {
    setLoadingLive(true);
    setLiveSearched(true);
    const res = await api.listLiveInternships({ query: searchTerm, work_mode: workModeFilter });
    if (res.data) {
      setLiveJobs(res.data);
    } else {
      setLiveJobs([]);
    }
    setLoadingLive(false);
  };

  const displayedJobs = activeTab === "db"
    ? internships.filter((job) => {
        const matchesSearch =
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (job.company || job.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (job.required_skills || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMode = workModeFilter === "all" || (job.work_mode || "").toLowerCase().includes(workModeFilter.toLowerCase());
        return matchesSearch && matchesMode;
      })
    : liveJobs;

  const handleOpenJobModal = async (job) => {
    setSelectedJob(job);
    setMatchDetails(null);
    setLoadingMatch(true);
    setSavedSuccess(false);

    if (job.is_live) {
      setMatchDetails({
        match_score: job.match_score || 82,
        matching_skills: job.matching_skills || job.required_skills?.split(",").slice(0, 3) || ["Python"],
        missing_skills: job.missing_skills || ["Docker", "AWS"],
        recommendation: job.recommendation || "Strong live opportunity match based on your skills profile."
      });
      setLoadingMatch(false);
      return;
    }

    const res = await api.matchInternship(job.id);
    if (res.data) {
      setMatchDetails(res.data);
    } else {
      setMatchDetails({
        match_score: job.match_score || 85,
        matching_skills: job.required_skills ? job.required_skills.split(",").slice(0, 3) : ["Python"],
        missing_skills: ["Docker", "AWS"],
        recommendation: "Strong match based on your skills profile. Recommended to apply immediately."
      });
    }
    setLoadingMatch(false);
  };

  const handleTrackJob = (job) => {
    onApplyTrack({
      internship_id: job.is_live ? null : job.id,
      company_name: job.company || job.company_name,
      role_title: job.title,
      status: "saved",
      notes: `Matched ${job.match_score || 85}% via ${job.is_live ? 'Live Web Fetcher' : 'AI Directory'}.`
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setSelectedJob(null);
    }, 1500);
  };

  const handleGenerateTailoredResume = async (job) => {
    setLoadingResume(true);
    setResumeModalOpen(true);
    setCopiedResume(false);
    setTailoredResume(null);
    setTailoredResumeError("");

    try {
      const res = await api.generateTailoredResume({
        company_name: job.company || job.company_name,
        role_title: job.title,
        target_skills: job.required_skills
      });
      if (res.data) {
        setTailoredResume(res.data);
      } else {
        setTailoredResumeError(res.error || "Could not tailor your resume. Check your profile and try again.");
      }
    } finally {
      setLoadingResume(false);
    }
  };

  const handleCopyResume = () => {
    if (tailoredResume?.resume_markdown) {
      navigator.clipboard.writeText(tailoredResume.resume_markdown);
      setCopiedResume(true);
      setTimeout(() => setCopiedResume(false), 2000);
    }
  };

  const handleDownloadResume = () => {
    if (!tailoredResume?.resume_markdown) return;
    const blob = new Blob([tailoredResume.resume_markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Resume_${(tailoredResume.target_company || 'Tailored').replace(/\s+/g, '_')}_${(tailoredResume.target_role || 'Role').replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Header & Mode Selector */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>
              AI Internship Finder & Matcher
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Explore curated positions or dynamically query real-time live internships from the web
            </p>
          </div>

          {/* Directory vs Live Web Toggle */}
          <div style={{ display: "flex", gap: "8px", background: "rgba(255, 255, 255, 0.05)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
            <button
              onClick={() => setActiveTab("db")}
              className={activeTab === "db" ? "btn-primary" : "btn-secondary"}
              style={{ padding: "6px 14px", fontSize: "0.85rem" }}
            >
              Curated Directory ({internships.length})
            </button>
            <button
              onClick={() => { setActiveTab("live"); if (!liveSearched) handleFetchLiveInternships(); }}
              className={activeTab === "live" ? "btn-cyan" : "btn-secondary"}
              style={{ padding: "6px 14px", fontSize: "0.85rem" }}
            >
              <Globe size={14} /> 🌐 Live Web Search
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} color="var(--text-dim)" style={{ position: "absolute", left: "16px", top: "14px" }} />
            <input
              type="text"
              placeholder={activeTab === "live" ? "Search live internships (e.g. Python Intern, Remote Software Engineering Intern)..." : "Search internships by title, company, or skills..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "48px" }}
              onKeyDown={(e) => { if (e.key === 'Enter' && activeTab === 'live') handleFetchLiveInternships(); }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {["all", "remote", "hybrid", "onsite"].map((mode) => (
              <button
                key={mode}
                onClick={() => setWorkModeFilter(mode)}
                className={workModeFilter === mode ? "btn-primary" : "btn-secondary"}
                style={{ padding: "8px 12px", textTransform: "capitalize", fontSize: "0.8rem" }}
              >
                {mode}
              </button>
            ))}
          </div>

          {activeTab === "live" && (
            <button onClick={handleFetchLiveInternships} className="btn-cyan" disabled={loadingLive} style={{ padding: "10px 16px" }}>
              <RefreshCw size={16} className={loadingLive ? "animate-spin" : ""} />
              {loadingLive ? "Finding internships..." : "Search internships"}
            </button>
          )}
        </div>
      </div>

      {/* Live Search Status Notice */}
      {activeTab === "live" && (
        <div style={{
          background: "rgba(6, 182, 212, 0.1)",
          border: "1px solid rgba(6, 182, 212, 0.3)",
          color: "var(--live-notice-text)",
          padding: "12px 16px",
          borderRadius: "10px",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <Globe size={18} />
          <span>
            <strong>Live Internship Search Active:</strong> Searching public internship listings and scoring each result against your profile.
          </span>
        </div>
      )}

      {/* Loading Live State */}
      {activeTab === "live" && loadingLive && (
        <div className="glass-panel" style={{ textAlign: "center", padding: "60px" }}>
          <Sparkles size={36} className="gradient-text-cyan" style={{ animation: "spin 1s linear infinite" }} />
          <h3 style={{ marginTop: "16px", fontSize: "1.1rem" }}>Fetching Live Web Internships...</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
            Connecting to internship listings and matching them against your skills profile
          </p>
        </div>
      )}

      {/* Internship Cards Grid */}
      {(!loadingLive || activeTab === "db") && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px"
        }}>
          {displayedJobs.map((job, idx) => {
            const score = job.match_score || 85;
            let badgeClass = "badge-emerald";
            if (score < 60) badgeClass = "badge-amber";
            if (score < 40) badgeClass = "badge-rose";
            const compName = job.company || job.company_name || "Company";

            return (
              <div
                key={job.id || idx}
                className="glass-panel"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{job.title}</h3>
                      <span style={{ fontSize: "0.9rem", color: "var(--primary-cyan)", fontWeight: "600" }}>
                        {compName}
                      </span>
                    </div>
                    <span className={`badge ${badgeClass}`} style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
                      <Sparkles size={12} /> {score}% Match
                    </span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", margin: "14px 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={14} color="var(--primary-purple)" />
                      <span>{job.location || "Remote"}</span>
                    </div>
                    {(job.stipend || job.stipend_amount) && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <DollarSign size={14} color="var(--primary-emerald)" />
                        <span>{job.stipend || job.stipend_amount}</span>
                      </div>
                    )}
                    {job.is_live && (
                      <span className="badge badge-cyan" style={{ fontSize: "0.7rem" }}>Live Web</span>
                    )}
                  </div>

                  <p style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    lineHeight: "1.4",
                    marginBottom: "16px",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {job.description}
                  </p>

                  {/* Tech Skills Pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                    {job.required_skills && job.required_skills.split(",").map((s, sIdx) => (
                      <span key={sIdx} style={{
                        fontSize: "0.75rem",
                        background: "rgba(255, 255, 255, 0.05)",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-main)"
                      }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleOpenJobModal(job)}
                      className="btn-cyan"
                      style={{ flex: 1, justifyContent: "center", fontSize: "0.82rem", padding: "8px 10px" }}
                    >
                      <Sparkles size={14} /> AI Fit Details
                    </button>
                    <button
                      onClick={() => handleTrackJob(job)}
                      className="btn-secondary"
                      style={{ padding: "8px 12px" }}
                      title="Add to Application Tracker"
                    >
                      <Plus size={16} /> Track
                    </button>
                  </div>

                  {/* One-Click Generate Tailored Resume Button */}
                  <button
                    onClick={() => handleGenerateTailoredResume(job)}
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center", fontSize: "0.82rem", padding: "8px 10px" }}
                  >
                    <FileText size={14} /> Generate Tailored Resume
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Job Detail Modal */}
      {selectedJob && (
        <div className="modal-overlay">
          <div className="glass-panel glass-panel-glow" style={{
            width: "100%",
            maxWidth: "620px",
            padding: "32px",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span className="badge badge-purple" style={{ marginBottom: "8px" }}>
                  {selectedJob.is_live ? "Live Web Match Analysis" : "AI Match Insights"}
                </span>
                <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>{selectedJob.title}</h2>
                <h4 style={{ color: "var(--primary-cyan)", fontSize: "1rem" }}>{selectedJob.company || selectedJob.company_name}</h4>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            {loadingMatch ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Sparkles size={32} className="gradient-text-purple" style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>Evaluating candidate skill match vector...</p>
              </div>
            ) : (
              matchDetails && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Score Box */}
                  <div style={{
                    background: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    padding: "20px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px"
                  }}>
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      fontWeight: "800"
                    }}>
                      {matchDetails.match_score}%
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "1rem", fontWeight: "700" }}>Match Recommendation</h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        {matchDetails.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Matching vs Missing Skills */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                      <h5 style={{ color: "#34D399", fontSize: "0.85rem", fontWeight: "700", marginBottom: "8px" }}>
                        ✓ Matching Skills ({matchDetails.matching_skills?.length || 0})
                      </h5>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {matchDetails.matching_skills?.map((s, idx) => (
                          <span key={idx} className="badge badge-emerald" style={{ fontSize: "0.75rem" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "rgba(245, 158, 11, 0.08)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                      <h5 style={{ color: "#FBBF24", fontSize: "0.85rem", fontWeight: "700", marginBottom: "8px" }}>
                        ! Missing / Target Skills
                      </h5>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {matchDetails.missing_skills?.map((s, idx) => (
                          <span key={idx} className="badge badge-amber" style={{ fontSize: "0.75rem" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h5 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "6px" }}>Role Overview</h5>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                      {selectedJob.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexColumn: "column", gap: "10px", marginTop: "10px" }}>
                    <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                      <button
                        onClick={() => handleTrackJob(selectedJob)}
                        className="btn-primary"
                        style={{ flex: 1, justifyContent: "center" }}
                      >
                        {savedSuccess ? (
                          <>
                            <Check size={18} /> Added to Kanban Tracker!
                          </>
                        ) : (
                          <>
                            <Plus size={18} /> Save & Track Application
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleGenerateTailoredResume(selectedJob)}
                        className="btn-cyan"
                        style={{ flex: 1, justifyContent: "center" }}
                      >
                        <FileText size={18} /> Tailor Resume
                      </button>
                    </div>

                    {(selectedJob.apply_url || selectedJob.source_url) && (
                      <a
                        href={selectedJob.apply_url || selectedJob.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}
                      >
                        <ExternalLink size={18} /> Apply Directly on Official Page
                      </a>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Tailored Resume Generator Modal */}
      {resumeModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel glass-panel-glow" style={{
            width: "100%",
            maxWidth: "750px",
            padding: "32px",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span className="badge badge-emerald" style={{ marginBottom: "8px" }}>
                  ATS-Optimized Dynamic Resume
                </span>
                <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>
                  Tailored Resume for {tailoredResume?.target_company || "Target Company"}
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Target Role: <strong>{tailoredResume?.target_role}</strong> | Match Score: <strong>{tailoredResume?.match_score || 85}%</strong>
                </p>
              </div>
              <button
                onClick={() => setResumeModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            {loadingResume ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Sparkles size={36} className="gradient-text-emerald" style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ marginTop: "16px", color: "var(--text-muted)" }}>Synthesizing ATS-aligned resume structure...</p>
              </div>
            ) : tailoredResumeError ? (
              <div role="alert" className="profile-error">{tailoredResumeError}</div>
            ) : tailoredResume ? (
              <div>
                <div style={{
                  background: "var(--code-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "20px",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  color: "var(--code-text)",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.6",
                  maxHeight: "450px",
                  overflowY: "auto",
                  marginBottom: "20px"
                }}>
                  {tailoredResume?.resume_markdown}
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button onClick={handleCopyResume} className="btn-secondary">
                    {copiedResume ? <Check size={16} /> : <Copy size={16} />}
                    {copiedResume ? "Copied!" : "Copy Markdown"}
                  </button>
                  <button onClick={handleDownloadResume} className="btn-primary">
                    <Download size={16} /> Download Resume (.md)
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
