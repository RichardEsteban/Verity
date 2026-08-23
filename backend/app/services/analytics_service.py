from collections import defaultdict

from app.db import store


def get_earnings(user_id: str) -> dict:
    """Totales en USDT: es lo que el vendedor realmente recibe via PayBot/WDK,
    a diferencia de amount_pen que es el valor pactado del deal en soles."""
    rows = [d for d in store.deals.values() if d["seller_id"] == user_id and d["status"] == "completed"]

    total = sum(row["amount_usdt"] for row in rows)
    deals_count = len(rows)
    avg_per_deal = round(total / deals_count, 2) if deals_count else 0.0

    by_month: dict[str, float] = defaultdict(float)
    for row in rows:
        if not row.get("completed_at"):
            continue
        month = row["completed_at"][:7]
        by_month[month] += row["amount_usdt"]

    return {
        "total": total,
        "deals_count": deals_count,
        "avg_per_deal": avg_per_deal,
        "data": [{"month": month, "earnings": earnings} for month, earnings in sorted(by_month.items())],
    }


def get_stats(user_id: str) -> dict:
    completed = [d for d in store.deals.values() if d["seller_id"] == user_id and d["status"] == "completed"]
    user = store.users.get(user_id)
    return {
        "total_earned": sum(d["amount_usdt"] for d in completed),
        "deals_completed": len(completed),
        "rating": user["rating"] if user else None,
    }


def get_timeline(user_id: str) -> list[dict]:
    rows = [d for d in store.deals.values() if d["seller_id"] == user_id]
    rows.sort(key=lambda d: d["created_at"], reverse=True)
    return [
        {
            "date": row["created_at"],
            "event": row["service_description"],
            "amount": row["amount_pen"],
            "status": row["status"],
        }
        for row in rows
    ]
