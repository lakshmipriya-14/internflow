def test_analytics(client, auth_headers):
    # Add an application
    client.post("/applications", json={"company_name": "Tesla", "role_title": "Firmware Intern", "status": "applied"}, headers=auth_headers)

    sum_res = client.get("/analytics/summary", headers=auth_headers)
    assert sum_res.status_code == 200
    sum_data = sum_res.json()
    assert sum_data["total_applications"] >= 1

    gap_res = client.get("/analytics/skill-gaps", headers=auth_headers)
    assert gap_res.status_code == 200
    assert "missing_top_skills" in gap_res.json()
