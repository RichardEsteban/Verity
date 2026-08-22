def _auth_headers(client, whatsapp_number="+51999999999"):
    response = client.post("/api/auth/whatsapp", json={"whatsapp_number": whatsapp_number, "display_name": "Juan"})
    assert response.status_code == 200
    token = response.json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_full_deal_flow_with_photo_gets_paid(client):
    headers = _auth_headers(client)

    create = client.post(
        "/api/deals/create", json={"service_description": "Reparar caneria", "amount_pen": 150}, headers=headers
    )
    assert create.status_code == 200
    deal_id = create.json()["deal_id"]

    webhook = client.post(
        "/api/kapso/webhook",
        json={"deal_id": deal_id, "amount": 150, "status": "confirmed", "payment_id": "kapso_test_1"},
    )
    assert webhook.status_code == 200

    deal_after_payment = client.get(f"/api/deals/{deal_id}").json()
    assert deal_after_payment["status"] == "escrowed"

    photo_bytes = b"fake-photo-content"
    upload = client.post(
        f"/api/deals/{deal_id}/upload-photo",
        files={"photo": ("after.jpg", photo_bytes, "image/jpeg")},
        headers=headers,
    )
    assert upload.status_code == 200
    assert upload.json()["ipfs_hash"].startswith("Qm")

    arbitration = client.post(f"/api/arbitrage/{deal_id}/start")
    assert arbitration.status_code == 200
    result = arbitration.json()
    assert result["decision"] == "CUMPLIDO"
    assert result["status"] == "completed"
    assert result["payout"]["status"] == "confirmed"
    assert result["payout"]["tx_hash"].startswith("0x")

    status = client.get(f"/api/arbitrage/{deal_id}/status").json()
    assert status["agents"]["gemini"]["decision"] == "CUMPLIDO"
    assert status["consensus"]["decision"] == "CUMPLIDO"

    earnings = client.get("/api/analytics/earnings", headers=headers).json()
    assert earnings["deals_count"] == 1
    assert earnings["total"] == 150


def test_deal_without_photo_gets_disputed_and_not_paid(client):
    headers = _auth_headers(client, whatsapp_number="+51988888888")

    create = client.post(
        "/api/deals/create", json={"service_description": "Pintar fachada", "amount_pen": 300}, headers=headers
    )
    deal_id = create.json()["deal_id"]

    client.post(
        "/api/kapso/webhook",
        json={"deal_id": deal_id, "amount": 300, "status": "confirmed", "payment_id": "kapso_test_2"},
    )

    arbitration = client.post(f"/api/arbitrage/{deal_id}/start")
    assert arbitration.status_code == 200
    result = arbitration.json()
    assert result["decision"] == "INCUMPLIDO"
    assert result["status"] == "disputed"
    assert result["payout"] is None


def test_cannot_arbitrate_before_payment(client):
    headers = _auth_headers(client)
    create = client.post(
        "/api/deals/create", json={"service_description": "Instalar cerradura", "amount_pen": 80}, headers=headers
    )
    deal_id = create.json()["deal_id"]

    arbitration = client.post(f"/api/arbitrage/{deal_id}/start")
    assert arbitration.status_code == 400
