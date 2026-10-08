from datetime import timedelta

from app.core.security import create_access_token, hash_password, verify_password

from conftest import USER


# ---------- Registration ----------

def test_register_success(client):
    response = client.post("/auth/register", json=USER)
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == USER["email"]
    assert body["full_name"] == USER["full_name"]
    assert body["is_active"] is True
    assert "id" in body
    assert "password" not in body
    assert "password_hash" not in body


def test_register_duplicate_email_is_rejected(client, registered_user):
    response = client.post("/auth/register", json=USER)
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "email_already_registered"


def test_register_duplicate_email_is_case_insensitive(client, registered_user):
    payload = {**USER, "email": USER["email"].upper()}
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 409


def test_register_weak_password_is_rejected(client):
    response = client.post("/auth/register", json={**USER, "password": "onlyletters"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_register_short_password_is_rejected(client):
    response = client.post("/auth/register", json={**USER, "password": "a1"})
    assert response.status_code == 422


def test_register_invalid_email_is_rejected(client):
    response = client.post("/auth/register", json={**USER, "email": "not-an-email"})
    assert response.status_code == 422


# ---------- Login ----------

def test_login_success(client, registered_user):
    response = client.post(
        "/auth/login", json={"email": USER["email"], "password": USER["password"]}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["expires_in"] > 0
    assert body["user"]["email"] == USER["email"]


def test_login_is_case_insensitive_on_email(client, registered_user):
    response = client.post(
        "/auth/login", json={"email": USER["email"].upper(), "password": USER["password"]}
    )
    assert response.status_code == 200


def test_login_wrong_password(client, registered_user):
    response = client.post(
        "/auth/login", json={"email": USER["email"], "password": "WrongPass999"}
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "invalid_credentials"


def test_login_unknown_email(client):
    response = client.post(
        "/auth/login", json={"email": "nobody@gmail.com", "password": "Whatever123"}
    )
    assert response.status_code == 401
    assert response.json()["error"]["message"] == "Incorrect email or password."


def test_swagger_form_login(client, registered_user):
    response = client.post(
        "/auth/token", data={"username": USER["email"], "password": USER["password"]}
    )
    assert response.status_code == 200
    assert response.json()["access_token"]


# ---------- Protected routes ----------

def test_me_without_token_is_rejected(client):
    response = client.get("/auth/me")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "http_error"


def test_me_with_valid_token(client, auth_headers):
    response = client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == USER["email"]


def test_me_with_garbage_token_is_rejected(client):
    response = client.get("/auth/me", headers={"Authorization": "Bearer not.a.token"})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "invalid_token"


def test_me_with_expired_token_is_rejected(client, registered_user):
    expired = create_access_token(1, expires_delta=timedelta(seconds=-5))
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {expired}"})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "invalid_token"


def test_me_with_token_for_deleted_user_is_rejected(client):
    token = create_access_token(9999)
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


# ---------- Security helpers ----------

def test_password_hashing_roundtrip():
    hashed = hash_password("Strong123")
    assert hashed != "Strong123"
    assert verify_password("Strong123", hashed)
    assert not verify_password("Wrong123", hashed)
