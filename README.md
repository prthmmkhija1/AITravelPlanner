# AI Travel Planner 🌍✈️

An intelligent travel planning assistant powered by AI that helps you find flights, hotels, and activities for your trips using real-world APIs.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: FastAPI + Uvicorn (Python)
- **AI Agent**: LangChain + LangGraph + Groq (Llama 3.3 70B)
- **APIs**: Amadeus (flights), Hotels.com/RapidAPI (hotels), Foursquare (activities)

## Project Structure

```
ai-travel-planner/
├── agent.py                    # LangChain travel planning agent
├── api_server.py               # FastAPI backend server
├── real_api_tools.py           # LangChain tools wrapping real APIs
├── real_flight_api.py          # Amadeus Flight API integration
├── real_hotel_api.py           # Hotels.com API integration
├── real_activities_api.py      # Foursquare Activities API integration
├── multi_system_integration.py # Multi-system (cars, travels) integration
├── customer_manager.py         # Customer data management
├── enhanced_flight_search.py   # Enhanced flight search features
├── enhanced_tools.py           # Additional enhanced tools
├── requirements.txt            # Python dependencies
├── package.json                # Root scripts for running servers
├── .env                        # Environment variables (API keys)
├── client/                     # React frontend
│   ├── src/
│   │   ├── App.tsx             # Main React app
│   │   ├── api.ts              # API client
│   │   ├── types.ts            # TypeScript types
│   │   ├── styles.css          # Styles
│   │   └── components/         # React components
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── venv/                       # Python virtual environment
```

## Prerequisites

- **Node.js** v18+ (tested with v24.13.0)
- **Python** 3.10+ (tested with 3.14.2)
- **npm** or **yarn**

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/ai-travel-planner.git
cd ai-travel-planner
```

### 2. Set up Python environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Required - Groq API for LLM
GROQ_API_KEY=your_groq_api_key

# Optional - Real API integrations
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
RAPIDAPI_KEY=your_rapidapi_key
FOURSQUARE_API_KEY=your_foursquare_api_key
```

### 4. Install frontend dependencies

```bash
cd client
npm install
cd ..
```

## Running the Application

### Option 1: Using npm scripts (recommended)

```bash
# Terminal 1 - Start FastAPI backend
npm run server

# Terminal 2 - Start React frontend
npm run client
```

### Option 2: Manual commands

```bash
# Terminal 1 - Start FastAPI backend (with venv activated)
uvicorn api_server:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Start React frontend
cd client
npm run dev
```

### Access the application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## API Endpoints

| Endpoint          | Method | Description                       |
| ----------------- | ------ | --------------------------------- |
| `/api/health`     | GET    | Health check                      |
| `/api/plan`       | POST   | Create travel plan using AI agent |
| `/api/flights`    | POST   | Search for flights                |
| `/api/hotels`     | POST   | Search for hotels                 |
| `/api/activities` | POST   | Search for activities             |

## Features

- 🤖 **AI-Powered Planning**: Natural language travel planning using LangChain and Groq
- ✈️ **Flight Search**: Real-time flight search via Amadeus API
- 🏨 **Hotel Search**: Hotel recommendations via Hotels.com API
- 🎯 **Activity Discovery**: Local activities via Foursquare API
- 💬 **Chat Interface**: Interactive chat-based travel planning
- 📱 **Responsive Design**: Works on desktop and mobile

## API Keys Setup

### Groq API (Required)

1. Go to [console.groq.com](https://console.groq.com)
2. Create an account and get your API key
3. Add to `.env` as `GROQ_API_KEY`

### Amadeus API (Flights)

1. Go to [developers.amadeus.com](https://developers.amadeus.com)
2. Create an account and get API credentials
3. Add to `.env` as `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET`

### RapidAPI (Hotels)

1. Go to [rapidapi.com](https://rapidapi.com)
2. Subscribe to Hotels.com API
3. Add to `.env` as `RAPIDAPI_KEY`

### Foursquare API (Activities)

1. Go to [developer.foursquare.com](https://developer.foursquare.com)
2. Create an app and get API key
3. Add to `.env` as `FOURSQUARE_API_KEY`

## Development

### Scripts

```bash
npm run client    # Start React dev server
npm run server    # Start FastAPI server
npm run setup     # Install all dependencies
```

### Tech Details

- **Frontend Port**: 5173 (Vite dev server)
- **Backend Port**: 8000 (FastAPI/Uvicorn)
- **Proxy**: Vite proxies `/api/*` requests to backend

## License

MIT License - feel free to use this project for learning or building your own travel planner!

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Built with ❤️ using React, FastAPI, LangChain, and Groq
