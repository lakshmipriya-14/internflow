import React, { useState } from "react";
import { Columns, Plus, Trash2, Edit3, Calendar, Mail, FileText, CheckCircle2, ChevronRight, Sparkles, X } from "lucide-react";
import { api } from "../api";

const COLUMNS = [
  { id: "saved", label: "Saved / Wishlist", color: "#3B82F6" },
  { id: "applied", label: "Applied", color: "#8B5CF6" },
  { id: "screening", label: "Screening / Test", color: "#06B6D4" },
  { id: "interviewing", label: "Interview Scheduled", color: "#F59E0B" },
  { id: "offered", label: "Offer Received 🎉", color: "#10B981" },
  { id: "rejected", label: "Archived / Rejected", color: "#6B7280" }
];

export function KanbanBoardView({ applications, onUpdateStatus, onDeleteApp, onCreateApp }) {
  const [activeModalApp, setActiveModalApp] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newStatus, setNewStatus] = useState("saved");
  const [newNotes, setNewNotes] = useState("");
  const [genCoverLetter, setGenCoverLetter] = useState("");
  const [loadingGen, setLoadingGen] = useState(false);

  const handleCreateNew = (e) => {
    e.preventDefault();
    onCreateApp({
      company_name: newCompany,
      role_title: newRole,
      status: newStatus,
      notes: newNotes,
      applied_date: new Date().toISOString().split("T")[0]
    });
    setNewCompany("");
    setNewRole("");
    setNewNotes("");
    setShowAddModal(false);
  };

  const handleGenerateCoverForApp = async (appItem) => {
    setLoadingGen(true);
    const res = await api.generateCoverLetter({
      company_name: appItem.company_name,
      role_title: appItem.role_title,
      tone: "Professional"
    });
    if (res.data) {
      setGenCoverLetter(res.data.cover_letter);
      onUpdateStatus(appItem.id, { generated_cover_letter: res.data.cover_letter });
    }
    setLoadingGen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Bar */}
      <div className="glass-panel" style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>
            Application Pipeline (Kanban Board)
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Track application lifecycle stages, follow-up deadlines, notes, and cover letters
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={18} />
          <span>Add Custom Application</span>
        </button>
      </div>

      {/* Kanban Board Layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        alignItems: "start",
        overflowX: "auto",
        paddingBottom: "16px"
      }}>
        {COLUMNS.map((col) => {
          const colApps = applications.filter((a) => (a.status || "saved").toLowerCase() === col.id);

          return (
            <div
              key={col.id}
              className="glass-panel"
              style={{
                padding: "16px",
                minHeight: "500px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                background: "rgba(17, 24, 39, 0.5)"
              }}
            >
              {/* Column Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "10px",
                borderBottom: `2px solid ${col.color}`
              }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-main)" }}>
                  {col.label}
                </span>
                <span style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  background: `${col.color}25`,
                  color: col.color,
                  padding: "2px 8px",
                  borderRadius: "10px"
                }}>
                  {colApps.length}
                </span>
              </div>

              {/* Cards in Column */}
              {colApps.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-dim)", fontSize: "0.8rem" }}>
                  No applications in this stage
                </div>
              ) : (
                colApps.map((item) => (
                  <div
                    key={item.id}
                    className="glass-panel"
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      background: "var(--bg-card-hover)",
                      border: "1px solid var(--border-color)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px"
                    }}
                    onClick={() => {
                      setActiveModalApp(item);
                      setGenCoverLetter(item.generated_cover_letter || "");
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "700", margin: 0 }}>{item.role_title}</h4>
                      <span className="badge badge-purple" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                        {item.match_score || 85}%
                      </span>
                    </div>

                    <span style={{ fontSize: "0.85rem", color: "var(--primary-cyan)", fontWeight: "600" }}>
                      {item.company_name}
                    </span>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>
                      <span>{item.applied_date || "Recent"}</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {item.generated_cover_letter && <FileText size={14} color="var(--primary-emerald)" />}
                        {item.notes && <Edit3 size={14} color="var(--primary-amber)" />}
                      </div>
                    </div>

                    {/* Quick Move Select */}
                    <div style={{ marginTop: "6px" }} onClick={(e) => e.stopPropagation()}>
                      <select
                        value={item.status || "saved"}
                        onChange={(e) => onUpdateStatus(item.id, { status: e.target.value })}
                        style={{
                          width: "100%",
                          background: "var(--input-bg)",
                          color: "var(--text-main)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          padding: "4px 6px"
                        }}
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      {/* Application Detail Modal */}
      {activeModalApp && (
        <div className="modal-overlay">
          <div className="glass-panel glass-panel-glow" style={{
            width: "100%",
            maxWidth: "600px",
            padding: "32px",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span className="badge badge-cyan" style={{ marginBottom: "6px" }}>Application Details</span>
                <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>{activeModalApp.role_title}</h2>
                <h4 style={{ color: "var(--primary-cyan)" }}>{activeModalApp.company_name}</h4>
              </div>
              <button onClick={() => setActiveModalApp(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Stage selector */}
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                  Current Stage
                </label>
                <select
                  value={activeModalApp.status || "saved"}
                  onChange={(e) => {
                    const newSt = e.target.value;
                    setActiveModalApp({ ...activeModalApp, status: newSt });
                    onUpdateStatus(activeModalApp.id, { status: newSt });
                  }}
                  className="input-field"
                >
                  {COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                  Interview Notes / Status Updates
                </label>
                <textarea
                  className="input-field"
                  placeholder="Record recruiter contacts, interview dates, coding challenge topics..."
                  value={activeModalApp.notes || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setActiveModalApp({ ...activeModalApp, notes: val });
                    onUpdateStatus(activeModalApp.id, { notes: val });
                  }}
                />
              </div>

              {/* AI Tailored Cover Letter Section */}
              <div style={{ background: "rgba(139, 92, 246, 0.08)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles size={16} color="var(--primary-purple)" />
                    AI Tailored Cover Letter
                  </h4>
                  <button
                    onClick={() => handleGenerateCoverForApp(activeModalApp)}
                    className="btn-primary"
                    style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                    disabled={loadingGen}
                  >
                    {loadingGen ? "Generating..." : "Generate AI Cover Letter"}
                  </button>
                </div>
                {genCoverLetter ? (
                  <textarea
                    readOnly
                    className="input-field"
                    style={{ minHeight: "140px", fontSize: "0.8rem", fontFamily: "monospace" }}
                    value={genCoverLetter}
                  />
                ) : (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Click above to generate a customized cover letter for {activeModalApp.company_name}.
                  </p>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <button
                  onClick={() => {
                    onDeleteApp(activeModalApp.id);
                    setActiveModalApp(null);
                  }}
                  className="btn-secondary"
                  style={{ color: "#FB7185", borderColor: "rgba(244, 63, 94, 0.3)" }}
                >
                  <Trash2 size={16} /> Delete Application
                </button>
                <button onClick={() => setActiveModalApp(null)} className="btn-cyan">
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Application Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel glass-panel-glow" style={{ width: "100%", maxWidth: "450px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Track New Application</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateNew} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Company Name</label>
                <input required type="text" placeholder="e.g. OpenAI" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} className="input-field" />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Role Title</label>
                <input required type="text" placeholder="e.g. Software Engineer Intern" value={newRole} onChange={(e) => setNewRole(e.target.value)} className="input-field" />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Initial Pipeline Stage</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field">
                  {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Notes / Link</label>
                <input type="text" placeholder="Applied via referral / LinkedIn" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className="input-field" />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: "center", marginTop: "10px" }}>
                <Plus size={18} /> Add Application Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
