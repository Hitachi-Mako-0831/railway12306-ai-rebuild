from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_request_password_recovery_simulated() -> None:
    response = client.post(
        "/api/password-recovery/request",
        json={"account": "user@example.com"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["code"] == 0
    assert body["data"]["account"] == "user@example.com"

