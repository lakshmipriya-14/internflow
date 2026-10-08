def test_create_and_update_application(client, auth_headers):
    payload = {
        "company_name": "Google",
        "role_title": "Software Engineering Intern",
        "status": "saved",
        "notes": "Applied on portal"
    }
    res = client.post("/applications", json=payload, headers=auth_headers)
    assert res.status_code == 201
    app_data = res.json()
    assert app_data["company_name"] == "Google"
    app_id = app_data["id"]

    # Update status to interviewing
    update_res = client.put(f"/applications/{app_id}", json={"status": "interviewing"}, headers=auth_headers)
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "interviewing"

    # List applications
    list_res = client.get("/applications", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
