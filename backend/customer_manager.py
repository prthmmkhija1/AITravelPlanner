"""
Customer Profile Management System for Travel Agents
Helps agents track customer preferences, history, and provide personalized service
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum

class TravelType(Enum):
    BUSINESS = "business"
    LEISURE = "leisure"
    FAMILY = "family"
    HONEYMOON = "honeymoon"
    SOLO = "solo"

class BudgetCategory(Enum):
    BUDGET = "budget"
    STANDARD = "standard"
    PREMIUM = "premium"
    LUXURY = "luxury"

@dataclass
class CustomerPreference:
    preferred_airlines: List[str]
    preferred_hotel_chains: List[str]
    preferred_class: str  # Economy, Business, First
    preferred_meal: str   # Veg, Non-veg, Vegan
    budget_category: BudgetCategory
    travel_type: TravelType
    preferred_destinations: List[str]
    avoid_destinations: List[str]
    mobility_assistance: bool
    special_requests: List[str]

@dataclass
class TravelHistory:
    trip_id: str
    destination: str
    travel_dates: List[str]
    total_cost: float
    satisfaction_rating: int  # 1-5
    travel_type: TravelType
    companions: int
    booked_through_agent: bool
    notes: str

@dataclass
class CustomerProfile:
    customer_id: str
    name: str
    email: str
    phone: str
    date_of_birth: str
    nationality: str
    passport_number: str
    emergency_contact: str
    preferences: CustomerPreference
    travel_history: List[TravelHistory]
    agent_notes: List[str]
    loyalty_points: int
    created_date: str
    last_updated: str

class CustomerManager:
    """Manages customer profiles and provides intelligent recommendations"""
    
    def __init__(self, data_file: str = "data/customers.json"):
        self.data_file = data_file
        self.customers: Dict[str, CustomerProfile] = self._load_customers()
    
    def _load_customers(self) -> Dict[str, CustomerProfile]:
        """Load customer profiles from file"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                    customers = {}
                    for customer_id, customer_data in data.items():
                        # Convert dict back to dataclass
                        customer_data['preferences'] = CustomerPreference(**customer_data['preferences'])
                        customer_data['travel_history'] = [
                            TravelHistory(**trip) for trip in customer_data['travel_history']
                        ]
                        customers[customer_id] = CustomerProfile(**customer_data)
                    return customers
        except Exception as e:
            print(f"Error loading customers: {e}")
        return {}
    
    def _save_customers(self):
        """Save customer profiles to file"""
        try:
            # Ensure data directory exists
            os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
            
            # Convert dataclasses to dict for JSON serialization
            data = {}
            for customer_id, customer in self.customers.items():
                customer_dict = asdict(customer)
                # Convert enums to strings
                customer_dict['preferences']['budget_category'] = customer.preferences.budget_category.value
                customer_dict['preferences']['travel_type'] = customer.preferences.travel_type.value
                for i, trip in enumerate(customer_dict['travel_history']):
                    trip['travel_type'] = customer.travel_history[i].travel_type.value
                data[customer_id] = customer_dict
            
            with open(self.data_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving customers: {e}")
    
    def create_customer(self, name: str, email: str, phone: str) -> str:
        """Create a new customer profile"""
        customer_id = f"CUST_{len(self.customers) + 1:04d}"
        
        # Default preferences
        default_preferences = CustomerPreference(
            preferred_airlines=[],
            preferred_hotel_chains=[],
            preferred_class="Economy",
            preferred_meal="Veg",
            budget_category=BudgetCategory.STANDARD,
            travel_type=TravelType.LEISURE,
            preferred_destinations=[],
            avoid_destinations=[],
            mobility_assistance=False,
            special_requests=[]
        )
        
        customer = CustomerProfile(
            customer_id=customer_id,
            name=name,
            email=email,
            phone=phone,
            date_of_birth="",
            nationality="",
            passport_number="",
            emergency_contact="",
            preferences=default_preferences,
            travel_history=[],
            agent_notes=[],
            loyalty_points=0,
            created_date=datetime.now().isoformat(),
            last_updated=datetime.now().isoformat()
        )
        
        self.customers[customer_id] = customer
        self._save_customers()
        return customer_id
    
    def get_customer(self, customer_id: str) -> Optional[CustomerProfile]:
        """Get customer by ID"""
        return self.customers.get(customer_id)
    
    def search_customers(self, query: str) -> List[CustomerProfile]:
        """Search customers by name, email, or phone"""
        query = query.lower()
        results = []
        for customer in self.customers.values():
            if (query in customer.name.lower() or 
                query in customer.email.lower() or 
                query in customer.phone):
                results.append(customer)
        return results
    
    def add_trip_history(self, customer_id: str, trip_data: Dict[str, Any]):
        """Add a trip to customer's history"""
        if customer_id not in self.customers:
            return False
        
        trip = TravelHistory(
            trip_id=trip_data.get('trip_id', f"TRIP_{datetime.now().strftime('%Y%m%d%H%M%S')}"),
            destination=trip_data.get('destination', ''),
            travel_dates=trip_data.get('travel_dates', []),
            total_cost=trip_data.get('total_cost', 0.0),
            satisfaction_rating=trip_data.get('satisfaction_rating', 0),
            travel_type=TravelType(trip_data.get('travel_type', 'leisure')),
            companions=trip_data.get('companions', 1),
            booked_through_agent=trip_data.get('booked_through_agent', True),
            notes=trip_data.get('notes', '')
        )
        
        self.customers[customer_id].travel_history.append(trip)
        self.customers[customer_id].last_updated = datetime.now().isoformat()
        self._save_customers()
        return True
    
    def get_personalized_recommendations(self, customer_id: str, trip_request: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized recommendations based on customer profile"""
        customer = self.get_customer(customer_id)
        if not customer:
            return {"error": "Customer not found"}
        
        recommendations = {
            "customer_insights": {
                "total_trips": len(customer.travel_history),
                "average_spending": self._calculate_average_spending(customer),
                "preferred_travel_type": customer.preferences.travel_type.value,
                "loyalty_status": self._get_loyalty_status(customer.loyalty_points)
            },
            "personalized_suggestions": [],
            "budget_guidance": self._get_budget_guidance(customer, trip_request),
            "preference_matches": [],
            "upsell_opportunities": []
        }
        
        # Airline recommendations
        if customer.preferences.preferred_airlines:
            recommendations["preference_matches"].append({
                "type": "airline",
                "message": f"Consider {', '.join(customer.preferences.preferred_airlines)} - customer's preferred airlines"
            })
        
        # Hotel recommendations
        if customer.preferences.preferred_hotel_chains:
            recommendations["preference_matches"].append({
                "type": "hotel",
                "message": f"Look for {', '.join(customer.preferences.preferred_hotel_chains)} properties"
            })
        
        # Budget recommendations
        if customer.preferences.budget_category == BudgetCategory.LUXURY:
            recommendations["upsell_opportunities"].append({
                "type": "class_upgrade",
                "message": "Customer prefers luxury - suggest business class upgrade"
            })
        
        return recommendations
    
    def _calculate_average_spending(self, customer: CustomerProfile) -> float:
        """Calculate customer's average trip spending"""
        if not customer.travel_history:
            return 0.0
        total = sum(trip.total_cost for trip in customer.travel_history)
        return total / len(customer.travel_history)
    
    def _get_loyalty_status(self, points: int) -> str:
        """Get customer loyalty status"""
        if points >= 10000:
            return "Platinum"
        elif points >= 5000:
            return "Gold"
        elif points >= 2000:
            return "Silver"
        else:
            return "Bronze"
    
    def _get_budget_guidance(self, customer: CustomerProfile, trip_request: Dict[str, Any]) -> Dict[str, Any]:
        """Provide budget guidance based on customer history"""
        avg_spending = self._calculate_average_spending(customer)
        requested_budget = trip_request.get('budget', 0)
        
        guidance = {
            "historical_average": avg_spending,
            "current_request": requested_budget,
            "recommendation": ""
        }
        
        if requested_budget > 0:
            if requested_budget < avg_spending * 0.8:
                guidance["recommendation"] = "Budget is lower than usual - focus on budget options"
            elif requested_budget > avg_spending * 1.2:
                guidance["recommendation"] = "Higher budget than usual - great opportunity for upgrades"
            else:
                guidance["recommendation"] = "Budget aligns with customer's typical spending"
        
        return guidance

# Tool integration for LangChain
def get_customer_insights(customer_id: str, trip_request: str = "") -> str:
    """Tool function for getting customer insights and recommendations"""
    manager = CustomerManager()
    
    # Parse trip request (simple implementation)
    trip_data = {"destination": trip_request, "budget": 0}
    
    customer = manager.get_customer(customer_id)
    if not customer:
        return json.dumps({"error": f"Customer {customer_id} not found"})
    
    recommendations = manager.get_personalized_recommendations(customer_id, trip_data)
    
    return json.dumps({
        "customer_name": customer.name,
        "customer_insights": recommendations["customer_insights"],
        "recommendations": recommendations["personalized_suggestions"],
        "preferences": {
            "preferred_class": customer.preferences.preferred_class,
            "budget_category": customer.preferences.budget_category.value,
            "travel_type": customer.preferences.travel_type.value
        },
        "agent_notes": customer.agent_notes[-3:] if customer.agent_notes else []
    }, indent=2)