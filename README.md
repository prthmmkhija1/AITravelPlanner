# 🌍 AI Travel Planning Assistant

An intelligent travel planning system powered by **LangChain**, **OpenRouter AI**, and **Streamlit** that autonomously creates personalized trip itineraries with flights, hotels, attractions, weather forecasts, and budget estimates.

## 📋 Project Overview

This project implements an **Agentic AI-based Travel Planning Assistant** that uses:
- **LangChain ReAct Agent** for autonomous decision-making and multi-step reasoning
- **OpenRouter API** (GPT-4o-mini) for natural language understanding
- **5 Custom Tools** for flight search, hotel recommendations, place discovery, weather lookup, and budget estimation
- **Streamlit** for an interactive, user-friendly web interface
- **Real-time Weather API** (Open-Meteo) for accurate forecasts

### Problem Statement
Planning trips requires switching between multiple websites, comparing inconsistent information, and manually building itineraries that may be inefficient or incomplete. This system automates the entire process through intelligent AI agents.

### Business Use Cases
- **Travel Agencies**: Reduce customer support workload with automated planning
- **Hotel Platforms**: Provide personalized recommendations
- **Airline Aggregators**: Automate itinerary design
- **Tourism Companies**: Improve customer satisfaction and save time/money

---

## ✨ Features

### Core Capabilities
✅ **Autonomous Trip Planning** - AI agent independently searches and decides  
✅ **Multi-Tool Integration** - Coordinates 5 specialized tools  
✅ **Smart Recommendations** - Selects optimal flights, hotels, and attractions  
✅ **Weather Integration** - Real-time forecasts from Open-Meteo API  
✅ **Budget Optimization** - Finds best value options with cost breakdowns  
✅ **Day-wise Itineraries** - Complete schedules with specific places  
✅ **Natural Language Input** - Simple conversational requests  
✅ **Interactive UI** - Clean Streamlit interface with examples  

### Technical Highlights
- **ReAct Agent Pattern**: Thought → Action → Observation loop
- **Tool Calling**: Automatic tool selection and execution
- **Structured Output**: JSON + Human-readable formats
- **Error Handling**: Graceful failures with helpful messages
- **Session Management**: History tracking and plan downloads

---

## 🏗️ Project Structure

```
ai-travel-planner/
├── app.py                 # Streamlit UI application
├── agent.py               # LangChain ReAct agent implementation
├── tools.py               # All 5 travel planning tools
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variable template
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── data/                 # JSON datasets
    ├── flights.json      # Flight information (15 routes)
    ├── hotels.json       # Hotel listings (16 properties)
    └── places.json       # Tourist attractions (26 places)
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- OpenRouter API key ([Get one here](https://openrouter.ai/))

### Step 1: Clone or Download
```bash
cd ai-travel-planner
```

### Step 2: Create Virtual Environment (Recommended)
```bash
python -m venv venv

# Activate on macOS/Linux:
source venv/bin/activate

# Activate on Windows:
venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure API Key
Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key:
```
OPENROUTER_API_KEY=your_actual_api_key_here
```

---

## 🎯 Usage

### Running the Application

Start the Streamlit app:
```bash
streamlit run app.py
```

The app will open in your browser at `http://localhost:8501`

### Using the Interface

1. **Enter API Key**: Add your OpenRouter API key in the sidebar (if not in `.env`)
2. **Describe Your Trip**: Use natural language to describe your travel plans
3. **Click "Plan My Trip"**: Watch the AI agent work through the planning process
4. **Review Your Itinerary**: Get complete trip details with all recommendations
5. **Download**: Save your plan as text or JSON

### Example Requests

```
"Plan a 3-day trip to Goa from Delhi"
```

```
"I want to visit Jaipur for 5 days, budget under 20000 rupees"
```

```
"Weekend getaway to Mumbai from Bangalore with heritage sites"
```

```
"7-day Kerala backwaters and nature tour from Delhi"
```

---

## 🛠️ Technical Architecture

### 1. Tools (tools.py)

Five specialized LangChain tools handle specific tasks:

#### Tool 1: Flight Search
- **Input**: Source city, destination city
- **Function**: Filters flights by route
- **Output**: Cheapest and fastest options with prices/timings

