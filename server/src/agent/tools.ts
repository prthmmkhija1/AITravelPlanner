import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

type Flight = {
  flight_id: string;
  airline: string;
  source: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: string; // e.g. "2h 15m"
  price: number;
  class: string;
};

type Hotel = {
  hotel_id: string;
  name: string;
  city: string;
  rating: number;
  price_per_night: number;
  amenities: string[];
  location: string;
};

type Place = {
  place_id: string;
  name: string;
  city: string;
  type: string;
  rating: number;
  description: string;
  average_time: string;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../../data");

const jsonCache = new Map<string, unknown>();

async function loadJsonData<T>(filename: string): Promise<T> {
  if (jsonCache.has(filename)) return jsonCache.get(filename) as T;
  const fullPath = path.join(DATA_DIR, filename);
  const raw = await fs.readFile(fullPath, "utf-8");
  const parsed = JSON.parse(raw) as T;
  jsonCache.set(filename, parsed);
  return parsed;
}

function durationToMinutes(duration: string): number {
  const hMatch = duration.match(/(\d+)\s*h/i);
  const mMatch = duration.match(/(\d+)\s*m/i);
  const hours = hMatch ? Number(hMatch[1]) : 0;
  const minutes = mMatch ? Number(mMatch[1]) : 0;
  return hours * 60 + minutes;
}

const weatherDesc: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  80: "Rain showers",
  95: "Thunderstorm"
};

const cityCoords: Record<string, [number, number]> = {
  goa: [15.2993, 74.124],
  jaipur: [26.9124, 75.7873],
  mumbai: [19.076, 72.8777],
  bangalore: [12.9716, 77.5946],
  kerala: [10.8505, 76.2711],
  delhi: [28.7041, 77.1025]
};

export const searchFlightsTool = tool(
  async ({ source, destination }: { source: string; destination: string }) => {
    const flights = await loadJsonData<Flight[]>("flights.json");
    const matching = flights.filter(
      (f) =>
        f.source.toLowerCase() === source.toLowerCase() &&
        f.destination.toLowerCase() === destination.toLowerCase()
    );

    if (!matching.length) {
      return JSON.stringify(
        {
          status: "error",
          message: `No flights found from ${source} to ${destination}`,
          flights: []
        },
        null,
        2
      );
    }

    const cheapest = matching.reduce((min, f) => (f.price < min.price ? f : min), matching[0]);
    const fastest = matching.reduce(
      (min, f) => (durationToMinutes(f.duration) < durationToMinutes(min.duration) ? f : min),
      matching[0]
    );

    return JSON.stringify(
      {
        status: "success",
        total_flights: matching.length,
        cheapest_flight: cheapest,
        fastest_flight: fastest,
        all_flights: matching.slice(0, 5)
      },
      null,
      2
    );
  },
  {
    name: "search_flights_tool",
    description:
      "Search for flights between cities. Returns cheapest and fastest options with prices and timings.",
    schema: z.object({
      source: z.string().describe("Source city name (e.g., 'Delhi', 'Mumbai')"),
      destination: z.string().describe("Destination city name (e.g., 'Goa', 'Jaipur')")
    })
  }
);

export const searchHotelsTool = tool(
  async ({
    city,
    max_price = 10000,
    min_rating = 3.0
  }: {
    city: string;
    max_price?: number;
    min_rating?: number;
  }) => {
    const hotels = await loadJsonData<Hotel[]>("hotels.json");
    const matching = hotels.filter(
      (h) =>
        h.city.toLowerCase() === city.toLowerCase() &&
        h.price_per_night <= max_price &&
        h.rating >= min_rating
    );

    if (!matching.length) {
      return JSON.stringify(
        {
          status: "error",
          message: `No hotels found in ${city} matching your criteria`,
          hotels: []
        },
        null,
        2
      );
    }

    const bestValue = [...matching].sort(
      (a, b) => (b.rating - a.rating) || (a.price_per_night - b.price_per_night)
    );
    const cheapest = matching.reduce(
      (min, h) => (h.price_per_night < min.price_per_night ? h : min),
      matching[0]
    );
    const highestRated = matching.reduce((max, h) => (h.rating > max.rating ? h : max), matching[0]);

    return JSON.stringify(
      {
        status: "success",
        total_hotels: matching.length,
        recommended_hotel: bestValue[0] ?? null,
        cheapest_hotel: cheapest,
        highest_rated_hotel: highestRated,
        all_options: bestValue.slice(0, 5)
      },
      null,
      2
    );
  },
  {
    name: "search_hotels_tool",
    description:
      "Search for hotels in a city based on budget and rating. Returns recommended hotels with prices, ratings, and amenities.",
    schema: z.object({
      city: z.string().describe("City name (e.g., 'Goa', 'Jaipur')"),
      max_price: z.number().optional().default(10000).describe("Maximum price per night in INR"),
      min_rating: z.number().optional().default(3.0).describe("Minimum hotel rating (1-5)")
    })
  }
);

