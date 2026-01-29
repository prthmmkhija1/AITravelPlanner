"""
PDF Generator for AI Travel Planner
Generates professionally formatted PDF itineraries from trip plans.
"""

import os
import re
import tempfile
from datetime import datetime
from typing import Dict, Any, Optional

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    Image
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch


# =============================================================================
# INR FORMATTER (INDIAN COMMAS: 1,00,000)
# =============================================================================

def format_inr(amount) -> str:
    """Format amount with Indian comma style (lakhs/crores)."""
    try:
        amount = int(float(str(amount).replace(',', '').replace('₹', '').replace('INR', '').strip()))
    except Exception:
        return str(amount)

    s = str(amount)
    if len(s) <= 3:
        return s

    last3 = s[-3:]
    rest = s[:-3]

    parts = []
    while len(rest) > 2:
        parts.insert(0, rest[-2:])
        rest = rest[:-2]

    if rest:
        parts.insert(0, rest)

    return ",".join(parts + [last3])


# =============================================================================
# CUSTOM STYLES
# =============================================================================

styles = getSampleStyleSheet()

TITLE = ParagraphStyle(
    "TITLE",
    parent=styles["Title"],
    fontSize=22,
    spaceAfter=20,
    textColor=colors.HexColor('#1a365d'),
    fontName='Helvetica-Bold'
)

SUBTITLE = ParagraphStyle(
    "SUBTITLE",
    parent=styles["Normal"],
    fontSize=12,
    spaceAfter=16,
    textColor=colors.HexColor('#4a5568'),
    alignment=1  # Center
)

SECTION = ParagraphStyle(
    "SECTION",
    parent=styles["Heading2"],
    fontSize=14,
    spaceBefore=20,
    spaceAfter=12,
    textColor=colors.HexColor('#2d3748'),
    fontName='Helvetica-Bold',
    borderPadding=5
)

TEXT = ParagraphStyle(
    "TEXT",
    parent=styles["Normal"],
    fontSize=10,
    leading=14,
    textColor=colors.HexColor('#2d3748')
)

BOLD = ParagraphStyle(
    "BOLD",
    parent=styles["Normal"],
    fontSize=10,
    leading=14,
    spaceAfter=4,
    fontName='Helvetica-Bold',
    textColor=colors.HexColor('#1a365d')
)

SMALL = ParagraphStyle(
    "SMALL",
    parent=styles["Normal"],
    fontSize=8,
    leading=10,
    textColor=colors.HexColor('#718096')
)


# =============================================================================
# HELPER — BOXED TABLE
# =============================================================================

def boxed_table(data, widths, header=False):
    """Create a styled table with borders."""
    table = Table(data, colWidths=widths)
    
    style_commands = [
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor('#edf2f7')),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor('#f7fafc')),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]
    
    if header and len(data) > 0:
        style_commands.append(("BACKGROUND", (0, 0), (-1, 0), colors.HexColor('#4299e1')))
        style_commands.append(("TEXTCOLOR", (0, 0), (-1, 0), colors.white))
    
    table.setStyle(TableStyle(style_commands))
    return table


def highlight_table(data, widths):
    """Create a highlighted summary table."""
    table = Table(data, colWidths=widths)
    table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 2, colors.HexColor('#4299e1')),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor('#ebf8ff')),
        ("LEFTPADDING", (0, 0), (-1, -1), 15),
        ("RIGHTPADDING", (0, 0), (-1, -1), 15),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return table


# =============================================================================
# TEXT PARSER — EXTRACT INFO FROM TRIP PLAN
# =============================================================================

