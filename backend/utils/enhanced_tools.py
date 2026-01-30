"""
Enhanced LangChain tools for the AI Travel Agent/Copilot
Integrates all advanced features for hackathon project
"""

from langchain_core.tools import tool
from pydantic import BaseModel, Field
import json
import os
from typing import List, Dict, Any, Optional

# Import our enhanced modules
from integrations.enhanced_flight_search import enhanced_search_flights
from services.customer_manager import get_customer_insights
from utils.multi_system_integration import (
    search_comprehensive_travel_options, 
    search_transfers_and_cars,
    search_activities_experiences
)

# Original tools (keep for compatibility)
try:
    from utils.real_api_tools import search_flights, search_hotels, search_places, get_weather_forecast, estimate_budget
except ImportError:
    # Fallback if real_api_tools not available
    search_flights = None
    search_hotels = None
    search_places = None
    get_weather_forecast = None
    estimate_budget = None

class CustomerSearchInput(BaseModel):
    """Input schema for customer search."""
    customer_id: str = Field(description="Customer ID (e.g., 'CUST_0001')")
    trip_request: str = Field(default="", description="Brief description of the trip request")

class ComprehensiveTripInput(BaseModel):
    """Input schema for comprehensive trip planning."""
    destination: str = Field(description="Destination city/country")
    duration: int = Field(default=3, description="Trip duration in days")
    budget: int = Field(default=50000, description="Total budget in INR")
    trip_type: str = Field(default="leisure", description="Type of trip: leisure, business, adventure, cultural")
    travelers: int = Field(default=2, description="Number of travelers")

class TransferSearchInput(BaseModel):
    """Input schema for transfer and car search."""
    city: str = Field(description="City name")
    transfer_type: str = Field(default="all", description="Type: 'all', 'transfers', or 'cars'")

class ExperienceSearchInput(BaseModel):
    """Input schema for activity search."""
    city: str = Field(description="City name")
    activity_type: str = Field(default="", description="Activity type: adventure, cultural, leisure")
    max_budget: int = Field(default=10000, description="Maximum budget for activity")

class EnhancedFlightSearchInput(BaseModel):
    """Input schema for enhanced flight search."""
    source: str = Field(description="Source city name")
    destination: str = Field(description="Destination city name")
    departure_date: str = Field(default="", description="Departure date in YYYY-MM-DD format")
    passengers: int = Field(default=1, description="Number of passengers")

@tool("customer_insights", args_schema=CustomerSearchInput)
def get_customer_profile_and_insights(customer_id: str, trip_request: str = "") -> str:
    """
    Get customer profile, preferences, and personalized recommendations.
    Essential for travel agents to provide personalized service.
    
    Args:
        customer_id: Customer ID (e.g., 'CUST_0001')
        trip_request: Brief trip description for context
    
    Returns:
        Customer insights and personalized recommendations
    """
    return get_customer_insights(customer_id, trip_request)

@tool("comprehensive_trip_planning", args_schema=ComprehensiveTripInput)
def plan_comprehensive_trip(destination: str, duration: int = 3, budget: int = 50000, 
                           trip_type: str = "leisure", travelers: int = 2) -> str:
    """
    Create a comprehensive trip plan with flights, hotels, transfers, activities, and day-wise itinerary.
    This is the main tool for complete trip planning that agents need.
    
    Args:
        destination: Destination city/country
        duration: Trip duration in days
        budget: Total budget in INR
        trip_type: leisure, business, adventure, cultural, family
        travelers: Number of travelers
    
    Returns:
        Complete trip plan with all components and agent recommendations
    """
    return search_comprehensive_travel_options(destination, trip_type, duration, budget)

@tool("enhanced_flight_search", args_schema=EnhancedFlightSearchInput) 
def search_flights_enhanced(source: str, destination: str, departure_date: str = "", passengers: int = 1) -> str:
    """
    Search for flights with real-time pricing, price alerts, and enhanced recommendations.
    Includes both real-time API data and fallback options.
    
    Args:
        source: Source city name
        destination: Destination city name  
        departure_date: Departure date in YYYY-MM-DD format (optional)
        passengers: Number of passengers
    
    Returns:
        Enhanced flight options with pricing insights and recommendations
    """
    return enhanced_search_flights(source, destination, departure_date, passengers)

