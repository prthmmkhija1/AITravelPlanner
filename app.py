"""
Streamlit UI for AI Travel Planning Assistant.
A clean and interactive interface for trip planning.
"""

import streamlit as st
import os
import json
from dotenv import load_dotenv
from agent import create_agent

# Load environment variables
load_dotenv()

# Page configuration
st.set_page_config(
    page_title="AI Travel Planner",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
    <style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        color: #1E88E5;
        margin-bottom: 1rem;
    }
    .sub-header {
        font-size: 1.2rem;
        text-align: center;
        color: #666;
        margin-bottom: 2rem;
    }
    .section-header {
        font-size: 1.5rem;
        font-weight: bold;
        color: #1565C0;
        margin-top: 2rem;
        margin-bottom: 1rem;
        border-bottom: 2px solid #1E88E5;
        padding-bottom: 0.5rem;
    }
    .trip-card {
        background-color: #f0f8ff;
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 5px solid #1E88E5;
        margin: 1rem 0;
    }
    .stButton>button {
        background-color: #1E88E5;
        color: white;
        font-size: 1.1rem;
        padding: 0.75rem 2rem;
        border-radius: 8px;
        border: none;
        width: 100%;
    }
    .stButton>button:hover {
        background-color: #1565C0;
    }
    </style>