export const searchPlacesTool = tool(
  async ({
    city,
    place_type = "all",
    min_rating = 4.0
  }: {
    city: string;
    place_type?: string;
    min_rating?: number;
  }) => {
    const places = await loadJsonData<Place[]>("places.json");
    let matching = places.filter(
      (p) => p.city.toLowerCase() === city.toLowerCase() && p.rating >= min_rating
    );

    if (place_type.toLowerCase() !== "all") {
      matching = matching.filter((p) => p.type.toLowerCase() === place_type.toLowerCase());
    }

    if (!matching.length) {
      return JSON.stringify(
        {
          status: "error",
          message: `No places found in ${city} matching your criteria`,
          places: []
        },
        null,
        2
      );
    }

    matching = [...matching].sort((a, b) => b.rating - a.rating);

    const byType: Record<string, Place[]> = {};
    for (const place of matching) {
      const key = place.type;
      if (!byType[key]) byType[key] = [];
      byType[key].push(place);
    }

    const placesByType: Record<string, Place[]> = {};
    for (const [k, v] of Object.entries(byType)) {
      placesByType[k] = v.slice(0, 3);
    }

    return JSON.stringify(
      {
        status: "success",
        total_places: matching.length,
        top_rated_places: matching.slice(0, 10),
        places_by_type: placesByType
      },
      null,
      2
    );
  },
  {
    name: "search_places_tool",
    description:
      "Search for tourist attractions and places to visit in a city. Returns top-rated places with descriptions and visit durations.",
    schema: z.object({
      city: z.string().describe("City name (e.g., 'Goa', 'Jaipur')"),
      place_type: z
        .string()
        .optional()
        .default("all")
        .describe(
          "Type of place: 'Beach', 'Heritage', 'Shopping', 'Nature', 'Religious', 'Scenic', or 'all'"
        ),
      min_rating: z.number().optional().default(4.0).describe("Minimum place rating (1-5)")
    })
  }
);

export const getWeatherTool = tool(
  async ({ city, days = 7 }: { city: string; days?: number }) => {
    const cityKey = city.toLowerCase();
    const coords = cityCoords[cityKey];
    if (!coords) {
      return JSON.stringify(
        { status: "error", message: `Weather data not available for ${city}`, forecast: [] },
        null,
        2
      );
    }

    const [latitude, longitude] = coords;
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", String(Math.min(days, 7)));

    try {
      const resp = await fetch(url.toString(), { method: "GET" });
      if (!resp.ok) throw new Error(`Open-Meteo request failed: ${resp.status}`);
      const data: any = await resp.json();

      const daily = data?.daily ?? {};
      const dates: string[] = daily.time ?? [];
      const maxTemps: number[] = daily.temperature_2m_max ?? [];
      const minTemps: number[] = daily.temperature_2m_min ?? [];
      const precipitation: number[] = daily.precipitation_sum ?? [];
      const weatherCodes: number[] = daily.weathercode ?? [];

      const forecast = dates.map((date, i) => ({
        date,
        max_temp_c: Number.isFinite(maxTemps[i]) ? Math.round(maxTemps[i] * 10) / 10 : null,
        min_temp_c: Number.isFinite(minTemps[i]) ? Math.round(minTemps[i] * 10) / 10 : null,
        precipitation_mm: Number.isFinite(precipitation[i]) ? Math.round(precipitation[i] * 10) / 10 : null,
        condition: weatherDesc[weatherCodes[i]] ?? "Unknown"
      }));

      return JSON.stringify({ status: "success", city, forecast }, null, 2);
    } catch (e: any) {
      return JSON.stringify(
        { status: "error", message: `Failed to fetch weather data: ${String(e?.message ?? e)}`, forecast: [] },
        null,
        2
      );
    }
  },
  {
    name: "get_weather_tool",
    description:
      "Get weather forecast for a city. Returns daily temperature, precipitation, and weather conditions.",
    schema: z.object({
      city: z.string().describe("City name (e.g., 'Goa', 'Jaipur')"),
      days: z.number().optional().default(7).describe("Number of days to forecast (1-7)")
    })
  }
);

export const estimateBudgetTool = tool(
  async ({
    flight_price,
    hotel_price_per_night,
    num_nights,
    daily_expense = 2000
  }: {
    flight_price: number;
    hotel_price_per_night: number;
    num_nights: number;
    daily_expense?: number;
  }) => {
    const hotelTotal = hotel_price_per_night * num_nights;
    const dailyTotal = daily_expense * num_nights;
    const totalCost = flight_price + hotelTotal + dailyTotal;

    return JSON.stringify(
      {
        status: "success",
        breakdown: {
          flight: flight_price,
          hotel: { per_night: hotel_price_per_night, total_nights: num_nights, total: hotelTotal },
          daily_expenses: { per_day: daily_expense, total_days: num_nights, total: dailyTotal }
        },
        total_cost: totalCost,
        currency: "INR"
      },
      null,
      2
    );
  },
  {
    name: "estimate_budget_tool",
    description: "Calculate total trip budget. Returns detailed budget breakdown with total cost.",
    schema: z.object({
      flight_price: z.number().describe("Flight ticket price in INR"),
      hotel_price_per_night: z.number().describe("Hotel price per night in INR"),
      num_nights: z.number().describe("Number of nights staying"),
      daily_expense: z.number().optional().default(2000).describe("Daily local expense in INR")
    })
  }
);

export const travelTools = [
  searchFlightsTool,
  searchHotelsTool,
  searchPlacesTool,
  getWeatherTool,
  estimateBudgetTool
];

