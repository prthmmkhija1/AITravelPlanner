"""
Travel Planning Agent using LangChain and Groq API.
This agent autonomously plans trips using the available tools.
"""

import os
from typing import Dict, Any
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from tools import create_travel_tools


class TravelPlanningAgent:
    """
    AI Travel Planning Agent that uses LangChain and Groq LLM.
    """
    
    def __init__(self, api_key: str, model: str = "llama-3.3-70b-versatile"):
        """
        Initialize the travel planning agent.
        
        Args:
            api_key: Groq API key
            model: Model to use (default: llama-3.3-70b-versatile)
        """
        self.api_key = api_key
        self.model = model
        self.tools = create_travel_tools()
        self.agent_executor = self._create_agent()
    
    def _create_agent(self):
        """Create the ReAct agent with tools."""
        
        # Initialize Groq LLM
        llm = ChatOpenAI(
            model=self.model,
            api_key=self.api_key,
            base_url="https://api.groq.com/openai/v1",
            temperature=0.7
        )
        
        # Create the agent using langgraph
        agent_executor = create_react_agent(llm, self.tools)
        
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


def create_agent(api_key: str) -> TravelPlanningAgent:
    """
    Factory function to create a travel planning agent.
    
    Args:
        api_key: OpenRouter API key
    
    Returns:
        TravelPlanningAgent instance
    """
    return TravelPlanningAgent(api_key)
