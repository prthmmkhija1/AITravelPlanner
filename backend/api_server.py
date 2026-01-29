"""
FastAPI Server for AI Travel Planner
"""

import os
import json
import asyncio
from typing import Optional, List, Dict, Set
from fastapi import FastAPI, HTTPException, Header, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import datetime

# Import PDF generator
try:
    from pdf_generator import generate_trip_pdf
    PDF_AVAILABLE = True
except ImportError as e:
    PDF_AVAILABLE = False
    print(f"⚠️ PDF generator not available: {e}")

# Import database and auth
try:
    from database import (
        init_database, create_trip, get_user_trips, update_trip, delete_trip,
        create_budget, get_user_budgets, add_budget_transaction, get_budget_summary,
        get_budget_transactions
    )
    from auth import (
        register_user, login_user, logout_user, get_current_user, require_auth,
        update_user_profile, change_password
    )
    from notification_service import (
        NotificationService, PriceAlertService, LiveTrackingService,
        start_price_monitor, stop_price_monitor
    )
    DB_AVAILABLE = True
except ImportError as e:
    DB_AVAILABLE = False
    print(f"⚠️ Database/Auth not available: {e}")

# Load environment variables
load_dotenv()

# Import the travel agent
try:
    from agent import TravelPlanningAgent, create_agent
    AGENT_AVAILABLE = True
except ImportError as e:
    AGENT_AVAILABLE = False
    print(f"⚠️ Agent not available: {e}")

# Import real API tools for direct endpoints
try:
    from real_flight_api import search_flights_live_api
    from real_hotel_api import search_hotels_live_api
    from real_activities_api import search_activities_live_api
    APIS_AVAILABLE = True
except ImportError as e:
    APIS_AVAILABLE = False
    print(f"⚠️ Real APIs not available: {e}")

# Import flight tracking (uses existing Amadeus credentials)
try:
    from flight_tracking import (
        get_flight_status, get_delay_prediction, search_route_flights
    )
    FLIGHT_TRACKING_AVAILABLE = True
except ImportError as e:
    FLIGHT_TRACKING_AVAILABLE = False
    print(f"⚠️ Flight tracking not available: {e}")

# Initialize FastAPI app
app = FastAPI(
    title="AI Travel Planner API",
    description="🌍 AI-powered travel planning with REAL-TIME APIs (Amadeus, Hotels.com, Foursquare)",
    version="2.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class PlanTripRequest(BaseModel):
    request: str

class FlightSearchRequest(BaseModel):
    source: str
    destination: str
    date: Optional[str] = None
    passengers: Optional[int] = 1
    travel_class: Optional[str] = "ECONOMY"

class HotelSearchRequest(BaseModel):
    city: str
    checkin: Optional[str] = None
    checkout: Optional[str] = None
    adults: Optional[int] = 2
    rooms: Optional[int] = 1
    max_price: Optional[float] = None

class ActivitySearchRequest(BaseModel):
    city: str
    type: Optional[str] = "tourist_attraction"
    limit: Optional[int] = 10

class WeatherRequest(BaseModel):
    city: str
    days: Optional[int] = 7

class PDFGenerateRequest(BaseModel):
    trip_plan: str
    user_request: str

# Auth Models
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    preferences: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

# Trip Models
class SaveTripRequest(BaseModel):
    destination: str
    trip_plan: str
    user_request: str
    source: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    travelers: Optional[int] = 1

class UpdateTripRequest(BaseModel):
    destination: Optional[str] = None
    status: Optional[str] = None
    rating: Optional[int] = None

# Budget Models
class CreateBudgetRequest(BaseModel):
    category: str
    planned_amount: float
    trip_id: Optional[int] = None
    notes: Optional[str] = None

class AddTransactionRequest(BaseModel):
    budget_id: int
    amount: float
    description: Optional[str] = None
    transaction_type: Optional[str] = "expense"

# Notification Models
class CreatePriceAlertRequest(BaseModel):
    alert_type: str
    search_params: dict
    initial_price: float
    target_price: Optional[float] = None

# Global agent instance
_agent = None

def get_agent():
    global _agent
    if _agent is None and AGENT_AVAILABLE:
        try:
            _agent = create_agent()
        except Exception as e:
            print(f"Failed to create agent: {e}")
            return None
    return _agent


# =============================================================================
# API ENDPOINTS
# =============================================================================

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "agent_available": AGENT_AVAILABLE,
        "apis_available": APIS_AVAILABLE,
        "groq_key_set": bool(os.getenv("GROQ_API_KEY")),
        "amadeus_key_set": bool(os.getenv("AMADEUS_API_KEY")),
        "rapidapi_key_set": bool(os.getenv("RAPIDAPI_KEY")),
        "foursquare_key_set": bool(os.getenv("FOURSQUARE_API_KEY"))
    }


