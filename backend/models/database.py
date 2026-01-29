"""
Database Module for AI Travel Planner
SQLite-based storage for users, trips, budgets, and notifications
"""

import os
import json
import sqlite3
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from contextlib import contextmanager

# Database file path
DB_PATH = os.path.join(os.path.dirname(__file__), "travel_planner.db")


@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_database():
    """Initialize database with all required tables"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                phone TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                loyalty_points INTEGER DEFAULT 0,
                preferences TEXT DEFAULT '{}'
            )
        ''')
        
        # Sessions table for authentication
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Trips table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS trips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                destination TEXT NOT NULL,
                source TEXT,
                start_date DATE,
                end_date DATE,
                travelers INTEGER DEFAULT 1,
                status TEXT DEFAULT 'planned',
                trip_plan TEXT,
                user_request TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                rating INTEGER,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Budget tracking table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS budgets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                trip_id INTEGER,
                category TEXT NOT NULL,
                planned_amount REAL NOT NULL,
                spent_amount REAL DEFAULT 0,
                currency TEXT DEFAULT 'INR',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (trip_id) REFERENCES trips (id)
            )
        ''')
        
        # Budget transactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS budget_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                budget_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                description TEXT,
                transaction_type TEXT DEFAULT 'expense',
                transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (budget_id) REFERENCES budgets (id)
            )
        ''')
        
        # Price alerts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS price_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                alert_type TEXT NOT NULL,
                search_params TEXT NOT NULL,
                initial_price REAL NOT NULL,
                current_price REAL,
                target_price REAL,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_checked TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Notifications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                notification_type TEXT DEFAULT 'info',
                is_read INTEGER DEFAULT 0,
                data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Saved searches for live tracking
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS saved_searches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                search_type TEXT NOT NULL,
                search_params TEXT NOT NULL,
                last_result TEXT,
                last_price REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_updated TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        print("✅ Database initialized successfully")


# =============================================================================
# USER OPERATIONS
# =============================================================================

def create_user(email: str, password_hash: str, name: str, phone: str = None) -> Optional[int]:
    """Create a new user"""
    with get_db() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO users (email, password_hash, name, phone)
                VALUES (?, ?, ?, ?)
            ''', (email, password_hash, name, phone))
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            return None


def get_user_by_email(email: str) -> Optional[Dict]:
    """Get user by email"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        row = cursor.fetchone()
        return dict(row) if row else None


