from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from typing import List, Optional, Any, Dict

# Initialize FastAPI
app = FastAPI(title="Corid Lifestyle API", version="1.0.0")

# Configure CORS to allow your JavaScript frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase Client securely on the server
# In a pro-environment, use environment variables (e.g., os.getenv("SUPABASE_URL"))
SUPABASE_URL = "https://zjareduwncregdocmdcc.supabase.co"
SUPABASE_KEY = "sb_publishable_jrbNF-iZe1kSmNrDmQwTdg_Wza_-vQI"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Data Models (Pydantic validates incoming frontend data) ---
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

# --- Endpoints ---

@app.get("/api/products")
async def get_products(category: str = "all"):
    """Fetch brand new products"""
    try:
        query = supabase.table("products").select("*").order("id")
        if category != "all":
            query = query.eq("category", category)
        
        response = query.execute()
        return {"data": response.data, "error": None}
    except Exception as e:
        return {"error": str(e), "data": None}

@app.post("/api/products")
async def create_product(product: Dict[str, Any]):
    """Create a brand new product"""
    try:
        response = supabase.table("products").insert(product).execute()
        return {"message": "Product created successfully", "data": response.data}
    except Exception as e:
        return {"error": str(e), "data": None}

@app.put("/api/products/{product_id}")
async def update_product(product_id: int, product: Dict[str, Any]):
    """Update a brand new product"""
    try:
        response = supabase.table("products").update(product).eq("id", product_id).execute()
        return {"message": "Product updated successfully", "data": response.data}
    except Exception as e:
        return {"error": str(e), "data": None}

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: int):
    """Delete a brand new product"""
    try:
        response = supabase.table("products").delete().eq("id", product_id).execute()
        return {"message": "Product deleted successfully", "data": response.data}
    except Exception as e:
        return {"error": str(e), "data": None}

@app.get("/api/preowned")
async def get_preowned(category: str = "all"):
    """Fetch preowned products"""
    try:
        query = supabase.table("preowned_products").select("*").order("id")
        if category != "all":
            query = query.eq("category", category)
            
        response = query.execute()
        return {"data": response.data, "error": None}
    except Exception as e:
        return {"error": str(e), "data": None}

@app.post("/api/preowned")
async def create_preowned(product: Dict[str, Any]):
    """Create a preowned product"""
    try:
        response = supabase.table("preowned_products").insert(product).execute()
        return {"message": "Preowned product created successfully", "data": response.data}
    except Exception as e:
        return {"error": str(e), "data": None}

@app.put("/api/preowned/{product_id}")
async def update_preowned(product_id: int, product: Dict[str, Any]):
    """Update a preowned product"""
    try:
        response = supabase.table("preowned_products").update(product).eq("id", product_id).execute()
        return {"message": "Preowned product updated successfully", "data": response.data}
    except Exception as e:
        return {"error": str(e), "data": None}

@app.delete("/api/preowned/{product_id}")
async def delete_preowned(product_id: int):
    """Delete a preowned product"""
    try:
        response = supabase.table("preowned_products").delete().eq("id", product_id).execute()
        return {"message": "Preowned product deleted successfully", "data": response.data}
    except Exception as e:
        return {"error": str(e), "data": None}

@app.post("/api/orders")
async def create_order(order: Order):
    """Securely save a new cart order"""
    try:
        response = supabase.table("orders").insert(order.dict()).execute()
        return {"message": "Order created successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/inquiries")
async def create_inquiry(inquiry: Inquiry):
    """Securely save a bulk order inquiry"""
    try:
        response = supabase.table("inquiries").insert(inquiry.dict()).execute()
        return {"message": "Inquiry submitted successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))