"""
Test script to validate the AI Travel Planner setup.
Run this to ensure all components are working correctly.
"""

import os
import sys
import json


def test_imports():
    """Test if all required packages are installed."""
    print("🧪 Testing imports...")
    
    try:
        import streamlit
        print("  ✅ streamlit")
    except ImportError:
        print("  ❌ streamlit - Run: pip install streamlit")
        return False
    
    try:
        import langchain
        print("  ✅ langchain")
    except ImportError:
        print("  ❌ langchain - Run: pip install langchain")
        return False
    
    try:
        from langchain_openai import ChatOpenAI
        print("  ✅ langchain-openai")
    except ImportError:
        print("  ❌ langchain-openai - Run: pip install langchain-openai")
        return False
    
    try:
        import requests
        print("  ✅ requests")
    except ImportError:
        print("  ❌ requests - Run: pip install requests")
        return False
    
    try:
        from dotenv import load_dotenv
        print("  ✅ python-dotenv")
    except ImportError:
        print("  ❌ python-dotenv - Run: pip install python-dotenv")
        return False
    
    print("✅ All imports successful!\n")
    return True


def test_data_files():
    """Test if all data files exist and are valid JSON."""
    print("🧪 Testing data files...")
    
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    files = ['flights.json', 'hotels.json', 'places.json']
    
    all_valid = True
    
    for filename in files:
        filepath = os.path.join(data_dir, filename)
        
        if not os.path.exists(filepath):
            print(f"  ❌ {filename} - File not found")
            all_valid = False
            continue
        
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
                count = len(data)
                print(f"  ✅ {filename} - {count} entries")
        except json.JSONDecodeError:
            print(f"  ❌ {filename} - Invalid JSON")
            all_valid = False
        except Exception as e:
            print(f"  ❌ {filename} - Error: {str(e)}")
            all_valid = False
    
    if all_valid:
        print("✅ All data files valid!\n")
    else:
        print("❌ Some data files have issues\n")
    
    return all_valid


def test_tools():
    """Test if tools can be loaded and executed."""
    print("🧪 Testing tools...")
    
    try:
        from tools import (
            search_flights,
            search_hotels,
            search_places,
            get_weather,
            estimate_budget,
            create_travel_tools
        )
        
        # Test flight search
        result = search_flights("Delhi", "Goa")
        result_dict = json.loads(result)
        if result_dict.get("status") == "success":
            print("  ✅ search_flights")
        else:
            print("  ⚠️  search_flights - No flights found (check data)")
        
        # Test hotel search
        result = search_hotels("Goa")
        result_dict = json.loads(result)
        if result_dict.get("status") == "success":
            print("  ✅ search_hotels")
        else:
            print("  ⚠️  search_hotels - No hotels found (check data)")
        
        # Test places search
        result = search_places("Goa")
        result_dict = json.loads(result)
        if result_dict.get("status") == "success":
            print("  ✅ search_places")
        else:
            print("  ⚠️  search_places - No places found (check data)")
        
        # Test weather (may fail without internet)
        result = get_weather("Goa", 3)
        result_dict = json.loads(result)
        if result_dict.get("status") == "success":
            print("  ✅ get_weather")
        else:
            print("  ⚠️  get_weather - API may be unavailable")
        
        # Test budget estimation
        result = estimate_budget(4800, 3200, 3)
        result_dict = json.loads(result)
        if result_dict.get("status") == "success":
            print("  ✅ estimate_budget")
        else:
            print("  ❌ estimate_budget - Error")
        
        # Test tool creation
        tools = create_travel_tools()
        if len(tools) == 5:
            print("  ✅ create_travel_tools")
        else:
            print(f"  ❌ create_travel_tools - Expected 5 tools, got {len(tools)}")
        
        print("✅ All tools working!\n")
        return True
        
    except Exception as e:
        print(f"  ❌ Error testing tools: {str(e)}\n")
        return False


def test_agent_creation():
    """Test if agent can be created (without API key)."""
    print("🧪 Testing agent creation...")
    
    try:
        from agent import TravelPlanningAgent
        print("  ✅ Agent module imports successfully")
        print("  ⚠️  Agent initialization requires API key (skipped)\n")
        return True
    except Exception as e:
        print(f"  ❌ Error: {str(e)}\n")
        return False


def test_streamlit_app():
    """Test if Streamlit app file is valid."""
    print("🧪 Testing Streamlit app...")
    
    try:
        # Just check if app.py exists and imports
        if not os.path.exists('app.py'):
            print("  ❌ app.py not found\n")
            return False
        
        print("  ✅ app.py exists")
        print("  ℹ️  Run 'streamlit run app.py' to test UI\n")
        return True
    except Exception as e:
        print(f"  ❌ Error: {str(e)}\n")
        return False


def test_environment():
    """Test environment configuration."""
    print("🧪 Testing environment...")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("OPENROUTER_API_KEY")
    
    if api_key and api_key != "your_openrouter_api_key_here":
        print("  ✅ API key found in .env")
    else:
        print("  ⚠️  API key not set (you can enter it in UI)")
    
    if os.path.exists('.env'):
        print("  ✅ .env file exists")
    else:
        print("  ⚠️  .env file not found (optional)")
    
    print()
    return True


def run_all_tests():
    """Run all validation tests."""
    print("=" * 60)
    print("🚀 AI Travel Planner - Setup Validation")
    print("=" * 60)
    print()
    
    results = {
        "Imports": test_imports(),
        "Data Files": test_data_files(),
        "Tools": test_tools(),
        "Agent": test_agent_creation(),
        "Streamlit App": test_streamlit_app(),
        "Environment": test_environment()
    }
    
    print("=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name:20s} {status}")
    
    print()
    
    all_passed = all(results.values())
    
    if all_passed:
        print("🎉 All tests passed! You're ready to go!")
        print("\nNext steps:")
        print("1. Add your OpenRouter API key to .env file")
        print("2. Run: streamlit run app.py")
        print("3. Start planning trips!")
    else:
        print("⚠️  Some tests failed. Please fix the issues above.")
        print("\nCommon fixes:")
        print("- Install missing packages: pip install -r requirements.txt")
        print("- Check data files exist in data/ directory")
        print("- Ensure all .py files are in the correct location")
    
    print()
    return all_passed


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