def get_user_by_id(user_id: int) -> Optional[Dict]:
    """Get user by ID"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


def update_user(user_id: int, **kwargs) -> bool:
    """Update user fields"""
    allowed_fields = ['name', 'phone', 'preferences', 'loyalty_points']
    updates = {k: v for k, v in kwargs.items() if k in allowed_fields}
    
    if not updates:
        return False
    
    with get_db() as conn:
        cursor = conn.cursor()
        set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
        values = list(updates.values()) + [user_id]
        cursor.execute(f'''
            UPDATE users SET {set_clause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', values)
        conn.commit()
        return cursor.rowcount > 0


# =============================================================================
# SESSION OPERATIONS
# =============================================================================

def create_session(user_id: int, token: str, expires_hours: int = 24) -> bool:
    """Create a new session"""
    with get_db() as conn:
        cursor = conn.cursor()
        expires_at = datetime.now() + timedelta(hours=expires_hours)
        cursor.execute('''
            INSERT INTO sessions (user_id, token, expires_at)
            VALUES (?, ?, ?)
        ''', (user_id, token, expires_at))
        conn.commit()
        return True


def get_session(token: str) -> Optional[Dict]:
    """Get session by token"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT s.*, u.email, u.name 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP
        ''', (token,))
        row = cursor.fetchone()
        return dict(row) if row else None


def delete_session(token: str) -> bool:
    """Delete a session (logout)"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM sessions WHERE token = ?', (token,))
        conn.commit()
        return cursor.rowcount > 0


# =============================================================================
# TRIP OPERATIONS
# =============================================================================

def create_trip(user_id: int, destination: str, trip_plan: str, user_request: str, **kwargs) -> int:
    """Create a new trip"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO trips (user_id, destination, source, start_date, end_date, 
                              travelers, trip_plan, user_request, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, 
            destination,
            kwargs.get('source'),
            kwargs.get('start_date'),
            kwargs.get('end_date'),
            kwargs.get('travelers', 1),
            trip_plan,
            user_request,
            kwargs.get('status', 'planned')
        ))
        conn.commit()
        return cursor.lastrowid


def get_user_trips(user_id: int, status: str = None) -> List[Dict]:
    """Get all trips for a user"""
    with get_db() as conn:
        cursor = conn.cursor()
        if status:
            cursor.execute('''
                SELECT * FROM trips WHERE user_id = ? AND status = ?
                ORDER BY created_at DESC
            ''', (user_id, status))
        else:
            cursor.execute('''
                SELECT * FROM trips WHERE user_id = ?
                ORDER BY created_at DESC
            ''', (user_id,))
        return [dict(row) for row in cursor.fetchall()]


def update_trip(trip_id: int, user_id: int, **kwargs) -> bool:
    """Update a trip"""
    allowed_fields = ['destination', 'source', 'start_date', 'end_date', 
                      'travelers', 'status', 'trip_plan', 'rating']
    updates = {k: v for k, v in kwargs.items() if k in allowed_fields}
    
    if not updates:
        return False
    
    with get_db() as conn:
        cursor = conn.cursor()
        set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
        values = list(updates.values()) + [trip_id, user_id]
        cursor.execute(f'''
            UPDATE trips SET {set_clause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        ''', values)
        conn.commit()
        return cursor.rowcount > 0


def delete_trip(trip_id: int, user_id: int) -> bool:
    """Delete a trip"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM trips WHERE id = ? AND user_id = ?', (trip_id, user_id))
        conn.commit()
        return cursor.rowcount > 0


# =============================================================================
# BUDGET OPERATIONS
# =============================================================================

def create_budget(user_id: int, category: str, planned_amount: float, 
                  trip_id: int = None, notes: str = None) -> int:
    """Create a new budget"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO budgets (user_id, trip_id, category, planned_amount, notes)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, trip_id, category, planned_amount, notes))
        conn.commit()
        return cursor.lastrowid


def get_user_budgets(user_id: int, trip_id: int = None) -> List[Dict]:
    """Get budgets for a user"""
    with get_db() as conn:
        cursor = conn.cursor()
        if trip_id:
            cursor.execute('''
                SELECT * FROM budgets WHERE user_id = ? AND trip_id = ?
                ORDER BY created_at DESC
            ''', (user_id, trip_id))
        else:
            cursor.execute('''
                SELECT * FROM budgets WHERE user_id = ?
                ORDER BY created_at DESC
            ''', (user_id,))
        return [dict(row) for row in cursor.fetchall()]


def add_budget_transaction(budget_id: int, amount: float, description: str = None,
                           transaction_type: str = 'expense') -> int:
    """Add a transaction to a budget"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO budget_transactions (budget_id, amount, description, transaction_type)
            VALUES (?, ?, ?, ?)
        ''', (budget_id, amount, description, transaction_type))
        
        # Update spent amount in budget
        cursor.execute('''
            UPDATE budgets SET spent_amount = spent_amount + ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (amount if transaction_type == 'expense' else -amount, budget_id))
        
        conn.commit()
        return cursor.lastrowid


def get_budget_transactions(budget_id: int) -> List[Dict]:
    """Get all transactions for a budget"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM budget_transactions WHERE budget_id = ?
            ORDER BY transaction_date DESC
        ''', (budget_id,))
        return [dict(row) for row in cursor.fetchall()]


def get_budget_summary(user_id: int) -> Dict:
    """Get overall budget summary for a user"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                SUM(planned_amount) as total_planned,
                SUM(spent_amount) as total_spent,
                COUNT(*) as budget_count
            FROM budgets WHERE user_id = ?
        ''', (user_id,))
        row = cursor.fetchone()
        
        # Get by category
        cursor.execute('''
            SELECT category, SUM(planned_amount) as planned, SUM(spent_amount) as spent
            FROM budgets WHERE user_id = ?
            GROUP BY category
        ''', (user_id,))
        categories = [dict(r) for r in cursor.fetchall()]
        
        return {
            'total_planned': row['total_planned'] or 0,
            'total_spent': row['total_spent'] or 0,
            'budget_count': row['budget_count'] or 0,
            'remaining': (row['total_planned'] or 0) - (row['total_spent'] or 0),
            'by_category': categories
        }


# =============================================================================
# NOTIFICATION OPERATIONS
# =============================================================================

def create_notification(user_id: int, title: str, message: str, 
                        notification_type: str = 'info', data: Dict = None) -> int:
    """Create a notification"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO notifications (user_id, title, message, notification_type, data)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, title, message, notification_type, json.dumps(data) if data else None))
        conn.commit()
        return cursor.lastrowid


