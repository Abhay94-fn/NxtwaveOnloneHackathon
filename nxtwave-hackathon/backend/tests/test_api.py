import hashlib
import hmac
import json
import pyotp

from fastapi.testclient import TestClient

from backend.app.main import app, WEBHOOK_SECRET


client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_registration_profile_and_application():
    email = "submission-test@example.com"
    registration = client.post(
        "/api/auth/register",
        json={"name": "Submission Test", "email": email, "password": "password123"},
    )
    assert registration.status_code == 200
    token = registration.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    profile = client.put(
        "/api/profile",
        headers=headers,
        json={
            "name": "Submission Test",
            "email": email,
            "course": "B.Tech Computer Science",
            "year": 2,
            "family_income": 350000,
        },
    )
    assert profile.status_code == 200

    application = client.post(
        "/api/applications",
        headers=headers,
        json={
            "name": "Submission Test",
            "email": email,
            "course": "B.Tech Computer Science",
            "year": 2,
            "family_income": 350000,
            "scheme_id": "national-merit",
        },
    )
    assert application.status_code == 200
    assert application.json()["status"] == "ready_for_review"


def test_webhook_signature_accepts_then_deduplicates():
    body = json.dumps(
        {
            "id": "WH-PYTEST-001",
            "event": "scheme.source.updated",
            "source": "Test",
            "source_url": "https://example.gov.in",
            "data_hash": "pytest-hash",
        },
        separators=(",", ":"),
    ).encode()
    signature = "sha256=" + hmac.new(WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()
    headers = {"Content-Type": "application/json", "X-SevaSetu-Signature": signature}

    accepted = client.post("/api/webhooks/source-update", content=body, headers=headers)
    duplicate = client.post("/api/webhooks/source-update", content=body, headers=headers)

    assert accepted.status_code == 200
    assert accepted.json()["status"] == "accepted"
    assert duplicate.json()["status"] == "duplicate"


def test_personalized_filter():
    response = client.get(
        "/api/schemes",
        params={
            "family_income": 350000,
            "gender": "Female",
            "social_category": "General",
            "course": "B.Tech",
            "percentage_score": 80,
        },
    )
    assert response.status_code == 200
    ids = {scheme["id"] for scheme in response.json()}
    assert "national-merit" in ids
    assert "aicte-pragati" in ids


def test_refresh_and_mfa():
    registration = client.post(
        "/api/auth/register",
        json={"name": "MFA Test", "email": "mfa-test@example.com", "password": "password123"},
    )
    assert registration.status_code == 200
    token = registration.json()["token"]
    refresh_token = registration.json()["refresh_token"]
    headers = {"Authorization": f"Bearer {token}"}

    refreshed = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert refreshed.status_code == 200
    assert refreshed.json()["token"]

    setup = client.post("/api/auth/mfa/setup", headers=headers)
    assert setup.status_code == 200
    secret = setup.json()["secret"]
    code = pyotp.TOTP(secret).now()
    enabled = client.post("/api/auth/mfa/enable", headers=headers, json={"code": code})
    assert enabled.status_code == 200


def test_eligibility_disclaimer_and_application_ownership():
    result = client.post(
        "/api/eligibility",
        json={
            "name": "Accuracy Test",
            "email": "accuracy@example.com",
            "course": "B.Tech Computer Science",
            "year": 2,
            "family_income": 350000,
            "category": "General",
            "gender": "Male",
            "percentage_score": 80,
            "scheme_id": "national-merit",
        },
    )
    assert result.status_code == 200
    assert result.json()["calculation_version"] == "rules-v1"
    assert "official scheme authority" in result.json()["disclaimer"]

    registration = client.post(
        "/api/auth/register",
        json={"name": "Owner Test", "email": "owner-test@example.com", "password": "password123"},
    )
    token = registration.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    application = client.post(
        "/api/applications",
        headers=headers,
        json={
            "name": "Owner Test",
            "email": "owner-test@example.com",
            "course": "B.Tech",
            "year": 2,
            "family_income": 350000,
            "scheme_id": "national-merit",
        },
    )
    assert application.status_code == 200
    application_id = application.json()["id"]
    owned = client.get(f"/api/applications/{application_id}", headers=headers)
    assert owned.status_code == 200
