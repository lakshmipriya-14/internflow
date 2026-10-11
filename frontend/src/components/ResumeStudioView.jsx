import React, { useState, useRef } from "react";
import { FileText, Sparkles, Check, Save, UploadCloud, Lock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../api";

export function ResumeStudioView({
  profile,
  onUpdateProfile,
  initialSection = "details",
  user
}) {
  const [activeSection, setActiveSection] = useState(initialSection); // "details" | "resume" | "security"

  // Profile Details state
  const [phone] = useState(profile?.phone || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [college, setCollege] = useState(profile?.college || "");
  const [degree, setDegree] = useState(profile?.degree || "");
  const [department] = useState(profile?.department || "");
  const [targetRoles, setTargetRoles] = useState(profile?.target_roles || "");
  const [skills, setSkills] = useState(profile?.skills || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [experienceSummary, setExperienceSummary] = useState(profile?.experience_summary || "");

  // Resume state
  const [resumeText, setResumeText] = useState(profile?.resume_text || "");
  const [resumeFileName, setResumeFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [parseResult, setParseResult] = useState(null);

  // Security / Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // UI feedback states
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resumeSavedSuccess, setResumeSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef(null);

  const handleSaveProfile = async () => {
    setErrorMessage("");
    try {
      const updated = await onUpdateProfile({
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
      setTimeout(() => setSavedSuccess(false), 2500);
      return updated;
    } catch (error) {
      setErrorMessage(error.message || "Failed to save profile.");
    }
  };

  const handleSaveResumeOnly = async () => {
    setErrorMessage("");
    if (!resumeText.trim()) {
      setErrorMessage("Please upload a resume or paste your resume text first.");
      return;
    }
    try {
      await onUpdateProfile({
        target_roles: targetRoles,
        skills,
        bio,
        resume_text: resumeText
      });
      setResumeSavedSuccess(true);
      setTimeout(() => setResumeSavedSuccess(false), 2500);
    } catch (error) {
      setErrorMessage(error.message || "Failed to save resume.");
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
        if (res.data.suggested_roles?.length > 0) setTargetRoles(res.data.suggested_roles.join(", "));
      } else {
        setErrorMessage(res.error || "Could not analyze the resume text. Please check the content.");
      }
    } finally {
      setParsing(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    if (fileNameLower.endsWith(".doc") && !fileNameLower.endsWith(".docx")) {
      setErrorMessage("Legacy .doc format detected. Please save your file as .docx or .pdf, or copy-paste its text below.");
      return;
    }

    setUploading(true);
    setErrorMessage("");
    setParseResult(null);

    // If it's a text or markdown file, read client-side preview immediately
    if (fileNameLower.endsWith(".txt") || fileNameLower.endsWith(".md") || file.type.startsWith("text/")) {
      try {
        const textContent = await file.text();
        if (textContent.trim()) {
          setResumeText(textContent);
          setResumeFileName(file.name);
        }
      } catch (err) {
        console.warn("Could not read text preview client-side:", err);
      }
    }

    try {
      const res = await api.uploadResume(file);
      if (!res.data) {
        setErrorMessage(
          res.isOffline
            ? "Backend server is offline (http://localhost:8000). You can paste your resume text directly below, or start the backend."
            : res.error || "Could not upload this resume file. Please try another file."
        );
        return;
      }

      setResumeText(res.data.resume_text);
      setResumeFileName(file.name);
      setParseResult(res.data);

      const newSkills = res.data.extracted_skills?.length ? res.data.extracted_skills.join(", ") : skills;
      const newBio = res.data.suggested_bio || bio;
      const newRoles = res.data.suggested_roles?.length ? res.data.suggested_roles.join(", ") : targetRoles;

      if (res.data.extracted_skills?.length) setSkills(newSkills);
      if (res.data.suggested_bio) setBio(newBio);
      if (res.data.suggested_roles?.length) setTargetRoles(newRoles);

      // Synchronize parent app profile immediately
      if (res.data.profile) {
        onUpdateProfile(res.data.profile).catch(() => {});
      }

      setResumeSavedSuccess(true);
      setTimeout(() => setResumeSavedSuccess(false), 2500);
    } catch (err) {
      setErrorMessage(err.message || "Failed to process resume upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    event.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setErrorMessage("");
    setPasswordSuccess("");

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      setPasswordLoading(false);
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setErrorMessage("Password must contain at least one letter and one number.");
      setPasswordLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setPasswordLoading(false);
      return;
    }

    const emailToUse = user?.email || profile?.email;
    if (!emailToUse) {
      setErrorMessage("Account email could not be determined. Please re-sign in.");
      setPasswordLoading(false);
      return;
    }

    const res = await api.forgotPassword({ email: emailToUse, new_password: newPassword });
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setPasswordSuccess("Password updated successfully! You can use this new password on your next login.");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner & Sub-Navigation */}
      <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: "700" }}>
              Student Profile & Resume Hub
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Manage your academic background, upload your resume, and configure account credentials.
            </p>
          </div>

          {activeSection === "details" && (
            <button onClick={handleSaveProfile} className="btn-primary">
              {savedSuccess ? <Check size={18} /> : <Save size={18} />}
              <span>{savedSuccess ? "Profile Saved!" : "Save Profile Details"}</span>
            </button>
          )}

          {activeSection === "resume" && (
            <button onClick={handleSaveResumeOnly} className="btn-primary">
              {resumeSavedSuccess ? <Check size={18} /> : <Save size={18} />}
              <span>{resumeSavedSuccess ? "Resume Saved!" : "Save Resume Changes"}</span>
            </button>
          )}
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="profile-subtabs">
          <button
            type="button"
            className={`profile-subtab-btn ${activeSection === "details" ? "active" : ""}`}
            onClick={() => { setActiveSection("details"); setErrorMessage(""); }}
          >
            <User size={16} />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            className={`profile-subtab-btn ${activeSection === "resume" ? "active" : ""}`}
            onClick={() => { setActiveSection("resume"); setErrorMessage(""); }}
          >
            <UploadCloud size={16} />
            <span>Update Resume</span>
          </button>
          <button
            type="button"
            className={`profile-subtab-btn ${activeSection === "security" ? "active" : ""}`}
            onClick={() => { setActiveSection("security"); setErrorMessage(""); }}
          >
            <Lock size={16} />
            <span>Account & Security</span>
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div role="alert" className="profile-error" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Global Success Banners */}
      {savedSuccess && (
        <div className="profile-success">
          <CheckCircle2 size={18} />
          <span>Profile information saved successfully!</span>
        </div>
      )}

      {resumeSavedSuccess && (
        <div className="profile-success">
          <CheckCircle2 size={18} />
          <span>Resume and extracted skills updated successfully!</span>
        </div>
      )}

      {/* SECTION 1: PROFILE DETAILS */}
      {activeSection === "details" && (
        <div className="glass-panel" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={20} color="var(--primary-purple)" /> Academic & Professional Details
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                College / University
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. National Institute of Technology"
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                Location / City
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore, India"
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                Degree & Field of Study
              </label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                Target Internship Roles
              </label>
              <input
                type="text"
                value={targetRoles}
                onChange={(e) => setTargetRoles(e.target.value)}
                placeholder="e.g. Software Engineer Intern, AI / ML Intern"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
              Technical Skills (Comma separated)
            </label>
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Python, React, FastAPI, SQL, PyTorch, Docker, Git"
              className="input-field"
              style={{ minHeight: "85px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
              Professional Bio Summary
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief professional introduction summarizing your engineering interests..."
              className="input-field"
              style={{ minHeight: "95px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
              Project & Work Experience Highlights
            </label>
            <textarea
              value={experienceSummary}
              onChange={(e) => setExperienceSummary(e.target.value)}
              placeholder="Describe major projects you built, technologies utilized, and measurable outcomes..."
              className="input-field"
              style={{ minHeight: "120px" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
            <button onClick={handleSaveProfile} className="btn-primary">
              <Save size={18} />
              <span>Save Profile Details</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: UPDATE RESUME */}
      {activeSection === "resume" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "24px" }}>
          {/* Left Column: Drag & Drop Resume Upload */}
          <div className="glass-panel" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <UploadCloud size={22} color="var(--primary-cyan)" /> Update & Upload Resume
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Upload your latest resume document (PDF, DOCX, TXT, MD). Our AI parser extracts technical skills and updates your profile automatically.
              </p>
            </div>

            {/* Hidden file input with ref */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
              onChange={handleFileInputChange}
              style={{ display: "none" }}
            />

            {/* Drag & Drop Zone */}
            <div
              className={`resume-dropzone ${dragActive ? "drag-active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <UploadCloud size={28} color="var(--primary-cyan)" />
              </div>

              <div>
                <p style={{ fontWeight: "600", fontSize: "0.95rem", margin: "0 0 4px 0" }}>
                  {uploading ? "Extracting & analyzing resume…" : "Drop your resume file here or click to browse"}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                  Supports PDF, Word (.docx), Plain Text (.txt), and Markdown (.md) up to 10 MB
                </p>
              </div>

              <button
                type="button"
                className="btn-secondary"
                disabled={uploading}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                style={{ marginTop: "4px" }}
              >
                <UploadCloud size={16} />
                <span>{uploading ? "Reading file…" : resumeFileName || "Select Resume Document"}</span>
              </button>
            </div>

            {/* Current Loaded File Details */}
            {resumeFileName && (
              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FileText size={18} color="var(--primary-cyan)" />
                  <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{resumeFileName}</span>
                </div>
                <span className="badge badge-cyan" style={{ fontSize: "0.75rem" }}>Uploaded</span>
              </div>
            )}

            {/* Extracted Skills Preview Box */}
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
                {parseResult.suggested_bio && (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Suggested Bio: {parseResult.suggested_bio}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Resume Text Content Viewer & Analyzer */}
          <div className="glass-panel" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} color="var(--primary-purple)" /> Resume Text Editor & Extractor
              </h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                {resumeText ? `${resumeText.trim().split(/\s+/).length} words` : "Empty"}
              </span>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              View the extracted text or paste your resume content directly. Click below to analyze skills.
            </p>

            <textarea
              className="input-field"
              style={{
                minHeight: "260px",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                lineHeight: "1.5"
              }}
              placeholder="Paste or view your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handleParseResume}
                className="btn-cyan"
                disabled={parsing || !resumeText.trim()}
              >
                <Sparkles size={16} style={parsing ? { animation: "spin 1s linear infinite" } : {}} />
                <span>{parsing ? "Extracting..." : "Analyze & Extract Skills"}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveResumeOnly}
                className="btn-primary"
                disabled={!resumeText.trim()}
              >
                <Save size={16} />
                <span>Save Resume Text</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: ACCOUNT & SECURITY */}
      {activeSection === "security" && (
        <div className="glass-panel" style={{ maxWidth: "600px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <Lock size={20} color="var(--primary-purple)" /> Account Password & Security
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Update your account password directly. No email verification link required.
            </p>
          </div>

          <div style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Registered Email:</span>
              <span style={{ fontWeight: "600" }}>{user?.email || "student@gmail.com"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Full Name:</span>
              <span style={{ fontWeight: "600" }}>{user?.full_name || "Student"}</span>
            </div>
          </div>

          {passwordSuccess && (
            <div className="profile-success">
              <CheckCircle2 size={18} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="At least 8 characters, letter and number"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "fit-content", padding: "12px 24px" }}
              disabled={passwordLoading}
            >
              <Lock size={16} />
              <span>{passwordLoading ? "Updating..." : "Update Password"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