""", unsafe_allow_html=True)

# Initialize session state
if 'agent' not in st.session_state:
    st.session_state.agent = None
if 'trip_plan' not in st.session_state:
    st.session_state.trip_plan = None
if 'planning_history' not in st.session_state:
    st.session_state.planning_history = []


def initialize_agent(api_key: str):
    """Initialize the travel planning agent."""
    try:
        # Validate API key format
        if not api_key:
            st.error("❌ API key is missing")
            return False
        
        agent = create_agent(api_key)
        st.session_state.agent = agent
        return True
    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg or "API key not valid" in error_msg or "INVALID_ARGUMENT" in error_msg:
            st.error("❌ **API Key Error**: Your xAI API key is invalid")
            st.info("""
            **How to get an API key:**
            1. Go to https://console.x.ai
            2. Sign in with your account
            3. Navigate to API Keys section
            4. Create a new API key
            5. Copy the key (starts with xai-...)
            6. Paste it in the sidebar above
            """)
        elif "403" in error_msg or "PERMISSION_DENIED" in error_msg:
            st.error("❌ **Access Denied**: Check your API key permissions")
            st.info("Make sure your xAI API key has the necessary permissions")
        else:
            st.error(f"❌ Failed to initialize agent: {error_msg}")
        return False


def main():
    """Main Streamlit application."""
    
    # Header
    st.markdown('<h1 class="main-header">✈️ AI Travel Planner</h1>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Your Intelligent Travel Planning Assistant powered by LangChain & AI</p>', unsafe_allow_html=True)
    
    # Sidebar for configuration
    with st.sidebar:
        st.header("⚙️ Configuration")
        
        # Hard-coded API key
        api_key = "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"
        
        if st.session_state.agent is None:
            with st.spinner("Initializing AI agent..."):
                if initialize_agent(api_key):
                    st.success("✅ Agent initialized successfully!")
        
        st.markdown("---")
        
        # Information section
        st.header("ℹ️ How to Use")
        st.markdown("""
        1. Enter your OpenRouter API key
        2. Describe your travel plans in natural language
        3. Click "Plan My Trip"
        4. Review your personalized itinerary
        
        **Example Requests:**
        - "Plan a 3-day trip to Goa from Delhi"
        - "I want to visit Jaipur for 5 days, budget-friendly"
        - "Weekend getaway to Mumbai from Bangalore"
        """)
        
        st.markdown("---")
        
        # Available destinations
        st.header("🌍 Available Destinations")
        st.markdown("""
        - 🏖️ **Goa** - Beaches & Nightlife
        - 🏰 **Jaipur** - Heritage & Culture
        - 🏙️ **Mumbai** - City Life
        - 💻 **Bangalore** - Tech & Gardens
        - 🌴 **Kerala** - Backwaters & Nature
        """)
    
    # Main content area
    if st.session_state.agent is not None:
        
        # Trip request input
        st.markdown('<h2 class="section-header">📝 Tell us about your trip</h2>', unsafe_allow_html=True)
        
        col1, col2 = st.columns([3, 1])
        
        with col1:
            user_request = st.text_area(
                "Describe your ideal trip",
                height=100,
                placeholder="Example: Plan a 3-day trip to Goa from Delhi starting Feb 12. I want beach activities and heritage sites.",
                help="Be as specific as possible about source, destination, duration, and preferences"
            )
        
        with col2:
            st.markdown("<br>", unsafe_allow_html=True)
            plan_button = st.button("🚀 Plan My Trip", use_container_width=True)
        
        # Quick examples
        st.markdown("**Quick Examples:**")
        example_col1, example_col2, example_col3 = st.columns(3)
        
        with example_col1:
            if st.button("🏖️ Goa Beach Vacation", use_container_width=True):
                user_request = "Plan a 3-day beach vacation to Goa from Delhi"
                plan_button = True
        
        with example_col2:
            if st.button("🏰 Jaipur Heritage Tour", use_container_width=True):
                user_request = "Plan a 4-day heritage tour to Jaipur from Mumbai"
                plan_button = True
        
        with example_col3:
            if st.button("🌴 Kerala Backwaters", use_container_width=True):
                user_request = "Plan a 5-day backwaters and nature trip to Kerala from Bangalore"
                plan_button = True
        
        # Process trip planning
        if plan_button and user_request:
            st.markdown('<h2 class="section-header">🤖 AI is planning your trip...</h2>', unsafe_allow_html=True)
            
            with st.spinner("🔍 Searching flights, hotels, and attractions..."):
                result = st.session_state.agent.plan_trip(user_request)
                
                if result['status'] == 'success':
                    st.session_state.trip_plan = result
                    st.session_state.planning_history.append({
                        'request': user_request,
                        'plan': result['trip_plan']
                    })
                    st.success("✅ Trip planned successfully!")
                else:
                    st.error(f"❌ Error: {result.get('error_message', 'Unknown error occurred')}")
        
        # Display trip plan
        if st.session_state.trip_plan:
            st.markdown('<h2 class="section-header">🎉 Your Personalized Trip Plan</h2>', unsafe_allow_html=True)
            
            trip_plan_text = st.session_state.trip_plan.get('trip_plan', '')
            
            # Display in a nice card format
            st.markdown('<div class="trip-card">', unsafe_allow_html=True)
            st.markdown(trip_plan_text)
            st.markdown('</div>', unsafe_allow_html=True)
            
            # Download options
            col1, col2 = st.columns(2)
            
            with col1:
                # Download as text
                st.download_button(
                    label="📄 Download as Text",
                    data=trip_plan_text,
                    file_name="trip_plan.txt",
                    mime="text/plain",
                    use_container_width=True
                )
            
            with col2:
                # Download as JSON
                json_data = json.dumps({
                    'request': st.session_state.planning_history[-1]['request'] if st.session_state.planning_history else '',
                    'trip_plan': trip_plan_text,
                    'timestamp': str(st.session_state.trip_plan)
                }, indent=2)
                
                st.download_button(
                    label="📋 Download as JSON",
                    data=json_data,
                    file_name="trip_plan.json",
                    mime="application/json",
                    use_container_width=True
                )
            
            # Show intermediate steps (for debugging/transparency)
            with st.expander("🔍 View Agent's Thinking Process"):
                intermediate_steps = st.session_state.trip_plan.get('intermediate_steps', [])
                if intermediate_steps:
                    for i, (action, observation) in enumerate(intermediate_steps):
                        st.markdown(f"**Step {i+1}:**")
                        st.markdown(f"- **Action:** {action.tool}")
                        st.markdown(f"- **Input:** `{action.tool_input}`")
                        st.markdown(f"- **Output:** {observation[:500]}..." if len(str(observation)) > 500 else f"- **Output:** {observation}")
                        st.markdown("---")
                else:
                    st.info("No intermediate steps available.")
        
        # Planning history
        if st.session_state.planning_history:
            with st.expander("📚 Planning History"):
                for i, entry in enumerate(reversed(st.session_state.planning_history)):
                    st.markdown(f"**Request {len(st.session_state.planning_history) - i}:** {entry['request']}")
                    st.markdown("---")
    
    else:
        # Show welcome message when agent is not initialized
        st.info("👈 Please enter your OpenRouter API key in the sidebar to get started!")
        
        # Feature highlights
        st.markdown('<h2 class="section-header">✨ Features</h2>', unsafe_allow_html=True)
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown("""
            ### 🎯 Smart Planning
            AI-powered agent that autonomously:
            - Searches flights
            - Recommends hotels
            - Finds attractions
            - Checks weather
            - Estimates budget
            """)
        
        with col2:
            st.markdown("""
            ### 🤖 Agentic AI
            Uses LangChain ReAct agent:
            - Multi-step reasoning
            - Tool selection
            - Decision making
            - Itinerary optimization
            """)
        
        with col3:
            st.markdown("""
            ### 📊 Complete Itinerary
            Get detailed plans with:
            - Day-wise schedule
            - Weather forecast
            - Budget breakdown
            - Recommendations
            """)
    
    # Footer
    st.markdown("---")
    st.markdown(
        '<p style="text-align: center; color: #666;">Built with ❤️ using LangChain, OpenRouter & Streamlit</p>',
        unsafe_allow_html=True
    )


if __name__ == "__main__":
    main()
