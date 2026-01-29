"""
Multi-System Travel Integration
Handles cars, transfers, experiences, and comprehensive trip planning
"""

import json
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

class TransferService:
    """Handle car rentals and local transfers"""
    
    def __init__(self):
        self.uber_api_key = None  # Would be from env
        self.static_data = self._load_transfer_data()
    
    def _load_transfer_data(self):
        """Load static transfer/car data"""
        return {
            "airport_transfers": [
                {"id": "T001", "type": "Taxi", "from": "Delhi Airport", "to": "Delhi City", "price": 800, "duration": "45 mins"},
                {"id": "T002", "type": "Uber", "from": "Delhi Airport", "to": "Delhi City", "price": 600, "duration": "40 mins"},
                {"id": "T003", "type": "Metro", "from": "Delhi Airport", "to": "Delhi City", "price": 150, "duration": "55 mins"},
            ],
            "car_rentals": [
                {"id": "C001", "company": "Hertz", "city": "Delhi", "car_type": "Compact", "price_per_day": 2500},
                {"id": "C002", "company": "Zoomcar", "city": "Delhi", "car_type": "SUV", "price_per_day": 4000},
                {"id": "C003", "company": "Ola Rentals", "city": "Goa", "car_type": "Hatchback", "price_per_day": 1800},
            ]
        }
    
    def search_transfers(self, from_location: str, to_location: str, travel_date: str = None) -> Dict[str, Any]:
        """Search for transfer options"""
        transfers = []
        
        # Filter relevant transfers
        for transfer in self.static_data["airport_transfers"]:
            if (from_location.lower() in transfer["from"].lower() or 
                to_location.lower() in transfer["to"].lower()):
                transfers.append(transfer)
        
        return {
            "status": "success",
            "transfers": transfers,
            "recommendations": [
                "Metro is most economical for airport transfers",
                "Uber provides good balance of cost and comfort",
                "Taxi is most reliable but expensive"
            ]
        }
    
    def search_car_rentals(self, city: str, pickup_date: str, return_date: str) -> Dict[str, Any]:
        """Search for car rental options"""
        cars = [car for car in self.static_data["car_rentals"] 
                if city.lower() in car["city"].lower()]
        
        # Calculate total cost if dates provided
        if pickup_date and return_date:
            try:
                pickup = datetime.fromisoformat(pickup_date)
                return_dt = datetime.fromisoformat(return_date)
                days = (return_dt - pickup).days
                
                for car in cars:
                    car["total_cost"] = car["price_per_day"] * days
                    car["rental_days"] = days
            except:
                pass
        
        return {
            "status": "success",
            "car_rentals": cars,
            "tips": [
                "Book early for better rates",
                "Check fuel policy and insurance coverage",
                "Consider local traffic conditions"
            ]
        }

class ExperienceService:
    """Handle activities and experiences"""
    
    def __init__(self):
        self.experiences_data = self._load_experiences_data()
    
    def _load_experiences_data(self):
        """Load experiences and activities data"""
        return [
            {
                "id": "E001",
                "name": "Golden Triangle Tour",
                "city": "Delhi",
                "type": "Cultural",
                "duration": "3 days",
                "price": 15000,
                "rating": 4.5,
                "description": "Explore Delhi, Agra, and Jaipur in a comprehensive tour",
                "inclusions": ["Transport", "Guide", "Entry fees"],
                "best_time": "Oct-Mar"
            },
            {
                "id": "E002",
                "name": "Beach Water Sports",
                "city": "Goa",
                "type": "Adventure",
                "duration": "Half day",
                "price": 3500,
                "rating": 4.2,
                "description": "Parasailing, jet skiing, and banana boat rides",
                "inclusions": ["Equipment", "Safety gear", "Instructor"],
                "best_time": "Nov-Feb"
            },
            {
                "id": "E003",
                "name": "Sunset Camel Safari",
                "city": "Jaipur",
                "type": "Adventure",
                "duration": "4 hours",
                "price": 2500,
                "rating": 4.7,
                "description": "Desert safari with cultural performance and dinner",
                "inclusions": ["Camel ride", "Dinner", "Cultural show"],
                "best_time": "Oct-Mar"
            }
        ]
    
    def search_experiences(self, city: str, experience_type: str = None, 
                          max_price: int = None, duration_pref: str = None) -> Dict[str, Any]:
        """Search for experiences and activities"""
        experiences = [exp for exp in self.experiences_data 
                      if city.lower() in exp["city"].lower()]
        
        # Apply filters
        if experience_type:
            experiences = [exp for exp in experiences 
                          if experience_type.lower() in exp["type"].lower()]
        
        if max_price:
            experiences = [exp for exp in experiences if exp["price"] <= max_price]
        
        # Sort by rating
        experiences.sort(key=lambda x: x["rating"], reverse=True)
        
        return {
            "status": "success",
            "experiences": experiences,
            "categories": list(set(exp["type"] for exp in self.experiences_data)),
            "booking_tips": [
                "Book popular experiences in advance",
                "Check weather conditions for outdoor activities",
                "Read cancellation policies carefully"
            ]
        }