@app.post("/api/plan")
async def plan_trip(request: PlanTripRequest):
    """
    🤖 AI Trip Planning Endpoint
    Uses LangChain agent to autonomously plan trips with real APIs
    """
    if not request.request.strip():
        raise HTTPException(status_code=400, detail="Missing request")
    
    agent = get_agent()
    if not agent:
        raise HTTPException(
            status_code=503, 
            detail="Agent not available. Check GROQ_API_KEY in .env"
        )
    
    try:
        result = agent.plan_trip(request.request)
        return result
    except Exception as e:
        return {
            "status": "error",
            "error_message": str(e),
            "trip_plan": None
        }


@app.post("/api/flights")
async def search_flights(request: FlightSearchRequest):
    """
    ✈️ Direct Flight Search Endpoint
    Uses Amadeus API for real-time flight prices
    """
    if not APIS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Flight API not available")
    
    try:
        import json
        result = search_flights_live_api(
            origin=request.source,
            destination=request.destination,
            departure_date=request.date or "",
            passengers=request.passengers,
            travel_class=request.travel_class
        )
        return json.loads(result)
    except Exception as e:
        return {"status": "error", "error_message": str(e)}


@app.post("/api/hotels")
async def search_hotels(request: HotelSearchRequest):
    """
    🏨 Direct Hotel Search Endpoint
    Uses Hotels.com/RapidAPI for real-time hotel rates
    """
    if not APIS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Hotel API not available")
    
    try:
        import json
        result = search_hotels_live_api(
            city=request.city,
            checkin_date=request.checkin or "",
            checkout_date=request.checkout or "",
            adults=request.adults,
            rooms=request.rooms,
            max_price=request.max_price
        )
        return json.loads(result)
    except Exception as e:
        return {"status": "error", "error_message": str(e)}


@app.post("/api/activities")
async def search_activities(request: ActivitySearchRequest):
    """
    🎯 Direct Activities Search Endpoint
    Uses Foursquare API for real-time attraction data
    """
    if not APIS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Activities API not available")
    
    try:
        import json
        result = search_activities_live_api(
            city=request.city,
            activity_type=request.type,
            max_budget=10000  # Default budget
        )
        return json.loads(result)
    except Exception as e:
        return {"status": "error", "error_message": str(e)}


