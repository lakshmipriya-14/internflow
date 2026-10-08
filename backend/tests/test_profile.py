from io import BytesIO

from docx import Document


def test_upload_docx_resume(client, auth_headers):
    document = Document()
    document.add_paragraph("Python and React developer. Built a student portfolio project.")
    content = BytesIO()
    document.save(content)
    response = client.post(
        "/profile/upload-resume",
        files={"file": ("my-resume.docx", content.getvalue(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert "Python" in response.json()["extracted_skills"]
    profile = client.get("/profile", headers=auth_headers).json()
    assert "student portfolio project" in profile["resume_text"]


def test_upload_text_resume(client, auth_headers):
    response = client.post(
        "/profile/upload-resume",
        files={"file": ("my-resume.txt", b"Python and React developer. Built a student portfolio.", "text/plain")},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert "Python" in response.json()["extracted_skills"]
    assert response.json()["resume_text"].startswith("Python and React")


def test_upload_rejects_unsupported_resume_type(client, auth_headers):
    response = client.post(
        "/profile/upload-resume",
        files={"file": ("resume.exe", b"not a resume", "application/octet-stream")},
        headers=auth_headers
    )
    assert response.status_code == 415


def test_get_profile(client, auth_headers):
    res = client.get("/profile", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "user_id" in data


def test_update_profile(client, auth_headers):
    payload = {
        "college": "IIT Madras",
        "degree": "B.Tech Computer Science",
        "skills": "Python, React, FastAPI, SQL",
        "target_roles": "Software Engineer Intern"
    }
    res = client.put("/profile", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["college"] == "IIT Madras"
    assert data["skills"] == "Python, React, FastAPI, SQL"


def test_parse_resume(client, auth_headers):
    resume = "Passionate developer skilled in Python, React, FastAPI, SQL, Docker. Built microservices."
    res = client.post("/profile/parse-resume", json={"resume_text": resume}, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "Python" in data["extracted_skills"]
    assert "React" in data["extracted_skills"]
