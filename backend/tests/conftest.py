import pytest
from fastapi.testclient import TestClient

from app.db import store
from main import app


@pytest.fixture()
def client():
    store.reset()
    yield TestClient(app)
    store.reset()