@app.post("/api/weather")
async def get_weather(request: WeatherRequest):
    """
    🌤️ Weather Forecast Endpoint
    Uses OpenWeather/Open-Meteo for weather data
    """
    import requests
    import json
    
    # City coordinates
    city_coords = {
        "goa": (15.2993, 74.124),
        "jaipur": (26.9124, 75.7873),
        "mumbai": (19.076, 72.8777),
        "bangalore": (12.9716, 77.5946),
        "kerala": (10.8505, 76.2711),
        "delhi": (28.7041, 77.1025),
        "chennai": (13.0827, 80.2707),
        "kolkata": (22.5726, 88.3639),
        "hyderabad": (17.385, 78.4867),
        "pune": (18.5204, 73.8567),
    }
    
    weather_desc = {
        0: "Clear sky ☀️",
        1: "Mainly clear 🌤️",
        2: "Partly cloudy ⛅",
        3: "Overcast ☁️",
        45: "Foggy 🌫️",
        51: "Light drizzle 🌧️",
        61: "Slight rain 🌧️",
        63: "Moderate rain 🌧️",
        65: "Heavy rain ⛈️",
        95: "Thunderstorm ⛈️"
    }
    
    city_key = request.city.lower()
    coords = city_coords.get(city_key)
    
    if not coords:
        # Try OpenWeather API
        api_key = os.getenv("OPENWEATHER_API_KEY")
        if api_key:
            try:
                url = f"https://api.openweathermap.org/data/2.5/forecast?q={request.city},IN&appid={api_key}&units=metric"
                resp = requests.get(url, timeout=10)
                if resp.ok:
                    data = resp.json()
                    forecasts = data.get("list", [])[:request.days * 8]
                    daily = []
                    for i in range(0, len(forecasts), 8):
                        day = forecasts[i]
                        daily.append({
                            "date": day.get("dt_txt", "").split(" ")[0],
                            "max_temp_c": round(day["main"]["temp_max"]),
                            "min_temp_c": round(day["main"]["temp_min"]),
                            "condition": day["weather"][0]["description"],
                            "humidity": day["main"]["humidity"]
                        })
                    return {
                        "status": "success",
                        "data_source": "🔴 LIVE - OpenWeather API",
                        "city": request.city,
                        "forecast": daily[:request.days]
                    }
            except Exception:
                pass
        
        return {
            "status": "error",
            "message": f"Weather data not available for {request.city}",
            "supported_cities": list(city_coords.keys())
        }
    
    # Use Open-Meteo (free, no API key needed)
    lat, lon = coords
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&forecast_days={min(request.days, 7)}"
        resp = requests.get(url, timeout=10)
        data = resp.json()
        
        daily = data.get("daily", {})
        dates = daily.get("time", [])
        max_temps = daily.get("temperature_2m_max", [])
        min_temps = daily.get("temperature_2m_min", [])
        precip = daily.get("precipitation_sum", [])
        codes = daily.get("weathercode", [])
        
        forecast = []
        for i, date in enumerate(dates):
            forecast.append({
                "date": date,
                "max_temp_c": round(max_temps[i]) if i < len(max_temps) else None,
                "min_temp_c": round(min_temps[i]) if i < len(min_temps) else None,
                "precipitation_mm": round(precip[i], 1) if i < len(precip) else None,
                "condition": weather_desc.get(codes[i], "Unknown") if i < len(codes) else "Unknown"
            })
        
        return {
            "status": "success",
            "data_source": "🔴 LIVE - Open-Meteo API",
            "city": request.city,
            "forecast": forecast
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/api/generate-pdf")
async def generate_pdf(request: PDFGenerateRequest):
    """
    📄 PDF Generation Endpoint
    Generates a professionally formatted PDF from the trip plan
    """
    if not PDF_AVAILABLE:
        raise HTTPException(status_code=503, detail="PDF generator not available. Install reportlab: pip install reportlab")
    
    if not request.trip_plan or not request.trip_plan.strip():
        raise HTTPException(status_code=400, detail="Trip plan cannot be empty")
    
    try:
        # Generate PDF
        pdf_path = generate_trip_pdf(
            trip_plan=request.trip_plan,
            user_request=request.user_request or "Travel Plan"
        )
        
        # Return the PDF file
        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename="trip_itinerary.pdf",
            headers={
                "Content-Disposition": "attachment; filename=trip_itinerary.pdf"
            }
        )
    except Exception as e:
        return {"status": "error", "error_message": str(e)}


