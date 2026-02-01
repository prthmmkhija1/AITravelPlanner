# 🌍 AI Travel Planner

<div align="center">

![AI Travel Planner Banner](https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop)

**An intelligent, full-stack travel planning assistant powered by AI**

_Plan your entire trip using natural language - find flights, hotels, activities with real-time data and track everything live!_

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![LangChain](https://img.shields.io/badge/LangChain-AI_Agent-green?style=for-the-badge)](https://langchain.com)

[Features](#-features) • [Demo](#-screenshots) • [Installation](#-installation) • [API Setup](#-api-setup) • [Tech Stack](#-tech-stack)

</div>

---

## 👨‍💻 Author

**Pratham Makhija**

[![GitHub](https://img.shields.io/badge/GitHub-prthmmkhija1-181717?style=for-the-badge&logo=github)](https://github.com/prthmmkhija1)

---

## ✨ Features

### 🤖 AI-Powered Trip Planning

| Feature                       | Description                                                           |
| ----------------------------- | --------------------------------------------------------------------- |
| **Natural Language Planning** | Describe your trip in plain English - AI creates complete itineraries |
| **LangChain ReAct Agent**     | Intelligent agent that reasons and acts to find the best options      |
| **Groq LLM (Llama 3.3 70B)**  | Ultra-fast AI responses with state-of-the-art language model          |
| **Voyager Chatbot**           | Friendly AI assistant with robot avatar and quick prompts             |
| **Voice Input (STT)**         | Speak your travel requests using Web Speech API                       |
| **Form-Based Planning**       | Easy trip planning with dropdown menus and date pickers               |
| **Smart Search**              | Search destinations from navbar - redirects to AI chatbot             |

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

### 💰 Budget & Alerts

| Feature                  | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| **Budget Tracker**       | Track expenses across 7 categories (flights, hotels, food, etc.) |
| **Price Alerts**         | Get notified when flight/hotel prices drop                       |
| **Notifications Center** | Centralized notification management                              |
| **Currency Converter**   | Multi-currency support with real-time rates                      |

### 🎨 Modern UI/UX

| Feature                    | Description                                         |
| -------------------------- | --------------------------------------------------- |
| **3D Card Carousel**       | Beautiful destination cards with tilt effects       |
| **Discover Dropdown**      | Search destinations with 8 popular quick picks      |
| **Explore Menu**           | Quick access to Trip Progress, GPS, Budget & Alerts |
| **Responsive Design**      | Works beautifully on desktop, tablet, and mobile    |
| **Dark Theme**             | Professional dark UI with gradient accents          |
| **Voice Input Button**     | Microphone icon for speech-to-text input            |
| **Multi-language Support** | Internationalization ready                          |

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
│   │   ├── styles.css                   # Global styles (4000+ lines)
│   │   │
│   │   ├── 📁 components/               # React components
│   │   │   ├── AuthModal.tsx            # Login/Register with Google OAuth
│   │   │   ├── ChatBotPopup.tsx         # Voyager AI chatbot with voice input
│   │   │   ├── VoiceInputButton.tsx     # Speech-to-text microphone button
│   │   │   ├── HeroSection.tsx          # Hero section with video & cards
│   │   │   ├── HotDestinations.tsx      # 3D carousel destinations
│   │   │   ├── TripPlannerForm.tsx      # Form-based trip planning
│   │   │   ├── FlightTracker.tsx        # Flight status & delays
│   │   │   ├── BudgetTracker.tsx        # Budget management
│   │   │   ├── UserProfile.tsx          # User profile modal
│   │   │   ├── NavbarDark.tsx           # Navbar with Discover & Explore
│   │   │   ├── NotificationCenter.tsx   # Alerts & notifications
│   │   │   └── ...more components
│   │   │
│   │   ├── 📁 contexts/                 # React contexts
│   │   │   └── CurrencyContext.tsx      # Currency management
│   │   │
│   │   ├── 📁 hooks/                    # Custom hooks
│   │   │   └── useWebSocket.ts          # WebSocket for real-time
│   │   │
│   │   └── 📁 i18n/                     # Internationalization
│   │       └── index.ts                 # Language translations
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── 📁 docs/                             # Documentation
│   └── API_SETUP_GUIDE.md               # API keys setup guide
│
├── .env                                 # Environment variables
├── .gitignore                           # Git ignore rules
├── package.json                         # Root package.json
├── requirements.txt                     # Python dependencies
└── README.md                            # This file
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/prthmmkhija1/ai-travel-planner.git
cd ai-travel-planner
```

### Step 2: Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Frontend Setup

```bash
cd frontend
npm install
```

### Step 4: Configure Environment Variables

Create `.env` file in root directory:

```env
# AI - Groq (Required)
GROQ_API_KEY=your_groq_api_key

# Flight Data - Amadeus (Optional)
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret

# Hotel Data - RapidAPI (Optional)
RAPIDAPI_KEY=your_rapidapi_key

# Activities - Foursquare (Optional)
FOURSQUARE_API_KEY=your_foursquare_api_key
```

Create `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
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
python api_server.py
# Or use uvicorn:
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

### Budget & Alerts

| Method | Endpoint                       | Description      |
| ------ | ------------------------------ | ---------------- |
| POST   | `/api/budget`                  | Create budget    |
| GET    | `/api/budget/{id}`             | Get budget       |
| POST   | `/api/budget/{id}/transaction` | Add transaction  |
| GET    | `/api/alerts`                  | Get price alerts |

---

## 🧪 Tech Stack

### Frontend

- **React 18** - UI framework with hooks
- **TypeScript 5** - Type safety
- **Vite** - Build tool & dev server
- **Leaflet** - Interactive maps
- **Google Identity Services** - OAuth authentication

### Backend

- **FastAPI** - High-performance async API
- **Python 3.10+** - Backend language
- **SQLite** - Lightweight database
- **LangChain** - AI agent framework
- **Groq** - LLM inference (Llama 3.3 70B)
- **ReportLab** - PDF generation
- **WebSocket** - Real-time communication

### External APIs

- **Amadeus** - Flight search & status
- **Hotels.com (RapidAPI)** - Hotel search
- **Foursquare** - Places & activities
- **OpenStreetMap** - Map tiles

---

## 📸 Screenshots

### 🏠 Home Page

- Professional dark theme with gradient accents
- Hero section with video backgrounds
- 3D tilted destination cards carousel
- Quick access travel command center

### 🤖 AI Chatbot (Voyager)

- Friendly robot avatar with floating animation
- Voice input with microphone button
- Quick prompts for common queries (Flights, Hotels, Trip plans)
- Professional purple/blue gradient theme
- Seamless integration with Discover & Explore search

### 🔐 Google Sign-In

- One-click authentication
- Profile picture integration
- Secure OAuth 2.0

### 📍 Live Tracking

- Real-time location tracking
- Interactive Leaflet maps
- Flight status monitoring

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📧 Contact

**Pratham Makhija**

- GitHub: [@prthmmkhija1](https://github.com/prthmmkhija1)

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Made with ❤️ for travelers everywhere**

</div>
