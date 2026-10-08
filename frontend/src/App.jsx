import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Header } from "./components/Header";
import { AuthModal } from "./components/AuthModal";
import { DashboardView } from "./components/DashboardView";
import { JobFinderView } from "./components/JobFinderView";
import { KanbanBoardView } from "./components/KanbanBoardView";
import { ResumeStudioView } from "./components/ResumeStudioView";
import { GeneratorStudioView } from "./components/GeneratorStudioView";
import { InterviewPrepView } from "./components/InterviewPrepView";
import { api, getToken, setToken } from "./api";

// Fallback initial internships if backend API is connecting
const DEMO_INTERNSHIPS = [
  {
    id: 1,
    title: "Software Engineer Intern (Full Stack)",
    company: "TechFlow Inc.",
    location: "Bangalore / Remote",
    work_mode: "Remote",
    stipend_amount: "₹35,000/month",
    description: "Build user-facing React interfaces, write clean FastAPI endpoints, and optimize PostgreSQL queries for scale.",
    required_skills: "Python, React, FastAPI, SQL, PostgreSQL, Git",
    match_score: 92,
    source_url: "https://techflow.io"
  },
  {
    id: 2,
    title: "AI / Machine Learning Engineer Intern",
    company: "NeuralMind Systems",
    location: "Hyderabad / Hybrid",
    work_mode: "Hybrid",
    stipend_amount: "₹45,000/month",
    description: "Fine-tune Large Language Models, LLM agent workflows, vector search (FAISS), and Python backend integration.",
    required_skills: "Python, PyTorch, Machine Learning, NLP, FastAPI, Docker",
    match_score: 88,
    source_url: "https://neuralmind.ai"
  },
  {
    id: 3,
    title: "Frontend Developer Intern",
    company: "DesignCraft Labs",
    location: "Remote",
    work_mode: "Remote",
    stipend_amount: "₹30,000/month",
    description: "Build responsive animated web experiences using TypeScript, React, TailwindCSS, and state management.",
    required_skills: "React, TypeScript, JavaScript, HTML, CSS, Figma",
    match_score: 85,
    source_url: "https://designcraft.dev"
  },
  {
    id: 4,
    title: "Backend Engineering Intern",
    company: "DataCloud Infrastructure",
    location: "Pune / Onsite",
    work_mode: "Onsite",
    stipend_amount: "₹40,000/month",
    description: "Design high-performance microservices, REST APIs, and database schemas using Go, Python, PostgreSQL.",
    required_skills: "Python, Go, SQL, PostgreSQL, Docker, REST APIs, Linux",
    match_score: 78,
    source_url: "https://datacloud.io"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState("");
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem("internflow-theme") === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  const [profile, setProfile] = useState(null);

  const [internships, setInternships] = useState(DEMO_INTERNSHIPS);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState({
    total_applications: 0,
    conversion_rate: 0,
    offer_rate: 0,
    average_match_score: 0
  });

  async function loadUserData() {
    setProfileLoading(true);
    setProfileLoadError("");
    const [profileRes, applicationsRes, analyticsRes, internshipsRes] = await Promise.all([
      api.getProfile(),
      api.listApplications(),
      api.getAnalyticsSummary(),
      api.listInternships()
    ]);
    if (profileRes.data) {
      setProfile(profileRes.data);
    } else {
      setProfileLoadError(profileRes.error || "Could not load your profile. Please try again.");
    }
    if (applicationsRes.data) setApplications(applicationsRes.data);
    if (analyticsRes.data) setAnalytics(analyticsRes.data);
    if (internshipsRes.data) setInternships(internshipsRes.data);
    setProfileLoading(false);
  }

  useEffect(() => {
    async function loadData() {
      const token = getToken();
      if (!token) {
        setAuthReady(true);
        return;
      }

      const meRes = await api.getMe();
      if (!meRes.data) {
        if (meRes.status === 401) setToken(null);
        setAuthReady(true);
        return;
      }

      setUser(meRes.data);
      await loadUserData();
      setAuthReady(true);
    }

    loadData();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem("internflow-theme", theme);
    } catch {
      // Keep the selected theme for this session when storage is unavailable.
    }
  }, [theme]);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    setProfileLoadError("");
    setApplications([]);
    setAnalytics({ total_applications: 0, conversion_rate: 0, offer_rate: 0, average_match_score: 0 });
    setActiveTab("dashboard");
  };

  const handleAuthSuccess = async (userData) => {
    setUser(userData);
    await loadUserData();
  };

  const handleUpdateProfile = async (payload) => {
    const res = await api.updateProfile(payload);
    if (res.data) {
      setProfile(res.data);
      return res.data;
    }
    throw new Error(res.error || res.message || "Could not save your profile. Please try again.");
  };

  const handleCreateApplication = async (payload) => {
    const res = await api.createApplication(payload);
    if (res.data) {
      setApplications([res.data, ...applications]);
    } else {
      const fallbackApp = {
        id: Date.now(),
        ...payload,
        match_score: 85,
        applied_date: new Date().toISOString().split("T")[0]
      };
      setApplications([fallbackApp, ...applications]);
    }
  };

  const handleUpdateAppStatus = async (id, payload) => {
    setApplications(
      applications.map((a) => (a.id === id ? { ...a, ...payload } : a))
    );
    await api.updateApplication(id, payload);
  };

  const handleDeleteApplication = async (id) => {
    setApplications(applications.filter((a) => a.id !== id));
    await api.deleteApplication(id);
  };

  const profileReady = Boolean(profile?.resume_text?.trim() && profile?.skills?.trim());

  if (!authReady) {
    return (
      <div className="auth-loading" data-theme={theme}>
        <Sparkles size={28} className="gradient-text-purple" />
        <span>Checking your account…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div data-theme={theme} className="auth-page">
        <AuthModal
          isOpen
          fullScreen
          onClose={() => {}}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="auth-loading" data-theme={theme}>
        <Sparkles size={28} className="gradient-text-purple" />
        <span>Loading your profile…</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div data-theme={theme} className="auth-page">
        <div className="glass-panel profile-required">
          <h2>We couldn't load your profile</h2>
          <p role="alert">{profileLoadError || "Please try again before continuing."}</p>
          <button className="btn-primary" onClick={loadUserData}>Retry</button>
          <button className="btn-secondary" onClick={handleLogout}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div data-theme={theme} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => {}}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={() => setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark")}
      />

      {/* Main View Area */}
      <main style={{ maxWidth: "1400px", width: "100%", margin: "0 auto", padding: "32px 24px", flex: 1 }}>
        {!profileReady ? (
          <ResumeStudioView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onboarding
            onComplete={() => setActiveTab("dashboard")}
          />
        ) : (
          <>
        {activeTab === "dashboard" && (
          <DashboardView
            analytics={analytics}
            profile={profile}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "jobs" && (
          <JobFinderView
            internships={internships}
            onApplyTrack={handleCreateApplication}
          />
        )}

        {activeTab === "kanban" && (
          <KanbanBoardView
            applications={applications}
            onUpdateStatus={handleUpdateAppStatus}
            onDeleteApp={handleDeleteApplication}
            onCreateApp={handleCreateApplication}
          />
        )}

        {activeTab === "resume" && (
          <ResumeStudioView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activeTab === "generator" && (
          <GeneratorStudioView
            profile={profile}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "interview" && (
          <InterviewPrepView />
        )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border-color)",
        padding: "20px 24px",
        textAlign: "center",
        fontSize: "0.85rem",
        color: "var(--text-dim)",
        background: "var(--surface-strong)"
      }}>
        InternFlow AI Platform • FastAPI Backend + React Glassmorphic Frontend • Powered by AI Automation
      </footer>

    </div>
  );
}