@app.get("/api/status")
async def api_status():
    """
    📊 Check status of all integrated APIs
    """
    return {
        "status": "ok",
        "apis": {
            "amadeus_flights": {
                "status": "✅ Active" if os.getenv("AMADEUS_API_KEY") else "❌ No API Key",
                "description": "Live flight search (2000 calls/month FREE)"
            },
            "hotels_com": {
                "status": "✅ Active" if os.getenv("RAPIDAPI_KEY") else "❌ No API Key",
                "description": "Live hotel search (500 calls/month FREE)"
            },
            "foursquare": {
                "status": "✅ Active" if os.getenv("FOURSQUARE_API_KEY") else "❌ No API Key",
                "description": "Live activities (1000 calls/day FREE)"
            },
            "openweather": {
                "status": "✅ Active" if os.getenv("OPENWEATHER_API_KEY") else "❌ No API Key",
                "description": "Weather forecast (1000 calls/day FREE)"
            },
            "groq_llm": {
                "status": "✅ Active" if os.getenv("GROQ_API_KEY") else "❌ No API Key",
                "description": "AI Agent (Groq LLM)"
            }
        },
        "database_available": DB_AVAILABLE if 'DB_AVAILABLE' in dir() else False,
        "all_apis_free": True,
        "no_credit_card_required": True
    }


# =============================================================================
# AUTHENTICATION ENDPOINTS
# =============================================================================

@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    """📝 Register a new user"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    return register_user(request.email, request.password, request.name, request.phone)


@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """🔐 Login user"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    return login_user(request.email, request.password)


@app.post("/api/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """🚪 Logout user"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    if authorization:
        token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
        return logout_user(token)
    return {"status": "success", "message": "Logged out"}


@app.get("/api/auth/me")
async def get_me(authorization: Optional[str] = Header(None)):
    """👤 Get current user profile"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"status": "success", "user": user}


@app.put("/api/auth/profile")
async def update_profile(request: UpdateProfileRequest, authorization: Optional[str] = Header(None)):
    """✏️ Update user profile"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    updates = {}
    if request.name:
        updates['name'] = request.name
    if request.phone:
        updates['phone'] = request.phone
    if request.preferences:
        updates['preferences'] = request.preferences
    
    return update_user_profile(user['id'], **updates)


@app.post("/api/auth/change-password")
async def api_change_password(request: ChangePasswordRequest, authorization: Optional[str] = Header(None)):
    """🔑 Change password"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return change_password(user['id'], request.old_password, request.new_password)


# =============================================================================
# TRIP MANAGEMENT ENDPOINTS
# =============================================================================

@app.post("/api/trips")
async def save_trip(request: SaveTripRequest, authorization: Optional[str] = Header(None)):
    """💾 Save a trip"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    trip_id = create_trip(
        user_id=user['id'],
        destination=request.destination,
        trip_plan=request.trip_plan,
        user_request=request.user_request,
        source=request.source,
        start_date=request.start_date,
        end_date=request.end_date,
        travelers=request.travelers
    )
    return {"status": "success", "trip_id": trip_id, "message": "Trip saved successfully"}


@app.get("/api/trips")
async def get_trips(status: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """📋 Get user's trips"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    trips = get_user_trips(user['id'], status)
    return {"status": "success", "trips": trips}


@app.put("/api/trips/{trip_id}")
async def api_update_trip(trip_id: int, request: UpdateTripRequest, authorization: Optional[str] = Header(None)):
    """✏️ Update a trip"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    updates = {}
    if request.destination:
        updates['destination'] = request.destination
    if request.status:
        updates['status'] = request.status
    if request.rating:
        updates['rating'] = request.rating
    
    success = update_trip(trip_id, user['id'], **updates)
    if success:
        return {"status": "success", "message": "Trip updated"}
    raise HTTPException(status_code=404, detail="Trip not found")


@app.delete("/api/trips/{trip_id}")
async def api_delete_trip(trip_id: int, authorization: Optional[str] = Header(None)):
    """🗑️ Delete a trip"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    success = delete_trip(trip_id, user['id'])
    if success:
        return {"status": "success", "message": "Trip deleted"}
    raise HTTPException(status_code=404, detail="Trip not found")


# =============================================================================
# BUDGET TRACKING ENDPOINTS
# =============================================================================

@app.post("/api/budgets")
async def api_create_budget(request: CreateBudgetRequest, authorization: Optional[str] = Header(None)):
    """💰 Create a budget"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    budget_id = create_budget(
        user_id=user['id'],
        category=request.category,
        planned_amount=request.planned_amount,
        trip_id=request.trip_id,
        notes=request.notes
    )
    return {"status": "success", "budget_id": budget_id}


