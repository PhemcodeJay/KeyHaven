const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ⚠️ move this to .env in production
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "YOUR_RAPIDAPI_KEY";

// Simple in-memory cache
const cache = {
  axesso: new Map(),
  loopnet: new Map()
};

// Admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const sessions = new Map();

// Cache duration: 5 minutes (300000 ms)
const CACHE_DURATION = 5 * 60 * 1000;

console.log("✅ Server configuration loaded");
console.log(`🔑 RapidAPI Key: ${RAPIDAPI_KEY ? RAPIDAPI_KEY.substring(0, 10) + '...' : 'NOT SET'}`);

// === Mock Data Generators ===

function getMockAxessoData() {
  return [
    {
      id: "axesso-mock-1",
      title: "Luxury Apartment with City Views",
      description: "Beautiful apartment with modern amenities, pool, and gym access. Close to shopping and dining.",
      price: 3200,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      address: "123 Main St, Los Angeles, CA 90210",
      city: "Los Angeles",
      state: "CA",
      zip: "90210",
      country: "USA",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 34.0522,
      longitude: -118.2437,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-2",
      title: "Modern Family Home",
      description: "Spacious 4-bedroom house with large yard, 2-car garage, and updated kitchen. Great for families.",
      price: 4500,
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2200,
      address: "456 Oak Ave, Los Angeles, CA 90211",
      city: "Los Angeles",
      state: "CA",
      zip: "90211",
      country: "USA",
      property_type: "house",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 34.0523,
      longitude: -118.2438,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-ny",
      title: "Manhattan Loft",
      description: "Industrial chic loft with floor-to-ceiling windows and exposed brick.",
      price: 6500,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1800,
      address: "500 Broadway, New York, NY 10012",
      city: "New York",
      state: "NY",
      zip: "10012",
      country: "USA",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 40.7128,
      longitude: -74.0060,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-miami",
      title: "Oceanfront Condo",
      description: "Luxurious condo with direct beach access and stunning Atlantic views.",
      price: 5200,
      bedrooms: 3,
      bathrooms: 3,
      sqft: 2100,
      address: "1201 Ocean Dr, Miami Beach, FL 33139",
      city: "Miami",
      state: "FL",
      zip: "33139",
      country: "USA",
      property_type: "condo",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 25.7907,
      longitude: -80.1300,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-london",
      title: "Elegant Flat in London",
      description: "Stunning period flat with high ceilings and modern finishes in the heart of London.",
      price: 2800,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 750,
      address: "10 Downing St, London, UK",
      city: "London",
      state: "Greater London",
      zip: "SW1A 2AA",
      country: "UK",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 51.5033,
      longitude: -0.1276,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-paris",
      title: "Charming Paris Studio",
      description: "Classic Parisian studio in the Marais district, steps away from cafes.",
      price: 2100,
      bedrooms: 0,
      bathrooms: 1,
      sqft: 450,
      address: "15 Rue des Francs Bourgeois, Paris, France",
      city: "Paris",
      state: "Île-de-France",
      zip: "75004",
      country: "France",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 48.8566,
      longitude: 2.3522,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-berlin",
      title: "Berlin Loft Apartment",
      description: "Spacious loft in the trendy Mitte district.",
      price: 2400,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 900,
      address: "Mitte, Berlin, Germany",
      city: "Berlin",
      state: "Berlin",
      zip: "10115",
      country: "Germany",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 52.5200,
      longitude: 13.4050,
      source: "mock",
      price_period: "monthly"
    }
  ];
}

