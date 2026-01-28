# 🔑 **FREE REAL APIs SETUP GUIDE**

## **✅ STEP-BY-STEP API KEY SETUP**

### **1. 🛫 AMADEUS FLIGHT API (FREE - 2000 calls/month)**

#### **How to Get:**

1. **Go to:** [developers.amadeus.com](https://developers.amadeus.com)
2. **Click:** "Register" (top right)
3. **Create account** with your email
4. **Verify email** and login
5. **Go to:** "My Self-Service Workspace"
6. **Click:** "Create New App"
7. **App Details:**
   - App Name: `AI Travel Planner`
   - App Type: `Self-Service`
   - Description: `Travel planning application`
8. **Click:** "Create"
9. **Copy your keys:**
   - **API Key:** `your_amadeus_api_key_here`
   - **API Secret:** `your_amadeus_api_secret_here`

#### **Where to Paste:**

```env
# In your .env file:
AMADEUS_API_KEY=your_amadeus_api_key_here
AMADEUS_API_SECRET=your_amadeus_api_secret_here
```

---

### **2. 🏨 RAPIDAPI FOR HOTELS (FREE - 500 calls/month)**

#### **How to Get:**

1. **Go to:** [rapidapi.com](https://rapidapi.com)
2. **Sign up** with email/Google
3. **Search:** "Hotels.com" in the search bar
4. **Click:** "Hotels.com Provider" API
5. **Click:** "Subscribe to Test" (Free plan)
6. **Go to:** Dashboard → My Apps
7. **Copy:** X-RapidAPI-Key

#### **Alternative Hotel APIs on RapidAPI:**

- **Booking.com API** - Search "Booking.com"
- **Agoda API** - Search "Agoda"
- **Expedia API** - Search "Expedia"

#### **Where to Paste:**

```env
# In your .env file:
RAPIDAPI_KEY=your_rapidapi_key_here
```

---

### **3. 🎯 FOURSQUARE API (FREE - 1000 calls/day) ⭐ RECOMMENDED**

> **No credit card required! Best free option for activities.**

#### **How to Get:**

1. **Go to:** [location.foursquare.com/developer](https://location.foursquare.com/developer)
2. **Click:** "Sign Up" or "Get Started"
3. **Create account** with email (no credit card!)
4. **Verify email**
5. **Create a new project:**
   - Project Name: `AI Travel Planner`
6. **Go to:** API Keys section
7. **Copy:** Your API Key

#### **Where to Paste:**

```env
# In your .env file:
FOURSQUARE_API_KEY=your_foursquare_api_key_here
```

---

### **4. 🗺️ OPENTRIPMAP API (FREE - 5000 calls/day)**

> **Completely free backup option for tourist attractions.**

#### **How to Get:**

1. **Go to:** [opentripmap.io/product](https://opentripmap.io/product)
2. **Sign up** for free (optional - works without key for basic)
3. **Get API key** from dashboard

#### **Where to Paste:**

```env
# In your .env file (optional):
OPENTRIPMAP_API_KEY=your_opentripmap_key_here
```

---

### **~~5. 🎯 GOOGLE PLACES API~~ (SKIP - Requires Credit Card)**

> ⚠️ **Google requires credit card verification with ₹15,000 hold. Use Foursquare instead!**

---

### **5. 🌤️ OPENWEATHER API (FREE - 1000 calls/day)**

#### **How to Get:**

1. **Go to:** [openweathermap.org/api](https://openweathermap.org/api)
2. **Sign up** for free account
3. **Go to:** API Keys section
4. **Copy:** Default API key

#### **Where to Paste:**

```env
# In your .env file:
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

---

### **6. 💱 EXCHANGERATE API (FREE - 1500 calls/month)**

> **For currency conversion - useful for international trips.**

#### **How to Get:**

1. **Go to:** [exchangerate-api.com](https://www.exchangerate-api.com/)
2. **Click:** "Get Free Key"
3. **Enter your email** and sign up
4. **Verify email**
5. **Copy:** Your API Key from dashboard

#### **Where to Paste:**

```env
# In your .env file:
EXCHANGERATE_API_KEY=your_exchangerate_api_key_here
```

#### **Alternative Free Currency APIs:**

- **Fixer.io** - [fixer.io](https://fixer.io) - 1000 calls/month
- **Open Exchange Rates** - [openexchangerates.org](https://openexchangerates.org) - 1000 calls/month

---

## **❓ WHAT IS GOOGLE_API_KEY?**

> The `GOOGLE_API_KEY` in your `.env` file is **NOT required** for your current setup!

**Explanation:**

- It was likely created for another project or for Google Maps/Geocoding
- Since we're using **Foursquare** (free, no credit card) instead of Google Places, **you don't need it**
- It won't cause any issues if you keep it there
- **You can safely ignore it** or remove it

```env
# ❌ NOT NEEDED - Skip this (requires credit card)
```

---

## **📋 COMPLETE .ENV FILE TEMPLATE**

```env
# ⚠️ GOOGLE_API_KEY - Not needed (skip, requires credit card)
# GOOGLE_API_KEY=AIzaSyAuxSmoq1Sls8xZBk0Gzo4BvJYanLhMWDg

# 🛫 FLIGHTS (FREE - 2000/month)
AMADEUS_API_KEY=your_amadeus_api_key_here
AMADEUS_API_SECRET=your_amadeus_api_secret_here

# 🏨 HOTELS (FREE - 500/month)
RAPIDAPI_KEY=your_rapidapi_key_here

# 🎯 ACTIVITIES (FREE - No credit card!)
FOURSQUARE_API_KEY=your_foursquare_api_key_here
OPENTRIPMAP_API_KEY=your_opentripmap_key_here

# 🌤️ WEATHER (FREE - 1000/day)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# 💱 CURRENCY (FREE - 1500/month)
EXCHANGERATE_API_KEY=your_exchangerate_api_key_here
```

---

## **⚡ QUICK START PRIORITY**

### **MINIMUM REQUIRED (for basic functionality):**

1. **✅ AMADEUS_API_KEY** - For real flight data
2. **✅ RAPIDAPI_KEY** - For real hotel data
3. **✅ FOURSQUARE_API_KEY** - For real activities (FREE, no card!)

### **NICE TO HAVE (for enhanced features):**

4. **OPENTRIPMAP_API_KEY** - Backup for activities
5. **OPENWEATHER_API_KEY** - Enhanced weather
6. **EXCHANGERATE_API_KEY** - Currency conversion

---

## **🧪 TESTING YOUR APIS**

### **Test Script:**

```bash
cd f:\Projects\AITravelPlanner\ai-travel-planner
python real_api_tools.py
```

### **Expected Output:**

```
🔍 Testing Real API Connections...

✈️ Testing Amadeus Flight API...
✅ Flight API: Working

🏨 Testing Hotels API...
✅ Hotel API: Working

🎯 Testing Activities API...
✅ Activities API: Working

🎉 API Testing Complete!
```

---

## **📊 API USAGE LIMITS (FREE TIERS)**

| API                 | Free Limit  | Cost After       | Best For           |
| ------------------- | ----------- | ---------------- | ------------------ |
| **Amadeus Flights** | 2,000/month | $0.002/call      | Real flight prices |
| **RapidAPI Hotels** | 500/month   | $0.01/call       | Live hotel rates   |
| **Google Places**   | $200 credit | $17/1000 calls   | Activity details   |
| **Foursquare**      | 1,000/day   | $0.02/call       | Activity backup    |
| **OpenWeather**     | 1,000/day   | $0.15/1000 calls | Weather data       |

---

## **🔧 INTEGRATION STEPS**

### **Step 1: Get API Keys (30 mins)**

1. Start with Amadeus (most important)
2. Then RapidAPI for hotels
3. Finally Google Places for activities

### **Step 2: Update .env File**

1. Add all your API keys to `.env`
2. Keep existing keys intact

### **Step 3: Test Integration**

```bash
python real_api_tools.py
```

### **Step 4: Update Your Agent**

```python
# In agent.py, replace:
from tools import create_travel_tools

# With:
from real_api_tools import create_real_api_tools

# And update:
self.tools = create_real_api_tools()
```

---

## **🚨 TROUBLESHOOTING**

### **Common Issues:**

1. **"API Key Invalid"** → Check key is copied correctly
2. **"Rate limit exceeded"** → Free tier limit reached
3. **"No results"** → Try different search terms
4. **"Connection timeout"** → Check internet connection

### **Fallback Strategy:**

- All APIs have graceful fallback to enhanced static data
- Error messages guide users to try different options
- System continues working even if some APIs fail

---

## **🎯 HACKATHON ADVANTAGE**

With these real APIs, you'll have:

- ✅ **Live pricing** - Actual flight/hotel rates
- ✅ **Real availability** - Current inventory status
- ✅ **Fresh reviews** - Latest customer feedback
- ✅ **Professional credibility** - Production-ready data
- ✅ **Competitive edge** - Most teams use static data

**This makes your project stand out as a REAL solution!** 🏆
