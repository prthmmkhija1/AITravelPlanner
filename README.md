# AI Travel Planner 🌍✈️

An intelligent, full-stack travel planning assistant powered by AI. Plan your entire trip using natural language - find flights, hotels, and activities with real-time data from industry-leading APIs.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.14-3776AB?logo=python)
![LangChain](https://img.shields.io/badge/LangChain-1.2-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)

## ✨ Features

| Feature                         | Description                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| 🤖 **AI-Powered Planning**      | Natural language trip planning using LangChain ReAct agent with Groq's Llama 3.3 70B |
| ✈️ **Real-Time Flights**        | Live flight search via Amadeus API with pricing, schedules, and availability         |
| 🏨 **Hotel Search**             | Hotel recommendations with pricing via Hotels.com/RapidAPI                           |
| 🎯 **Activity Discovery**       | Local attractions, restaurants, and experiences via Foursquare Places API            |
| 🚗 **Multi-System Integration** | Car rentals and additional travel services support                                   |
| 💬 **Chat Interface**           | Intuitive chat-based UI for conversational trip planning                             |
| 📱 **Responsive Design**        | Fully responsive - works seamlessly on desktop, tablet, and mobile                   |
| 📄 **Export Plans**             | Download your travel plans as text files                                             |
| 📜 **History Tracking**         | View and revisit your previous trip plans                                            |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                           │
│                   (Vite + TypeScript + CSS)                     │
│     ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│     │  Hero   │  │ Feature │  │  Chat   │  │ Footer  │        │
│     │Component│  │  Cards  │  │  Panel  │  │         │        │
│     └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST (Vite Proxy)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                              │
│                    (Python + Uvicorn)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Endpoints                          │  │
│  │  /api/plan  │  /api/flights  │  /api/hotels  │  /api/... │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │              LangChain ReAct Agent                       │   │
│  │         (Groq LLM + LangGraph Orchestration)            │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │                   Tool Layer                             │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │ Flight  │  │  Hotel  │  │Activity │  │  Multi  │    │   │
│  │  │  Tool   │  │  Tool   │  │  Tool   │  │ System  │    │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │   │
│  └───────┼────────────┼───────────┼────────────┼──────────┘   │
└──────────┼────────────┼───────────┼────────────┼──────────────┘
           │            │           │            │
           ▼            ▼           ▼            ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ Amadeus  │  │Hotels.com│  │Foursquare│  │  Other   │
    │   API    │  │   API    │  │   API    │  │  APIs    │
    └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern UI with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **CSS3** - Custom responsive styling

### Backend

- **FastAPI** - High-performance Python web framework
- **Uvicorn** - ASGI server for production
- **Pydantic** - Data validation and serialization

### AI/ML

- **LangChain** - LLM application framework
- **LangGraph** - Agent orchestration with ReAct pattern
- **Groq** - Ultra-fast LLM inference (Llama 3.3 70B)

### External APIs

- **Amadeus** - Flight search and booking data
- **Hotels.com (RapidAPI)** - Hotel availability and pricing
- **Foursquare** - Places, activities, and local recommendations

## 📁 Project Structure

```
ai-travel-planner/
│
├── 🐍 Backend (Python/FastAPI)
│   ├── agent.py                    # LangChain ReAct travel planning agent
│   ├── api_server.py               # FastAPI server with all endpoints
│   ├── real_api_tools.py           # LangChain tools wrapping real APIs
│   ├── real_flight_api.py          # Amadeus Flight API integration
│   ├── real_hotel_api.py           # Hotels.com API integration
│   ├── real_activities_api.py      # Foursquare Activities API
│   ├── multi_system_integration.py # Car rentals & additional services
│   ├── customer_manager.py         # Customer data management
│   ├── enhanced_flight_search.py   # Advanced flight search features
│   └── enhanced_tools.py           # Additional AI tools
│
├── ⚛️ Frontend (React/TypeScript)
│   └── client/
│       ├── src/
│       │   ├── App.tsx             # Main application component
│       │   ├── api.ts              # API client functions
│       │   ├── types.ts            # TypeScript interfaces
│       │   ├── styles.css          # Application styles
│       │   └── components/
│       │       ├── Hero.tsx        # Landing hero section
│       │       ├── ChatPanel.tsx   # Chat interface
│       │       ├── FeatureCards.tsx# Feature showcase
│       │       └── Footer.tsx      # Footer component
│       ├── package.json
│       ├── vite.config.ts          # Vite configuration with proxy
│       └── tsconfig.json
│
├── 📋 Configuration
│   ├── requirements.txt            # Python dependencies
│   ├── package.json                # Root npm scripts
│   ├── .env                        # Environment variables (not in repo)
│   └── .gitignore
│
└── 📚 Documentation
    ├── README.md                   # This file
    ├── API_SETUP_GUIDE.md          # Detailed API setup instructions
    └── HACKATHON_ANALYSIS.md       # Project analysis
```

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Check Command      |
| ----------- | ------- | ------------------ |
| Node.js     | v18+    | `node --version`   |
| Python      | 3.10+   | `python --version` |
| npm         | v8+     | `npm --version`    |

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/prthmmkhija1/AITravelPlanner.git
cd AITravelPlanner
```

#### 2. Set up Python environment

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

#### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
# ═══════════════════════════════════════════════════════════
# REQUIRED - AI Language Model
# ═══════════════════════════════════════════════════════════
GROQ_API_KEY=your_groq_api_key_here

# ═══════════════════════════════════════════════════════════
# OPTIONAL - Real API Integrations (for live data)
# ═══════════════════════════════════════════════════════════

# Amadeus - Flight Search
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret

# RapidAPI - Hotel Search (Hotels.com)
RAPIDAPI_KEY=your_rapidapi_key

# Foursquare - Activities & Places
FOURSQUARE_API_KEY=your_foursquare_api_key
```

#### 4. Install frontend dependencies

```bash
cd client
npm install
cd ..
```

### Running the Application

#### Option 1: Using npm scripts (Recommended)

```bash
# Terminal 1 - Start FastAPI backend
npm run server

# Terminal 2 - Start React frontend
npm run client
```

#### Option 2: Manual commands

```bash
# Terminal 1 - Backend (with venv activated)
uvicorn api_server:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd client && npm run dev
```

### Access Points

| Service        | URL                         | Description          |
| -------------- | --------------------------- | -------------------- |
| 🌐 Frontend    | http://localhost:5173       | React application    |
| 🔧 Backend API | http://localhost:8000       | FastAPI server       |
| 📖 API Docs    | http://localhost:8000/docs  | Swagger UI           |
| 📋 ReDoc       | http://localhost:8000/redoc | Alternative API docs |

## 📡 API Reference

### Endpoints

| Endpoint          | Method | Description        | Request Body                                                             |
| ----------------- | ------ | ------------------ | ------------------------------------------------------------------------ |
| `/api/health`     | GET    | Health check       | -                                                                        |
| `/api/plan`       | POST   | AI travel planning | `{ "request": "Plan a trip to Paris" }`                                  |
| `/api/flights`    | POST   | Search flights     | `{ "source": "NYC", "destination": "LAX", "date": "2026-03-15" }`        |
| `/api/hotels`     | POST   | Search hotels      | `{ "city": "Paris", "checkin": "2026-03-15", "checkout": "2026-03-20" }` |
| `/api/activities` | POST   | Search activities  | `{ "city": "Paris", "type": "restaurant", "limit": 10 }`                 |

### Example: Plan a Trip

```bash
curl -X POST http://localhost:8000/api/plan \
  -H "Content-Type: application/json" \
  -d '{"request": "Plan a 5-day trip to Tokyo in April with budget hotels"}'
```

### Example Response

```json
{
  "status": "success",
  "trip_plan": "# Your Tokyo Adventure 🇯🇵\n\n## Day 1: Arrival...",
  "request": "Plan a 5-day trip to Tokyo..."
}
```

## 🔑 API Keys Setup

### Groq API (Required)

1. Visit [console.groq.com](https://console.groq.com)
2. Create a free account
3. Navigate to API Keys → Create new key
4. Add to `.env`: `GROQ_API_KEY=gsk_xxxxx`

### Amadeus API (Flights)

1. Visit [developers.amadeus.com](https://developers.amadeus.com)
2. Create account → My Apps → Create new app
3. Copy Client ID and Client Secret
4. Add to `.env`:
   ```
   AMADEUS_CLIENT_ID=xxxxx
   AMADEUS_CLIENT_SECRET=xxxxx
   ```

### RapidAPI (Hotels)

1. Visit [rapidapi.com](https://rapidapi.com)
2. Search for "Hotels.com" API
3. Subscribe to a plan (free tier available)
4. Copy your API key from the dashboard
5. Add to `.env`: `RAPIDAPI_KEY=xxxxx`

### Foursquare API (Activities)

1. Visit [developer.foursquare.com](https://developer.foursquare.com)
2. Create account → Create new project
3. Copy your API key
4. Add to `.env`: `FOURSQUARE_API_KEY=xxxxx`

## 💻 Development

### Available Scripts

```bash
# Root directory
npm run client    # Start React dev server (port 5173)
npm run server    # Start FastAPI server (port 8000)
npm run setup     # Install all dependencies

# Client directory
cd client
npm run dev       # Development mode
npm run build     # Production build
npm run preview   # Preview production build
```

### Project Configuration

| File               | Purpose                             |
| ------------------ | ----------------------------------- |
| `vite.config.ts`   | Vite bundler config with API proxy  |
| `tsconfig.json`    | TypeScript configuration            |
| `requirements.txt` | Python dependencies                 |
| `.env`             | Environment variables (git-ignored) |

### How the AI Agent Works

1. **User Input**: Natural language request (e.g., "Plan a trip to Paris")
2. **LangChain Processing**: Request sent to Groq's Llama 3.3 70B model
3. **Tool Selection**: Agent decides which tools to use (flights, hotels, activities)
4. **API Calls**: Real-time data fetched from external APIs
5. **Response Generation**: AI compiles results into a comprehensive travel plan
6. **Frontend Display**: Formatted plan shown in chat interface

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contributions

- [ ] Add more travel APIs (car rentals, trains)
- [ ] Implement user authentication
- [ ] Add trip saving/loading functionality
- [ ] Create mobile app version
- [ ] Add multi-language support
- [ ] Implement budget tracking