def extract_trip_info(trip_plan: str, user_request: str) -> Dict[str, Any]:
    """
    Parse the AI-generated trip plan text and extract structured information.
    """
    info = {
        "request": user_request,
        "source": "",
        "destination": "",
        "dates": "",
        "travelers": "1",
        "flights": [],
        "hotels": [],
        "weather": [],
        "activities": [],
        "itinerary": [],
        "budget": "",
        "raw_plan": trip_plan
    }
    
    # Extract source and destination from request
    route_patterns = [
        r'from\s+(\w+(?:\s+\w+)?)\s+to\s+(\w+(?:\s+\w+)?)',
        r'(\w+(?:\s+\w+)?)\s+to\s+(\w+(?:\s+\w+)?)',
        r'(\w+)\s*→\s*(\w+)',
        r'(\w+)\s*->\s*(\w+)',
    ]
    
    for pattern in route_patterns:
        match = re.search(pattern, user_request, re.IGNORECASE)
        if match:
            info["source"] = match.group(1).strip().title()
            info["destination"] = match.group(2).strip().title()
            break
    
    # Extract travelers count
    travelers_match = re.search(r'(\d+)\s*(?:travelers?|people|persons?|adults?)', user_request, re.IGNORECASE)
    if travelers_match:
        info["travelers"] = travelers_match.group(1)
    
    # Extract dates
    date_match = re.search(r'(?:on|from|starting|departing)\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?)', user_request, re.IGNORECASE)
    if date_match:
        info["dates"] = date_match.group(1)
    
    # Parse sections from trip plan
    lines = trip_plan.split('\n')
    current_section = ""
    section_content = []
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
            
        line_lower = line_stripped.lower()
        
        # Detect section headers
        if any(keyword in line_lower for keyword in ['flight', '✈️', '🛫', 'airline']):
            if current_section and section_content:
                _process_section(info, current_section, section_content)
            current_section = "flights"
            section_content = [line_stripped]
        elif any(keyword in line_lower for keyword in ['hotel', '🏨', 'accommodation', 'stay']):
            if current_section and section_content:
                _process_section(info, current_section, section_content)
            current_section = "hotels"
            section_content = [line_stripped]
        elif any(keyword in line_lower for keyword in ['weather', '🌤️', '☀️', 'forecast', 'temperature']):
            if current_section and section_content:
                _process_section(info, current_section, section_content)
            current_section = "weather"
            section_content = [line_stripped]
        elif any(keyword in line_lower for keyword in ['activit', '🎯', 'attraction', 'things to do', 'places']):
            if current_section and section_content:
                _process_section(info, current_section, section_content)
            current_section = "activities"
            section_content = [line_stripped]
        elif any(keyword in line_lower for keyword in ['itinerary', 'day 1', 'day-wise', '📅']):
            if current_section and section_content:
                _process_section(info, current_section, section_content)
            current_section = "itinerary"
            section_content = [line_stripped]
        elif any(keyword in line_lower for keyword in ['budget', 'cost', 'price', 'total', '💰', '₹', 'inr']):
            if current_section and section_content:
                _process_section(info, current_section, section_content)
            current_section = "budget"
            section_content = [line_stripped]
        else:
            section_content.append(line_stripped)
    
    # Process last section
    if current_section and section_content:
        _process_section(info, current_section, section_content)
    
    return info


def _process_section(info: Dict, section: str, content: list):
    """Process and store section content."""
    if section == "flights":
        info["flights"] = content
    elif section == "hotels":
        info["hotels"] = content
    elif section == "weather":
        info["weather"] = content
    elif section == "activities":
        info["activities"] = content
    elif section == "itinerary":
        info["itinerary"] = content
    elif section == "budget":
        info["budget"] = '\n'.join(content)


def clean_text(text: str) -> str:
    """Clean text for PDF rendering - remove problematic characters."""
    # Replace emojis with text equivalents for better PDF compatibility
    replacements = {
        '✈️': '[Flight]',
        '🛫': '[Departure]',
        '🛬': '[Arrival]',
        '🏨': '[Hotel]',
        '🌤️': '[Weather]',
        '☀️': '[Sunny]',
        '🌧️': '[Rain]',
        '❄️': '[Cold]',
        '🎯': '[Activity]',
        '📅': '[Calendar]',
        '💰': '[Budget]',
        '⭐': '*',
        '★': '*',
        '✅': '[OK]',
        '❌': '[X]',
        '→': '->',
        '•': '-',
        '🔴': '[LIVE]',
    }
    
    for emoji, replacement in replacements.items():
        text = text.replace(emoji, replacement)
    
    return text


