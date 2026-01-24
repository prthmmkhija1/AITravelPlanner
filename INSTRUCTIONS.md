# 🎯 INSTRUCTIONS FOR USE

## Your AI Travel Planner is Ready! ✨

### 📍 Project Location
```
/Users/dakshmor/Downloads/pathway/Code_24/ai-travel-planner/
```

---

## 🚀 Getting Started (3 Steps)

### Step 1: Install Dependencies
Open terminal and run:
```bash
cd /Users/dakshmor/Downloads/pathway/Code_24/ai-travel-planner
pip install -r requirements.txt
```

**OR** use the automated installer:
```bash
./install.sh
```

### Step 2: Add Your OpenRouter API Key

Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and add your key:
```
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

**Don't have an API key?**
1. Go to https://openrouter.ai/
2. Sign up for free account
3. Create API key in dashboard
4. Copy and paste into `.env`

### Step 3: Run the Application
```bash
streamlit run app.py
```

Browser will open at `http://localhost:8501` 🎉

---

## 📖 What to Read

### Start Here
1. **README.md** - Complete documentation (read first!)
2. **QUICKSTART.md** - Fast setup guide
3. **PROJECT_SUMMARY.md** - Submission overview

### For Development
4. **DOCUMENTATION_INDEX.md** - Project structure and concepts

---

## 🎯 Try These Examples

Once the app is running, try:

### Example 1: Simple Trip
```
Plan a 3-day trip to Goa from Delhi
```

### Example 2: Budget Trip
```
I want to visit Jaipur for 5 days from Mumbai, budget under 20000 rupees
```

### Example 3: Specific Interests
```
Weekend beach trip to Goa with water sports and heritage sites
```

### Example 4: Nature Trip
```
7-day Kerala backwaters and nature tour from Bangalore
```

---

## 🎨 What You'll See

### In the Sidebar:
- 🔑 API key input
- ℹ️ How to use guide
- 🌍 Available destinations

### Main Area:
- 📝 Text area for your trip description
- 🚀 "Plan My Trip" button
- 🎯 Quick example buttons
- 📋 Your personalized itinerary
- 💾 Download options (text/JSON)
- 🔍 Agent's thinking process (expandable)

---

## ✅ Verify Setup

Run the test script:
```bash
python test_setup.py
```

You should see:
- ✅ All imports successful
- ✅ All data files valid
- ✅ All tools working
- ✅ Agent module ready
- ✅ Streamlit app exists

---

## 📁 Project Structure

```
ai-travel-planner/
├── app.py                 ← Main Streamlit app
├── agent.py               ← LangChain agent
├── tools.py               ← 5 travel tools
├── test_setup.py          ← Validation script
├── install.sh             ← Auto installer
│
├── README.md              ← Full documentation
├── QUICKSTART.md          ← Setup guide
├── PROJECT_SUMMARY.md     ← Submission summary
├── DOCUMENTATION_INDEX.md ← Navigation
├── INSTRUCTIONS.md        ← This file
│
├── requirements.txt       ← Dependencies
├── .env.example           ← Config template
├── .gitignore            ← Git rules
│
└── data/
    ├── flights.json      ← 15 flights
    ├── hotels.json       ← 16 hotels
    └── places.json       ← 26 attractions
```

---

## 🛠️ Troubleshooting

### "Module not found" errors
```bash
pip install -r requirements.txt
```

### "API key invalid"
1. Check OpenRouter dashboard
2. Generate new key
3. Update `.env` file
4. Restart app

### "No flights/hotels found"
- Check city spelling (case-insensitive)
- Try: Goa, Jaipur, Mumbai, Bangalore, Kerala
- Source cities: Delhi, Mumbai, Bangalore

### App won't start
```bash
# Make sure you're in the right directory
cd /Users/dakshmor/Downloads/pathway/Code_24/ai-travel-planner

# Run streamlit
streamlit run app.py
```

---

## 🎓 Understanding the Agent

### How It Works:
1. You describe your trip in natural language
2. AI agent reads your request
3. Agent thinks about what tools to use
4. Agent calls tools (flights, hotels, places, weather, budget)
5. Agent analyzes results
6. Agent creates day-by-day itinerary
7. You get complete trip plan!

### Behind the Scenes:
```
User Input
    ↓
LangChain ReAct Agent
    ↓
Tool 1: Search Flights → Find cheapest/fastest
Tool 2: Search Hotels → Filter by rating/price
Tool 3: Search Places → Discover attractions
Tool 4: Get Weather → Real-time forecast
Tool 5: Estimate Budget → Calculate total cost
    ↓
Agent Constructs Itinerary
    ↓
Beautiful Output to You!
```

---

## 📊 What's Included

### 5 AI Tools:
1. **Flight Search** - Finds best flight options
2. **Hotel Finder** - Recommends accommodations
3. **Places Discovery** - Tourist attractions
4. **Weather Lookup** - 7-day forecasts
5. **Budget Calculator** - Total cost estimation

### 57 Data Entries:
- 15 flight routes across India
- 16 hotels (budget to luxury)
- 26 tourist attractions

### 6 Supported Cities:
- 🏛️ Delhi (Source)
- 🏖️ Goa (Beach destination)
- 🏰 Jaipur (Heritage)
- 🏙️ Mumbai (City)
- 💻 Bangalore (Tech hub)
- 🌴 Kerala (Nature)

---

## 🎯 Tips for Best Results

### Do's ✅
- Be specific about source and destination
- Mention duration (3 days, 5 days, etc.)
- State preferences (beach, heritage, budget)
- Use supported city names

### Don'ts ❌
- Don't use cities not in the data
- Don't ask for international trips
- Don't expect real-time flight availability
- Don't use very short prompts like "trip"

---

## 💡 Advanced Usage

### View Agent Thinking:
Click "View Agent's Thinking Process" expander to see:
- Which tools were called
- What inputs were used
- What results were returned
- How decisions were made

### Download Plans:
- **Text Format**: Easy to read and share
- **JSON Format**: For data processing

### Planning History:
Check "Planning History" section to see all your previous trips!

---

## 🚀 Next Steps

1. ✅ Install dependencies
2. ✅ Add API key
3. ✅ Run `streamlit run app.py`
4. ✅ Try example trips
5. ✅ Experiment with requests
6. ✅ Download your plans
7. ✅ Read documentation
8. ✅ Customize if needed

---

## 🎉 You're All Set!

Your complete AI Travel Planning Assistant is ready to use!

### Quick Command Reference:
```bash
# Install
pip install -r requirements.txt

# Test
python test_setup.py

# Run
streamlit run app.py
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Complete technical documentation |
| `QUICKSTART.md` | 5-minute setup guide |
| `PROJECT_SUMMARY.md` | Submission overview |
| `DOCUMENTATION_INDEX.md` | Navigation and concepts |
| `INSTRUCTIONS.md` | This file - getting started |

---

## 🌟 Features You'll Love

- 🤖 **Autonomous AI Agent** - Makes decisions for you
- 🎯 **Smart Recommendations** - Best flights, hotels, places
- 🌤️ **Real Weather** - Live forecasts via API
- 💰 **Budget Optimization** - Find best value
- 📅 **Day-by-Day Plans** - Complete itineraries
- 📥 **Download Options** - Save as text or JSON
- 🔍 **Transparency** - See how AI thinks
- 💬 **Natural Language** - Just describe your trip!

---

**Happy Planning! ✈️🌍**

For questions, check the README.md or QUICKSTART.md files.

**Project is complete and ready for submission! 🎉**