#### Tool 2: Hotel Recommendations
- **Input**: City, max price, min rating
- **Function**: Filters hotels by criteria
- **Output**: Best value, cheapest, and highest-rated options

#### Tool 3: Places Discovery
- **Input**: City, place type (Beach/Heritage/etc.), min rating
- **Function**: Finds tourist attractions
- **Output**: Top-rated places with descriptions and visit durations

#### Tool 4: Weather Lookup
- **Input**: City, number of forecast days
- **Function**: Calls Open-Meteo API
- **Output**: Daily temperature, precipitation, and conditions

#### Tool 5: Budget Estimation
- **Input**: Flight price, hotel price, nights, daily expense
- **Function**: Calculates total cost
- **Output**: Detailed breakdown with subtotals

### 2. Agent (agent.py)

**ReAct Agent Pattern**:
```
Question → Thought → Action → Action Input → Observation → (Repeat) → Final Answer
```

The agent:
1. Understands user's natural language request
2. Determines which tools to call and in what order
3. Retrieves data from multiple sources
4. Analyzes and synthesizes information
5. Constructs day-wise itineraries
6. Provides complete trip plan with reasoning

### 3. UI (app.py)

**Streamlit Interface**:
- Clean, responsive design with custom CSS
- Sidebar configuration (API key, help, destinations)
- Text area for natural language input
- Quick example buttons for common trips
- Real-time planning with loading indicators
- Formatted trip display with cards
- Download options (text/JSON)
- Planning history and agent transparency (intermediate steps)

---

## 📊 Data Sources

### JSON Datasets (Included)

**flights.json** - 15 domestic routes:
- Delhi ↔ Goa, Jaipur, Mumbai, Bangalore, Kerala
- Mumbai ↔ Goa, Jaipur, Bangalore
- Bangalore ↔ Goa

**hotels.json** - 16 properties across 5 cities:
- Budget to luxury options (₹1500-₹8000/night)
- Ratings: 3.0 to 5.0 stars
- Amenities: Pool, WiFi, Spa, Restaurant, etc.

**places.json** - 26 tourist attractions:
- Types: Beach, Heritage, Shopping, Nature, Religious, Scenic
- Ratings: 4.0+ stars
- Visit durations and descriptions

### Live API

**Open-Meteo Weather API**:
- Free, no API key required
- 7-day forecasts
- Temperature, precipitation, weather codes
- Supported cities: Goa, Jaipur, Mumbai, Bangalore, Kerala, Delhi

---

## 🧪 Testing the Application

### Manual Testing

1. **Simple Request**:
   ```
   "Plan a 3-day trip to Goa from Delhi"
   ```
   Expected: Flight options, hotel, 3-day itinerary, weather, budget

2. **Complex Request**:
   ```
   "5-day heritage tour to Jaipur from Mumbai, budget 25000"
   ```
   Expected: Filtered results within budget constraints

3. **Specific Preferences**:
   ```
   "Weekend beach trip to Goa with water sports"
   ```
   Expected: Beach-focused itinerary with appropriate places

### Validation Checklist

- [ ] Agent initializes successfully with API key
- [ ] All 5 tools execute without errors
- [ ] Flight search returns valid options
- [ ] Hotel recommendations match city
- [ ] Places are relevant to destination
- [ ] Weather API returns forecast data
- [ ] Budget calculation is accurate
- [ ] Final itinerary is coherent and structured
- [ ] Download buttons work (text & JSON)
- [ ] Error handling displays helpful messages

---

## 📝 Code Quality Standards

### Followed Best Practices

✅ **PEP 8 Compliance**: Consistent formatting, 4-space indentation  
✅ **Meaningful Names**: Descriptive variables, functions, classes  
✅ **Modular Design**: Separate files for tools, agent, UI  
✅ **Documentation**: Comprehensive docstrings and comments  
✅ **Error Handling**: Try-except blocks with user-friendly messages  
✅ **Type Hints**: Function signatures with return types  
✅ **DRY Principle**: Reusable helper functions (e.g., `load_json_data`)  
✅ **Configuration Management**: Environment variables for secrets  

