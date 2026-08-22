from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class DealStatus(str, Enum):
    pending_buyer = "pending_buyer"
    escrowed = "escrowed"
    arbitrating = "arbitrating"
    disputed = "disputed"
    completed = "completed"


class PaymentStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    failed = "failed"


class ArbitrationDecision(str, Enum):
    cumplido = "CUMPLIDO"
    incumplido = "INCUMPLIDO"
    partial = "PARTIAL"


class PayoutStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    failed = "failed"


class WhatsAppAuthRequest(BaseModel):
    whatsapp_number: str
    display_name: Optional[str] = None


class AuthResponse(BaseModel):
    token: str
    user_id: str
    created: bool


class User(BaseModel):
    id: str
    whatsapp_number: str
    wallet_address: Optional[str] = None
    display_name: Optional[str] = None
    rating: Optional[float] = None
    deal_count: int = 0
    created_at: Optional[datetime] = None


class DealCreate(BaseModel):
    service_description: str
    amount_pen: float = Field(gt=0)


class Deal(BaseModel):
    id: str
    seller_id: str
    buyer_id: Optional[str] = None
    service_description: str
    amount_pen: float
    amount_usdt: Optional[float] = None
    status: DealStatus = DealStatus.pending_buyer
    high_value: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class Photo(BaseModel):
    id: str
    deal_id: str
    uploaded_by: str
    ipfs_hash: str
    metadata: dict = Field(default_factory=dict)
    uploaded_at: Optional[datetime] = None


class Payment(BaseModel):
    id: str
    deal_id: str
    kapso_payment_id: str
    amount_pen: float
    status: PaymentStatus = PaymentStatus.pending
    confirmed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class ArbitrationLog(BaseModel):
    id: str
    deal_id: str
    agent_name: str
    status: str = "processing"
    progress: int = 0
    decision: Optional[ArbitrationDecision] = None
    confidence: Optional[int] = None
    reasoning: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class PayoutLog(BaseModel):
    id: str
    deal_id: str
    tx_hash: Optional[str] = None
    amount_usdt: float
    recipient_wallet: str
    status: PayoutStatus = PayoutStatus.pending
    created_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