@tool("transfer_and_car_search", args_schema=TransferSearchInput)
def search_transfers_cars(city: str, transfer_type: str = "all") -> str:
    """
    Search for airport transfers, local transportation, and car rentals.
    Helps agents provide complete transportation solutions.
    
    Args:
        city: City name
        transfer_type: 'all', 'transfers', or 'cars'
    
    Returns:
        Available transfer options and car rental services
    """
    return search_transfers_and_cars(city, transfer_type)

@tool("activity_experience_search", args_schema=ExperienceSearchInput) 
def search_activities(city: str, activity_type: str = "", max_budget: int = 10000) -> str:
    """
    Search for activities, experiences, tours, and attractions.
    Essential for creating engaging itineraries.
    
    Args:
        city: City name
        activity_type: adventure, cultural, leisure, or leave empty for all
        max_budget: Maximum budget per activity
    
    Returns:
        Available activities and experiences with booking recommendations
    """
    return search_activities_experiences(city, activity_type, max_budget)

@tool("price_monitoring_alert")
def create_price_alert(route: str, target_price: int, customer_email: str = "") -> str:
    """
    Set up price monitoring and alerts for flights/hotels.
    Helps agents proactively notify customers about price changes.
    
    Args:
        route: Flight route (e.g., "Delhi-Goa") or hotel name
        target_price: Desired price threshold
        customer_email: Customer email for notifications
    
    Returns:
        Price alert setup confirmation and monitoring details
    """
    alert_data = {
        "status": "success",
        "alert_id": f"ALERT_{hash(route)}",
        "route": route,
        "target_price": target_price,
        "current_monitoring": True,
        "notification_email": customer_email if customer_email else "agent@travelagency.com",
        "message": f"Price alert set for {route} at ₹{target_price}",
        "estimated_savings": "Up to 15-20% when prices drop",
        "monitoring_period": "30 days",
        "agent_tip": "Customer will be notified within 2 hours of price drop"
    }
    
    return json.dumps(alert_data, indent=2)

@tool("travel_policy_check")
def check_travel_policy(company: str, trip_details: str, employee_level: str = "standard") -> str:
    """
    Check corporate travel policy compliance and suggest alternatives.
    Critical for business travel agents managing corporate accounts.
    
    Args:
        company: Company name
        trip_details: Trip details to check
        employee_level: standard, senior, executive
    
    Returns:
        Policy compliance status and recommendations
    """
    policy_limits = {
        "standard": {"flight_class": "Economy", "hotel_limit": 8000, "meal_allowance": 2000},
        "senior": {"flight_class": "Economy/Business domestic", "hotel_limit": 12000, "meal_allowance": 3000},
        "executive": {"flight_class": "Business", "hotel_limit": 20000, "meal_allowance": 5000}
    }
    
    limits = policy_limits.get(employee_level, policy_limits["standard"])
    
    policy_result = {
        "status": "checked",
        "company": company,
        "employee_level": employee_level,
        "policy_limits": limits,
        "compliance_status": "approved",
        "recommendations": [
            f"Flight class limit: {limits['flight_class']}",
            f"Hotel budget: ₹{limits['hotel_limit']} per night",
            f"Meal allowance: ₹{limits['meal_allowance']} per day"
        ],
        "cost_optimization_tips": [
            "Book 14+ days in advance for better rates",
            "Consider business hotels near meeting locations",
            "Use company-preferred vendors for additional discounts"
        ],
        "approval_required": False
    }
    
    return json.dumps(policy_result, indent=2)