class ComprehensiveTripPlanner:
    """Comprehensive trip planning with all services integrated"""
    
    def __init__(self):
        self.transfer_service = TransferService()
        self.experience_service = ExperienceService()
    
    def create_comprehensive_itinerary(self, trip_request: Dict[str, Any]) -> Dict[str, Any]:
        """Create a comprehensive itinerary with all travel components"""
        
        destination = trip_request.get("destination", "")
        duration = trip_request.get("duration", 3)
        budget = trip_request.get("budget", 50000)
        interests = trip_request.get("interests", ["sightseeing"])
        
        itinerary = {
            "trip_overview": {
                "destination": destination,
                "duration": f"{duration} days",
                "estimated_budget": budget,
                "trip_type": self._determine_trip_type(interests)
            },
            "transportation": {},
            "experiences": {},
            "logistics": {},
            "budget_breakdown": {},
            "day_wise_plan": [],
            "agent_recommendations": []
        }
        
        # Get transfers
        transfers = self.transfer_service.search_transfers("Airport", destination)
        itinerary["transportation"]["airport_transfers"] = transfers.get("transfers", [])
        
        # Get car rentals
        car_rentals = self.transfer_service.search_car_rentals(destination, "", "")
        itinerary["transportation"]["car_rentals"] = car_rentals.get("car_rentals", [])
        
        # Get experiences
        experiences = self.experience_service.search_experiences(destination)
        itinerary["experiences"]["available_activities"] = experiences.get("experiences", [])
        
        # Create day-wise plan
        itinerary["day_wise_plan"] = self._create_day_wise_plan(destination, duration, interests)
        
        # Budget breakdown
        itinerary["budget_breakdown"] = self._calculate_budget_breakdown(itinerary, budget)
        
        # Agent recommendations
        itinerary["agent_recommendations"] = self._generate_agent_recommendations(itinerary, trip_request)
        
        return itinerary
    
    def _determine_trip_type(self, interests: List[str]) -> str:
        """Determine trip type based on interests"""
        adventure_keywords = ["adventure", "sports", "trekking", "safari"]
        cultural_keywords = ["cultural", "heritage", "museum", "temple"]
        leisure_keywords = ["beach", "relaxation", "spa", "resort"]
        
        if any(keyword in " ".join(interests).lower() for keyword in adventure_keywords):
            return "Adventure"
        elif any(keyword in " ".join(interests).lower() for keyword in cultural_keywords):
            return "Cultural"
        elif any(keyword in " ".join(interests).lower() for keyword in leisure_keywords):
            return "Leisure"
        else:
            return "Mixed"
    
    def _create_day_wise_plan(self, destination: str, duration: int, interests: List[str]) -> List[Dict[str, Any]]:
        """Create detailed day-wise itinerary"""
        days = []
        
        # Sample day plans - would be more sophisticated in real implementation
        sample_activities = {
            "delhi": [
                {"day": 1, "morning": "Red Fort visit", "afternoon": "Chandni Chowk shopping", "evening": "India Gate"},
                {"day": 2, "morning": "Qutub Minar", "afternoon": "Humayun's Tomb", "evening": "Lotus Temple"},
                {"day": 3, "morning": "Akshardham Temple", "afternoon": "National Museum", "evening": "Connaught Place"}
            ],
            "goa": [
                {"day": 1, "morning": "Beach arrival", "afternoon": "Water sports", "evening": "Sunset cruise"},
                {"day": 2, "morning": "Old Goa churches", "afternoon": "Spice plantation", "evening": "Night market"},
                {"day": 3, "morning": "Beach relaxation", "afternoon": "Local sightseeing", "evening": "Beach party"}
            ]
        }
        
        city_key = destination.lower()
        if city_key in sample_activities:
            return sample_activities[city_key][:duration]
        
        # Generic plan
        for day in range(1, duration + 1):
            days.append({
                "day": day,
                "morning": f"Sightseeing in {destination}",
                "afternoon": f"Local experiences in {destination}",
                "evening": f"Leisure time in {destination}"
            })
        
        return days
    
    def _calculate_budget_breakdown(self, itinerary: Dict[str, Any], total_budget: float) -> Dict[str, Any]:
        """Calculate budget breakdown"""
        return {
            "total_budget": total_budget,
            "flights": total_budget * 0.4,
            "accommodation": total_budget * 0.3,
            "activities": total_budget * 0.15,
            "food": total_budget * 0.1,
            "miscellaneous": total_budget * 0.05,
            "breakdown_explanation": "40% flights, 30% hotels, 15% activities, 10% food, 5% misc"
        }
    
    def _generate_agent_recommendations(self, itinerary: Dict[str, Any], trip_request: Dict[str, Any]) -> List[str]:
        """Generate recommendations for travel agents"""
        recommendations = [
            "Book flights and hotels together for better rates",
            "Consider travel insurance for international trips",
            "Check visa requirements and processing time",
            "Recommend local SIM card or international roaming",
            "Suggest packing checklist based on destination weather"
        ]
        
        # Add specific recommendations based on trip data
        destination = trip_request.get("destination", "").lower()
        if "goa" in destination:
            recommendations.append("Recommend beach essentials and sun protection")
        elif "delhi" in destination:
            recommendations.append("Advise about air quality and appropriate clothing")
        
        return recommendations

