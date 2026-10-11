const API_BASE_URL = "http://localhost:8000";

// Retrieve saved token
export function getToken() {
  return localStorage.getItem("internflow_token");
}

export function setToken(token) {
  if (token) {
    localStorage.setItem("internflow_token", token);
  } else {
    localStorage.removeItem("internflow_token");
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Unauthenticated
      return { error: "unauthorized", status: 401 };
    }

    const data = await res.json();
    if (!res.ok) {
      let errMsg = data.error?.message || data.detail || "Request failed";
      if (data.error?.details && Array.isArray(data.error.details) && data.error.details.length > 0) {
        errMsg = data.error.details.map(d => `${d.field ? d.field + ": " : ""}${d.message}`).join(" | ");
      }
      return { error: errMsg, status: res.status };
    }

    return { data, status: res.status };
  } catch (err) {
    console.warn("Backend API offline or unreachable, using client state fallback:", err);
    return {
      error: "Backend server is offline or unreachable (http://localhost:8000). Please ensure the backend is running.",
      message: err.message,
      isOffline: true
    };
  }
}

export const api = {
  // Auth
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  forgotPassword: (payload) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => request("/auth/me"),

  // Profile
  getProfile: () => request("/profile"),
  updateProfile: (payload) => request("/profile", { method: "PUT", body: JSON.stringify(payload) }),
  parseResume: (resumeText) => request("/profile/parse-resume", { method: "POST", body: JSON.stringify({ resume_text: resumeText }) }),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request("/profile/upload-resume", { method: "POST", body: formData });
  },

  // Internships
  listInternships: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/internships?${query}`);
  },
  listLiveInternships: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/internships/live?${query}`);
  },
  matchInternship: (id) => request(`/internships/${id}/match`, { method: "POST" }),

  // Applications
  listApplications: (status) => request(status ? `/applications?status=${status}` : "/applications"),
  createApplication: (payload) => request("/applications", { method: "POST", body: JSON.stringify(payload) }),
  updateApplication: (id, payload) => request(`/applications/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteApplication: (id) => request(`/applications/${id}`, { method: "DELETE" }),

  // AI Copilot
  computeMatchScore: (payload) => request("/ai/match-score", { method: "POST", body: JSON.stringify(payload) }),
  generateCoverLetter: (payload) => request("/ai/generate-cover-letter", { method: "POST", body: JSON.stringify(payload) }),
  generateColdEmail: (payload) => request("/ai/generate-cold-email", { method: "POST", body: JSON.stringify(payload) }),
  generateTailoredResume: (payload) => request("/ai/generate-resume", { method: "POST", body: JSON.stringify(payload) }),
  generateInterviewPrep: (payload) => request("/ai/interview-prep/generate", { method: "POST", body: JSON.stringify(payload) }),
  evaluateInterviewAnswer: (payload) => request("/ai/interview-prep/evaluate", { method: "POST", body: JSON.stringify(payload) }),

  // Analytics
  getAnalyticsSummary: () => request("/analytics/summary"),
  getSkillGaps: () => request("/analytics/skill-gaps"),
};