# =============================================================================
# MAIN PDF GENERATOR
# =============================================================================

def generate_trip_pdf(
    trip_plan: str,
    user_request: str,
    output_path: Optional[str] = None
) -> str:
    """
    Generate a PDF document from the trip plan.
    
    Args:
        trip_plan: The AI-generated trip plan text
        user_request: The original user request
        output_path: Optional path for the PDF file
    
    Returns:
        Path to the generated PDF file
    """
    
    if not trip_plan:
        raise ValueError("Trip plan cannot be empty")
    
    # Generate output path if not provided
    if not output_path:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(tempfile.gettempdir(), f"trip_itinerary_{timestamp}.pdf")
    
    # Extract structured info from trip plan
    info = extract_trip_info(trip_plan, user_request)
    
    # Create PDF document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=50,
        bottomMargin=40
    )
    
    story = []
    
    # ==========================================================================
    # HEADER / TITLE
    # ==========================================================================
    
    story.append(Paragraph("✈ AI Travel Planner", TITLE))
    story.append(Paragraph("Your Personalized Trip Itinerary", SUBTITLE))
    story.append(Spacer(1, 10))
    
    # Generation timestamp
    story.append(Paragraph(
        f"Generated on: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
        SMALL
    ))
    story.append(Spacer(1, 20))
    
    # ==========================================================================
    # TRIP OVERVIEW
    # ==========================================================================
    
    story.append(Paragraph("📋 Trip Overview", SECTION))
    
    overview_data = []
    
    if info["source"] and info["destination"]:
        overview_data.append([
            Paragraph(f"<b>Route</b><br/>{info['source']} → {info['destination']}", TEXT),
            Paragraph(f"<b>Travelers</b><br/>{info['travelers']} person(s)", TEXT),
        ])
    
    overview_data.append([
        Paragraph(f"<b>Your Request</b><br/>{clean_text(info['request'])}", TEXT),
        Paragraph(f"<b>Status</b><br/>Plan Generated Successfully", TEXT),
    ])
    
    if overview_data:
        story.append(highlight_table(overview_data, [260, 260]))
    
    story.append(Spacer(1, 15))
    
    # ==========================================================================
    # FLIGHTS SECTION
    # ==========================================================================
    
    if info["flights"]:
        story.append(Paragraph("✈ Flight Details", SECTION))
        
        flight_rows = []
        for flight_line in info["flights"]:
            if flight_line.strip():
                flight_rows.append([
                    Paragraph(clean_text(flight_line), TEXT)
                ])
        
        if flight_rows:
            story.append(boxed_table(flight_rows, [520]))
        story.append(Spacer(1, 10))
    
    # ==========================================================================
    # HOTEL SECTION
    # ==========================================================================
    
    if info["hotels"]:
        story.append(Paragraph("🏨 Accommodation", SECTION))
        
        hotel_rows = []
        for hotel_line in info["hotels"]:
            if hotel_line.strip():
                hotel_rows.append([
                    Paragraph(clean_text(hotel_line), TEXT)
                ])
        
        if hotel_rows:
            story.append(boxed_table(hotel_rows, [520]))
        story.append(Spacer(1, 10))
    
    # ==========================================================================
    # WEATHER SECTION
    # ==========================================================================
    
    if info["weather"]:
        story.append(Paragraph("🌤 Weather Forecast", SECTION))
        
        weather_rows = []
        for weather_line in info["weather"]:
            if weather_line.strip():
                weather_rows.append([
                    Paragraph(clean_text(weather_line), TEXT)
                ])
        
        if weather_rows:
            story.append(boxed_table(weather_rows, [520]))
        story.append(Spacer(1, 10))
    
    # ==========================================================================
    # ACTIVITIES SECTION
    # ==========================================================================
    
    if info["activities"]:
        story.append(Paragraph("🎯 Recommended Activities", SECTION))
        
        activity_rows = []
        for activity_line in info["activities"]:
            if activity_line.strip():
                activity_rows.append([
                    Paragraph(clean_text(activity_line), TEXT)
                ])
        
        if activity_rows:
            story.append(boxed_table(activity_rows, [520]))
        story.append(Spacer(1, 10))
    
    # ==========================================================================
    # ITINERARY SECTION
    # ==========================================================================
    
    if info["itinerary"]:
        story.append(PageBreak())
        story.append(Paragraph("📅 Day-Wise Itinerary", SECTION))
        
        itinerary_rows = []
        for itinerary_line in info["itinerary"]:
            if itinerary_line.strip():
                itinerary_rows.append([
                    Paragraph(clean_text(itinerary_line), TEXT)
                ])
        
        if itinerary_rows:
            story.append(boxed_table(itinerary_rows, [520]))
        story.append(Spacer(1, 10))
    
    # ==========================================================================
    # BUDGET SECTION
    # ==========================================================================
    
    if info["budget"]:
        story.append(Paragraph("💰 Budget Estimate", SECTION))
        
        story.append(highlight_table(
            [[Paragraph(clean_text(info["budget"]), TEXT)]],
            [520]
        ))
        story.append(Spacer(1, 10))
    
    # ==========================================================================
    # FULL TRIP PLAN (FALLBACK)
    # ==========================================================================
    
    # If no sections were extracted, show the raw plan
    if not any([info["flights"], info["hotels"], info["weather"], 
                info["activities"], info["itinerary"], info["budget"]]):
        story.append(Paragraph("📄 Complete Trip Plan", SECTION))
        
        # Split into paragraphs
        paragraphs = trip_plan.split('\n\n')
        for para in paragraphs:
            if para.strip():
                story.append(Paragraph(clean_text(para.strip()), TEXT))
                story.append(Spacer(1, 8))
    
    # ==========================================================================
    # FOOTER
    # ==========================================================================
    
    story.append(Spacer(1, 30))
    story.append(Paragraph("─" * 80, SMALL))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "This itinerary was generated by AI Travel Planner using live data from Amadeus, Hotels.com, and Foursquare APIs. "
        "Prices and availability are subject to change. Please verify all bookings before traveling.",
        SMALL
    ))
    story.append(Spacer(1, 5))
    story.append(Paragraph(
        "Powered by AI Travel Planner | Built with ❤️",
        SMALL
    ))
    
    # ==========================================================================
    # BUILD PDF
    # ==========================================================================
    
    doc.build(story)
    
    return output_path


