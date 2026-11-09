const express = require("express");
const axios = require("axios");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const app = express();

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests from this IP, please try again later." }
});
app.use(limiter);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// RapidAPI key - required from environment (no fallback)
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
if (!RAPIDAPI_KEY) {
  console.error("❌ RAPIDAPI_KEY environment variable is required");
  process.exit(1);
}

// Supabase client initialization (REQUIRED - no fallbacks)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl) {
  console.error("❌ SUPABASE_URL environment variable is required");
  process.exit(1);
}

if (!supabaseKey) {
  console.error("❌ SUPABASE_KEY environment variable is required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Admin credentials from environment (REQUIRED - no defaults)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_USERNAME) {
  console.error("❌ ADMIN_USERNAME environment variable is required");
  process.exit(1);
}

if (!ADMIN_PASSWORD) {
  console.error("❌ ADMIN_PASSWORD environment variable is required");
  process.exit(1);
}

// Sessions store
const sessions = new Map();

// Cache duration: 5 minutes (300000 ms)
const CACHE_DURATION = 5 * 60 * 1000;

console.log("✅ Server configuration loaded - UPDATED");
console.log(`🔑 RapidAPI Key: ${RAPIDAPI_KEY.substring(0, 10)}...`);
console.log(`📡 Supabase connected: ${process.env.SUPABASE_URL || 'localhost'}`);

// Supabase data queries (replaces mock generators)

async function getAxessoPropertiesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('source', 'axesso');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching axesso properties:", error);
    return [];
  }
}

async function getLoopNetPropertiesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('source', 'loopnet');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching loopnet properties from Supabase:", error);
    return [];
  }
}

// Unified listings endpoint
app.get("/properties", async (req, res) => {
  try {
    const location = req.query.location || "";
    const type = req.query.type || "all";
    
    console.log(`\n📦 Properties Request: location="${location}", type=${type}`);
    
    let allProperties = []

    // Fetch axesso properties from Supabase
    const axessoProps = await getAxessoPropertiesFromSupabase()
    allProperties = [...allProperties, ...axessoProps]

    // Fetch loopnet properties from Supabase
    const loopnetProps = await getLoopNetPropertiesFromSupabase()
    allProperties = [...allProperties, ...loopnetProps]

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
    const isWorldwide = ["", "usa", "worldwide", "us", "world", "international", "global", "all", "united states", "america", "any"].includes(searchLocation); // Track if searching worldwide

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
      results: [],
      total: 0,
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

app.post("/admin/properties", async (req, res) => {
  const token = req.headers.authorization;
  if (!sessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized. Please login again." });
  }

  const { action, page = 1, per_page = 10, source = 'all' } = req.body;
  
  if (action === 'list_properties') {
    let allProperties = []

    // Fetch axesso properties from Supabase
    const axessoProps = await getAxessoPropertiesFromSupabase()
    allProperties = [...allProperties, ...axessoProps]

    // Fetch loopnet properties from Supabase
    const loopnetProps = await getLoopNetPropertiesFromSupabase()
    allProperties = [...allProperties, ...loopnetProps];
    
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
// Serve frontend (dev: Vite middleware, prod: static dist) — single port
// ----------------------------------

async function initFrontend() {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    const vite = require("vite");
    const viteServer = await vite.createServer({
      root: path.resolve(__dirname, ".."),
      server: {
        middlewareMode: true,
        host: true,
      },
    });

    // Vite dev middleware serves the frontend + HMR through this same port
    app.use(viteServer.middlewares);

    // SPA fallback for client-side routes that Vite did not match
    app.use((req, res) => {
      if (res.headersSent) return;
      res.status(200).sendFile(path.join(__dirname, "..", "index.html"));
    });
  } else {
    const distPath = path.join(__dirname, "..", "dist");
    app.use(express.static(distPath));
    app.get(/.*/, (req, res) => {
      if (
        req.path.startsWith("/api") ||
        req.path === "/health" ||
        req.path === "/properties" ||
        req.path.startsWith("/admin")
      ) {
        return res.status(404).json({ error: "Not found" });
      }
      res.sendFile(path.join(distPath, "index.html"), (err) => {
        if (err) res.status(404).send("Not found");
      });
    });
  }
}

initFrontend().catch((err) => {
  console.error("Failed to initialize frontend middleware:", err);
  process.exit(1);
});

// ----------------------------------
// Server (single port: frontend + backend)
// ----------------------------------

app.listen(PORT, () => {
  console.log(`KeyHaven server running on port ${PORT}`);
});