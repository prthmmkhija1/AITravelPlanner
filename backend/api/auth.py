"""
Authentication Module for AI Travel Planner
Handles user registration, login, and session management
"""

import hashlib
import secrets
import re
from typing import Optional, Dict
from fastapi import HTTPException, Header, Depends

from models.database import (
    create_user, get_user_by_email, get_user_by_id,
    create_session, get_session, delete_session, update_user
)


def hash_password(password: str) -> str:
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash"""
    return hash_password(password) == password_hash


def generate_token() -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(32)


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, email))


def validate_password(password: str) -> tuple[bool, str]:
    """Validate password strength"""
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    return True, ""


# =============================================================================
# AUTHENTICATION FUNCTIONS
# =============================================================================

def register_user(email: str, password: str, name: str, phone: str = None) -> Dict:
    """Register a new user"""
    
    # Validate email
    if not validate_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Validate password
    is_valid, msg = validate_password(password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)
    
    # Check if user exists
    existing = get_user_by_email(email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    password_hash = hash_password(password)
    user_id = create_user(email, password_hash, name, phone)
    
    if not user_id:
        raise HTTPException(status_code=500, detail="Failed to create user")
    
    # Create session
    token = generate_token()
    create_session(user_id, token)
    
    return {
        "status": "success",
        "message": "User registered successfully",
        "user": {
            "id": user_id,
            "email": email,
            "name": name
        },
        "token": token
    }


def login_user(email: str, password: str) -> Dict:
    """Login a user"""
    
    # Get user
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create session
    token = generate_token()
    create_session(user['id'], token)
    
    return {
        "status": "success",
        "message": "Login successful",
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "phone": user['phone'],
            "loyalty_points": user['loyalty_points'],
            "preferences": user['preferences']
        },
        "token": token
    }


def logout_user(token: str) -> Dict:
    """Logout a user"""
    delete_session(token)
    return {
        "status": "success",
        "message": "Logged out successfully"
    }


def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[Dict]:
    """Get the current authenticated user from token"""
    
    if not authorization:
        return None
    
    # Extract token from "Bearer <token>" format
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization
    
    session = get_session(token)
    if not session:
        return None
    
    user = get_user_by_id(session['user_id'])
    if not user:
        return None
    
    # Remove password hash from user data
    user.pop('password_hash', None)
    return user


def require_auth(authorization: Optional[str] = Header(None)) -> Dict:
    """Dependency that requires authentication"""
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


def update_user_profile(user_id: int, **kwargs) -> Dict:
    """Update user profile"""
    success = update_user(user_id, **kwargs)
    if success:
        user = get_user_by_id(user_id)
        user.pop('password_hash', None)
        return {
            "status": "success",
            "message": "Profile updated",
            "user": user
        }
    raise HTTPException(status_code=400, detail="Failed to update profile")


def change_password(user_id: int, old_password: str, new_password: str) -> Dict:
    """Change user password"""
    user = get_user_by_id(user_id)
    
    if not verify_password(old_password, user['password_hash']):
        raise HTTPException(status_code=400, detail="Invalid current password")
    
    is_valid, msg = validate_password(new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)
    
    # Update password in database
    from models.database import get_db
    with get_db() as conn:
        cursor = conn.cursor()
        new_hash = hash_password(new_password)
        cursor.execute(
            'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            (new_hash, user_id)
        )
        conn.commit()
    
    return {
        "status": "success",
        "message": "Password changed successfully"
    }