# =============================================================================
# QUICK TEST
# =============================================================================

if __name__ == "__main__":
    # Test with sample data
    sample_plan = """
    ✈️ FLIGHT DETAILS:
    - IndiGo 6E-2341: Delhi (DEL) → Goa (GOI)
    - Departure: Feb 12, 2026 at 8:30 AM
    - Price: ₹4,500 per person
    
    🏨 HOTEL RECOMMENDATION:
    - Taj Holiday Village Resort & Spa
    - Location: Candolim Beach, Goa
    - Rating: 4.5 stars
    - Price: ₹8,000 per night
    
    🌤️ WEATHER FORECAST:
    - Feb 12: Sunny, 28°C - 32°C
    - Feb 13: Partly Cloudy, 27°C - 31°C
    - Feb 14: Sunny, 29°C - 33°C
    
    📅 DAY-WISE ITINERARY:
    Day 1: Arrive in Goa, check into hotel, beach relaxation
    Day 2: Visit Fort Aguada, Basilica of Bom Jesus
    Day 3: Water sports, departure
    
    💰 BUDGET ESTIMATE:
    - Flights: ₹9,000 (round trip for 1)
    - Hotel: ₹16,000 (2 nights)
    - Food & Activities: ₹5,000
    - Total: ₹30,000
    """
    
    output = generate_trip_pdf(
        sample_plan,
        "Plan a 3-day trip to Goa from Delhi starting Feb 12"
    )
    print(f"PDF generated: {output}")
