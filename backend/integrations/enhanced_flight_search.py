"""
Enhanced flight search tool with real-time API integration.
"""

import requests
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import os

class RealTimeFlightSearch:
    """Real-time flight search using Amadeus API"""
    
    def __init__(self):
        self.amadeus_api_key = os.getenv('AMADEUS_API_KEY')
        self.amadeus_api_secret = os.getenv('AMADEUS_API_SECRET')
        self.access_token = None
        self.fallback_data = self._load_fallback_data()
    
    def _load_fallback_data(self):
        """Load static data as fallback"""
        try:
            with open('data/flights.json', 'r') as f:
                return json.load(f)
        except:
            return []
    
    def _get_access_token(self):
        """Get Amadeus API access token"""
        if not self.amadeus_api_key or not self.amadeus_api_secret:
            return None
            
        url = "https://test.api.amadeus.com/v1/security/oauth2/token"
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        data = {
            'grant_type': 'client_credentials',
            'client_id': self.amadeus_api_key,
            'client_secret': self.amadeus_api_secret
        }
        
        try:
            response = requests.post(url, headers=headers, data=data)
            if response.status_code == 200:
                self.access_token = response.json()['access_token']
                return self.access_token
        except Exception as e:
            print(f"Error getting access token: {e}")
        return None
    
    def search_flights_realtime(self, source: str, destination: str, 
                               departure_date: str = None, passengers: int = 1) -> Dict[str, Any]:
        """
        Search flights using real-time API
        
        Args:
            source: IATA airport code (e.g., 'DEL')
            destination: IATA airport code (e.g., 'GOI')
            departure_date: Date in YYYY-MM-DD format
            passengers: Number of passengers
        
        Returns:
            Flight search results with real-time prices
        """
        
        # Try real-time API first
        if self._get_access_token():
            try:
                return self._amadeus_search(source, destination, departure_date, passengers)
            except Exception as e:
                print(f"Real-time API failed: {e}, falling back to static data")
        
        # Fallback to enhanced static data
        return self._enhanced_static_search(source, destination)
    
    def _amadeus_search(self, source: str, destination: str, 
                       departure_date: str, passengers: int) -> Dict[str, Any]:
        """Search using Amadeus API"""
        
        url = "https://test.api.amadeus.com/v2/shopping/flight-offers"
        headers = {'Authorization': f'Bearer {self.access_token}'}
        
        # Default to tomorrow if no date specified
        if not departure_date:
            from datetime import datetime, timedelta
            departure_date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        params = {
            'originLocationCode': source,
            'destinationLocationCode': destination,
            'departureDate': departure_date,
            'adults': passengers,
            'max': 10  # Limit results
        }
        
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        data = response.json()
        flights = data.get('data', [])
        
        # Process and format results
        formatted_flights = []
        for flight in flights[:5]:  # Top 5 results
            segments = flight['itineraries'][0]['segments']
            price = float(flight['price']['total'])
            
            formatted_flight = {
                'flight_id': flight.get('id', 'N/A'),
                'airline': segments[0]['carrierCode'],
                'source': segments[0]['departure']['iataCode'],
                'destination': segments[-1]['arrival']['iataCode'],
                'departure_time': segments[0]['departure']['at'],
                'arrival_time': segments[-1]['arrival']['at'],
                'duration': flight['itineraries'][0]['duration'],
                'price': price,
                'class': 'Economy',
                'real_time': True
            }
            formatted_flights.append(formatted_flight)
        
        return {
            'status': 'success',
            'source': 'amadeus_api',
            'flights': formatted_flights,
            'total_results': len(flights)
        }
    
    def _enhanced_static_search(self, source: str, destination: str) -> Dict[str, Any]:
        """Enhanced static search with price variations"""
        
        # Apply city name to IATA mapping
        city_to_iata = {
            'delhi': 'DEL', 'mumbai': 'BOM', 'goa': 'GOI', 
            'jaipur': 'JAI', 'bangalore': 'BLR', 'chennai': 'MAA'
        }
        
        source_iata = city_to_iata.get(source.lower(), source.upper())
        dest_iata = city_to_iata.get(destination.lower(), destination.upper())
        
        matching_flights = []
        for flight in self.fallback_data:
            if (flight['source'].lower() == source.lower() and 
                flight['destination'].lower() == destination.lower()):
                
                # Add price variation (±20% for dynamic feel)
                import random
                base_price = flight['price']
                variation = random.uniform(0.8, 1.2)
                flight['price'] = int(base_price * variation)
                flight['real_time'] = False
                matching_flights.append(flight)
        
        return {
            'status': 'success',
            'source': 'static_enhanced',
            'flights': matching_flights,
            'total_results': len(matching_flights)
        }

# Integration with existing tools.py
def enhanced_search_flights(source: str, destination: str, 
                           departure_date: str = None, passengers: int = 1) -> str:
    """Enhanced flight search tool"""
    
    flight_search = RealTimeFlightSearch()
    result = flight_search.search_flights_realtime(source, destination, departure_date, passengers)
    
    if result['status'] == 'success' and result['flights']:
        # Find cheapest and fastest
        flights = result['flights']
        cheapest = min(flights, key=lambda x: x['price'])
        fastest = min(flights, key=lambda x: x.get('duration', '999h'))
        
        enhanced_result = {
            'status': 'success',
            'data_source': result['source'],
            'total_flights': result['total_results'],
            'cheapest_flight': cheapest,
            'fastest_flight': fastest,
            'all_options': flights,
            'price_alert': 'Consider booking soon - prices may increase',
            'recommendations': [
                f"Best value: {cheapest['airline']} at ₹{cheapest['price']}",
                f"Fastest: {fastest['airline']} - {fastest.get('duration', 'N/A')}",
            ]
        }
        return json.dumps(enhanced_result, indent=2, default=str)
    
    return json.dumps({
        'status': 'error',
        'message': f'No flights found from {source} to {destination}',
        'suggestion': 'Try different dates or nearby airports'
    })