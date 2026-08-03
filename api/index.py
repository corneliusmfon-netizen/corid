import base64
import hashlib
import hmac
import json
import os
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
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


# --- Admin authentication (HMAC token derived from ADMIN_PASSWORD) ---
def _make_admin_token() -> str:
    """Derive a stable session token from ADMIN_PASSWORD using HMAC-SHA256."""
    if not ADMIN_PASSWORD:
        return ""
    return hmac.new(b"corid-admin-session", ADMIN_PASSWORD.encode(), hashlib.sha256).hexdigest()


def _check_admin_token(token: str) -> bool:
    if not ADMIN_PASSWORD or not token:
        return False
    return hmac.compare_digest(token, _make_admin_token())


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


# --- App + CORS ---
app = FastAPI(title="Corid Lifestyle API", version="1.1.0")

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
async def create_order(order: Order):
    """Save a new cart order from the storefront (public)."""
    try:
        response = supabase.table("orders").insert(order.dict()).execute()
        return {"message": "Order created successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/inquiries")
async def create_inquiry(inquiry: Inquiry):
    """Save a bulk order inquiry from the storefront (public)."""
    try:
        response = supabase.table("inquiries").insert(inquiry.dict()).execute()
        return {"message": "Inquiry submitted successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- Admin authentication ---

@app.post("/api/admin/login")
async def admin_login(login: LoginRequest):
    """Verify the admin password and return a session token."""
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
