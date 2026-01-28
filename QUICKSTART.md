# 🚀 Quick Start Guide

## 5-Minute Setup

### 1. Prerequisites Check
```bash
# Check Node version (need 18+)
node --version

# Check npm is installed
npm --version
```

### 2. Install Dependencies
```bash
# Navigate to project directory
cd AITravelPlanner

# Install root + server + client dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### 3. Get Groq API Key

1. Create a Groq API key from your Groq account
2. Copy the key

### 4. Configure Environment

**Option A: Using .env file (Recommended)**
```bash
# Copy example file
copy .env.example .env

# Edit .env and paste your API key
# GROQ_API_KEY=gsk_xxx
```

### 5. Run the Application
```bash
npm run dev
```

The app will open at `http://localhost:5173` (API at `http://localhost:3000`)

---

## First Trip Planning

### Example 1: Simple Beach Vacation
**Input:**
```
Plan a 3-day trip to Goa from Delhi
```

**What the AI will do:**
1. Search for flights from Delhi to Goa
2. Recommend hotels in Goa
3. Find beach attractions and heritage sites
4. Get 3-day weather forecast
5. Calculate total budget
6. Create day-wise itinerary

**Expected Output Structure:**
```
🌴 Your 3-Day Trip to Goa

✈️ Flight Selected:
- SpiceJet (₹4500)
- Departs Delhi at 18:00, Arrives 20:30

🏨 Hotel Booked:
- Sea View Resort (₹3200/night, 4.0★)
- Location: Baga Beach
- Amenities: Pool, Beach Access, WiFi, Restaurant

🌤️ Weather Forecast:
- Day 1: Clear sky (Max: 31°C, Min: 24°C)
- Day 2: Partly cloudy (Max: 30°C, Min: 23°C)
- Day 3: Mainly clear (Max: 32°C, Min: 24°C)

📅 Day-wise Itinerary:

Day 1: Arrival & Beach Time
- Check-in at Sea View Resort
- Evening at Baga Beach (3-4 hours)
- Dinner at beachside restaurant

Day 2: Heritage & Culture
- Morning: Basilica of Bom Jesus (1-2 hours)
- Afternoon: Fort Aguada (2 hours)
- Evening: Candolim Market (2-3 hours)

Day 3: Water Sports & Departure
- Morning: Calangute Beach - Water Sports (3-4 hours)
- Checkout and flight back to Delhi

💰 Budget Breakdown:
- Flight: ₹4,500
- Hotel: ₹9,600 (3 nights × ₹3,200)
- Food & Local Transport: ₹6,000 (3 days × ₹2,000)
----------------------------------------
Total Estimated Cost: ₹20,100

✨ Why These Choices:
- SpiceJet selected for best value (lowest price)
- Sea View Resort offers beach access at reasonable rate
- Mix of beach activities and heritage sites for variety
- Weather is perfect for beach activities all 3 days
```

---

## Example Requests by Type

### Budget Travel
```
I want to visit Jaipur for 4 days from Mumbai, budget under 15000 rupees
```

### Heritage Focus
```
Plan a heritage tour to Jaipur with palaces and forts, 5 days from Delhi
```

### Nature & Relaxation
```
7-day Kerala backwaters and tea gardens trip from Bangalore
```

### Weekend Getaway
```
Quick 2-day weekend trip to Mumbai from Delhi with shopping
```

### Specific Dates
```
Plan a trip to Goa from Delhi for Feb 12-15, I love beaches and nightlife
```

---

## Interpreting Results

### ✅ Good Results Indicators
- Agent completes in 5-10 tool calls
- All sections present (flight, hotel, weather, itinerary, budget)
- Specific places mentioned in itinerary
- Budget matches tool outputs
- Reasoning explains choices

### ⚠️ Potential Issues
- "No flights found" → Check city spelling or add route to data
- Agent loops → Simplify request or be more specific
- Missing sections → Agent may need different prompt
- High budget → Try specifying budget constraints

---

## Tips for Best Results

### 1. Be Specific
❌ "Plan a trip to Goa"  
✅ "Plan a 3-day beach vacation to Goa from Delhi"

### 2. Include Key Details
- Source city
- Destination city
- Duration (number of days/nights)
- Preferences (beach, heritage, budget, etc.)

### 3. Use Available Cities
Supported: **Goa, Jaipur, Mumbai, Bangalore, Kerala, Delhi**

### 4. Set Realistic Expectations
- Budget: ₹10,000 - ₹50,000 for domestic trips
- Duration: 2-7 days
- Specific interests: beaches, heritage, nature, shopping

---

## Testing the System

### Test Case 1: Basic Functionality
```
Input: "Plan a 3-day trip to Goa from Delhi"
Expected: Complete itinerary with all sections
```

### Test Case 2: Budget Constraint
```
Input: "Jaipur trip for 4 days, under 20000 rupees"
Expected: Budget-friendly hotel and economical flight
```

### Test Case 3: Specific Interests
```
Input: "Kerala nature trip with backwaters, 5 days from Bangalore"
Expected: Nature-focused places (backwaters, tea gardens, wildlife)
```

### Test Case 4: Different Cities
```
Input: "Mumbai weekend trip from Bangalore"
Expected: 2-day itinerary with Mumbai attractions
```

---

## Troubleshooting Quick Fixes

### Problem: "streamlit: command not found"
```bash
pip install streamlit
# or
python -m streamlit run app.py
```

### Problem: Import errors
```bash
pip install --upgrade -r requirements.txt
```

### Problem: Agent not responding
1. Check internet connection
2. Verify API key is correct
3. Check OpenRouter account has credits
4. Try refreshing the page

### Problem: Empty results
1. Verify city names are correct
2. Check data/*.json files exist and have data
3. Try a different destination pair

---

## Next Steps After Setup

1. ✅ **Test basic functionality** with simple request
2. ✅ **Try different cities** and durations
3. ✅ **Experiment with preferences** (budget, interests)
4. ✅ **Review agent's thinking** in expander section
5. ✅ **Download your plans** as text or JSON
6. ✅ **Customize data** by adding more flights/hotels/places

---

## Understanding the Output Files

### Text Download
Plain text format, easy to read and share:
```
Your 3-Day Trip to Goa (Feb 12–14)
Flight Selected: ...
Hotel Booked: ...
[Full itinerary]
```

### JSON Download
Structured data for programmatic use:
```json
{
  "request": "Plan a 3-day trip...",
  "trip_plan": "Your 3-Day Trip...",
  "timestamp": "2025-12-22..."
}
```

---

## Performance Expectations

- **Planning Time**: 15-45 seconds (depends on agent iterations)
- **Tool Calls**: 5-10 actions typical
- **Token Usage**: ~2000-4000 tokens per request
- **Success Rate**: 90%+ for supported city pairs

---

## Getting Help

If stuck:
1. Check `README.md` for detailed documentation
2. Review error messages carefully
3. Test with example requests first
4. Verify all setup steps completed
5. Check data files are not empty

---

**You're all set! Start planning amazing trips! ✈️🌍**
