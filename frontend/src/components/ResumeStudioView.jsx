import React, { useState } from "react";
import { FileText, Sparkles, Check, Save, UploadCloud } from "lucide-react";
import { api } from "../api";

export function ResumeStudioView({ profile, onUpdateProfile, onboarding = false, onComplete }) {
  const [phone] = useState(profile?.phone || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [college, setCollege] = useState(profile?.college || "");
  const [degree, setDegree] = useState(profile?.degree || "");
  const [department] = useState(profile?.department || "");
  const [targetRoles, setTargetRoles] = useState(profile?.target_roles || "");
  const [skills, setSkills] = useState(profile?.skills || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [experienceSummary, setExperienceSummary] = useState(profile?.experience_summary || "");
  const [resumeText, setResumeText] = useState(profile?.resume_text || "");
  const [resumeFileName, setResumeFileName] = useState("");

  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSaveProfile = async () => {
    setErrorMessage("");
    if (!resumeText.trim() || !skills.trim()) {
      setErrorMessage("Upload or paste your resume and add your technical skills before continuing.");
      return;
    }
    try {
      await onUpdateProfile({
        phone,
        location,
        college,
        degree,
        department,
        target_roles: targetRoles,
        skills,
        bio,
        experience_summary: experienceSummary,
        resume_text: resumeText
      });
      setSavedSuccess(true);
      if (onboarding) onComplete?.();
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleParseResume = async () => {
    if (!resumeText.trim()) return;
    setParsing(true);
    setParseResult(null);
    setErrorMessage("");
    try {
      const res = await api.parseResume(resumeText);
      if (res.data) {
        setParseResult(res.data);
        if (res.data.extracted_skills?.length > 0) {
          setSkills(res.data.extracted_skills.join(", "));
        }
        if (res.data.suggested_bio) setBio(res.data.suggested_bio);
      } else {
        setErrorMessage(res.error || "Could not analyze the pasted resume. Please try again.");
      }
    } finally {
      setParsing(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setErrorMessage("");
    setParseResult(null);
    try {
      const res = await api.uploadResume(file);
      if (!res.data) {
        setErrorMessage(res.error || "Could not upload this resume. Please try another file.");
        return;
      }
      setResumeText(res.data.resume_text);
      setResumeFileName(file.name);
      setParseResult(res.data);
      if (res.data.extracted_skills?.length) setSkills(res.data.extracted_skills.join(", "));
      if (res.data.suggested_bio) setBio(res.data.suggested_bio);
      if (res.data.suggested_roles?.length) setTargetRoles(res.data.suggested_roles.join(", "));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>
            {onboarding ? "Set Up Your Personal Internship Profile" : "Candidate Profile & Resume Studio"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {onboarding
              ? "Add your own resume and technical background. InternFlow uses these details to personalize your internship matches and application materials."
              : "Update your resume and technical background to personalize internship matching and generated application materials."}
          </p>
        </div>
        <button onClick={handleSaveProfile} className="btn-primary">
          {savedSuccess ? <Check size={18} /> : <Save size={18} />}
          <span>{savedSuccess ? (onboarding ? "Profile Ready!" : "Saved Profile!") : (onboarding ? "Save & Continue" : "Save Profile Changes")}</span>
        </button>
      </div>

      {errorMessage && (
        <div role="alert" className="profile-error">
          {errorMessage}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Left Column: Education & Skills Profile */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={20} color="var(--primary-purple)" /> Education & Target Profile
          </h3>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>College / University</label>
            <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="e.g. National Institute of Technology" className="input-field" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Degree</label>
              <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="e.g. B.Tech Computer Science" className="input-field" />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bangalore, India" className="input-field" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Target Internship Roles</label>
            <input type="text" value={targetRoles} onChange={(e) => setTargetRoles(e.target.value)} placeholder="e.g. Software Engineer Intern, Data Science Intern" className="input-field" />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Technical Skills (Comma separated)</label>
            <textarea value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. Python, React, FastAPI, SQL, PyTorch, Docker" className="input-field" style={{ minHeight: "80px" }} />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Professional Bio Summary</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Brief introduction about your background and interests..." className="input-field" style={{ minHeight: "90px" }} />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Project / Experience Details</label>
            <textarea value={experienceSummary} onChange={(e) => setExperienceSummary(e.target.value)} placeholder="Describe projects, tools you used, and what you personally contributed..." className="input-field" style={{ minHeight: "110px" }} />
          </div>
        </div>

        {/* Right Column: AI Resume Text Extractor */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={20} color="var(--primary-cyan)" /> Your Resume
            </h3>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Upload your own PDF, DOCX, or text resume, or paste its text below. We extract skills to help personalize your profile.
          </p>

          <label className="btn-secondary resume-upload-button">
            <UploadCloud size={17} />
            <span>{uploading ? "Reading resume…" : resumeFileName || "Choose resume file"}</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
              onChange={handleResumeUpload}
              disabled={uploading}
              hidden
            />
          </label>

          <textarea
            className="input-field"
            style={{ minHeight: "220px", fontFamily: "monospace", fontSize: "0.85rem" }}
            placeholder="Your extracted resume text will appear here. You can also paste it directly..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />

          <button
            onClick={handleParseResume}
            className="btn-cyan"
            style={{ justifyContent: "center", padding: "12px" }}
            disabled={parsing || !resumeText.trim()}
          >
            {parsing ? (
              <>
                <Sparkles size={18} style={{ animation: "spin 1s linear infinite" }} /> Extracting Skills...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Analyze & Extract Skills
              </>
            )}
          </button>

          {/* AI Parser Feedback Output */}
          {parseResult && (
            <div style={{
              background: "rgba(6, 182, 212, 0.08)",
              border: "1px solid rgba(6, 182, 212, 0.25)",
              padding: "16px",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}>
              <h4 style={{ fontSize: "0.95rem", color: "var(--primary-cyan)", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                <Check size={16} /> Skills Extracted ({parseResult.extracted_skills?.length || 0})
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {parseResult.extracted_skills?.map((s, idx) => (
                  <span key={idx} className="badge badge-cyan">
                    {s}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Suggested Bio: {parseResult.suggested_bio}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
