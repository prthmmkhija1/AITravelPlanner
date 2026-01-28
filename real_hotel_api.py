"""
Real Hotel API Integration using RapidAPI (Hotels.com & Booking.com)
Live hotel data with real pricing and availability
"""

import os
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

class RealHotelAPI:
    """Real hotel API integration using RapidAPI"""
    
    def __init__(self):
        self.rapidapi_key = os.getenv('RAPIDAPI_KEY')
        self.rapidapi_host_hotels = "hotels-com-provider.p.rapidapi.com"
        self.rapidapi_host_booking = "booking-com.p.rapidapi.com"
        
    def search_hotels(self, city: str, checkin_date: str, checkout_date: str,
                     adults: int = 2, rooms: int = 1, max_price: float = None) -> Dict[str, Any]:
        """
        Search for real hotels using RapidAPI
        
        Args:
            city: City name or destination
            checkin_date: Check-in date (YYYY-MM-DD)
            checkout_date: Check-out date (YYYY-MM-DD)
            adults: Number of adults
            rooms: Number of rooms
            max_price: Maximum price per night
            
        Returns:
            Hotel search results with real pricing
        """
        
        if not self.rapidapi_key:
            return {"error": "RapidAPI key not found in .env file", "hotels": []}
        
        # Try Hotels.com first, then Booking.com as backup
        hotels_result = self._search_hotels_com(city, checkin_date, checkout_date, adults, rooms, max_price)
        
        if hotels_result.get('status') == 'success' and hotels_result.get('hotels'):
            return hotels_result
        
        # Fallback to Booking.com
        return self._search_booking_com(city, checkin_date, checkout_date, adults, rooms, max_price)
    
    def _search_hotels_com(self, city: str, checkin_date: str, checkout_date: str,
                          adults: int, rooms: int, max_price: float) -> Dict[str, Any]:
        """Search using Hotels.com API via RapidAPI"""
        
        try:
            # First get destination ID
            dest_id = self._get_destination_id_hotels(city)
            if not dest_id:
                return {"error": f"Destination '{city}' not found", "hotels": []}
            
            # Search hotels
            url = "https://hotels-com-provider.p.rapidapi.com/v2/hotels/search"
            
            headers = {
                "X-RapidAPI-Key": self.rapidapi_key,
                "X-RapidAPI-Host": self.rapidapi_host_hotels
            }
            
            # Ensure dates are in future
            if not checkin_date:
                checkin_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
            if not checkout_date:
                checkout_date = (datetime.now() + timedelta(days=9)).strftime('%Y-%m-%d')
            
            params = {
                "destination_id": dest_id,
                "checkin_date": checkin_date,
                "checkout_date": checkout_date,
                "adults_number": adults,
                "room_number": rooms,
                "locale": "en_US",
                "currency": "INR",
                "units": "metric"
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                hotels_data = data.get('data', {}).get('body', {}).get('searchResults', {}).get('results', [])
                
                formatted_hotels = []
                for hotel in hotels_data[:15]:  # Top 15 results
                    try:
                        formatted_hotel = self._format_hotels_com_data(hotel, checkin_date, checkout_date)
                        if formatted_hotel:
                            # Apply price filter
                            if max_price and formatted_hotel.get('price_per_night', 0) > max_price:
                                continue
                            formatted_hotels.append(formatted_hotel)
                    except Exception as e:
                        print(f"Error formatting hotel: {e}")
                        continue
                
                if not formatted_hotels:
                    return {
                        "status": "no_hotels",
                        "message": f"No hotels found in {city} for {checkin_date} to {checkout_date}",
                        "hotels": [],
                        "suggestions": [
                            "Try different dates",
                            "Increase budget range",
                            "Check nearby areas"
                        ]
                    }
                
                # Sort by value (considering price and rating)
                formatted_hotels.sort(key=lambda x: (-x.get('rating', 0), x.get('price_per_night', 999999)))
                
                best_value = max(formatted_hotels, key=lambda x: x.get('rating', 0) / max(x.get('price_per_night', 1), 1000)) if formatted_hotels else None
                cheapest = min(formatted_hotels, key=lambda x: x.get('price_per_night', 999999)) if formatted_hotels else None
                highest_rated = max(formatted_hotels, key=lambda x: x.get('rating', 0)) if formatted_hotels else None
                
                return {
                    "status": "success",
                    "source": "hotels_com_live_api",
                    "search_params": {
                        "city": city,
                        "checkin": checkin_date,
                        "checkout": checkout_date,
                        "adults": adults,
                        "rooms": rooms
                    },
                    "total_results": len(formatted_hotels),
                    "best_value": best_value,
                    "cheapest": cheapest,
                    "highest_rated": highest_rated,
                    "all_hotels": formatted_hotels[:10],  # Top 10 results
                    "booking_tips": [
                        "✅ Real-time availability - book now to secure rate",
                        "💡 Prices may change based on demand",
                        "🎯 Free cancellation available on selected hotels",
                        "💳 Additional city tax may apply at hotel"
                    ]
                }
                
            else:
                print(f"❌ Hotels.com API error: {response.status_code} - {response.text}")
                return {"error": f"Hotels.com API Error: {response.status_code}", "hotels": []}
                
        except Exception as e:
            print(f"❌ Error in Hotels.com search: {str(e)}")
            return {"error": f"Hotels.com search failed: {str(e)}", "hotels": []}
    
    def _search_booking_com(self, city: str, checkin_date: str, checkout_date: str,
                           adults: int, rooms: int, max_price: float) -> Dict[str, Any]:
        """Search using Booking.com API via RapidAPI (fallback)"""
        
        try:
            url = "https://booking-com.p.rapidapi.com/v1/hotels/locations"
            
            headers = {
                "X-RapidAPI-Key": self.rapidapi_key,
                "X-RapidAPI-Host": self.rapidapi_host_booking
            }
            
            # Get location ID first
            params = {"name": city, "locale": "en-gb"}
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code != 200:
                return {"error": "Booking.com API unavailable", "hotels": []}
            
            locations = response.json()
            if not locations:
                return {"error": f"City '{city}' not found on Booking.com", "hotels": []}
            
            dest_id = locations[0].get('dest_id')
            if not dest_id:
                return {"error": f"Invalid destination: {city}", "hotels": []}
            
            # Search hotels
            search_url = "https://booking-com.p.rapidapi.com/v1/hotels/search"
            
            search_params = {
                "dest_id": dest_id,
                "order_by": "popularity",
                "filter_by_currency": "INR",
                "adults_number": adults,
                "room_number": rooms,
                "checkin_date": checkin_date,
                "checkout_date": checkout_date,
                "locale": "en-gb",
                "units": "metric"
            }
            
            search_response = requests.get(search_url, headers=headers, params=search_params, timeout=15)
            
            if search_response.status_code == 200:
                data = search_response.json()
                hotels_data = data.get('result', [])
                
                formatted_hotels = []
                for hotel in hotels_data[:10]:
                    try:
                        formatted_hotel = self._format_booking_com_data(hotel, checkin_date, checkout_date)
                        if formatted_hotel:
                            if max_price and formatted_hotel.get('price_per_night', 0) > max_price:
                                continue
                            formatted_hotels.append(formatted_hotel)
                    except Exception as e:
                        print(f"Error formatting Booking.com hotel: {e}")
                        continue
                
                return {
                    "status": "success",
                    "source": "booking_com_live_api",
                    "search_params": {"city": city, "checkin": checkin_date, "checkout": checkout_date},
                    "total_results": len(formatted_hotels),
                    "all_hotels": formatted_hotels,
                    "booking_tips": ["Real-time data from Booking.com", "Prices include taxes"]
                }
            
            return {"error": "Booking.com search failed", "hotels": []}
            
        except Exception as e:
            return {"error": f"Booking.com error: {str(e)}", "hotels": []}
    
    def _get_destination_id_hotels(self, city: str) -> Optional[str]:
        """Get destination ID for Hotels.com"""
        try:
            url = "https://hotels-com-provider.p.rapidapi.com/v2/destinations/search"
            headers = {
                "X-RapidAPI-Key": self.rapidapi_key,
                "X-RapidAPI-Host": self.rapidapi_host_hotels
            }
            params = {"query": city, "locale": "en_US"}
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                suggestions = data.get('data', {}).get('body', {}).get('suggestions', [])
                
                for suggestion in suggestions:
                    entities = suggestion.get('entities', [])
                    for entity in entities:
                        if entity.get('type') == 'CITY':
                            return entity.get('destinationId')
            
            return None
        except:
            return None
    
    def _format_hotels_com_data(self, hotel_data: Dict, checkin: str, checkout: str) -> Optional[Dict[str, Any]]:
        """Format Hotels.com data to standard format"""
        try:
            # Calculate nights
            checkin_dt = datetime.strptime(checkin, '%Y-%m-%d')
            checkout_dt = datetime.strptime(checkout, '%Y-%m-%d')
            nights = (checkout_dt - checkin_dt).days
            
            # Extract pricing
            ratePlan = hotel_data.get('ratePlan', {})
            price_info = ratePlan.get('price', {})
            current_price = price_info.get('current', 0)
            
            # Convert to per night if total
            price_per_night = current_price / max(nights, 1) if current_price else 0
            
            # Extract amenities
            amenities = []
            facilities = hotel_data.get('amenities', {}).get('amenities', [])
            for facility in facilities[:8]:  # Top 8 amenities
                amenities.append(facility.get('description', ''))
            
            formatted_hotel = {
                'hotel_id': hotel_data.get('id', ''),
                'name': hotel_data.get('name', ''),
                'rating': hotel_data.get('starRating', 0),
                'guest_rating': hotel_data.get('guestReviews', {}).get('rating', 0),
                'review_count': hotel_data.get('guestReviews', {}).get('total', 0),
                'price_per_night': round(price_per_night),
                'total_price': round(current_price),
                'currency': 'INR',
                'address': hotel_data.get('address', {}).get('streetAddress', ''),
                'location': hotel_data.get('neighbourhood', ''),
                'amenities': [am for am in amenities if am],
                'coordinates': {
                    'lat': hotel_data.get('coordinate', {}).get('lat', 0),
                    'lng': hotel_data.get('coordinate', {}).get('lon', 0)
                },
                'distance_from_center': hotel_data.get('landmarks', [{}])[0].get('distance', '') if hotel_data.get('landmarks') else '',
                'free_cancellation': ratePlan.get('features', {}).get('freeCancellation', False),
                'free_wifi': any('wifi' in am.lower() for am in amenities),
                'images': [img.get('baseUrl', '') for img in hotel_data.get('optimizedThumbUrls', {}).get('srpDesktop', [])[:3]],
                'api_source': 'hotels_com_live',
                'last_updated': datetime.now().isoformat()
            }
            
            return formatted_hotel
            
        except Exception as e:
            print(f"Error formatting Hotels.com data: {e}")
            return None
    
    def _format_booking_com_data(self, hotel_data: Dict, checkin: str, checkout: str) -> Optional[Dict[str, Any]]:
        """Format Booking.com data to standard format"""
        try:
            price = hotel_data.get('price_breakdown', {}).get('gross_price', 0)
            if isinstance(price, str):
                # Remove currency symbols and convert
                price = float(''.join(filter(str.isdigit, price.replace('.', '').replace(',', '')))) / 100
            
            formatted_hotel = {
                'hotel_id': str(hotel_data.get('hotel_id', '')),
                'name': hotel_data.get('hotel_name', ''),
                'rating': hotel_data.get('class', 0),
                'guest_rating': hotel_data.get('review_score', 0),
                'review_count': hotel_data.get('review_nr', 0),
                'price_per_night': round(price),
                'total_price': round(price),
                'currency': 'INR',
                'address': hotel_data.get('address', ''),
                'location': hotel_data.get('district', ''),
                'distance_from_center': hotel_data.get('distance_to_cc', ''),
                'free_wifi': hotel_data.get('has_free_wifi', 0) == 1,
                'api_source': 'booking_com_live',
                'last_updated': datetime.now().isoformat()
            }
            
            return formatted_hotel
            
        except Exception as e:
            print(f"Error formatting Booking.com data: {e}")
            return None

# Usage function for LangChain integration
def search_hotels_live_api(city: str, checkin_date: str = "", checkout_date: str = "",
                          adults: int = 2, rooms: int = 1, max_price: float = None) -> str:
    """
    Search for hotels using live APIs
    
    Args:
        city: City name
        checkin_date: Check-in date (YYYY-MM-DD)
        checkout_date: Check-out date (YYYY-MM-DD)
        adults: Number of adults
        rooms: Number of rooms
        max_price: Maximum price per night
        
    Returns:
        JSON string with real hotel data
    """
    
    hotel_api = RealHotelAPI()
    result = hotel_api.search_hotels(city, checkin_date, checkout_date, adults, rooms, max_price)
    
    return json.dumps(result, indent=2, default=str)

# Test function
def test_hotel_api():
    """Test the hotel API with sample data"""
    hotel_api = RealHotelAPI()
    
    result = hotel_api.search_hotels(
        city="Mumbai",
        checkin_date="2026-02-15",
        checkout_date="2026-02-17",
        adults=2,
        rooms=1
    )
    
    print(json.dumps(result, indent=2, default=str))

if __name__ == "__main__":
    test_hotel_api()