@app.get("/api/budgets")
async def api_get_budgets(trip_id: Optional[int] = None, authorization: Optional[str] = Header(None)):
    """📊 Get user's budgets"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    budgets = get_user_budgets(user['id'], trip_id)
    return {"status": "success", "budgets": budgets}


@app.get("/api/budgets/summary")
async def api_budget_summary(authorization: Optional[str] = Header(None)):
    """📈 Get budget summary"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    summary = get_budget_summary(user['id'])
    return {"status": "success", "summary": summary}


@app.post("/api/budgets/transactions")
async def api_add_transaction(request: AddTransactionRequest, authorization: Optional[str] = Header(None)):
    """💳 Add a budget transaction"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    transaction_id = add_budget_transaction(
        budget_id=request.budget_id,
        amount=request.amount,
        description=request.description,
        transaction_type=request.transaction_type
    )
    return {"status": "success", "transaction_id": transaction_id}


@app.get("/api/budgets/{budget_id}/transactions")
async def api_get_transactions(budget_id: int, authorization: Optional[str] = Header(None)):
    """📝 Get budget transactions"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    transactions = get_budget_transactions(budget_id)
    return {"status": "success", "transactions": transactions}


# =============================================================================
# NOTIFICATION ENDPOINTS
# =============================================================================

@app.get("/api/notifications")
async def api_get_notifications(unread_only: bool = False, authorization: Optional[str] = Header(None)):
    """🔔 Get user notifications"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    notifications = NotificationService.get_notifications(user['id'], unread_only)
    unread_count = NotificationService.get_unread_count(user['id'])
    return {"status": "success", "notifications": notifications, "unread_count": unread_count}


@app.put("/api/notifications/{notification_id}/read")
async def api_mark_notification_read(notification_id: int, authorization: Optional[str] = Header(None)):
    """✅ Mark notification as read"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    success = NotificationService.mark_read(notification_id, user['id'])
    return {"status": "success" if success else "error"}


@app.put("/api/notifications/read-all")
async def api_mark_all_read(authorization: Optional[str] = Header(None)):
    """✅ Mark all notifications as read"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    count = NotificationService.mark_all_read(user['id'])
    return {"status": "success", "marked_count": count}


# =============================================================================
# PRICE ALERT ENDPOINTS
# =============================================================================

@app.post("/api/price-alerts")
async def api_create_price_alert(request: CreatePriceAlertRequest, authorization: Optional[str] = Header(None)):
    """🔔 Create a price alert"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = PriceAlertService.create_alert(
        user_id=user['id'],
        alert_type=request.alert_type,
        search_params=request.search_params,
        initial_price=request.initial_price,
        target_price=request.target_price
    )
    return result


@app.get("/api/price-alerts")
async def api_get_price_alerts(authorization: Optional[str] = Header(None)):
    """📋 Get active price alerts"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    alerts = PriceAlertService.get_alerts(user['id'])
    return {"status": "success", "alerts": alerts}


@app.delete("/api/price-alerts/{alert_id}")
async def api_cancel_price_alert(alert_id: int, authorization: Optional[str] = Header(None)):
    """❌ Cancel a price alert"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return PriceAlertService.cancel_alert(alert_id, user['id'])


