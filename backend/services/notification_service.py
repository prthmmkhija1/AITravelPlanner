"""
Notification Service for AI Travel Planner
Handles price monitoring, alerts, and notifications
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import threading
import time

from database import (
    create_notification, get_user_notifications, mark_notification_read,
    mark_all_notifications_read, create_price_alert, get_active_price_alerts,
    update_price_alert, deactivate_price_alert, get_saved_searches,
    update_saved_search, save_search
)

# Global flag for background task
_price_monitor_running = False
_price_monitor_thread = None


class NotificationService:
    """Service for managing notifications and price alerts"""
    
    @staticmethod
    def send_notification(user_id: int, title: str, message: str, 
                         notification_type: str = 'info', data: Dict = None) -> int:
        """Send a notification to a user"""
        return create_notification(user_id, title, message, notification_type, data)
    
    @staticmethod
    def get_notifications(user_id: int, unread_only: bool = False) -> List[Dict]:
        """Get notifications for a user"""
        return get_user_notifications(user_id, unread_only)
    
    @staticmethod
    def mark_read(notification_id: int, user_id: int) -> bool:
        """Mark a notification as read"""
        return mark_notification_read(notification_id, user_id)
    
    @staticmethod
    def mark_all_read(user_id: int) -> int:
        """Mark all notifications as read"""
        return mark_all_notifications_read(user_id)
    
    @staticmethod
    def get_unread_count(user_id: int) -> int:
        """Get count of unread notifications"""
        notifications = get_user_notifications(user_id, unread_only=True)
        return len(notifications)


class PriceAlertService:
    """Service for managing price alerts"""
    
    @staticmethod
    def create_alert(user_id: int, alert_type: str, search_params: Dict,
                    initial_price: float, target_price: float = None) -> Dict:
        """Create a new price alert"""
        alert_id = create_price_alert(user_id, alert_type, search_params, 
                                      initial_price, target_price)
        
        # Send confirmation notification
        NotificationService.send_notification(
            user_id=user_id,
            title="🔔 Price Alert Created",
            message=f"You'll be notified when {alert_type} prices change for this search.",
            notification_type="info",
            data={"alert_id": alert_id, "alert_type": alert_type}
        )
        
        return {
            "status": "success",
            "alert_id": alert_id,
            "message": "Price alert created successfully"
        }
    
    @staticmethod
    def get_alerts(user_id: int) -> List[Dict]:
        """Get all active price alerts for a user"""
        return get_active_price_alerts(user_id)
    
    @staticmethod
    def cancel_alert(alert_id: int, user_id: int) -> Dict:
        """Cancel a price alert"""
        success = deactivate_price_alert(alert_id, user_id)
        if success:
            return {"status": "success", "message": "Alert cancelled"}
        return {"status": "error", "message": "Alert not found"}
    
    @staticmethod
    def check_and_notify(alert_id: int, new_price: float) -> Optional[Dict]:
        """Check price change and send notification if significant"""
        result = update_price_alert(alert_id, new_price)
        
        # Check if price changed significantly (> 5%)
        if abs(result['percent_change']) >= 5:
            price_direction = "dropped" if result['price_change'] < 0 else "increased"
            emoji = "📉" if result['price_change'] < 0 else "📈"
            
            notification_type = "price_drop" if result['price_change'] < 0 else "price_increase"
            
            NotificationService.send_notification(
                user_id=result['user_id'],
                title=f"{emoji} Price {price_direction.title()}!",
                message=f"{result['alert_type'].title()} price {price_direction} by {abs(result['percent_change'])}% "
                       f"(₹{result['old_price']:,.0f} → ₹{result['new_price']:,.0f})",
                notification_type=notification_type,
                data={
                    "alert_id": alert_id,
                    "old_price": result['old_price'],
                    "new_price": result['new_price'],
                    "change_percent": result['percent_change'],
                    "search_params": result['search_params']
                }
            )
            return result
        
        return None


class LiveTrackingService:
    """Service for live price tracking"""
    
    @staticmethod
    def save_for_tracking(user_id: int, search_type: str, search_params: Dict,
                         current_price: float = None) -> int:
        """Save a search for live tracking"""
        return save_search(user_id, search_type, search_params, None, current_price)
    
    @staticmethod
    def get_tracked_searches(user_id: int, search_type: str = None) -> List[Dict]:
        """Get all tracked searches for a user"""
        return get_saved_searches(user_id, search_type)
    
    @staticmethod
    def update_tracking(search_id: int, new_result: str, new_price: float) -> bool:
        """Update tracked search with new results"""
        return update_saved_search(search_id, new_result, new_price)


def check_flight_price(search_params: Dict) -> Optional[float]:
    """Check current flight price using the flight API"""
    try:
        from real_flight_api import search_flights_live_api
        import json
        
        result = search_flights_live_api(
            origin=search_params.get('origin', search_params.get('source', '')),
            destination=search_params.get('destination', ''),
            departure_date=search_params.get('date', search_params.get('departure_date', '')),
            passengers=search_params.get('passengers', 1),
            travel_class=search_params.get('travel_class', 'ECONOMY')
        )
        
        data = json.loads(result)
        if data.get('status') == 'success' and data.get('flights'):
            # Return cheapest flight price
            prices = [f.get('price', 0) for f in data['flights'] if f.get('price')]
            if prices:
                return min(prices)
    except Exception as e:
        print(f"Error checking flight price: {e}")
    
    return None


def check_hotel_price(search_params: Dict) -> Optional[float]:
    """Check current hotel price using the hotel API"""
    try:
        from real_hotel_api import search_hotels_live_api
        import json
        
        result = search_hotels_live_api(
            city=search_params.get('city', search_params.get('destination', '')),
            checkin_date=search_params.get('checkin', search_params.get('checkin_date', '')),
            checkout_date=search_params.get('checkout', search_params.get('checkout_date', '')),
            adults=search_params.get('adults', 2),
            rooms=search_params.get('rooms', 1)
        )
        
        data = json.loads(result)
        if data.get('status') == 'success' and data.get('hotels'):
            # Return cheapest hotel price
            prices = [h.get('price_per_night', 0) for h in data['hotels'] if h.get('price_per_night')]
            if prices:
                return min(prices)
    except Exception as e:
        print(f"Error checking hotel price: {e}")
    
    return None


def run_price_monitor():
    """Background task to monitor prices"""
    global _price_monitor_running
    
    while _price_monitor_running:
        try:
            # Get all active alerts
            alerts = get_active_price_alerts()
            
            for alert in alerts:
                try:
                    # Check price based on alert type
                    if alert['alert_type'] == 'flight':
                        new_price = check_flight_price(alert['search_params'])
                    elif alert['alert_type'] == 'hotel':
                        new_price = check_hotel_price(alert['search_params'])
                    else:
                        continue
                    
                    if new_price:
                        PriceAlertService.check_and_notify(alert['id'], new_price)
                
                except Exception as e:
                    print(f"Error processing alert {alert['id']}: {e}")
            
            # Wait 5 minutes before checking again
            time.sleep(300)
            
        except Exception as e:
            print(f"Price monitor error: {e}")
            time.sleep(60)


def start_price_monitor():
    """Start the background price monitor"""
    global _price_monitor_running, _price_monitor_thread
    
    if _price_monitor_running:
        return {"status": "already_running"}
    
    _price_monitor_running = True
    _price_monitor_thread = threading.Thread(target=run_price_monitor, daemon=True)
    _price_monitor_thread.start()
    
    return {"status": "started"}


def stop_price_monitor():
    """Stop the background price monitor"""
    global _price_monitor_running
    _price_monitor_running = False
    return {"status": "stopped"}


# Notification types for frontend
NOTIFICATION_TYPES = {
    "info": {"icon": "ℹ️", "color": "#3182ce"},
    "success": {"icon": "✅", "color": "#38a169"},
    "warning": {"icon": "⚠️", "color": "#dd6b20"},
    "error": {"icon": "❌", "color": "#e53e3e"},
    "price_drop": {"icon": "📉", "color": "#38a169"},
    "price_increase": {"icon": "📈", "color": "#dd6b20"},
    "trip_reminder": {"icon": "✈️", "color": "#3182ce"},
    "budget_alert": {"icon": "💰", "color": "#dd6b20"}
}
