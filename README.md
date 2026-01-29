# 🌍 AI Travel Planner

<div align="center">

**An intelligent, full-stack travel planning assistant powered by AI**

_Plan your entire trip using natural language - find flights, hotels, activities with real-time data and track everything live!_

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB?logo=python)](https://python.org)
[![LangChain](https://img.shields.io/badge/LangChain-1.2-green)](https://langchain.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [API Setup](#-api-setup) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🤖 AI-Powered Trip Planning

| Feature                       | Description                                                           |
| ----------------------------- | --------------------------------------------------------------------- |
| **Natural Language Planning** | Describe your trip in plain English - AI creates complete itineraries |
| **LangChain ReAct Agent**     | Intelligent agent that reasons and acts to find the best options      |
| **Groq LLM (Llama 3.3 70B)**  | Ultra-fast AI responses with state-of-the-art language model          |

### ✈️ Real-Time Travel Data

| Feature                      | API                                 | Free Tier       |
| ---------------------------- | ----------------------------------- | --------------- |
| **Flight Search & Status**   | Amadeus API                         | 2,000 req/month |
| **Flight Delay Predictions** | Amadeus API                         | Included        |
| **Hotel Search**             | Hotels.com/Booking.com via RapidAPI | 500 req/month   |
| **Activities & Attractions** | Foursquare Places API               | 1,000 req/day   |

### 📍 Live Tracking System

| Feature                      | Technology                | Cost      |
| ---------------------------- | ------------------------- | --------- |
| **User Location Tracking**   | Browser Geolocation API   | FREE      |
| **Real-time Trip Progress**  | WebSocket + FastAPI       | FREE      |
| **Interactive Maps**         | OpenStreetMap + Leaflet   | FREE      |
| **Flight Status Monitoring** | Amadeus Flight Status API | FREE tier |

### 💰 Budget & Alerts

| Feature                  | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| **Budget Tracker**       | Track expenses across 7 categories (flights, hotels, food, etc.) |
| **Price Alerts**         | Get notified when flight/hotel prices drop                       |
| **Notifications Center** | Centralized notification management                              |

### 👤 User Management

| Feature            | Description                                       |
| ------------------ | ------------------------------------------------- |
| **Authentication** | Secure login/registration with session management |
| **User Profiles**  | Travel preferences, loyalty tiers, history        |
| **Trip Dashboard** | View current, past, and saved trips               |
| **PDF Export**     | Download professionally formatted itineraries     |

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Navbar  │ │   Hero   │ │   Chat   │ │ Tracking │ │Dashboard │ │
│  │  + Auth  │ │ + Cards  │ │  Panel   │ │  Suite   │ │ + Budget │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└────────────────────────────────┬───────────────────────────────────┘
                                 │ REST API + WebSocket
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                         BACKEND (FastAPI + Python)                  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                     API Layer (api_server.py)                │  │
│  │  /auth  /trips  /flights  /hotels  /activities  /budget     │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
│                                │                                   │
│  ┌─────────────────────────────▼───────────────────────────────┐  │
│  │              LangChain ReAct Agent (agent.py)                │  │
│  │         Reasoning + Acting with Tool Selection               │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
│                                │                                   │
│  ┌─────────────────────────────▼───────────────────────────────┐  │
│  │                    Services Layer                            │  │
│  │  NotificationService │ PDFGenerator │ CustomerManager        │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
│                                │                                   │
│  ┌─────────────────────────────▼───────────────────────────────┐  │
│  │                  Integrations Layer                          │  │
│  │  FlightAPI │ HotelAPI │ ActivitiesAPI │ FlightTracking       │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
    ┌──────────┐          ┌──────────┐          ┌──────────┐
    │ Amadeus  │          │Hotels.com│          │Foursquare│
    │   API    │          │ RapidAPI │          │   API    │
    └──────────┘          └──────────┘          └──────────┘
```

---

## 📁 Project Structure

```
ai-travel-planner/
│
├── 📁 backend/                          # Python FastAPI Backend
│   ├── agent.py                         # LangChain ReAct travel planning agent
│   ├── api_server.py                    # FastAPI server - all REST endpoints
│   ├── auth.py                          # Authentication (login, register, sessions)
│   ├── database.py                      # SQLite database operations
│   │
│   ├── 📁 api/                          # API route handlers
│   │   └── auth.py                      # Authentication endpoints
│   │
│   ├── 📁 models/                       # Data models & database
│   │   └── database.py                  # SQLite schema & operations
│   │
│   ├── 📁 services/                     # Business logic services
│   │   ├── notification_service.py      # Alerts & notifications
│   │   ├── pdf_generator.py             # PDF itinerary generation
│   │   └── customer_manager.py          # Customer profiles & preferences
│   │
│   ├── 📁 integrations/                 # External API integrations
│   │   ├── real_flight_api.py           # Amadeus Flight API
│   │   ├── real_hotel_api.py            # Hotels.com/Booking.com API
│   │   ├── real_activities_api.py       # Foursquare Places API
│   │   ├── flight_tracking.py           # Flight status & delays
│   │   └── enhanced_flight_search.py    # Advanced flight search
│   │
│   └── 📁 utils/                        # Utilities & tools
│       ├── enhanced_tools.py            # LangChain agent tools
│       ├── real_api_tools.py            # API tool wrappers
│       └── multi_system_integration.py  # Multi-service coordination
│
├── 📁 frontend/                         # React TypeScript Frontend
│   ├── 📁 src/
│   │   ├── App.tsx                      # Main app component
│   │   ├── api.ts                       # API client functions
│   │   ├── types.ts                     # TypeScript definitions
│   │   ├── styles.css                   # Global styles
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── AuthModal.tsx            # Login/Register modal
│   │   │   ├── FlightTracker.tsx        # Flight status & delays
│   │   │   ├── LocationTracker.tsx      # GPS location tracking
│   │   │   ├── TripTracking.tsx         # Trip progress tracking
│   │   │   ├── TrackingMap.tsx          # Leaflet map component
│   │   │   ├── LiveTracking.tsx         # Real-time price tracking
│   │   │   ├── TravelDashboard.tsx      # Trip management
│   │   │   ├── BudgetTracker.tsx        # Budget management
│   │   │   ├── NotificationCenter.tsx   # Alerts & notifications
│   │   │   ├── UserProfile.tsx          # User profile
│   │   │   ├── ChatPanel.tsx            # AI chat interface
│   │   │   ├── DynamicMap.tsx           # Interactive India map
│   │   │   ├── Navbar.tsx               # Navigation bar
│   │   │   ├── Hero.tsx                 # Hero section
│   │   │   ├── Footer.tsx               # Footer
│   │   │   ├── FeatureCards.tsx         # Feature showcase
│   │   │   ├── HotDestinations.tsx      # Popular destinations
│   │   │   └── QuickAccessPanel.tsx     # Quick access buttons
│   │   │
│   │   ├── 📁 hooks/
│   │   │   └── useWebSocket.ts          # WebSocket hook for real-time
│   │   │
│   │   └── 📁 services/
│   │       └── locationService.ts       # Geolocation service
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── 📁 docs/                             # Documentation
│   ├── API_SETUP_GUIDE.md               # API keys setup guide
│   ├── LIVE_TRACKING_GUIDE.md           # Live tracking documentation
│   ├── QUICK_START_GUIDE.md             # Getting started
│   ├── UI_DESIGN_GUIDE.md               # UI/UX guidelines
│   └── ...                              # Additional docs
│
├── 📁 Assets/                           # Static assets (images)
│
├── .env                                 # Environment variables (git-ignored)
├── .gitignore
├── requirements.txt                     # Python dependencies
├── package.json                         # Root npm scripts
└── README.md                            # This file
```

---

## 📋 File Summaries

### Backend Files

| File            | Purpose                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `agent.py`      | LangChain ReAct agent that orchestrates AI trip planning using Groq LLM |
| `api_server.py` | FastAPI server exposing 25+ REST endpoints for all features             |
| `auth.py`       | User authentication: registration, login, sessions, password management |
| `database.py`   | SQLite database with tables for users, trips, budgets, notifications    |

### Backend Services

| File                      | Purpose                                                     |
| ------------------------- | ----------------------------------------------------------- |
| `notification_service.py` | Manages alerts, price monitoring, background price checking |
| `pdf_generator.py`        | Generates professional PDF itineraries using ReportLab      |
| `customer_manager.py`     | Customer profiles, preferences, loyalty tiers, trip history |

### Backend Integrations

| File                        | Purpose                               | API                     |
| --------------------------- | ------------------------------------- | ----------------------- |
| `real_flight_api.py`        | Live flight search with pricing       | Amadeus (FREE)          |
| `real_hotel_api.py`         | Hotel search with availability        | Hotels.com via RapidAPI |
| `real_activities_api.py`    | Activities & attractions              | Foursquare (FREE)       |
| `flight_tracking.py`        | Flight status & delay predictions     | Amadeus (FREE)          |
| `enhanced_flight_search.py` | Advanced flight search with fallbacks | Amadeus                 |

### Backend Utils

| File                          | Purpose                                                         |
| ----------------------------- | --------------------------------------------------------------- |
| `enhanced_tools.py`           | LangChain tools for customer insights, transfers, policy checks |
| `real_api_tools.py`           | Tool wrappers for all external APIs                             |
| `multi_system_integration.py` | Coordinates car rentals, transfers, experiences                 |

### Frontend Components

| Component                | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `App.tsx`                | Main application with 13+ modal states and routing |
| `Navbar.tsx`             | Navigation with auth, tracking dropdown, user menu |
| `Hero.tsx`               | Auto-playing video hero section                    |
| `ChatPanel.tsx`          | AI-powered conversational trip planning            |
| `FlightTracker.tsx`      | Flight status, delays, route search                |
| `LocationTracker.tsx`    | GPS tracking with coordinates display              |
| `TripTracking.tsx`       | Real-time trip progress with WebSocket             |
| `TrackingMap.tsx`        | Leaflet map with path visualization                |
| `BudgetTracker.tsx`      | Expense tracking across 7 categories               |
| `NotificationCenter.tsx` | Alerts and price drop notifications                |
| `TravelDashboard.tsx`    | Current/past/saved trips management                |
| `UserProfile.tsx`        | Profile with preferences and stats                 |
| `QuickAccessPanel.tsx`   | 6 quick-access feature cards                       |
| `DynamicMap.tsx`         | Interactive India map with weather                 |
| `HotDestinations.tsx`    | Popular destination showcase                       |
| `FeatureCards.tsx`       | 4 feature highlights                               |

### Frontend Services

| File                 | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `api.ts`             | 25+ API functions for all backend endpoints |
| `useWebSocket.ts`    | WebSocket hook with auto-reconnection       |
| `locationService.ts` | Browser Geolocation API wrapper             |

---

## 🚀 Installation

### Prerequisites

| Requirement | Version | Check Command      |
| ----------- | ------- | ------------------ |
| Node.js     | v18+    | `node --version`   |
| Python      | 3.10+   | `python --version` |
| npm         | v8+     | `npm --version`    |

### Step 1: Clone Repository

```bash
git clone https://github.com/prthmmkhija1/AITravelPlanner.git
cd AITravelPlanner/ai-travel-planner
```

### Step 2: Setup Python Backend

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Setup Frontend

```bash
cd frontend
npm install
```

### Step 4: Configure Environment

Create `.env` file in the project root:

```env
# ═══════════════════════════════════════════════════════════
# REQUIRED - AI Language Model
# ═══════════════════════════════════════════════════════════
GROQ_API_KEY=your_groq_api_key

# ═══════════════════════════════════════════════════════════
# OPTIONAL - Real API Integrations (Enhanced Features)
# ═══════════════════════════════════════════════════════════

# Amadeus - Flights (FREE: 2000 req/month)
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret

# RapidAPI - Hotels (FREE: 500 req/month)
RAPIDAPI_KEY=your_rapidapi_key

# Foursquare - Activities (FREE: 1000 req/day)
FOURSQUARE_API_KEY=your_foursquare_api_key
```

### Step 5: Run the Application

**Terminal 1 - Backend:**

```bash
cd backend
uvicorn api_server:app --reload --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

**Open:** http://localhost:5173

---

## 🔑 API Setup

### Getting API Keys (All FREE Tiers)

| API            | Sign Up                                                        | Free Limits        |
| -------------- | -------------------------------------------------------------- | ------------------ |
| **Groq**       | [console.groq.com](https://console.groq.com)                   | Generous free tier |
| **Amadeus**    | [developers.amadeus.com](https://developers.amadeus.com)       | 2,000 req/month    |
| **RapidAPI**   | [rapidapi.com](https://rapidapi.com)                           | Varies by API      |
| **Foursquare** | [foursquare.com/developers](https://foursquare.com/developers) | 1,000 req/day      |

> 📖 See [docs/API_SETUP_GUIDE.md](docs/API_SETUP_GUIDE.md) for detailed instructions.

---

## 🖥️ UI Features Summary

### Navigation Bar

- **Logo & Search** - Brand identity and global search
- **Quick Links** - Adventure, About, My Trips
- **Tracking Menu** - Flight Tracker, Trip Progress, My Location
- **User Menu** - Profile, Budget, Notifications, Logout

### Hero Section

- Auto-playing video backgrounds with travel themes
- Call-to-action for trip planning

### Quick Access Panel

6 quick-access cards for all major features:

- ✈️ Flight Tracker (FREE)
- 🗺️ Trip Progress (FREE)
- 📍 My Location (FREE)
- 💰 Budget Tracker (Login required)
- 🔔 Price Alerts (Login required)
- 📊 My Trips (Login required)

### AI Chat Panel

- Natural language trip planning
- Message history
- Real-time AI responses

### Interactive Maps

- India map with weather & flight prices
- Trip tracking with GPS path visualization

### Modals & Dashboards

| Modal                   | Features                                       |
| ----------------------- | ---------------------------------------------- |
| **Flight Tracker**      | Status lookup, delay predictions, route search |
| **Budget Tracker**      | 7 expense categories, transaction tracking     |
| **Notification Center** | Alerts, price drops, mark as read              |
| **Travel Dashboard**    | Current/past/saved trips, PDF export           |
| **User Profile**        | Preferences, loyalty tier, statistics          |
| **Location Tracker**    | GPS coordinates, speed, distance               |

---

## 📊 API Endpoints

### Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | User login        |
| POST   | `/api/auth/logout`   | User logout       |
| GET    | `/api/auth/me`       | Get current user  |

### Trip Planning

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| POST   | `/api/plan`       | AI trip planning |
| GET    | `/api/trips`      | Get user trips   |
| POST   | `/api/trips`      | Save trip        |
| DELETE | `/api/trips/{id}` | Delete trip      |

### Travel Services

| Method | Endpoint                        | Description       |
| ------ | ------------------------------- | ----------------- |
| POST   | `/api/flights/search`           | Search flights    |
| POST   | `/api/flights/status`           | Flight status     |
| POST   | `/api/flights/delay-prediction` | Delay prediction  |
| POST   | `/api/hotels`                   | Search hotels     |
| POST   | `/api/activities`               | Search activities |

### Budget & Notifications

| Method   | Endpoint                         | Description        |
| -------- | -------------------------------- | ------------------ |
| GET/POST | `/api/budgets`                   | Budget management  |
| POST     | `/api/budgets/{id}/transactions` | Add transaction    |
| GET      | `/api/notifications`             | Get notifications  |
| POST     | `/api/price-alerts`              | Create price alert |

---

## 🧪 Tech Stack

### Frontend

- **React 18** - UI framework with hooks
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Leaflet** - Interactive maps
- **WebSocket** - Real-time updates

### Backend

- **FastAPI** - High-performance API
- **SQLite** - Database
- **LangChain** - AI agent framework
- **Groq** - LLM inference
- **ReportLab** - PDF generation

### External APIs

- **Amadeus** - Flight data
- **Hotels.com** - Hotel data
- **Foursquare** - Places & activities
- **OpenStreetMap** - Map tiles

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Pratham Khija**

- GitHub: [@prthmmkhija1](https://github.com/prthmmkhija1)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ for travelers everywhere

</div>
