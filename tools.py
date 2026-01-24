"""
LangChain tools for the AI Travel Planner.
Each tool performs a specific function in the travel planning process.
"""

import json
import os
import requests
from typing import List, Dict, Any
from langchain_core.tools import tool
from pydantic import BaseModel, Field


# Data loading functions
def load_json_data(filename: str) -> List[Dict[str, Any]]:
    """Load JSON data from the data directory."""
    data_path = os.path.join(os.path.dirname(__file__), 'data', filename)
    with open(data_path, 'r') as f:
        return json.load(f)


# Tool 1: Flight Search Tool
class FlightSearchInput(BaseModel):
    """Input schema for flight search."""
    source: str = Field(description="Source city name (e.g., 'Delhi', 'Mumbai')")
    destination: str = Field(description="Destination city name (e.g., 'Goa', 'Jaipur')")


def search_flights(source: str, destination: str) -> str:
    """
    Search for flights between source and destination cities.
    Returns the cheapest and fastest flight options.
    
    Args:
        source: Source city name
        destination: Destination city name
    
    Returns:
        JSON string with flight options
    """
    flights = load_json_data('flights.json')
    
    # Filter flights by source and destination
    matching_flights = [
        f for f in flights 
        if f['source'].lower() == source.lower() and 
           f['destination'].lower() == destination.lower()
    ]
    
    if not matching_flights:
        return json.dumps({
            "status": "error",
            "message": f"No flights found from {source} to {destination}",
            "flights": []
        })
    
    # Find cheapest and fastest
    cheapest = min(matching_flights, key=lambda x: x['price'])
    
    # Sort by duration (convert to minutes for comparison)
    def duration_to_minutes(duration_str):
        parts = duration_str.replace('h', '').replace('m', '').split()
        hours = int(parts[0]) if len(parts) > 0 else 0
        minutes = int(parts[1]) if len(parts) > 1 else 0
        return hours * 60 + minutes
    
    fastest = min(matching_flights, key=lambda x: duration_to_minutes(x['duration']))
    
    result = {
        "status": "success",
        "total_flights": len(matching_flights),
        "cheapest_flight": cheapest,
        "fastest_flight": fastest,
        "all_flights": matching_flights[:5]  # Return top 5 for variety
    }
    
    return json.dumps(result, indent=2)


# Tool 2: Hotel Recommendation Tool
class HotelSearchInput(BaseModel):
    """Input schema for hotel search."""
    city: str = Field(description="City name (e.g., 'Goa', 'Jaipur')")
    max_price: int = Field(default=10000, description="Maximum price per night in INR")
    min_rating: float = Field(default=3.0, description="Minimum hotel rating (1-5)")


def search_hotels(city: str, max_price: int = 10000, min_rating: float = 3.0) -> str:
    """
    Search for hotels in a city based on price and rating criteria.
    
    Args:
        city: City name
        max_price: Maximum price per night (default: 10000)
        min_rating: Minimum rating (default: 3.0)
    
    Returns:
        JSON string with hotel recommendations
    """
    hotels = load_json_data('hotels.json')
    
    # Filter hotels by city, price, and rating
    matching_hotels = [
        h for h in hotels 
        if h['city'].lower() == city.lower() and 
           h['price_per_night'] <= max_price and
           h['rating'] >= min_rating
    ]
    
    if not matching_hotels:
        return json.dumps({
            "status": "error",
            "message": f"No hotels found in {city} matching your criteria",
            "hotels": []
        })
    
    # Sort by rating (descending) and price (ascending)
    best_value = sorted(matching_hotels, key=lambda x: (-x['rating'], x['price_per_night']))
    cheapest = min(matching_hotels, key=lambda x: x['price_per_night'])
    highest_rated = max(matching_hotels, key=lambda x: x['rating'])
    
    result = {
        "status": "success",
        "total_hotels": len(matching_hotels),
        "recommended_hotel": best_value[0] if best_value else None,
        "cheapest_hotel": cheapest,
        "highest_rated_hotel": highest_rated,
        "all_options": best_value[:5]
    }
    
    return json.dumps(result, indent=2)


