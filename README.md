# 🌍 AI Travel Planner

<div align="center">

**An intelligent, full-stack travel planning assistant powered by AI**

_Plan your entire trip using natural language - find flights, hotels, activities with real-time data and track everything live!_

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)](https://python.org)
[![LangChain](https://img.shields.io/badge/LangChain-AI_Agent-green)](https://langchain.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://typescriptlang.org)

[Features](#-features) • [Demo](#-screenshots) • [Installation](#-installation) • [API Setup](#-api-setup) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🤖 AI-Powered Trip Planning

| Feature                       | Description                                                           |
| ----------------------------- | --------------------------------------------------------------------- |
| **Natural Language Planning** | Describe your trip in plain English - AI creates complete itineraries |
| **LangChain ReAct Agent**     | Intelligent agent that reasons and acts to find the best options      |
| **Groq LLM (Llama 3.3 70B)**  | Ultra-fast AI responses with state-of-the-art language model          |
| **Floating Chatbot**          | Always-accessible AI assistant popup in bottom-right corner           |
| **Form-Based Planning**       | Easy trip planning with dropdown menus and date pickers               |

### 🔐 Authentication & User Management

| Feature                  | Description                                               |
| ------------------------ | --------------------------------------------------------- |
| **Google OAuth Sign-In** | One-click login with your Google account                  |
| **Demo Account**         | Try the app instantly without registration                |
| **Email Registration**   | Traditional signup with email and password                |
| **User Profiles**        | Personalized profiles with Google profile picture support |
| **Loyalty Program**      | Bronze, Silver, Gold, Platinum membership tiers           |

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

### 🔍 Smart Search

| Feature                       | Description                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| **Global Search Bar**         | Search destinations, hotels, flights from navbar               |
| **Auto-Complete Suggestions** | Real-time suggestions as you type                              |
| **Categorized Results**       | Results organized by destinations, hotels, flights, activities |
| **Direct Chat Integration**   | Search results open chatbot with your query                    |

### 💰 Budget & Alerts

| Feature                  | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| **Budget Tracker**       | Track expenses across 7 categories (flights, hotels, food, etc.) |
| **Price Alerts**         | Get notified when flight/hotel prices drop                       |
| **Notifications Center** | Centralized notification management                              |

### 🎨 Modern UI/UX

| Feature                | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| **Adventure Modal**    | Explore adventure categories (Beach, Mountain, City, Wildlife) |
| **Responsive Design**  | Works beautifully on desktop, tablet, and mobile               |
| **Centered Modals**    | All modals appear as proper popups, not inline                 |
| **Hero Video Section** | Auto-playing travel video backgrounds                          |

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Navbar  │ │   Hero   │ │ ChatBot  │ │ Tracking │ │Dashboard │ │
│  │ + Search │ │ + Cards  │ │  Popup   │ │  Suite   │ │ + Budget │ │
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
│   │   │   ├── AuthModal.tsx            # Login/Register with Google OAuth
│   │   │   ├── ChatBotPopup.tsx         # Floating AI chatbot
│   │   │   ├── TripPlannerForm.tsx      # Form-based trip planning
│   │   │   ├── AdventureModal.tsx       # Adventure categories modal
│   │   │   ├── FlightTracker.tsx        # Flight status & delays
│   │   │   ├── LocationTracker.tsx      # GPS location tracking
│   │   │   ├── TripTracking.tsx         # Trip progress tracking
│   │   │   ├── TrackingMap.tsx          # Leaflet map component
│   │   │   ├── BudgetTracker.tsx        # Budget management
│   │   │   ├── NotificationCenter.tsx   # Alerts & notifications
│   │   │   ├── UserProfile.tsx          # User profile with Google data
│   │   │   ├── TravelDashboard.tsx      # Trip management
│   │   │   ├── Navbar.tsx               # Navigation with search
│   │   │   ├── Hero.tsx                 # Video hero section
│   │   │   ├── FeatureCards.tsx         # Feature showcase
│   │   │   └── QuickAccessPanel.tsx     # Quick access buttons
│   │   │
│   │   ├── 📁 hooks/
│   │   │   └── useWebSocket.ts          # WebSocket hook for real-time
│   │   │
│   │   └── 📁 services/
│   │       └── locationService.ts       # Geolocation service
│   │
│   ├── .env                             # Frontend environment (Google OAuth)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── 📁 docs/                             # Documentation
│   ├── API_SETUP_GUIDE.md               # API keys setup guide
│   ├── LIVE_TRACKING_GUIDE.md           # Live tracking documentation
│   ├── QUICK_START_GUIDE.md             # Getting started
│   └── UI_DESIGN_GUIDE.md               # UI/UX guidelines
│
├── 📁 Assets/                           # Static assets (images)
├── 📁 client/public/                    # Hero videos
│
├── .env                                 # Backend environment variables
├── .gitignore
├── requirements.txt                     # Python dependencies
├── package.json                         # Root npm scripts
└── README.md                            # This file
```

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

**Backend `.env`** (in project root):

```env
# REQUIRED - AI Language Model
GROQ_API_KEY=your_groq_api_key

# OPTIONAL - Real API Integrations
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret
RAPIDAPI_KEY=your_rapidapi_key
FOURSQUARE_API_KEY=your_foursquare_api_key
```

**Frontend `.env`** (in frontend folder):

```env
# Google OAuth (Optional - for Google Sign-In)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Step 5: Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized JavaScript origins: `http://localhost:5173`, `http://localhost:5174`
4. Copy Client ID to `frontend/.env`

### Step 6: Run the Application

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

| API              | Sign Up                                                        | Free Limits        |
| ---------------- | -------------------------------------------------------------- | ------------------ |
| **Groq**         | [console.groq.com](https://console.groq.com)                   | Generous free tier |
| **Amadeus**      | [developers.amadeus.com](https://developers.amadeus.com)       | 2,000 req/month    |
| **RapidAPI**     | [rapidapi.com](https://rapidapi.com)                           | Varies by API      |
| **Foursquare**   | [foursquare.com/developers](https://foursquare.com/developers) | 1,000 req/day      |
| **Google OAuth** | [console.cloud.google.com](https://console.cloud.google.com)   | Unlimited          |

> 📖 See [docs/API_SETUP_GUIDE.md](docs/API_SETUP_GUIDE.md) for detailed instructions.

---

## 📸 Screenshots

### Home Page with Hero Section

- Auto-playing video backgrounds
- Quick feature cards
- AI-powered trip planning

### Google Sign-In

- One-click authentication
- Profile picture integration
- Secure OAuth 2.0

### AI Chatbot Popup

- Floating assistant in bottom-right
- Natural language trip planning
- Quick prompts for common queries

### Smart Search

- Real-time suggestions
- Categorized results
- Direct chat integration

---

## 🧪 Tech Stack

### Frontend

- **React 18** - UI framework with hooks
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Leaflet** - Interactive maps
- **Google Identity Services** - OAuth authentication

### Backend

- **FastAPI** - High-performance API
- **SQLite** - Database
- **LangChain** - AI agent framework
- **Groq** - LLM inference (Llama 3.3 70B)
- **ReportLab** - PDF generation

### External APIs

- **Amadeus** - Flight data
- **Hotels.com** - Hotel data
- **Foursquare** - Places & activities
- **OpenStreetMap** - Map tiles

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

| Method | Endpoint              | Description       |
| ------ | --------------------- | ----------------- |
| POST   | `/api/flights/search` | Search flights    |
| POST   | `/api/flights/status` | Flight status     |
| POST   | `/api/hotels`         | Search hotels     |
| POST   | `/api/activities`     | Search activities |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Pratham Makhija**

- GitHub: [@prthmmkhija1](https://github.com/prthmmkhija1)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ for travelers everywhere

</div>