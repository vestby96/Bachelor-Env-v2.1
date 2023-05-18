from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# 1
def test_customer():
    response = client.get('/customer/', headers={'X-token': 'coneofsilence'})
    assert response.status_code == 200, f'Expected status code: 200, but got {response.status_code}'
    assert type(response.json()) == list, f'Expected type: list, but got {type(response.json())}'
# 2
def test_customer_not_found():
    response = client.get("/empty/", headers={"X-Token": "coneofsilence"})
    assert response.status_code == 404, f'Expected status code: 404, but got {response.status_code}'
    assert response.json() == {"detail": "customer not found"}, f'Expected response: "customer not found", but got {response.json()}'
# 3
def test_customer_input_error():
    response = client.get("/empty'/", headers={"X-Token": "coneofsilence"})
    assert response.status_code == 403, f'Expected status code: 403, but got {response.status_code}'
    assert response.json() == {"detail": "customer input invalid"}, f'Expected response: "customer input invalid", but got {response.json()}'
# 4
def test_customer_input_error_2():
    response = client.get("/empty'/00000000-0000-0000-0000-000000000000/", headers={"X-Token": "coneofsilence"})
    assert response.status_code == 403, f'Expected status code: 403, but got {response.status_code}'
    assert response.json() == {"detail": "customer input invalid"}, f'Expected response: "customer input invalid", but got {response.json()}'
# 5
def test_process():
    response = client.get('/customer/7b2edef3-382c-489c-90f0-bc3d0b69c3fc/', headers={'X-token': 'coneofsilence'})
    assert response.status_code == 200, f'Expected status code: 200, but got {response.status_code}'
    assert type(response.json()) == dict, f'Expected type: dict, but got {type(response.json())}'
# 6
def test_process_not_found():
    response = client.get("/empty/00000000-0000-0000-0000-000000000000/", headers={"X-Token": "coneofsilence"})
    assert response.status_code == 404, f'Expected status code: 404, but got {response.status_code}'
    assert response.json() == {"detail": "process not found"}, f'Expected response: "process not found", but got {response.json()}'
# 7
def test_process_input_error():
    response = client.get("/empty/0000000'-0000-0000-0000-000000000000/", headers={"X-Token": "coneofsilence"})
    assert response.status_code == 403, f'Expected status code: 403, but got {response.status_code}'
    assert response.json() == {"detail": "process input invalid"}, f'Expected response: "process input invalid", but got {response.json()}'
# 8
def test_process_input_error_2():
    response = client.get("/empty/0000000-0000-0000-0000-000000000000/", headers={"X-Token": "coneofsilence"})
    assert response.status_code == 403, f'Expected status code: 403, but got {response.status_code}'
    assert response.json() == {"detail": "process input invalid"}, f'Expected response: "process input invalid", but got {response.json()}'