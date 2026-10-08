def test_list_internships(client, auth_headers):
    res = client.get("/internships", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert "match_score" in data[0]


def test_match_internship(client, auth_headers):
    # Set user skills first
    client.put("/profile", json={"skills": "Python, FastAPI, SQL"}, headers=auth_headers)
    
    # Fetch job list to get ID
    internships = client.get("/internships", headers=auth_headers).json()
    job_id = internships[0]["id"]
    
    res = client.post(f"/internships/{job_id}/match", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "match_score" in data
    assert "recommendation" in data
