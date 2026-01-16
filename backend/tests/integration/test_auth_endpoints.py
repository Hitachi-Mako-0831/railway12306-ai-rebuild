from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_register_and_login_with_database() -> None:
    username = "testuser_auth"
    password = "Password123"
    id_number = "123456789012345678"

    register_response = client.post(
        "/api/auth/register",
        json={
            "username": username,
            "password": password,
            "confirm_password": password,
            "real_name": "Test User",
            "id_type": "id_card",
            "id_number": id_number,
            "user_type": "adult",
            "phone": "13800138000",
            "email": "test@example.com",
        },
    )
    assert register_response.status_code == 200
    register_body = register_response.json()
    assert register_body["code"] == 0
    assert register_body["data"]["username"] == username

    login_response = client.post(
        "/api/auth/login",
        json={"username": username, "password": password},
    )
    assert login_response.status_code == 200
    login_body = login_response.json()
    assert login_body["code"] == 0
    assert "token" in login_body["data"]
    assert login_body["data"]["user"]["username"] == username


def test_login_wrong_password_returns_business_error() -> None:
    username = "testuser_auth_wrong_pw"
    password = "Password123"
    wrong_password = "Password456"
    id_number = "987654321098765432"

    client.post(
        "/api/auth/register",
        json={
            "username": username,
            "password": password,
            "confirm_password": password,
            "real_name": "Test User",
            "id_type": "id_card",
            "id_number": id_number,
            "user_type": "adult",
            "phone": "13800138001",
            "email": "test2@example.com",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={"username": username, "password": wrong_password},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["code"] != 0


def test_get_profile_returns_basic_info() -> None:
    response = client.get("/api/users/profile")
    assert response.status_code == 200
    body = response.json()
    assert body["code"] == 0
    data = body["data"]
    assert "username" in data
    assert "id_number" in data


def test_update_profile_allows_real_name_change() -> None:
    new_name = "测试用户B"
    response = client.put(
        "/api/users/profile",
        json={"real_name": new_name},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["code"] == 0
    assert body["data"]["real_name"] == new_name

    confirm = client.get("/api/users/profile")
    confirm_body = confirm.json()
    assert confirm_body["data"]["real_name"] == new_name


def test_update_profile_allows_contact_change() -> None:
    new_phone = "13900139000"
    new_email = "student@example.com"
    response = client.put(
        "/api/users/profile",
        json={"phone": new_phone, "email": new_email},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["code"] == 0
    assert body["data"]["phone"] == new_phone
    assert body["data"]["email"] == new_email