# Tool 3: Places Discovery Tool
class PlacesSearchInput(BaseModel):
    """Input schema for places search."""
    city: str = Field(description="City name (e.g., 'Goa', 'Jaipur')")
    place_type: str = Field(default="all", description="Type of place: 'Beach', 'Heritage', 'Shopping', 'Nature', 'Religious', 'Scenic', or 'all'")
    min_rating: float = Field(default=4.0, description="Minimum place rating (1-5)")


def search_places(city: str, place_type: str = "all", min_rating: float = 4.0) -> str:
    """
    Search for tourist attractions and places in a city.
    
    Args:
        city: City name
        place_type: Type of place to search for (default: 'all')
        min_rating: Minimum rating (default: 4.0)
    
    Returns:
        JSON string with place recommendations
    """
    places = load_json_data('places.json')
    
    # Filter places by city and rating
    matching_places = [
        p for p in places 
        if p['city'].lower() == city.lower() and 
           p['rating'] >= min_rating
    ]
    
    # Filter by type if specified
    if place_type.lower() != "all":
        matching_places = [
            p for p in matching_places 
            if p['type'].lower() == place_type.lower()
        ]
    
    if not matching_places:
        return json.dumps({
            "status": "error",
            "message": f"No places found in {city} matching your criteria",
            "places": []
        })
    
    # Sort by rating
    matching_places = sorted(matching_places, key=lambda x: -x['rating'])
    
    # Group by type for variety
    by_type = {}
    for place in matching_places:
        place_type_key = place['type']
        if place_type_key not in by_type:
            by_type[place_type_key] = []
        by_type[place_type_key].append(place)
    
    result = {
        "status": "success",
        "total_places": len(matching_places),
        "top_rated_places": matching_places[:10],
        "places_by_type": {k: v[:3] for k, v in by_type.items()}
    }
    
    return json.dumps(result, indent=2)


# Tool 4: Weather Lookup Tool
class WeatherSearchInput(BaseModel):
    """Input schema for weather search."""
    city: str = Field(description="City name (e.g., 'Goa', 'Jaipur')")
    days: int = Field(default=7, description="Number of days to forecast (1-7)")


def get_weather(city: str, days: int = 7) -> str:
    """
    Get weather forecast for a city using Open-Meteo API.
    
    Args:
        city: City name
        days: Number of days to forecast (default: 7)
    
    Returns:
        JSON string with weather forecast
    """
    # City coordinates mapping (latitude, longitude)
    city_coords = {
        "goa": (15.2993, 74.1240),
        "jaipur": (26.9124, 75.7873),
        "mumbai": (19.0760, 72.8777),
        "bangalore": (12.9716, 77.5946),
        "kerala": (10.8505, 76.2711),  # Kochi coordinates
        "delhi": (28.7041, 77.1025)
    }
    
    city_lower = city.lower()
    if city_lower not in city_coords:
        return json.dumps({
            "status": "error",
            "message": f"Weather data not available for {city}",
            "forecast": []
        })
    
    lat, lon = city_coords[city_lower]
    
    try:
        # Call Open-Meteo API
        url = f"https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode",
            "timezone": "auto",
            "forecast_days": min(days, 7)
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Parse weather data
        daily_data = data.get('daily', {})
        dates = daily_data.get('time', [])
        max_temps = daily_data.get('temperature_2m_max', [])
        min_temps = daily_data.get('temperature_2m_min', [])
        precipitation = daily_data.get('precipitation_sum', [])
        weather_codes = daily_data.get('weathercode', [])
        
        # Weather code descriptions (simplified)
        weather_desc = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Foggy",
            51: "Light drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            80: "Rain showers",
            95: "Thunderstorm"
        }
        
        forecast = []
        for i in range(len(dates)):
            forecast.append({
                "date": dates[i],
                "max_temp_c": round(max_temps[i], 1),
                "min_temp_c": round(min_temps[i], 1),
                "precipitation_mm": round(precipitation[i], 1),
                "condition": weather_desc.get(weather_codes[i], "Unknown")
            })
        
        result = {
            "status": "success",
            "city": city,
            "forecast": forecast
        }
        
        return json.dumps(result, indent=2)
        
    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": f"Failed to fetch weather data: {str(e)}",
            "forecast": []
        })


