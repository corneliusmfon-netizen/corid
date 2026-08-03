import base64
import hashlib
import hmac
import json
import os
from collections import defaultdict
from time import time
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import Client, create_client

# Load local .env for development. On Vercel, configure the same variables
# in the dashboard (Settings -> Environment Variables) instead.
load_dotenv()

# --- Configuration (from environment variables, never hardcode secrets) ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_URL or SUPABASE_KEY environment variable. "
        "Set them locally in .env and in Vercel (Settings -> Environment Variables)."
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# --- Admin authentication (expiring HMAC token derived from ADMIN_PASSWORD) ---
ADMIN_TOKEN_TTL_SECONDS = 24 * 60 * 60  # sessions last 24h, then re-login required


def _make_admin_token(iat: Optional[int] = None) -> str:
    """Issue a session token: "<issued-at>.<HMAC-SHA256(admin-password, issued-at)>.

    The password is the HMAC key, so tokens can only be minted by someone who
    knows ADMIN_PASSWORD, and they expire after ADMIN_TOKEN_TTL_SECONDS so a
    leaked token cannot be used forever.
    """
    if not ADMIN_PASSWORD:
        return ""
    iat = int(iat or time())
    sig = hmac.new(ADMIN_PASSWORD.encode(), str(iat).encode(), hashlib.sha256).hexdigest()
    return f"{iat}.{sig}"