@app.post("/api/price-monitor/start")
async def api_start_price_monitor():
    """▶️ Start price monitoring background task"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    return start_price_monitor()


@app.post("/api/price-monitor/stop")
async def api_stop_price_monitor():
    """⏹️ Stop price monitoring background task"""
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    return stop_price_monitor()


# =============================================================================
# FLIGHT TRACKING (Uses existing Amadeus API - FREE)
# =============================================================================

class FlightStatusRequest(BaseModel):
    carrier_code: str  # e.g., 'AI' for Air India
    flight_number: str  # e.g., '101'
    date: Optional[str] = None  # YYYY-MM-DD format


class RouteFlightsRequest(BaseModel):
    origin: str  # IATA code e.g., 'DEL'
    destination: str  # IATA code e.g., 'BOM'
    date: Optional[str] = None


@app.post("/api/flights/status")
async def api_get_flight_status(request: FlightStatusRequest):
    """
    ✈️ Get real-time flight status using Amadeus API.
    
    Example: carrier_code='AI', flight_number='101', date='2026-02-01'
    """
    if not FLIGHT_TRACKING_AVAILABLE:
        raise HTTPException(status_code=503, detail="Flight tracking not available")
    
    result = get_flight_status(
        request.carrier_code, 
        request.flight_number,
        request.date
    )
    return result


@app.get("/api/flights/{carrier_code}/{flight_number}/status")
async def api_get_flight_status_path(
    carrier_code: str, 
    flight_number: str, 
    date: Optional[str] = None
):
    """
    ✈️ Get flight status by path parameters.
    
    Example: GET /api/flights/AI/101/status?date=2026-02-01
    """
    if not FLIGHT_TRACKING_AVAILABLE:
        raise HTTPException(status_code=503, detail="Flight tracking not available")
    
    return get_flight_status(carrier_code, flight_number, date)


@app.post("/api/flights/delay-prediction")
async def api_get_delay_prediction(request: RouteFlightsRequest):
    """
    ⏰ Get delay predictions for a route.
    
    Uses Amadeus AI to predict likelihood of delays.
    """
    if not FLIGHT_TRACKING_AVAILABLE:
        raise HTTPException(status_code=503, detail="Flight tracking not available")
    
    return get_delay_prediction(request.origin, request.destination, request.date)


@app.post("/api/flights/route")
async def api_search_route_flights(request: RouteFlightsRequest):
    """
    🔍 Search all flights on a route for a given date.
    
    Returns all scheduled flights between two airports.
    """
    if not FLIGHT_TRACKING_AVAILABLE:
        raise HTTPException(status_code=503, detail="Flight tracking not available")
    
    return search_route_flights(request.origin, request.destination, request.date)


@app.get("/api/flights/airlines")
async def api_get_airline_codes():
    """
    📋 Get list of common airline IATA codes.
    """
    return {
        "airlines": [
            {"code": "AI", "name": "Air India", "country": "India"},
            {"code": "6E", "name": "IndiGo", "country": "India"},
            {"code": "SG", "name": "SpiceJet", "country": "India"},
            {"code": "UK", "name": "Vistara", "country": "India"},
            {"code": "G8", "name": "Go First", "country": "India"},
            {"code": "I5", "name": "AirAsia India", "country": "India"},
            {"code": "QP", "name": "Akasa Air", "country": "India"},
            {"code": "EK", "name": "Emirates", "country": "UAE"},
            {"code": "QR", "name": "Qatar Airways", "country": "Qatar"},
            {"code": "SQ", "name": "Singapore Airlines", "country": "Singapore"},
            {"code": "TG", "name": "Thai Airways", "country": "Thailand"},
            {"code": "BA", "name": "British Airways", "country": "UK"},
            {"code": "LH", "name": "Lufthansa", "country": "Germany"},
            {"code": "AF", "name": "Air France", "country": "France"},
        ]
    }


# =============================================================================
# WEBSOCKET MANAGER - Real-time Communication (FREE - Built into FastAPI)
# =============================================================================

class ConnectionManager:
    """
    Manages WebSocket connections for real-time updates.
    No external API required - uses FastAPI's built-in WebSocket support.
    """
    
    def __init__(self):
        # Store connections by channel (e.g., "trip_123", "alerts_user456")
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Store user locations for trip tracking
        self.location_history: Dict[str, List[dict]] = {}
    
    async def connect(self, websocket: WebSocket, channel: str):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)
        print(f"🔌 WebSocket connected to channel: {channel}")
    
    def disconnect(self, websocket: WebSocket, channel: str):
        """Remove a WebSocket connection"""
        if channel in self.active_connections:
            self.active_connections[channel].discard(websocket)
            if not self.active_connections[channel]:
                del self.active_connections[channel]
        print(f"🔌 WebSocket disconnected from channel: {channel}")
    
    async def send_personal(self, websocket: WebSocket, message: dict):
        """Send message to a specific connection"""
        await websocket.send_json(message)
    
    async def broadcast(self, channel: str, message: dict):
        """Broadcast message to all connections in a channel"""
        if channel in self.active_connections:
            disconnected = []
            for connection in self.active_connections[channel]:
                try:
                    await connection.send_json(message)
                except:
                    disconnected.append(connection)
            # Clean up disconnected clients
            for conn in disconnected:
                self.active_connections[channel].discard(conn)
    
    async def broadcast_all(self, message: dict):
        """Broadcast to all channels"""
        for channel in self.active_connections:
            await self.broadcast(channel, message)
    
    def get_connection_count(self, channel: str = None) -> int:
        """Get number of active connections"""
        if channel:
            return len(self.active_connections.get(channel, set()))
        return sum(len(conns) for conns in self.active_connections.values())
    
    def store_location(self, trip_id: str, location: dict):
        """Store location history for a trip"""
        if trip_id not in self.location_history:
            self.location_history[trip_id] = []
        self.location_history[trip_id].append({
            **location,
            "stored_at": datetime.now().isoformat()
        })
        # Keep only last 1000 points per trip
        if len(self.location_history[trip_id]) > 1000:
            self.location_history[trip_id] = self.location_history[trip_id][-1000:]
    
    def get_location_history(self, trip_id: str) -> List[dict]:
        """Get location history for a trip"""
        return self.location_history.get(trip_id, [])


# Initialize the connection manager
ws_manager = ConnectionManager()


# =============================================================================
# WEBSOCKET ENDPOINTS
# =============================================================================

@app.websocket("/ws/trip/{trip_id}")
async def trip_websocket(websocket: WebSocket, trip_id: str):
    """
    WebSocket endpoint for trip tracking and real-time updates.
    
    - Receives location updates from clients
    - Broadcasts updates to all connected clients for this trip
    - Stores location history
    """
    channel = f"trip_{trip_id}"
    await ws_manager.connect(websocket, channel)
    
    # Send current location history to new connection
    history = ws_manager.get_location_history(trip_id)
    if history:
        await ws_manager.send_personal(websocket, {
            "type": "history",
            "data": history[-50:]  # Send last 50 points
        })
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "location_update":
                # Store and broadcast location
                location = data.get("data", {})
                location["timestamp"] = datetime.now().isoformat()
                ws_manager.store_location(trip_id, location)
                
                await ws_manager.broadcast(channel, {
                    "type": "location_update",
                    "data": location
                })
            
            elif data.get("type") == "ping":
                # Keep-alive ping
                await ws_manager.send_personal(websocket, {"type": "pong"})
            
            else:
                # Generic message broadcast
                await ws_manager.broadcast(channel, data)
                
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel)
    except Exception as e:
        print(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket, channel)


@app.websocket("/ws/alerts/{user_id}")
async def alerts_websocket(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time price alerts and notifications.
    
    - Sends instant notifications when prices change
    - Broadcasts alerts to user's connected devices
    """
    channel = f"alerts_{user_id}"
    await ws_manager.connect(websocket, channel)
    
    try:
        while True:
            # Keep connection alive with heartbeat
            data = await websocket.receive_text()
            if data == "ping":
                await ws_manager.send_personal(websocket, {"type": "pong"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel)
    except Exception as e:
        print(f"Alerts WebSocket error: {e}")
        ws_manager.disconnect(websocket, channel)


@app.websocket("/ws/global")
async def global_websocket(websocket: WebSocket):
    """
    Global WebSocket for system-wide announcements.
    
    - Server status updates
    - New feature announcements
    - System maintenance notifications
    """
    channel = "global"
    await ws_manager.connect(websocket, channel)
    
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await ws_manager.send_personal(websocket, {"type": "pong"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel)


# Location tracking endpoint (REST API for storing locations)
class LocationUpdateRequest(BaseModel):
    trip_id: str
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    altitude: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None
    timestamp: Optional[int] = None


@app.post("/api/trips/location")
async def update_trip_location(request: LocationUpdateRequest, authorization: str = Header(None)):
    """
    Store a location update for a trip and broadcast to WebSocket clients.
    Uses Browser Geolocation API on frontend (FREE).
    """
    location = {
        "latitude": request.latitude,
        "longitude": request.longitude,
        "accuracy": request.accuracy,
        "altitude": request.altitude,
        "speed": request.speed,
        "heading": request.heading,
        "timestamp": request.timestamp or int(datetime.now().timestamp() * 1000)
    }
    
    # Store location
    ws_manager.store_location(request.trip_id, location)
    
    # Broadcast to WebSocket clients
    channel = f"trip_{request.trip_id}"
    await ws_manager.broadcast(channel, {
        "type": "location_update",
        "data": location
    })
    
    return {"status": "success", "message": "Location updated"}


@app.get("/api/trips/{trip_id}/locations")
async def get_trip_locations(trip_id: str, limit: int = 100):
    """Get location history for a trip"""
    history = ws_manager.get_location_history(trip_id)
    return {
        "status": "success",
        "trip_id": trip_id,
        "locations": history[-limit:],
        "total": len(history)
    }


@app.get("/api/ws/status")
async def websocket_status():
    """Get WebSocket connection statistics"""
    return {
        "status": "success",
        "total_connections": ws_manager.get_connection_count(),
        "channels": {
            channel: len(conns) 
            for channel, conns in ws_manager.active_connections.items()
        }
    }


# Helper function to send alert to user via WebSocket
async def send_alert_to_user(user_id: str, alert: dict):
    """Send a real-time alert to a user via WebSocket"""
    channel = f"alerts_{user_id}"
    await ws_manager.broadcast(channel, {
        "type": "price_alert",
        "data": alert,
        "timestamp": datetime.now().isoformat()
    })


# =============================================================================
# SERVE FRONTEND (React build in production)
# =============================================================================

# Check if we have the React build (client/dist)
CLIENT_DIST = os.path.join(os.path.dirname(__file__), "client", "dist")

if os.path.exists(CLIENT_DIST):
    # Serve static files from React build
    app.mount("/assets", StaticFiles(directory=os.path.join(CLIENT_DIST, "assets")), name="assets")
    
    @app.get("/")
    async def serve_frontend():
        return FileResponse(os.path.join(CLIENT_DIST, "index.html"))
    
    @app.get("/{path:path}")
    async def serve_spa(path: str):
        """Serve React SPA - all routes go to index.html"""
        file_path = os.path.join(CLIENT_DIST, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(CLIENT_DIST, "index.html"))


# =============================================================================
# RUN SERVER
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*60)
    print("🌍 AI Travel Planner - FastAPI Server")
    print("="*60)
    print(f"✅ Agent Available: {AGENT_AVAILABLE}")
    print(f"✅ APIs Available: {APIS_AVAILABLE}")
    print(f"🔑 GROQ_API_KEY: {'Set' if os.getenv('GROQ_API_KEY') else 'Missing'}")
    print(f"🔑 AMADEUS_API_KEY: {'Set' if os.getenv('AMADEUS_API_KEY') else 'Missing'}")
    print(f"🔑 RAPIDAPI_KEY: {'Set' if os.getenv('RAPIDAPI_KEY') else 'Missing'}")
    print(f"🔑 FOURSQUARE_API_KEY: {'Set' if os.getenv('FOURSQUARE_API_KEY') else 'Missing'}")
    print("="*60)
    print("🚀 Starting server at http://localhost:8000")
    print("📖 API Docs at http://localhost:8000/docs")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