def get_user_notifications(user_id: int, unread_only: bool = False) -> List[Dict]:
    """Get notifications for a user"""
    with get_db() as conn:
        cursor = conn.cursor()
        if unread_only:
            cursor.execute('''
                SELECT * FROM notifications WHERE user_id = ? AND is_read = 0
                ORDER BY created_at DESC
            ''', (user_id,))
        else:
            cursor.execute('''
                SELECT * FROM notifications WHERE user_id = ?
                ORDER BY created_at DESC LIMIT 50
            ''', (user_id,))
        
        notifications = []
        for row in cursor.fetchall():
            n = dict(row)
            if n['data']:
                n['data'] = json.loads(n['data'])
            notifications.append(n)
        return notifications


def mark_notification_read(notification_id: int, user_id: int) -> bool:
    """Mark a notification as read"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE notifications SET is_read = 1
            WHERE id = ? AND user_id = ?
        ''', (notification_id, user_id))
        conn.commit()
        return cursor.rowcount > 0


def mark_all_notifications_read(user_id: int) -> int:
    """Mark all notifications as read for a user"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE notifications SET is_read = 1
            WHERE user_id = ? AND is_read = 0
        ''', (user_id,))
        conn.commit()
        return cursor.rowcount


# =============================================================================
# PRICE ALERT OPERATIONS
# =============================================================================

def create_price_alert(user_id: int, alert_type: str, search_params: Dict,
                       initial_price: float, target_price: float = None) -> int:
    """Create a price alert"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO price_alerts (user_id, alert_type, search_params, initial_price, 
                                     current_price, target_price)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (user_id, alert_type, json.dumps(search_params), initial_price, 
              initial_price, target_price))
        conn.commit()
        return cursor.lastrowid


def get_active_price_alerts(user_id: int = None) -> List[Dict]:
    """Get active price alerts"""
    with get_db() as conn:
        cursor = conn.cursor()
        if user_id:
            cursor.execute('''
                SELECT * FROM price_alerts WHERE user_id = ? AND is_active = 1
            ''', (user_id,))
        else:
            cursor.execute('SELECT * FROM price_alerts WHERE is_active = 1')
        
        alerts = []
        for row in cursor.fetchall():
            a = dict(row)
            a['search_params'] = json.loads(a['search_params'])
            alerts.append(a)
        return alerts


def update_price_alert(alert_id: int, current_price: float) -> Dict:
    """Update a price alert with new price"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get the alert first
        cursor.execute('SELECT * FROM price_alerts WHERE id = ?', (alert_id,))
        alert = dict(cursor.fetchone())
        
        old_price = alert['current_price']
        price_change = current_price - old_price
        percent_change = (price_change / old_price * 100) if old_price else 0
        
        # Update the price
        cursor.execute('''
            UPDATE price_alerts SET current_price = ?, last_checked = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (current_price, alert_id))
        conn.commit()
        
        return {
            'alert_id': alert_id,
            'old_price': old_price,
            'new_price': current_price,
            'price_change': price_change,
            'percent_change': round(percent_change, 2),
            'user_id': alert['user_id'],
            'alert_type': alert['alert_type'],
            'search_params': json.loads(alert['search_params'])
        }


def deactivate_price_alert(alert_id: int, user_id: int) -> bool:
    """Deactivate a price alert"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE price_alerts SET is_active = 0
            WHERE id = ? AND user_id = ?
        ''', (alert_id, user_id))
        conn.commit()
        return cursor.rowcount > 0


# =============================================================================
# SAVED SEARCHES FOR LIVE TRACKING
# =============================================================================

def save_search(user_id: int, search_type: str, search_params: Dict, 
                last_result: str = None, last_price: float = None) -> int:
    """Save a search for live tracking"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO saved_searches (user_id, search_type, search_params, last_result, last_price)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, search_type, json.dumps(search_params), last_result, last_price))
        conn.commit()
        return cursor.lastrowid


def get_saved_searches(user_id: int, search_type: str = None) -> List[Dict]:
    """Get saved searches for a user"""
    with get_db() as conn:
        cursor = conn.cursor()
        if search_type:
            cursor.execute('''
                SELECT * FROM saved_searches WHERE user_id = ? AND search_type = ?
                ORDER BY created_at DESC
            ''', (user_id, search_type))
        else:
            cursor.execute('''
                SELECT * FROM saved_searches WHERE user_id = ?
                ORDER BY created_at DESC
            ''', (user_id,))
        
        searches = []
        for row in cursor.fetchall():
            s = dict(row)
            s['search_params'] = json.loads(s['search_params'])
            searches.append(s)
        return searches


def update_saved_search(search_id: int, last_result: str, last_price: float) -> bool:
    """Update a saved search with new results"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE saved_searches SET last_result = ?, last_price = ?, last_updated = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (last_result, last_price, search_id))
        conn.commit()
        return cursor.rowcount > 0


# Initialize database on import
init_database()
