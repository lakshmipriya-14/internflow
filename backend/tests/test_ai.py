def test_ai_cover_letter(client, auth_headers):
    client.put("/profile", json={
        "college": "North College",
        "degree": "BSc Computer Science",
        "skills": "Python, React",
        "resume_text": "Built a Python and React student project."
    }, headers=auth_headers)
    payload = {
        "company_name": "Microsoft",
        "role_title": "Software Engineer Intern",
        "tone": "Professional"
    }
    res = client.post("/ai/generate-cover-letter", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "Microsoft" in data["cover_letter"]
    assert "Software Engineer Intern" in data["cover_letter"]
    assert "Python, React" in data["cover_letter"]
    assert "Built a Python and React student project." in data["cover_letter"]
    assert "production software" not in data["cover_letter"]


def test_ai_cold_email(client, auth_headers):
    client.put("/profile", json={
        "skills": "Python",
        "resume_text": "Python student developer."
    }, headers=auth_headers)
    payload = {
        "company_name": "Meta",
        "role_title": "AI Intern",
        "recruiter_name": "Jane Doe"
    }
    res = client.post("/ai/generate-cold-email", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "Jane Doe" in data["email_body"]
    assert "Python" in data["email_body"]


def test_generated_resume_uses_only_candidate_profile(client, auth_headers):
    client.put("/profile", json={
        "college": "North College",
        "degree": "BSc Computer Science",
        "skills": "Python, React",
        "experience_summary": "Created a personal portfolio using React.",
        "resume_text": "My resume includes Python and React projects."
    }, headers=auth_headers)
    response = client.post("/ai/generate-resume", json={
        "company_name": "Example Co",
        "role_title": "Frontend Intern",
        "target_skills": "React, CSS"
    }, headers=auth_headers)
    assert response.status_code == 200
    resume = response.json()["resume_markdown"]
    assert "My resume includes Python and React projects." in resume
    assert "Example Co" in resume
    assert "Campus Tech Society" not in resume
    assert "2026" not in resume


def test_generation_requires_saved_resume_and_skills(client, auth_headers):
    response = client.post("/ai/generate-cover-letter", json={
        "company_name": "Example Co",
        "role_title": "Software Intern"
    }, headers=auth_headers)
    assert response.status_code == 400


def test_ai_interview_prep(client, auth_headers):
    gen_res = client.post("/ai/interview-prep/generate", json={"role_title": "SDE Intern", "count": 2}, headers=auth_headers)
    assert gen_res.status_code == 200
    questions = gen_res.json()["questions"]
    assert len(questions) == 2

    eval_res = client.post(
        "/ai/interview-prep/evaluate",
        json={"question": questions[0]["question"], "user_answer": "I built a REST API in Python using FastAPI and PostgreSQL with full JWT auth and unit testing."},
        headers=auth_headers
    )
    assert eval_res.status_code == 200
    assert eval_res.json()["score"] > 50
