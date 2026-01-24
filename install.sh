#!/bin/bash

# AI Travel Planner - Installation Script
# This script will set up the project with all dependencies

echo "🚀 AI Travel Planner - Installation Script"
echo "=========================================="
echo ""

# Check Python version
echo "📋 Checking Python version..."
python_version=$(python --version 2>&1)
echo "Found: $python_version"

if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo ""

# Check pip
echo "📋 Checking pip..."
if ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip first."
    exit 1
fi
echo "✅ pip is available"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it and add your OpenRouter API key."
else
    echo "✅ .env file already exists"
fi

echo ""

# Run validation test
echo "🧪 Running validation tests..."
python test_setup.py

echo ""
echo "=========================================="
echo "✨ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your OpenRouter API key"
echo "   OPENROUTER_API_KEY=your_key_here"
echo ""
echo "2. Run the application:"
echo "   streamlit run app.py"
echo ""
echo "3. Check QUICKSTART.md for usage examples"
echo "=========================================="