---

## 🔧 Customization Guide

### Adding New Cities

1. **Add flights** to `data/flights.json`:
   ```json
   {
     "flight_id": "F016",
     "airline": "IndiGo",
     "source": "Delhi",
     "destination": "Shimla",
     "departure_time": "09:00",
     "arrival_time": "10:30",
     "duration": "1h 30m",
     "price": 3500,
     "class": "Economy"
   }
   ```

2. **Add hotels** to `data/hotels.json`:
   ```json
   {
     "hotel_id": "H017",
     "name": "Mountain View Resort",
     "city": "Shimla",
     "rating": 4.5,
     "price_per_night": 4000,
     "amenities": ["WiFi", "Heater", "Mountain View"],
     "location": "Mall Road"
   }
   ```

3. **Add places** to `data/places.json`:
   ```json
   {
     "place_id": "P027",
     "name": "Ridge",
     "city": "Shimla",
     "type": "Scenic",
     "rating": 4.6,
     "description": "Historic open space with mountain views",
     "average_time": "1-2 hours"
   }
   ```

4. **Add weather coordinates** in `tools.py` → `get_weather()`:
   ```python
   city_coords = {
       # ... existing cities ...
       "shimla": (31.1048, 77.1734)
   }
   ```

### Changing LLM Model

In `agent.py`, modify the model parameter:
```python
llm = ChatOpenAI(
    model="openai/gpt-4o-mini",  # Change to "anthropic/claude-3.5-sonnet" etc.
    openai_api_key=self.api_key,
    openai_api_base="https://openrouter.ai/api/v1",
    temperature=0.7
)
```

### Adjusting Agent Behavior

Modify the prompt template in `agent.py` → `_create_agent()` to change instructions.

---

## 🐛 Troubleshooting

### Common Issues

**1. "Failed to initialize agent"**
- Check API key is correct
- Verify internet connection
- Ensure OpenRouter account has credits

**2. "No flights/hotels/places found"**
- Verify city names match exactly (case-insensitive but spelling matters)
- Check JSON files have data for requested route
- Try different city combinations

**3. Weather API errors**
- Open-Meteo may have rate limits
- Check city coordinates are added to `tools.py`
- Verify internet connectivity

**4. Agent gets stuck in loop**
- Increase `max_iterations` in `agent.py`
- Simplify user request
- Check tool outputs are valid JSON

**5. Module import errors**
- Reinstall requirements: `pip install -r requirements.txt`
- Activate virtual environment
- Check Python version (3.8+)

---

## 📚 Dependencies

```
langchain==0.1.0          # LangChain framework
langchain-openai==0.0.5   # OpenRouter integration
streamlit==1.29.0         # Web UI framework
requests==2.31.0          # HTTP library for weather API
python-dotenv==1.0.0      # Environment variable management
```

---

## 🎓 Learning Outcomes

By building this project, you'll master:
- **Agentic AI**: ReAct pattern, tool calling, autonomous reasoning
- **LangChain**: Agent creation, tool integration, prompt engineering
- **API Integration**: OpenRouter, Open-Meteo, data processing
- **Streamlit**: Interactive UI, session management, custom styling
- **Python Best Practices**: Modular code, error handling, documentation

---

## 🚀 Future Enhancements

Potential improvements:
- [ ] Multi-city trip support (Delhi → Goa → Mumbai)
- [ ] Return flight booking
- [ ] Real flight/hotel APIs (Amadeus, Booking.com)
- [ ] User authentication and saved trips
- [ ] Calendar integration for date selection
- [ ] PDF report generation with maps
- [ ] Budget constraints with filtering
- [ ] Activity booking integration
- [ ] Social sharing features
- [ ] Multi-language support

---

## 📄 License

This project is for educational purposes. Feel free to modify and extend it for your needs.

---

## 🙏 Acknowledgments

- **LangChain**: Agent framework
- **OpenRouter**: LLM API access
- **Open-Meteo**: Free weather API
- **Streamlit**: UI framework

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review code documentation
3. Verify all setup steps were completed

---

**Built with ❤️ using LangChain, OpenRouter & Streamlit**

Happy Traveling! ✈️🌍
