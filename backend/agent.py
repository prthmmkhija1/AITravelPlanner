"""
Travel Planning Agent using LangChain and Groq API.
This agent autonomously plans trips using REAL API tools.
Updated to use live Amadeus, Hotels.com, and Foursquare APIs.
"""

import os
from typing import Dict, Any
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import real API tools (live data)
try:
    from real_api_tools import create_real_api_tools
    USE_REAL_APIS = True
except ImportError as e:
    USE_REAL_APIS = False
    print(f"⚠️ Real API tools not found: {e}")
    print("Please ensure real_api_tools.py exists and all dependencies are installed")
    create_real_api_tools = None


class TravelPlanningAgent:
    """
    AI Travel Planning Agent that uses LangChain and Groq LLM.
    Now integrated with REAL APIs for live flight, hotel, and activity data.
    """
    
    def __init__(self, api_key: str = None, model: str = "llama-3.3-70b-versatile"):
        """
        Initialize the travel planning agent.
        
        Args:
            api_key: Groq API key (optional, can use env variable)
            model: Model to use (default: llama-3.3-70b-versatile)
        """
        self.api_key = api_key or os.getenv('GROQ_API_KEY')
        self.model = model
        
        # Use real API tools if available
        if USE_REAL_APIS and create_real_api_tools:
            self.tools = create_real_api_tools()
            print("✅ Using REAL API tools (Amadeus, Hotels.com, Foursquare)")
        else:
            raise ImportError("Real API tools required. Ensure real_api_tools.py exists and dependencies are installed.")
        
        self.agent_executor = self._create_agent()
    
    def _create_agent(self):
        """Create the ReAct agent with tools."""
        
        if not self.api_key:
            raise ValueError("Groq API key is required. Set GROQ_API_KEY in .env file.")
        
        # Initialize Groq LLM
        llm = ChatOpenAI(
            model=self.model,
            api_key=self.api_key,
            base_url="https://api.groq.com/openai/v1",
            temperature=0.7
        )
        
        # System prompt for travel agent copilot
        system_prompt = """You are an intelligent Travel Agent Copilot powered by real-time APIs.

Your capabilities:
🛫 FLIGHTS: Search real flights with live pricing from Amadeus API
🏨 HOTELS: Find real hotels with current rates from Hotels.com/Booking.com
🎯 ACTIVITIES: Discover attractions with live reviews from Foursquare
📊 MONITORING: Set up price alerts for customers
👥 CUSTOMERS: Access customer preferences and history

When planning trips:
1. Use real_flight_search for accurate, live flight prices
2. Use real_hotel_search for current hotel availability
3. Use real_activity_search for up-to-date attractions
4. Always mention that prices are LIVE and may change
5. Provide booking recommendations based on customer preferences
6. Consider budget constraints and travel preferences

Be helpful, professional, and provide complete travel solutions."""
        
        # Create the agent using langgraph with prompt parameter
        agent_executor = create_react_agent(llm, self.tools, prompt=system_prompt)
        
        return agent_executor
    
    def plan_trip(self, user_request: str) -> Dict[str, Any]:
        """
        Plan a trip based on user request.
        
        Args:
            user_request: Natural language travel request
        
        Returns:
            Dictionary with trip plan and intermediate steps
        """
        try:
            # Langgraph agent executor uses messages format
            result = self.agent_executor.invoke({
                "messages": [("user", user_request)]
            })
            
            # Extract the final message from the result
            messages = result.get("messages", [])
            trip_plan = ""
            if messages:
                # Get the last AI message
                for msg in reversed(messages):
                    if hasattr(msg, 'content'):
                        trip_plan = msg.content
                        break
            
            return {
                "status": "success",
                "trip_plan": trip_plan,
                "intermediate_steps": []
            }
        except Exception as e:
            return {
                "status": "error",
                "error_message": str(e),
                "trip_plan": None
            }
    
    def parse_trip_plan(self, trip_plan: str) -> Dict[str, Any]:
        """
        Parse the trip plan into structured format.
        
        Args:
            trip_plan: Raw trip plan text
        
        Returns:
            Structured dictionary with trip details
        """
        # Simple parser - can be enhanced with regex or NLP
        sections = {
            "summary": "",
            "flight": "",
            "hotel": "",
            "weather": "",
            "itinerary": "",
            "budget": "",
            "reasoning": ""
        }
        
        current_section = "summary"
        for line in trip_plan.split('\n'):
            line_lower = line.lower()
            
            if 'flight' in line_lower and ('selected' in line_lower or 'booked' in line_lower):
                current_section = "flight"
            elif 'hotel' in line_lower and ('selected' in line_lower or 'booked' in line_lower or 'recommendation' in line_lower):
                current_section = "hotel"
            elif 'weather' in line_lower or 'forecast' in line_lower:
                current_section = "weather"
            elif 'itinerary' in line_lower or 'day-wise' in line_lower or 'day 1' in line_lower:
                current_section = "itinerary"
            elif 'budget' in line_lower or 'cost' in line_lower:
                current_section = "budget"
            elif 'reasoning' in line_lower or 'why' in line_lower:
                current_section = "reasoning"
            
            sections[current_section] += line + '\n'
        
        return sections


def create_agent(api_key: str = None) -> TravelPlanningAgent:
    """
    Factory function to create a travel planning agent.
    
    Args:
        api_key: Groq API key (optional, uses env var if not provided)
    
    Returns:
        TravelPlanningAgent instance
    """
    return TravelPlanningAgent(api_key)


# Test function to verify API connections
def test_apis():
    """Test all API connections."""
    if USE_REAL_APIS:
        from real_api_tools import test_all_apis
        return test_all_apis()
    else:
        return {"status": "Using static data - no APIs to test"}


if __name__ == "__main__":
    # Test the agent
    print("Testing Travel Planning Agent...")
    print(f"Using Real APIs: {USE_REAL_APIS}")
    
    # Test API connections
    api_test = test_apis()
    print(f"API Test Results: {api_test}")
    
    # Quick agent test
    try:
        agent = create_agent()
        result = agent.plan_trip("Find flights from Delhi to Mumbai for next week")
        print(f"Agent Response: {result['status']}")
    except Exception as e:
        print(f"Agent Error: {e}")
