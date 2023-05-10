from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# test customer short list
def test_customer():
    response = client.get('/customer/', headers={'X-token': 'coneofsilence'})
    assert response.status_code == 200
    assert type(response.json()) == list

def test_customer_not_found():
    response = client.get("/empty/", headers={"X-Token": "coneofsilence"})
    assert response.status_code == 404
    assert response.json() == {"detail": "customer not found"}

def test_customer_input_error():
    response = client.get("/empty'/", headers={"X-Token": "coneofsilence"})
    assert response.status_code == 403
    assert response.json() == {"detail": "customer input invalid"}

def test_customer_input_error_2():
    response = client.get("/empty'/00000000-0000-0000-0000-000000000000/", headers={"X-Token": "coneofsilence"})
    assert response.status_code == 403
    assert response.json() == {"detail": "customer input invalid"}

# test process full list
def test_process():
    response = client.get('/customer/7b2edef3-382c-489c-90f0-bc3d0b69c3fc/', headers={'X-token': 'coneofsilence'})
    assert response.status_code == 200
    assert type(response.json()) == dict

def test_process_not_found():
    response = client.get("/empty/00000000-0000-0000-0000-000000000000/", headers={"X-Token": "coneofsilence"})
    assert response.status_code == 404
    assert response.json() == {"detail": "process not found"}

def test_process_input_error():
    response = client.get("/empty/0000000'-0000-0000-0000-000000000000/", headers={"X-Token": "coneofsilence"})
    assert response.status_code == 403
    assert response.json() == {"detail": "process input invalid"}