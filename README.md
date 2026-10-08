# InternFlow AI: Intelligent AI Internship Application Assistant

InternFlow AI is a comprehensive AI platform that automates and accelerates the student internship application process. It provides AI-powered resume matching, automated cover letter & cold outreach generation, an interactive Kanban application tracker, candidate profile skill parsing, analytics conversion funnels, and an AI mock interview practice coach.

---

## 🚀 Key Features

1. **AI Job Finder & Resume Matcher**:
   - Scores candidate skills against job descriptions on a scale of `0-100%`.
   - Identifies matching skills vs missing skills and generates targeted application recommendations.

2. **AI Resume Studio & Skill Extractor**:
   - Parses raw resume text to automatically extract technical skills and generate professional candidate bios.
   - Manages candidate education, target roles, desired stipend, and portfolio links.

3. **Kanban Application Tracker**:
   - Interactive 6-stage pipeline: `Saved`, `Applied`, `Screening / Test`, `Interview Scheduled`, `Offer Received`, `Archived`.
   - Organizes notes, follow-up dates, recruiter contacts, and generated cover letters per application.

4. **AI Generator Studio (Cover Letters & Cold Emails)**:
   - Generates role-tailored cover letters and concise recruiter cold emails.
   - Dynamic writing tones: `Professional`, `Enthusiastic`, `Startup / Direct`, `Conversational`.

5. **AI Mock Interview Practice Studio**:
   - Role-specific technical and behavioral question generator.
   - Evaluates candidate answers using the **STAR framework** (Situation, Task, Action, Result) with scores, strengths, and areas for improvement.

---

## 🛠️ Technology Stack

- **Backend**: FastAPI (Python 3.12), SQLAlchemy 2.0, Pydantic v2, PyJWT, Alembic, Pytest, SQLite / PostgreSQL.
- **Frontend**: Vite + React, Vanilla CSS Design System with dark mode, glassmorphism, responsive grid layouts, and Lucide Icons.

---

## 🏃 Getting Started

### 1. Backend Setup

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Run Alembic DB migrations:
```powershell
alembic upgrade head
```

Run the backend server:
```powershell
uvicorn app.main:app --reload
```
- API Endpoint: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

Run Python Test Suite:
```powershell
python -m pytest backend/tests -v
```

---

## 💻 Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```
- Web Application UI: `http://localhost:5173`

To build production bundle:
```powershell
npm run build
```

---

## 📋 Core API Endpoints

| Category | Endpoint | Method | Purpose |
|---|---|---|---|
| **Auth** | `/auth/register` | POST | Register new student account |
| **Auth** | `/auth/login` | POST | Authenticate & retrieve JWT access token |
| **Profile** | `/profile` | GET / PUT | Retrieve or update student profile |
| **Profile** | `/profile/parse-resume` | POST | Extract skills & bio from raw resume text |
| **Internships** | `/internships` | GET / POST | Browse listings with filters & AI match scores |
| **Internships** | `/internships/{id}/match` | POST | Get detailed AI skill fit analysis |
| **Applications** | `/applications` | GET / POST | Retrieve or create tracked Kanban applications |
| **Applications** | `/applications/{id}` | PUT / DELETE | Update application pipeline stage or notes |
| **AI Copilot** | `/ai/generate-cover-letter` | POST | Generate role-tailored cover letters |
| **AI Copilot** | `/ai/generate-cold-email` | POST | Generate cold recruiter outreach email |
| **AI Copilot** | `/ai/interview-prep/generate`| POST | Generate technical & behavioral interview questions |
| **AI Copilot** | `/ai/interview-prep/evaluate`| POST | Evaluate interview answers using STAR framework |
| **Analytics** | `/analytics/summary` | GET | Application conversion rate & status counts |
| **Analytics** | `/analytics/skill-gaps` | GET | Top in-demand skills vs candidate profile gaps |