# Tool functions for LangChain integration
def search_comprehensive_travel_options(destination: str, trip_type: str = "leisure", 
                                      duration: int = 3, budget: int = 50000) -> str:
    """Comprehensive travel search tool"""
    
    planner = ComprehensiveTripPlanner()
    
    trip_request = {
        "destination": destination,
        "duration": duration,
        "budget": budget,
        "interests": [trip_type]
    }
    
    itinerary = planner.create_comprehensive_itinerary(trip_request)
    
    return json.dumps(itinerary, indent=2, default=str)

def search_transfers_and_cars(city: str, transfer_type: str = "all") -> str:
    """Search for transfers and car rentals"""
    
    transfer_service = TransferService()
    
    result = {
        "status": "success",
        "location": city,
        "options": {}
    }
    
    if transfer_type in ["all", "transfers"]:
        transfers = transfer_service.search_transfers("Airport", city)
        result["options"]["transfers"] = transfers
    
    if transfer_type in ["all", "cars"]:
        cars = transfer_service.search_car_rentals(city, "", "")
        result["options"]["car_rentals"] = cars
    
    return json.dumps(result, indent=2)

def search_activities_experiences(city: str, activity_type: str = "", max_budget: int = 10000) -> str:
    """Search for activities and experiences"""
    
    experience_service = ExperienceService()
    experiences = experience_service.search_experiences(city, activity_type, max_budget)
    
    return json.dumps(experiences, indent=2)