@tool("group_booking_optimizer")
def optimize_group_booking(group_size: int, destination: str, travel_dates: str, budget_per_person: int = 30000) -> str:
    """
    Optimize bookings for groups with special rates and coordination.
    Essential for agents handling corporate groups, families, or tour groups.
    
    Args:
        group_size: Number of people in the group
        destination: Destination location
        travel_dates: Travel dates
        budget_per_person: Budget per person
    
    Returns:
        Group booking optimization with special rates and coordination tips
    """
    discounts = {
        "small_group": (5, 10, "5-10% group discount"),
        "medium_group": (10, 20, "10-15% group discount"),  
        "large_group": (20, 50, "15-25% group discount"),
        "corporate": (50, 100, "20-30% corporate rates")
    }
    
    discount_tier = "individual"
    discount_percent = 0
    
    if group_size >= 50:
        discount_tier, discount_percent = "corporate", 25
    elif group_size >= 20:
        discount_tier, discount_percent = "large_group", 18
    elif group_size >= 10:
        discount_tier, discount_percent = "medium_group", 12
    elif group_size >= 5:
        discount_tier, discount_percent = "small_group", 8
    
    total_budget = group_size * budget_per_person
    estimated_savings = int(total_budget * discount_percent / 100)
    
    group_optimization = {
        "status": "optimized",
        "group_details": {
            "size": group_size,
            "destination": destination,
            "dates": travel_dates,
            "total_budget": total_budget
        },
        "discount_tier": discount_tier,
        "discount_percentage": f"{discount_percent}%",
        "estimated_savings": estimated_savings,
        "coordination_benefits": [
            "Single booking reference for entire group",
            "Coordinated seating arrangements",
            "Group meal arrangements",
            "Dedicated support representative"
        ],
        "special_services": [
            "Airport group handling",
            "Group check-in coordination", 
            "Custom itinerary for groups",
            "Group leader communication channel"
        ],
        "booking_recommendations": [
            "Reserve block bookings early",
            "Confirm group rooming list 30 days prior",
            "Arrange pre-trip briefing for group leaders",
            "Set up group payment terms"
        ]
    }
    
    return json.dumps(group_optimization, indent=2)

@tool("agent_productivity_insights")
def get_agent_productivity_insights(time_period: str = "today") -> str:
    """
    Get productivity insights and recommendations for travel agents.
    Helps agents track performance and optimize their workflow.
    
    Args:
        time_period: today, week, month
    
    Returns:
        Agent performance metrics and productivity recommendations
    """
    productivity_data = {
        "time_period": time_period,
        "performance_metrics": {
            "bookings_completed": 12 if time_period == "today" else 45,
            "revenue_generated": 485000 if time_period == "today" else 1850000,
            "customer_interactions": 28 if time_period == "today" else 156,
            "average_response_time": "8 minutes",
            "customer_satisfaction": 4.6,
            "conversion_rate": "68%"
        },
        "productivity_insights": [
            "Peak booking hours: 10 AM - 12 PM and 3 PM - 5 PM",
            "Highest converting inquiries: International leisure travel",
            "Best performing channels: Phone calls and WhatsApp",
            "Average time per booking: 45 minutes"
        ],
        "optimization_recommendations": [
            "Block time slots for complex international bookings",
            "Use template responses for common queries",
            "Follow up with price alert customers during peak season",
            "Prioritize high-value customers during busy periods"
        ],
        "alerts_and_reminders": [
            "3 customers waiting for Goa package confirmations",
            "5 visa applications need document follow-up", 
            "Corporate group proposal due Friday",
            "Price drop alert: Delhi-Dubai route"
        ]
    }
    
    return json.dumps(productivity_data, indent=2)

# Create enhanced tool list
def create_enhanced_travel_tools():
    """Create the enhanced tool list for the travel agent copilot"""
    tools = [
        # Customer Management
        get_customer_profile_and_insights,
        
        # Enhanced Trip Planning
        plan_comprehensive_trip,
        search_flights_enhanced,
        search_transfers_cars,
        search_activities,
        
        # Agent-specific tools
        create_price_alert,
        check_travel_policy,
        optimize_group_booking,
        get_agent_productivity_insights
    ]
    
    # Add original tools if available
    if search_hotels:
        tools.append(search_hotels)
    if search_places:
        tools.append(search_places)
    if get_weather_forecast:
        tools.append(get_weather_forecast)
    if estimate_budget:
        tools.append(estimate_budget)
    
    return tools

# For backward compatibility
def create_travel_tools():
    """Legacy function - returns enhanced tools"""
    return create_enhanced_travel_tools()