function getMockLoopNetData() {
  return [
    {
      id: "loopnet-mock-1",
      title: "Downtown Office Space",
      description: "Prime office location in business district with modern amenities and parking.",
      price: 8500,
      bedrooms: 0,
      bathrooms: 2,
      sqft: 3500,
      address: "100 Business Center Dr, Los Angeles, CA 90001",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
      country: "USA",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 34.0522,
      longitude: -118.2437,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-dubai",
      title: "Sheikh Zayed Road Office",
      description: "Premium office suite in a landmark skyscraper with breathtaking views.",
      price: 15000,
      bedrooms: 0,
      bathrooms: 4,
      sqft: 5000,
      address: "Sheikh Zayed Rd, Dubai, UAE",
      city: "Dubai",
      state: "Dubai",
      zip: "00000",
      country: "UAE",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 25.2048,
      longitude: 55.2708,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-chicago",
      title: "Industrial Warehouse Space",
      description: "Large industrial warehouse with loading docks and high ceilings.",
      price: 12000,
      bedrooms: 0,
      bathrooms: 2,
      sqft: 10000,
      address: "2100 N Elston Ave, Chicago, IL 60614",
      city: "Chicago",
      state: "IL",
      zip: "60614",
      country: "USA",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 41.8781,
      longitude: -87.6298,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-tokyo",
      title: "Shinjuku Retail Outlet",
      description: "Prime retail space in the world's busiest district.",
      price: 25000,
      bedrooms: 0,
      bathrooms: 1,
      sqft: 1200,
      address: "1-1-3 Shinjuku, Tokyo, Japan",
      city: "Tokyo",
      state: "Tokyo",
      zip: "160-0022",
      country: "Japan",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 35.6895,
      longitude: 139.6917,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-london-comm",
      title: "Canary Wharf Office",
      description: "Premium office space in London's financial district.",
      price: 12000,
      bedrooms: 0,
      bathrooms: 2,
      sqft: 4000,
      address: "Canary Wharf, London, UK",
      city: "London",
      state: "London",
      zip: "E14",
      country: "UK",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 51.5054,
      longitude: -0.0235,
      source: "mock",
      price_period: "monthly"
    }
  ];
}

// Unified listings endpoint
app.get("/properties", async (req, res) => {
  try {
    const location = req.query.location || "";
    const type = req.query.type || "all";
    
    console.log(`\n📦 Properties Request: location="${location}", type=${type}`);
    
    let allProperties = [...getMockAxessoData(), ...getMockLoopNetData()];

    // Filter by type if specified
    if (type !== 'all') {
      if (type === 'rent') {
        allProperties = allProperties.filter(p => p.listing_type === 'rent');
      } else if (type === 'lease') {
        allProperties = allProperties.filter(p => p.listing_type === 'lease');
      }
    }

    // Filter by location
    const searchLocation = location.toLowerCase().trim();
    const isWorldwide = ["", "usa", "worldwide", "us", "world", "international", "global", "all", "united states", "america", "any"].includes(searchLocation);

    if (!isWorldwide && searchLocation !== "") {
      const filtered = allProperties.filter(p => 
        p.city.toLowerCase().includes(searchLocation) || 
        p.address.toLowerCase().includes(searchLocation) ||
        p.state.toLowerCase().includes(searchLocation) ||
        p.country?.toLowerCase().includes(searchLocation)
      );
      // If we found specific matches, use them.
      // If no matches found, we return the whole list as "global" results to avoid "no properties found"
      if (filtered.length > 0) {
        allProperties = filtered;
      }
    }
    
    res.json({ 
      results: allProperties, 
      total: allProperties.length,
      source: "mock data (broad results enabled)"
    });
    
  } catch (error) {
    console.error("Properties API Error:", error);
    res.json({ 
      results: getMockAxessoData(),
      total: 6,
      source: "error fallback"
    });
  }
});

// Admin endpoints
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessions.set(token, { username, createdAt: Date.now() });
    res.json({ success: true, session_token: token });
  } else {
    res.status(401).json({ success: false, error: "Invalid credentials" });
  }
});

