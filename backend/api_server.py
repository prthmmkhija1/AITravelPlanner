"""
FastAPI Server for AI Travel Planner
"""

import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

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
        "all_apis_free": True,
        "no_credit_card_required": True
    }


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
