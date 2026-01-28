"""
Real API Integration for Amadeus Flight Search
Live flight data with real pricing and availability
"""

import os
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

class AmadeusFlightAPI:
    """Real Amadeus API integration for flight search"""
    
    def __init__(self):
        self.api_key = os.getenv('AMADEUS_API_KEY')
        self.api_secret = os.getenv('AMADEUS_API_SECRET')
        self.base_url = "https://test.api.amadeus.com"
        self.access_token = None
        self.token_expires_at = None
        
    def _get_access_token(self) -> bool:
        """Get or refresh Amadeus access token"""
        # Check if token is still valid
        if (self.access_token and self.token_expires_at and 
            datetime.now() < self.token_expires_at):
            return True
            
        if not self.api_key or not self.api_secret:
            print("❌ Amadeus API credentials not found in .env file")
            return False
            
        try:
            url = f"{self.base_url}/v1/security/oauth2/token"
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            data = {
                'grant_type': 'client_credentials',
                'client_id': self.api_key,
                'client_secret': self.api_secret
            }
            
            response = requests.post(url, headers=headers, data=data, timeout=10)
            
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data['access_token']
                expires_in = token_data.get('expires_in', 3600)  # Default 1 hour
                self.token_expires_at = datetime.now() + timedelta(seconds=expires_in - 60)  # 1 min buffer
                print("✅ Amadeus API token obtained successfully")
                return True
            else:
                print(f"❌ Failed to get Amadeus token: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error getting Amadeus token: {str(e)}")
            return False
    
    def search_flights(self, origin: str, destination: str, departure_date: str, 
                      passengers: int = 1, travel_class: str = "ECONOMY") -> Dict[str, Any]:
        """
        Search for real flights using Amadeus API
        
        Args:
            origin: IATA airport code (e.g., 'DEL')
            destination: IATA airport code (e.g., 'BOM')
            departure_date: Date in YYYY-MM-DD format
            passengers: Number of adult passengers
            travel_class: ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
            
        Returns:
            Flight search results with real pricing
        """
        
        if not self._get_access_token():
            return {"error": "Failed to authenticate with Amadeus API", "flights": []}
        
        # Convert city names to IATA codes if needed
        origin_iata = self._city_to_iata(origin)
        dest_iata = self._city_to_iata(destination)
        
        try:
            url = f"{self.base_url}/v2/shopping/flight-offers"
            headers = {'Authorization': f'Bearer {self.access_token}'}
            
            # Ensure date is in future
            if not departure_date:
                departure_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
            
            params = {
                'originLocationCode': origin_iata,
                'destinationLocationCode': dest_iata,
                'departureDate': departure_date,
                'adults': passengers,
                'travelClass': travel_class,
                'max': 20,  # Get more options
                'currencyCode': 'INR'
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get('data', [])
                
                if not flights:
                    return {
                        "status": "no_flights",
                        "message": f"No flights found from {origin} to {destination} on {departure_date}",
                        "flights": [],
                        "suggestions": [
                            "Try different dates (+/- 3 days)",
                            "Check nearby airports",
                            "Consider connecting flights"
                        ]
                    }
                
                # Process and format flights
                formatted_flights = []
                for flight in flights:
                    try:
                        formatted_flight = self._format_flight_data(flight)
                        if formatted_flight:
                            formatted_flights.append(formatted_flight)
                    except Exception as e:
                        print(f"Error formatting flight: {e}")
                        continue
                
                # Sort by price
                formatted_flights.sort(key=lambda x: x.get('total_price', 0))
                
                # Find best options
                cheapest = min(formatted_flights, key=lambda x: x.get('total_price', 0)) if formatted_flights else None
                fastest = min(formatted_flights, key=lambda x: x.get('duration_minutes', 999999)) if formatted_flights else None
                
                return {
                    "status": "success",
                    "source": "amadeus_live_api",
                    "search_params": {
                        "origin": origin_iata,
                        "destination": dest_iata,
                        "date": departure_date,
                        "passengers": passengers,
                        "class": travel_class
                    },
                    "total_results": len(formatted_flights),
                    "cheapest_flight": cheapest,
                    "fastest_flight": fastest,
                    "all_flights": formatted_flights[:10],  # Top 10 results
                    "booking_tips": [
                        "✅ Real-time prices - book soon to secure rate",
                        "💡 Price may change based on availability", 
                        "📞 Call agent for group bookings (10+ passengers)",
                        "💳 Additional fees may apply for seat selection"
                    ]
                }
                
            else:
                error_msg = response.text
                print(f"❌ Amadeus API error: {response.status_code} - {error_msg}")
                return {
                    "error": f"API Error: {response.status_code}",
                    "message": "Unable to fetch real-time flight data",
                    "flights": []
                }
                
        except requests.exceptions.Timeout:
            return {
                "error": "API Timeout",
                "message": "Flight search took too long - please try again",
                "flights": []
            }
        except Exception as e:
            print(f"❌ Unexpected error in flight search: {str(e)}")
            return {
                "error": "Unexpected Error", 
                "message": f"Flight search failed: {str(e)}",
                "flights": []
            }
    
    def _format_flight_data(self, flight_data: Dict) -> Optional[Dict[str, Any]]:
        """Format Amadeus flight data to our standard format"""
        try:
            itinerary = flight_data['itineraries'][0]
            segments = itinerary['segments']
            pricing = flight_data['price']
            
            # Calculate total duration in minutes
            duration_str = itinerary['duration']
            duration_minutes = self._parse_duration(duration_str)
            
            # Get airline info
            first_segment = segments[0]
            airline_code = first_segment['carrierCode']
            flight_number = f"{airline_code}{first_segment['number']}"
            
            # Format times
            departure_time = first_segment['departure']['at']
            arrival_time = segments[-1]['arrival']['at']
            
            # Parse datetime for formatting
            dept_dt = datetime.fromisoformat(departure_time.replace('Z', '+00:00'))
            arr_dt = datetime.fromisoformat(arrival_time.replace('Z', '+00:00'))
            
            formatted_flight = {
                'flight_id': flight_data.get('id', f"AM_{hash(flight_number)}"),
                'flight_number': flight_number,
                'airline': airline_code,
                'airline_name': self._get_airline_name(airline_code),
                'source': first_segment['departure']['iataCode'],
                'destination': segments[-1]['arrival']['iataCode'],
                'departure_time': dept_dt.strftime('%H:%M'),
                'arrival_time': arr_dt.strftime('%H:%M'),
                'departure_date': dept_dt.strftime('%Y-%m-%d'),
                'arrival_date': arr_dt.strftime('%Y-%m-%d'),
                'duration': duration_str,
                'duration_minutes': duration_minutes,
                'stops': len(segments) - 1,
                'total_price': float(pricing['total']),
                'base_price': float(pricing.get('base', pricing['total'])),
                'taxes_fees': float(pricing['total']) - float(pricing.get('base', pricing['total'])),
                'currency': pricing.get('currency', 'INR'),
                'cabin_class': first_segment['cabin'],
                'aircraft_type': first_segment.get('aircraft', {}).get('code', 'Unknown'),
                'booking_class': first_segment['bookingClass'],
                'seats_available': flight_data.get('numberOfBookableSeats', 'Limited'),
                'is_refundable': pricing.get('refundableFare', False),
                'segment_details': [
                    {
                        'airline': seg['carrierCode'],
                        'flight_number': f"{seg['carrierCode']}{seg['number']}",
                        'departure': seg['departure']['iataCode'],
                        'arrival': seg['arrival']['iataCode'],
                        'departure_time': seg['departure']['at'],
                        'arrival_time': seg['arrival']['at'],
                        'duration': seg['duration']
                    }
                    for seg in segments
                ],
                'api_source': 'amadeus_live',
                'last_updated': datetime.now().isoformat()
            }
            
            return formatted_flight
            
        except Exception as e:
            print(f"Error formatting flight data: {e}")
            return None
    
    def _parse_duration(self, duration_str: str) -> int:
        """Parse ISO 8601 duration to minutes (e.g., 'PT2H30M' -> 150)"""
        try:
            duration_str = duration_str.replace('PT', '')
            hours = 0
            minutes = 0
            
            if 'H' in duration_str:
                hours_str = duration_str.split('H')[0]
                hours = int(hours_str) if hours_str.isdigit() else 0
                duration_str = duration_str.split('H')[1] if 'H' in duration_str else duration_str
            
            if 'M' in duration_str:
                minutes_str = duration_str.replace('M', '')
                minutes = int(minutes_str) if minutes_str.isdigit() else 0
            
            return hours * 60 + minutes
        except:
            return 0
    
    def _city_to_iata(self, city: str) -> str:
        """Convert city name to IATA airport code"""
        city_mapping = {
            'delhi': 'DEL', 'new delhi': 'DEL',
            'mumbai': 'BOM', 'bombay': 'BOM',
            'bangalore': 'BLR', 'bengaluru': 'BLR',
            'chennai': 'MAA', 'madras': 'MAA',
            'kolkata': 'CCU', 'calcutta': 'CCU',
            'hyderabad': 'HYD',
            'pune': 'PNQ',
            'ahmedabad': 'AMD',
            'goa': 'GOI',
            'jaipur': 'JAI',
            'kochi': 'COK', 'cochin': 'COK',
            'trivandrum': 'TRV',
            'dubai': 'DXB',
            'singapore': 'SIN',
            'bangkok': 'BKK',
            'kuala lumpur': 'KUL',
            'london': 'LHR',
            'paris': 'CDG',
            'new york': 'JFK',
            'tokyo': 'NRT'
        }
        
        # Try exact match first
        iata = city_mapping.get(city.lower(), city.upper())
        
        # If it's already 3 letters, assume it's IATA code
        if len(iata) == 3 and iata.isalpha():
            return iata
            
        return iata
    
    def _get_airline_name(self, airline_code: str) -> str:
        """Get full airline name from IATA code"""
        airline_names = {
            '6E': 'IndiGo', 'AI': 'Air India', 'SG': 'SpiceJet',
            'G8': 'Go First', 'UK': 'Vistara', 'I5': 'AirAsia India',
            'EK': 'Emirates', 'QR': 'Qatar Airways', 'SQ': 'Singapore Airlines',
            'LH': 'Lufthansa', 'BA': 'British Airways', 'AF': 'Air France'
        }
        return airline_names.get(airline_code, airline_code)

# Usage function for LangChain integration
def search_flights_live_api(origin: str, destination: str, departure_date: str = "", 
                           passengers: int = 1, travel_class: str = "ECONOMY") -> str:
    """
    Search for flights using live Amadeus API
    
    Args:
        origin: Source city or airport code
        destination: Destination city or airport code  
        departure_date: Departure date (YYYY-MM-DD)
        passengers: Number of passengers
        travel_class: ECONOMY, BUSINESS, FIRST
        
    Returns:
        JSON string with real flight data
    """
    
    amadeus = AmadeusFlightAPI()
    result = amadeus.search_flights(origin, destination, departure_date, passengers, travel_class)
    
    return json.dumps(result, indent=2, default=str)

# Test function
def test_amadeus_api():
    """Test the Amadeus API with sample data"""
    amadeus = AmadeusFlightAPI()
    
    # Test flight search
    result = amadeus.search_flights(
        origin="DEL",
        destination="BOM", 
        departure_date="2026-02-15",
        passengers=1
    )
    
    print(json.dumps(result, indent=2, default=str))

if __name__ == "__main__":
    test_amadeus_api()