"""
Real Activities & Places API Integration using Foursquare & OpenTripMap
100% FREE APIs - No credit card required!
"""

import os
import requests
import json
from datetime import datetime
from typing import Dict, List, Any, Optional

class RealActivitiesAPI:
    """Real activities API integration using FREE APIs (Foursquare, OpenTripMap)"""
    
    def __init__(self):
        self.foursquare_key = os.getenv('FOURSQUARE_API_KEY')
        # OpenTripMap doesn't require API key for basic usage
        self.opentripmap_key = os.getenv('OPENTRIPMAP_API_KEY', '')
        
    def search_activities(self, city: str, activity_type: str = "", 
                         max_budget: int = 10000, radius: int = 5000) -> Dict[str, Any]:
        """
        Search for real activities and attractions using FREE APIs
        
        Args:
            city: City name
            activity_type: Type of activity (tourist_attraction, restaurant, shopping, etc.)
            radius: Search radius in meters
            
        Returns:
            Activity search results with real data
        """
        
        # Try Foursquare first (best free option)
        if self.foursquare_key and self.foursquare_key != 'your_foursquare_key_here':
            foursquare_result = self._search_foursquare(city, activity_type, radius)
            if foursquare_result.get('status') == 'success':
                return foursquare_result
        
        # Fallback to OpenTripMap (free, no key required for basic)
        opentripmap_result = self._search_opentripmap(city, activity_type, radius)
        if opentripmap_result.get('status') == 'success':
            return opentripmap_result
        
        return {"error": "No API keys available. Please add FOURSQUARE_API_KEY to .env", "activities": []}
    
    def _search_google_places(self, city: str, activity_type: str, radius: int) -> Dict[str, Any]:
        """Search using Google Places API"""
        
        try:
            # First get city coordinates
            geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
            geocode_params = {
                'address': city,
                'key': self.google_places_key
            }
            
            geocode_response = requests.get(geocode_url, params=geocode_params, timeout=10)
            
            if geocode_response.status_code != 200:
                return {"error": "Failed to get city location", "activities": []}
            
            geocode_data = geocode_response.json()
            if not geocode_data.get('results'):
                return {"error": f"City '{city}' not found", "activities": []}
            
            location = geocode_data['results'][0]['geometry']['location']
            lat, lng = location['lat'], location['lng']
            
            # Map activity types to Google Places types
            place_type = self._map_activity_type(activity_type)
            
            # Search nearby places
            places_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
            places_params = {
                'location': f"{lat},{lng}",
                'radius': radius,
                'type': place_type,
                'key': self.google_places_key
            }
            
            places_response = requests.get(places_url, params=places_params, timeout=15)
            
            if places_response.status_code != 200:
                return {"error": "Google Places API error", "activities": []}
            
            places_data = places_response.json()
            places = places_data.get('results', [])
            
            if not places:
                return {
                    "status": "no_activities",
                    "message": f"No {activity_type} activities found in {city}",
                    "activities": [],
                    "suggestions": ["Try different activity type", "Expand search radius"]
                }
            
            # Format activities
            formatted_activities = []
            for place in places[:15]:  # Top 15 results
                try:
                    formatted_activity = self._format_google_place(place, city)
                    if formatted_activity:
                        formatted_activities.append(formatted_activity)
                except Exception as e:
                    print(f"Error formatting Google place: {e}")
                    continue
            
            # Sort by rating
            formatted_activities.sort(key=lambda x: x.get('rating', 0), reverse=True)
            
            # Get enhanced details for top activities
            enhanced_activities = []
            for activity in formatted_activities[:10]:
                enhanced = self._get_place_details(activity.get('place_id'), activity)
                enhanced_activities.append(enhanced)
            
            # Find recommendations
            top_rated = max(enhanced_activities, key=lambda x: x.get('rating', 0)) if enhanced_activities else None
            most_reviewed = max(enhanced_activities, key=lambda x: x.get('review_count', 0)) if enhanced_activities else None
            budget_friendly = [a for a in enhanced_activities if a.get('estimated_cost', 0) <= 1000]
            
            return {
                "status": "success",
                "source": "google_places_live_api",
                "search_params": {
                    "city": city,
                    "type": activity_type,
                    "radius_km": radius / 1000
                },
                "total_results": len(enhanced_activities),
                "top_rated": top_rated,
                "most_reviewed": most_reviewed,
                "budget_friendly": budget_friendly[:3],
                "all_activities": enhanced_activities,
                "activity_tips": [
                    "✅ Real-time data from Google Places",
                    "📞 Call ahead to confirm timings",
                    "🎫 Book tickets online for popular attractions",
                    "💡 Check reviews for latest updates"
                ]
            }
            
        except Exception as e:
            print(f"❌ OpenTripMap API error: {str(e)}")
            return {"error": f"OpenTripMap search failed: {str(e)}", "activities": []}
    
    def _search_foursquare(self, city: str, activity_type: str, radius: int = 5000) -> Dict[str, Any]:
        """Search using Foursquare API (PRIMARY - FREE, no credit card)"""
        
        try:
            url = "https://api.foursquare.com/v3/places/search"
            
            headers = {
                "Accept": "application/json",
                "Authorization": self.foursquare_key
            }
            
            # Map activity types for Foursquare
            category_id = self._map_foursquare_category(activity_type)
            
            params = {
                "near": city,
                "categories": category_id,
                "limit": 20,
                "sort": "RELEVANCE"
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=15)
            
            if response.status_code != 200:
                print(f"Foursquare error: {response.status_code} - {response.text}")
                return {"error": f"Foursquare API error: {response.status_code}", "activities": []}
            
            data = response.json()
            places = data.get('results', [])
            
            if not places:
                return {
                    "status": "no_activities",
                    "message": f"No {activity_type} activities found in {city}",
                    "activities": [],
                    "suggestions": ["Try different activity type", "Check city spelling"]
                }
            
            formatted_activities = []
            for place in places:
                try:
                    formatted_activity = self._format_foursquare_place(place, city)
                    if formatted_activity:
                        # Get additional details if available
                        enhanced = self._get_foursquare_details(place.get('fsq_id'), formatted_activity)
                        formatted_activities.append(enhanced)
                except Exception as e:
                    print(f"Error formatting Foursquare place: {e}")
                    continue
            
            # Sort by rating
            formatted_activities.sort(key=lambda x: x.get('rating', 0), reverse=True)
            
            # Find recommendations
            top_rated = max(formatted_activities, key=lambda x: x.get('rating', 0)) if formatted_activities else None
            
            return {
                "status": "success",
                "source": "foursquare_live_api",
                "search_params": {"city": city, "type": activity_type},
                "total_results": len(formatted_activities),
                "top_rated": top_rated,
                "all_activities": formatted_activities[:15],
                "activity_tips": [
                    "✅ Real-time data from Foursquare (FREE API)",
                    "📞 Call ahead to confirm timings",
                    "🎫 Check if advance booking required",
                    "💡 Verify current operating hours"
                ]
            }
            
        except Exception as e:
            print(f"❌ Foursquare API error: {str(e)}")
            return {"error": f"Foursquare search failed: {str(e)}", "activities": []}
    
    def _search_opentripmap(self, city: str, activity_type: str, radius: int = 5000) -> Dict[str, Any]:
        """Search using OpenTripMap API (FREE backup - no API key required for basic)"""
        
        try:
            # Step 1: Get city coordinates using free geocoding
            geocode_url = f"https://api.opentripmap.com/0.1/en/places/geoname"
            geocode_params = {"name": city}
            
            if self.opentripmap_key:
                geocode_params["apikey"] = self.opentripmap_key
            
            geo_response = requests.get(geocode_url, params=geocode_params, timeout=10)
            
            if geo_response.status_code != 200:
                # Try alternative free geocoding
                return self._search_with_nominatim(city, activity_type, radius)
            
            geo_data = geo_response.json()
            lat = geo_data.get('lat')
            lon = geo_data.get('lon')
            
            if not lat or not lon:
                return {"error": f"City '{city}' not found", "activities": []}
            
            # Step 2: Search for places
            kind = self._map_opentripmap_kind(activity_type)
            
            places_url = f"https://api.opentripmap.com/0.1/en/places/radius"
            places_params = {
                "radius": radius,
                "lon": lon,
                "lat": lat,
                "kinds": kind,
                "rate": 2,  # Only get places with ratings
                "limit": 20
            }
            
            if self.opentripmap_key:
                places_params["apikey"] = self.opentripmap_key
            
            places_response = requests.get(places_url, params=places_params, timeout=15)
            
            if places_response.status_code != 200:
                return {"error": "OpenTripMap API error", "activities": []}
            
            places = places_response.json()
            
            if not places:
                return {
                    "status": "no_activities",
                    "message": f"No activities found in {city}",
                    "activities": []
                }
            
            formatted_activities = []
            for place in places[:15]:
                try:
                    formatted = self._format_opentripmap_place(place, city)
                    if formatted:
                        formatted_activities.append(formatted)
                except Exception as e:
                    continue
            
            return {
                "status": "success",
                "source": "opentripmap_free_api",
                "search_params": {"city": city, "type": activity_type},
                "total_results": len(formatted_activities),
                "all_activities": formatted_activities,
                "activity_tips": [
                    "✅ Free data from OpenTripMap",
                    "📍 Verify locations before visiting",
                    "🌐 Check official websites for timings"
                ]
            }
            
        except Exception as e:
            print(f"❌ OpenTripMap error: {str(e)}")
            return {"error": f"OpenTripMap search failed: {str(e)}", "activities": []}
    
    def _search_with_nominatim(self, city: str, activity_type: str, radius: int) -> Dict[str, Any]:
        """Fallback search using free Nominatim geocoding"""
        try:
            # Free geocoding without API key
            geocode_url = "https://nominatim.openstreetmap.org/search"
            headers = {"User-Agent": "AITravelPlanner/1.0"}
            params = {"q": city, "format": "json", "limit": 1}
            
            response = requests.get(geocode_url, headers=headers, params=params, timeout=10)
            if response.status_code == 200 and response.json():
                location = response.json()[0]
                lat, lon = location['lat'], location['lon']
                
                # Return basic city info as activity
                return {
                    "status": "success",
                    "source": "nominatim_free",
                    "message": f"Found location for {city}",
                    "all_activities": [{
                        "name": f"Explore {city}",
                        "city": city,
                        "type": "General",
                        "coordinates": {"lat": float(lat), "lng": float(lon)},
                        "description": f"Discover attractions in {city}"
                    }]
                }
        except:
            pass
        return {"error": "Geocoding failed", "activities": []}
    
    def _get_foursquare_details(self, fsq_id: str, base_activity: Dict) -> Dict[str, Any]:
        """Get enhanced details from Foursquare"""
        if not fsq_id or not self.foursquare_key:
            return base_activity
        
        try:
            url = f"https://api.foursquare.com/v3/places/{fsq_id}"
            headers = {
                "Accept": "application/json",
                "Authorization": self.foursquare_key
            }
            params = {"fields": "rating,hours,photos,tips,stats"}
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                details = response.json()
                enhanced = base_activity.copy()
                
                # Add rating
                enhanced['rating'] = details.get('rating', 0) / 2  # Foursquare uses 10-scale
                
                # Add hours
                hours = details.get('hours', {})
                enhanced['opening_hours'] = hours.get('display', 'Check website')
                enhanced['open_now'] = hours.get('open_now')
                
                # Add photos
                photos = details.get('photos', [])
                if photos:
                    enhanced['photos'] = [
                        f"{photo.get('prefix')}300x300{photo.get('suffix')}"
                        for photo in photos[:3]
                    ]
                
                # Add tips/reviews
                tips = details.get('tips', [])
                if tips:
                    enhanced['recent_reviews'] = [
                        {"text": tip.get('text', '')[:200]}
                        for tip in tips[:3]
                    ]
                
                return enhanced
                
        except Exception as e:
            print(f"Error getting Foursquare details: {e}")
        
        return base_activity
    
    def _format_opentripmap_place(self, place_data: Dict, city: str) -> Optional[Dict[str, Any]]:
        """Format OpenTripMap data to standard format"""
        try:
            return {
                'activity_id': place_data.get('xid', ''),
                'name': place_data.get('name', 'Unknown Place'),
                'city': city,
                'type': place_data.get('kinds', '').split(',')[0].replace('_', ' ').title() if place_data.get('kinds') else 'Attraction',
                'rating': place_data.get('rate', 0),
                'coordinates': {
                    'lat': place_data.get('point', {}).get('lat', 0),
                    'lng': place_data.get('point', {}).get('lon', 0)
                },
                'estimated_duration': '2 hours',
                'estimated_cost': 500,
                'api_source': 'opentripmap_free',
                'last_updated': datetime.now().isoformat()
            }
        except:
            return None
    
    def _map_opentripmap_kind(self, activity_type: str) -> str:
        """Map activity type to OpenTripMap kinds"""
        kind_mapping = {
            'tourist_attraction': 'interesting_places',
            'sightseeing': 'interesting_places',
            'museum': 'museums',
            'temple': 'religion',
            'religious': 'religion',
            'nature': 'natural',
            'park': 'natural',
            'cultural': 'cultural',
            'historic': 'historic',
            'architecture': 'architecture'
        }
        return kind_mapping.get(activity_type.lower(), 'interesting_places')
    
    def _get_place_details(self, place_id: str, base_activity: Dict) -> Dict[str, Any]:
        """Get enhanced details - now uses Foursquare instead of Google"""
        return self._get_foursquare_details(place_id, base_activity) if self.foursquare_key else base_activity
        
        if not place_id or not self.google_places_key:
            return base_activity
        
        try:
            details_url = "https://maps.googleapis.com/maps/api/place/details/json"
            details_params = {
                'place_id': place_id,
                'fields': 'name,rating,user_ratings_total,price_level,opening_hours,website,phone,photos,reviews',
                'key': self.google_places_key
            }
            
            response = requests.get(details_url, params=details_params, timeout=10)
            
            if response.status_code == 200:
                details_data = response.json()
                result = details_data.get('result', {})
                
                # Enhance the activity with detailed info
                enhanced = base_activity.copy()
                
                # Opening hours
                opening_hours = result.get('opening_hours', {})
                enhanced['opening_hours'] = opening_hours.get('weekday_text', [])
                enhanced['open_now'] = opening_hours.get('open_now', None)
                
                # Contact info
                enhanced['website'] = result.get('website', '')
                enhanced['phone'] = result.get('formatted_phone_number', '')
                
                # Price level (0-4 scale)
                price_level = result.get('price_level')
                if price_level is not None:
                    price_map = {0: 500, 1: 1000, 2: 2000, 3: 4000, 4: 8000}
                    enhanced['estimated_cost'] = price_map.get(price_level, 2000)
                    enhanced['price_category'] = ['Free', 'Budget', 'Moderate', 'Expensive', 'Very Expensive'][price_level]
                
                # Photos
                photos = result.get('photos', [])
                if photos:
                    photo_references = [photo['photo_reference'] for photo in photos[:3]]
                    enhanced['photos'] = [
                        f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={ref}&key={self.google_places_key}"
                        for ref in photo_references
                    ]
                
                # Recent reviews
                reviews = result.get('reviews', [])
                enhanced['recent_reviews'] = [
                    {
                        'author': review.get('author_name', ''),
                        'rating': review.get('rating', 0),
                        'text': review.get('text', '')[:200] + '...' if len(review.get('text', '')) > 200 else review.get('text', ''),
                        'time': review.get('relative_time_description', '')
                    }
                    for review in reviews[:3]
                ]
                
                return enhanced
            
        except Exception as e:
            print(f"Error getting place details: {e}")
        
        return base_activity
    
    def _format_google_place(self, place_data: Dict, city: str) -> Optional[Dict[str, Any]]:
        """Format Google Places data to standard format"""
        try:
            # Estimate activity duration and cost based on type
            place_types = place_data.get('types', [])
            duration, cost = self._estimate_duration_cost(place_types)
            
            formatted_activity = {
                'activity_id': place_data.get('place_id', ''),
                'place_id': place_data.get('place_id', ''),
                'name': place_data.get('name', ''),
                'city': city,
                'type': self._categorize_place_type(place_types),
                'rating': place_data.get('rating', 0),
                'review_count': place_data.get('user_ratings_total', 0),
                'address': place_data.get('vicinity', ''),
                'estimated_duration': duration,
                'estimated_cost': cost,
                'coordinates': {
                    'lat': place_data.get('geometry', {}).get('location', {}).get('lat', 0),
                    'lng': place_data.get('geometry', {}).get('location', {}).get('lng', 0)
                },
                'price_level': place_data.get('price_level'),
                'photos': [],
                'api_source': 'google_places_live',
                'last_updated': datetime.now().isoformat()
            }
            
            return formatted_activity
            
        except Exception as e:
            print(f"Error formatting Google place: {e}")
            return None
    
    def _format_foursquare_place(self, place_data: Dict, city: str) -> Optional[Dict[str, Any]]:
        """Format Foursquare data to standard format"""
        try:
            categories = place_data.get('categories', [])
            main_category = categories[0].get('name', '') if categories else ''
            
            formatted_activity = {
                'activity_id': place_data.get('fsq_id', ''),
                'name': place_data.get('name', ''),
                'city': city,
                'type': main_category,
                'rating': 0,  # Foursquare doesn't provide ratings in basic search
                'address': place_data.get('location', {}).get('formatted_address', ''),
                'estimated_duration': '2 hours',
                'estimated_cost': 1500,
                'coordinates': {
                    'lat': place_data.get('geocodes', {}).get('main', {}).get('latitude', 0),
                    'lng': place_data.get('geocodes', {}).get('main', {}).get('longitude', 0)
                },
                'api_source': 'foursquare_live',
                'last_updated': datetime.now().isoformat()
            }
            
            return formatted_activity
            
        except Exception as e:
            print(f"Error formatting Foursquare place: {e}")
            return None
    
    def _map_activity_type(self, activity_type: str) -> str:
        """Map activity type to Google Places type"""
        type_mapping = {
            'tourist_attraction': 'tourist_attraction',
            'sightseeing': 'tourist_attraction',
            'museum': 'museum',
            'temple': 'place_of_worship',
            'religious': 'place_of_worship',
            'shopping': 'shopping_mall',
            'restaurant': 'restaurant',
            'food': 'restaurant',
            'entertainment': 'amusement_park',
            'adventure': 'tourist_attraction',
            'nature': 'park',
            'park': 'park',
            'beach': 'natural_feature',
            'cultural': 'museum'
        }
        
        return type_mapping.get(activity_type.lower(), 'tourist_attraction')
    
    def _map_foursquare_category(self, activity_type: str) -> str:
        """Map activity type to Foursquare category ID"""
        category_mapping = {
            'tourist_attraction': '16000',
            'museum': '12000',
            'restaurant': '13000',
            'shopping': '17000',
            'entertainment': '10000'
        }
        
        return category_mapping.get(activity_type.lower(), '16000')
    
    def _categorize_place_type(self, place_types: List[str]) -> str:
        """Categorize Google place types into our categories"""
        if any(t in place_types for t in ['tourist_attraction', 'museum', 'place_of_worship']):
            return 'Cultural'
        elif any(t in place_types for t in ['amusement_park', 'zoo', 'aquarium']):
            return 'Entertainment'
        elif any(t in place_types for t in ['restaurant', 'food', 'meal_takeaway']):
            return 'Food & Dining'
        elif any(t in place_types for t in ['shopping_mall', 'store']):
            return 'Shopping'
        elif any(t in place_types for t in ['park', 'natural_feature']):
            return 'Nature & Parks'
        else:
            return 'General Attraction'
    
    def _estimate_duration_cost(self, place_types: List[str]) -> tuple:
        """Estimate duration and cost based on place types"""
        if any(t in place_types for t in ['museum', 'tourist_attraction']):
            return ('2-3 hours', 500)
        elif any(t in place_types for t in ['amusement_park', 'zoo']):
            return ('4-6 hours', 1500)
        elif any(t in place_types for t in ['restaurant', 'food']):
            return ('1-2 hours', 1000)
        elif any(t in place_types for t in ['shopping_mall', 'store']):
            return ('2-4 hours', 2000)
        elif any(t in place_types for t in ['park', 'natural_feature']):
            return ('1-3 hours', 0)
        else:
            return ('2 hours', 800)

# Usage function for LangChain integration
def search_activities_live_api(city: str, activity_type: str = "", max_budget: int = 10000) -> str:
    """
    Search for activities using live APIs
    
    Args:
        city: City name
        activity_type: Type of activity
        max_budget: Maximum budget
        
    Returns:
        JSON string with real activity data
    """
    
    activities_api = RealActivitiesAPI()
    result = activities_api.search_activities(city, activity_type, max_budget)
    
    return json.dumps(result, indent=2, default=str)

# Test function
def test_activities_api():
    """Test the activities API"""
    activities_api = RealActivitiesAPI()
    
    result = activities_api.search_activities(
        city="Mumbai",
        activity_type="tourist_attraction",
        max_budget=5000
    )
    
    print(json.dumps(result, indent=2, default=str))

if __name__ == "__main__":
    test_activities_api()