# Tool 5: Budget Estimation Tool
class BudgetEstimationInput(BaseModel):
    """Input schema for budget estimation."""
    flight_price: int = Field(description="Flight ticket price in INR")
    hotel_price_per_night: int = Field(description="Hotel price per night in INR")
    num_nights: int = Field(description="Number of nights staying")
    daily_expense: int = Field(default=2000, description="Daily local expense (food, transport) in INR")


def estimate_budget(flight_price: int, hotel_price_per_night: int, num_nights: int, daily_expense: int = 2000) -> str:
    """
    Calculate total trip budget including flight, hotel, and daily expenses.
    
    Args:
        flight_price: Flight ticket price
        hotel_price_per_night: Hotel price per night
        num_nights: Number of nights
        daily_expense: Daily local expense (default: 2000)
    
    Returns:
        JSON string with budget breakdown
    """
    hotel_total = hotel_price_per_night * num_nights
    daily_total = daily_expense * num_nights
    total_cost = flight_price + hotel_total + daily_total
    
    result = {
        "status": "success",
        "breakdown": {
            "flight": flight_price,
            "hotel": {
                "per_night": hotel_price_per_night,
                "total_nights": num_nights,
                "total": hotel_total
            },
            "daily_expenses": {
                "per_day": daily_expense,
                "total_days": num_nights,
                "total": daily_total
            }
        },
        "total_cost": total_cost,
        "currency": "INR"
    }
    
    return json.dumps(result, indent=2)


# Create LangChain Tool objects
def create_travel_tools() -> List:
    """
    Create and return all travel planning tools.
    
    Returns:
        List of LangChain Tool objects
    """
    
    @tool
    def search_flights_tool(source: str, destination: str) -> str:
        """Search for flights between cities. 
        Returns cheapest and fastest flight options with prices and timings.
        
        Args:
            source: Source city name (e.g., 'Delhi', 'Mumbai')
            destination: Destination city name (e.g., 'Goa', 'Jaipur')
        """
        return search_flights(source, destination)
    
    @tool
    def search_hotels_tool(city: str, max_price: int = 10000, min_rating: float = 3.0) -> str:
        """Search for hotels in a city based on budget and rating.
        Returns recommended hotels with prices, ratings, and amenities.
        
        Args:
            city: City name (e.g., 'Goa', 'Jaipur')
            max_price: Maximum price per night in INR (default: 10000)
            min_rating: Minimum hotel rating 1-5 (default: 3.0)
        """
        return search_hotels(city, max_price, min_rating)
    
    @tool
    def search_places_tool(city: str, place_type: str = "all", min_rating: float = 4.0) -> str:
        """Search for tourist attractions and places to visit in a city.
        Returns top-rated places with descriptions and visit durations.
        
        Args:
            city: City name (e.g., 'Goa', 'Jaipur')
            place_type: Type of place (Beach, Heritage, Shopping, Nature, Religious, Scenic, or 'all')
            min_rating: Minimum rating (default: 4.0)
        """
        return search_places(city, place_type, min_rating)
    
    @tool
    def get_weather_tool(city: str, days: int = 7) -> str:
        """Get weather forecast for a city.
        Returns daily temperature, precipitation, and weather conditions.
        
        Args:
            city: City name (e.g., 'Goa', 'Jaipur')
            days: Number of days to forecast (1-7, default: 7)
        """
        return get_weather(city, days)
    
    @tool
    def estimate_budget_tool(flight_price: float, hotel_price_per_night: float, num_nights: int, daily_expense: float = 2000) -> str:
        """Calculate total trip budget.
        Returns detailed budget breakdown with total cost.
        
        Args:
            flight_price: Total flight cost in INR
            hotel_price_per_night: Hotel cost per night in INR
            num_nights: Number of nights staying
            daily_expense: Daily expense for food and activities in INR (default: 2000)
        """
        return estimate_budget(flight_price, hotel_price_per_night, num_nights, daily_expense)
    
    tools = [
        search_flights_tool,
        search_hotels_tool,
        search_places_tool,
        get_weather_tool,
        estimate_budget_tool
    ]
    
    return tools