def _check_admin_token(token: str) -> bool:
    if not ADMIN_PASSWORD or not token:
        return False
    try:
        iat_str, sig = token.split(".", 1)
        iat = int(iat_str)
    except (ValueError, AttributeError):
        return False
    # Reject stale tokens and tokens issued far in the future (clock-skew guard)
    if iat > time() + 300 or time() - iat > ADMIN_TOKEN_TTL_SECONDS:
        return False
    expected = hmac.new(ADMIN_PASSWORD.encode(), str(iat).encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(sig, expected)


def require_admin(authorization: Optional[str] = Header(None)):
    """FastAPI dependency: reject requests without a valid admin Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Admin authentication required")
    token = authorization.split(" ", 1)[1].strip()
    if not _check_admin_token(token):
        raise HTTPException(status_code=401, detail="Invalid or expired admin session. Please log in again.")


def _key_kind(key: str) -> str:
    """Classify the configured Supabase key (helpful for admin warnings)."""
    if key.startswith("sb_secret_"):
        return "secret"
    if key.startswith("sb_publishable_"):
        return "publishable"
    if key.startswith("eyJ"):  # legacy JWT (anon or service_role)
        try:
            payload = key.split(".")[1]
            payload += "=" * (-len(payload) % 4)
            data = json.loads(base64.urlsafe_b64decode(payload))
            role = data.get("role", "")
            if role in ("anon", "service_role"):
                return role
            return f"jwt:{role}" if role else "jwt"
        except Exception:
            return "jwt"
    return "unknown"


# --- Simple in-memory rate limiting (best-effort on serverless) ---
_RATE_LIMITS: Dict[tuple, list] = defaultdict(list)


def _client_ip(request: Request) -> str:
    """Best-effort real client IP: prefer the first X-Forwarded-For hop.

    Behind Vercel's proxy, request.client.host can be a shared edge IP, which
    would rate-limit every visitor together. The first X-Forwarded-For value
    is the original caller, so use it when present.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _rate_limited(scope: str, limit: int, window_seconds: float, request: Request) -> bool:
    """Return True if the caller has exceeded `limit` requests in `window_seconds`.

    Keyed by client IP + scope. In-memory only: on Vercel the API runs as
    serverless instances, so this is best-effort throttling rather than a
    hard guarantee. It still deters casual abuse and brute-force attempts.
    """
    key = (scope, _client_ip(request))
    now = time()
    hits = [t for t in _RATE_LIMITS[key] if now - t < window_seconds]
    _RATE_LIMITS[key] = hits
    if len(hits) >= limit:
        return True
    hits.append(now)
    # Blunt guard against unbounded growth from many unique IPs
    if len(_RATE_LIMITS) > 1000:
        _RATE_LIMITS.clear()
    return False


# --- App + CORS ---
app = FastAPI(title="Corid Lifestyle API", version="1.2.0")

# The frontend talks to this API from any origin. No cookies/sessions are used,
# so credentials stay disabled (making a wildcard origin spec-compliant).
# In production you may restrict origins to your store domain instead of "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Data models (Pydantic validates incoming frontend data) ---
class OrderItem(BaseModel):
    name: str
    size: str
    price: str
    condition: str


class Order(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = ""
    items: List[OrderItem]
    total_items: int
    order_type: str


class Inquiry(BaseModel):
    full_name: str
    email: str
    phone: str
    company: Optional[str] = ""
    category: str
    quantity: int
    details: Optional[str] = ""


class LoginRequest(BaseModel):
    password: str


# --- Public catalog reads ---

@app.get("/api/products")
async def get_products(category: str = "all"):
    """Fetch brand new products (public)."""
    try:
        query = supabase.table("products").select("*").order("id")
        if category != "all":
            query = query.eq("category", category)
        response = query.execute()
        return {"data": response.data, "error": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {e}")


@app.get("/api/preowned")
async def get_preowned(category: str = "all"):
    """Fetch preowned products (public)."""
    try:
        query = supabase.table("preowned_products").select("*").order("id")
        if category != "all":
            query = query.eq("category", category)
        response = query.execute()
        return {"data": response.data, "error": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch preowned products: {e}")


# --- Public customer submissions ---

@app.post("/api/orders")
async def create_order(order: Order, request: Request):
    """Save a new cart order from the storefront (public)."""
    if _rate_limited("orders", limit=10, window_seconds=60, request=request):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again in a minute.")
    try:
        response = supabase.table("orders").insert(order.dict()).execute()
        return {"message": "Order created successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/inquiries")
async def create_inquiry(inquiry: Inquiry, request: Request):
    """Save a bulk order inquiry from the storefront (public)."""
    if _rate_limited("inquiries", limit=10, window_seconds=60, request=request):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again in a minute.")
    try:
        response = supabase.table("inquiries").insert(inquiry.dict()).execute()
        return {"message": "Inquiry submitted successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- Admin authentication ---

@app.post("/api/admin/login")
async def admin_login(login: LoginRequest, request: Request):
    """Verify the admin password and return a session token."""
    if _rate_limited("admin-login", limit=5, window_seconds=60, request=request):
        raise HTTPException(status_code=429, detail="Too many login attempts. Please wait a minute and try again.")
    if not ADMIN_PASSWORD:
        raise HTTPException(
            status_code=503,
            detail="Admin authentication is not configured. Set the ADMIN_PASSWORD environment variable.",
        )
    if not hmac.compare_digest(login.password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"token": _make_admin_token(), "keyKind": _key_kind(SUPABASE_KEY)}


# --- Protected: product / preowned management (admin only) ---

@app.post("/api/products")
async def create_product(product: Dict[str, Any], _admin=Depends(require_admin)):
    """Create a brand new product (admin)."""
    try:
        response = supabase.table("products").insert(product).execute()
        return {"message": "Product created successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/api/products/{product_id}")
async def update_product(product_id: int, product: Dict[str, Any], _admin=Depends(require_admin)):
    """Update a brand new product (admin)."""
    try:
        response = supabase.table("products").update(product).eq("id", product_id).execute()
        return {"message": "Product updated successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/products/{product_id}")
async def delete_product(product_id: int, _admin=Depends(require_admin)):
    """Delete a brand new product (admin)."""
    try:
        response = supabase.table("products").delete().eq("id", product_id).execute()
        return {"message": "Product deleted successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/preowned")
async def create_preowned(product: Dict[str, Any], _admin=Depends(require_admin)):
    """Create a preowned product (admin)."""
    try:
        response = supabase.table("preowned_products").insert(product).execute()
        return {"message": "Preowned product created successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/api/preowned/{product_id}")
async def update_preowned(product_id: int, product: Dict[str, Any], _admin=Depends(require_admin)):
    """Update a preowned product (admin)."""
    try:
        response = supabase.table("preowned_products").update(product).eq("id", product_id).execute()
        return {"message": "Preowned product updated successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/preowned/{product_id}")
async def delete_preowned(product_id: int, _admin=Depends(require_admin)):
    """Delete a preowned product (admin)."""
    try:
        response = supabase.table("preowned_products").delete().eq("id", product_id).execute()
        return {"message": "Preowned product deleted successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- Protected: admin read endpoints (orders / inquiries / customers / reviews) ---

@app.get("/api/orders")
async def get_orders(_admin=Depends(require_admin)):
    """List all orders (admin only)."""
    try:
        response = supabase.table("orders").select("*").order("created_at", desc=True).execute()
        return {"data": response.data, "error": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {e}")


@app.get("/api/inquiries")
async def get_inquiries(_admin=Depends(require_admin)):
    """List all bulk inquiries (admin only)."""
    try:
        response = supabase.table("inquiries").select("*").order("created_at", desc=True).execute()
        return {"data": response.data, "error": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch inquiries: {e}")


@app.get("/api/customers")
async def get_customers(_admin=Depends(require_admin)):
    """List all customers (admin only)."""
    try:
        response = supabase.table("customers").select("*").order("created_at", desc=True).execute()
        return {"data": response.data, "error": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch customers: {e}")


@app.get("/api/reviews")
async def get_reviews(_admin=Depends(require_admin)):
    """List all reviews (admin only)."""
    try:
        response = supabase.table("reviews").select("*").order("created_at", desc=True).execute()
        return {"data": response.data, "error": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch reviews: {e}")