app.post("/admin/properties", (req, res) => {
  const token = req.headers.authorization;
  if (!sessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized. Please login again." });
  }

  const { action, page = 1, per_page = 10, source = 'all' } = req.body;
  
  if (action === 'list_properties') {
    let allProperties = [...getMockAxessoData(), ...getMockLoopNetData()];
    
    if (source !== 'all') {
      allProperties = allProperties.filter(p => {
        if (source === 'zillow') return p.listing_type === 'rent';
        if (source === 'loopnet') return p.listing_type === 'lease';
        if (source === 'manual') return p.source === 'manual';
        return true;
      });
    }
    
    const total = allProperties.length;
    const start = (page - 1) * per_page;
    const properties = allProperties.slice(start, start + per_page);
    
    return res.json({ 
      success: true, 
      properties, 
      total,
      page,
      per_page
    });
  }
  
  if (action === 'stats') {
    const allProperties = [...getMockAxessoData(), ...getMockLoopNetData()];
    const rentals = allProperties.filter(p => p.listing_type === 'rent');
    const leases = allProperties.filter(p => p.listing_type === 'lease');
    
    return res.json({ 
      success: true, 
      properties: {
        total: allProperties.length,
        zillow: rentals.length,
        loopnet: leases.length,
        manual: 0,
        rentals: rentals.length,
        leases: leases.length
      },
      api_usage: {
        last_24h: {
          zillow_calls: 45,
          loopnet_calls: 32,
          total: 77,
          errors: 0
        }
      }
    });
  }
  
  res.json({ success: true, message: "Action processed (Mock)" });
});

// ----------------------------------
// Mock Data (fallback)
// ----------------------------------

const mockRentals = [
  {
    id: 1,
    title: "Modern Apartment",
    city: "Los Angeles",
    price: 2400,
    beds: 2,
    baths: 2,
    image: "https://via.placeholder.com/400",
    source: "mock-zillow"
  },
  {
    id: 2,
    title: "Downtown Studio",
    city: "New York",
    price: 1800,
    beds: 1,
    baths: 1,
    image: "https://via.placeholder.com/400",
    source: "mock-zillow"
  }
];

const mockCommercial = [
  {
    id: 1,
    title: "Retail Space",
    city: "Chicago",
    price: 5500,
    sqft: 2400,
    type: "Retail",
    image: "https://via.placeholder.com/400",
    source: "mock-loopnet"
  },
  {
    id: 2,
    title: "Office Building",
    city: "San Francisco",
    price: 12000,
    sqft: 5400,
    type: "Office",
    image: "https://via.placeholder.com/400",
    source: "mock-loopnet"
  }
];

// ----------------------------------
// Zillow Rentals (Axesso)
// ----------------------------------

app.get("/api/rentals", async (req, res) => {
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === "YOUR_RAPIDAPI_KEY") {
    return res.json({
      source: "mock",
      data: mockRentals
    });
  }

  try {
    const response = await axios.get(
      "https://zillow-real-estate-api.p.rapidapi.com/v1/agents/{screen_name}/listings",
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": "zillow-real-estate-api.p.rapidapi.com"
        },
        params: {
          include_team: true,
          type: "sale",
          page: 1
        }
      }
    );

    res.json({
      source: "rapidapi-zillow",
      data: response.data
    });
  } catch (error) {
    console.error("Zillow API error:", error.message);
    res.json({
      source: "mock-fallback",
      data: mockRentals
    });
  }
});

// ----------------------------------
// LoopNet Commercial Listings
// ----------------------------------

app.get("/api/commercial", async (req, res) => {
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === "YOUR_RAPIDAPI_KEY") {
    return res.json({
      source: "mock",
      data: mockCommercial
    });
  }

  try {
    const response = await axios.post(
      "https://loopnet-api.p.rapidapi.com/loopnet/lease/searchByCoordination",
      {
        coordination: [-118.22553, 33.983027],
        radius: 5,
        page: 1
      },
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": "loopnet-api.p.rapidapi.com",
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      source: "rapidapi-loopnet",
      data: response.data
    });
  } catch (error) {
    console.error("LoopNet API error:", error.message);
    res.json({
      source: "mock-fallback",
      data: mockCommercial
    });
  }
});

// ----------------------------------
// Mock Endpoints (for frontend dev)
// ----------------------------------

app.get("/api/mock/rentals", (req, res) => {
  res.json(mockRentals);
});

app.get("/api/mock/commercial", (req, res) => {
  res.json(mockCommercial);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ----------------------------------
// Server
// ----------------------------------

app.listen(PORT, () => {
  console.log(`KeyHaven API running on port ${PORT}`);
});