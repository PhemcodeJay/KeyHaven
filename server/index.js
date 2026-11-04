const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

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
    },
    {
      id: "axesso-mock-austin",
      title: "Modern Downtown Condo",
      description: "Sleek condo in downtown Austin with skyline views and rooftop pool.",
      price: 2850,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 850,
      address: "200 Colorado St, Austin, TX 78701",
      city: "Austin",
      state: "TX",
      zip: "78701",
      country: "USA",
      property_type: "condo",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 30.2672,
      longitude: -97.7431,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-seattle",
      title: "Capitol Hill Apartment",
      description: "Bright apartment in vibrant Capitol Hill with easy transit access.",
      price: 2650,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 720,
      address: "1500 Broadway E, Seattle, WA 98102",
      city: "Seattle",
      state: "WA",
      zip: "98102",
      country: "USA",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 47.6174,
      longitude: -122.3197,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-denver",
      title: "Mountain View Loft",
      description: "Loft-style apartment with mountain views and exposed brick walls.",
      price: 2450,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1100,
      address: "1800 Blake St, Denver, CO 80202",
      city: "Denver",
      state: "CO",
      zip: "80202",
      country: "USA",
      property_type: "loft",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 39.7392,
      longitude: -104.9903,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-toronto",
      title: "King West Condo",
      description: "Contemporary condo in Toronto's trendiest neighborhood near restaurants and shops.",
      price: 3200,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 650,
      address: "450 King St W, Toronto, ON M5V 1K4, Canada",
      city: "Toronto",
      state: "ON",
      zip: "M5V 1K4",
      country: "Canada",
      property_type: "condo",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 43.6487,
      longitude: -79.3984,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-sydney",
      title: "Bondi Beach Apartment",
      description: "Oceanfront apartment steps from Bondi Beach with panoramic sea views.",
      price: 4500,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 950,
      address: "1 Campbell Pde, Bondi Beach, NSW 2026, Australia",
      city: "Sydney",
      state: "NSW",
      zip: "2026",
      country: "Australia",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: -33.8908,
      longitude: 151.2770,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-miami-2",
      title: "Brickell Highrise",
      description: "Luxury highrise apartment in Miami's Brickell financial district.",
      price: 4200,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1300,
      address: "1395 Brickell Ave, Miami, FL 33131",
      city: "Miami",
      state: "FL",
      zip: "33131",
      country: "USA",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 25.7617,
      longitude: -80.1918,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-chicago",
      title: "Lakeview Townhouse",
      description: "Charming 3-bedroom townhouse in Chicago's Lakeview neighborhood with private patio.",
      price: 3400,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1600,
      address: "3200 N Sheffield Ave, Chicago, IL 60657",
      city: "Chicago",
      state: "IL",
      zip: "60657",
      country: "USA",
      property_type: "townhouse",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 41.9427,
      longitude: -87.6560,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-boston",
      title: "Back Bay Brownstone",
      description: "Historic brownstone apartment in Boston's Back Bay with hardwood floors and high ceilings.",
      price: 4800,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1400,
      address: "150 Marlborough St, Boston, MA 02116",
      city: "Boston",
      state: "MA",
      zip: "02116",
      country: "USA",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 42.3492,
      longitude: -71.0817,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-las-vegas",
      title: "Strip View Condo",
      description: "Luxury condo with Strip views, resort-style pool, and 24-hour concierge.",
      price: 3100,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1150,
      address: "3700 S Las Vegas Blvd, Las Vegas, NV 89109",
      city: "Las Vegas",
      state: "NV",
      zip: "89109",
      country: "USA",
      property_type: "condo",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 36.1147,
      longitude: -115.1728,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-nashville",
      title: "Gulch Modern Loft",
      description: "Contemporary loft in Nashville's trendy Gulch district with exposed brick and skyline views.",
      price: 2900,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 850,
      address: "1100 Division St, Nashville, TN 37203",
      city: "Nashville",
      state: "TN",
      zip: "37203",
      country: "USA",
      property_type: "loft",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 36.1515,
      longitude: -86.7842,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-portland",
      title: "Pearl District Cottage",
      description: "Cozy cottage in Portland's Pearl District with garden access and bike storage.",
      price: 2300,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 700,
      address: "2300 NW 11th Ave, Portland, OR 97209",
      city: "Portland",
      state: "OR",
      zip: "97209",
      country: "USA",
      property_type: "house",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 45.5234,
      longitude: -122.6810,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-san-diego",
      title: "La Jolla Beach House",
      description: "Stunning beach house in La Jolla with ocean views and private deck.",
      price: 6800,
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2800,
      address: "1150 Coast Blvd, La Jolla, CA 92037",
      city: "San Diego",
      state: "CA",
      zip: "92037",
      country: "USA",
      property_type: "house",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 32.85,
      longitude: -117.2706,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-barcelona",
      title: "Gothic Quarter Apartment",
      description: "Renovated apartment in Barcelona's historic Gothic Quarter with balcony.",
      price: 2100,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 800,
      address: "Carrer del Bisbe, 08002 Barcelona, Spain",
      city: "Barcelona",
      state: "Catalonia",
      zip: "08002",
      country: "Spain",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 41.3829,
      longitude: 2.1774,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-rome",
      title: "Trastevere Flat",
      description: "Charming flat in Rome's Trastevere neighborhood with cobblestone streets and trattorias.",
      price: 1900,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 600,
      address: "Piazza di Santa Maria in Trastevere, Rome, Italy",
      city: "Rome",
      state: "Lazio",
      zip: "00153",
      country: "Italy",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 41.8902,
      longitude: 12.4706,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-zurich",
      title: "Zürich Altstadt Apartment",
      description: "Modern apartment in Zürich's Old Town with lake views and premium finishes.",
      price: 3800,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 950,
      address: "Rennweg, 8001 Zürich, Switzerland",
      city: "Zurich",
      state: "Zurich",
      zip: "8001",
      country: "Switzerland",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 47.3769,
      longitude: 8.5417,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-dublin",
      title: "Dublin 2 Apartment",
      description: "Bright apartment in Dublin's city center near Grafton Street and Trinity College.",
      price: 2600,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 820,
      address: "Dawson St, Dublin 2, Ireland",
      city: "Dublin",
      state: "County Dublin",
      zip: "D02",
      country: "Ireland",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      price_period: "monthly"
    },
    {
      id: "axesso-mock-munich",
      title: "Altstadt Apartment",
      description: "Charming apartment in Munich's Old Town near Marienplatz and Hofbräuhaus.",
      price: 2800,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 900,
      address: "Marienplatz 4, Munich, Germany",
      city: "Munich",
      state: "Bavaria",
      zip: "80331",
      country: "Germany",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 48.1351,
      longitude: 11.5820,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-amsterdam",
      title: "Canalside Apartment",
      description: "Beautiful apartment with canal views in Amsterdam's Jordaan neighborhood.",
      price: 3200,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1100,
      address: "Prinsengracht 169, Amsterdam, Netherlands",
      city: "Amsterdam",
      state: "North Holland",
      zip: "1015",
      country: "Netherlands",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1563922618905-160dd98918b5?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 52.3676,
      longitude: 4.9041,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-vienna",
      title: "Innere Stadt Apartment",
      description: "Elegant apartment in Vienna's historic center near St. Stephen's Cathedral.",
      price: 2500,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 850,
      address: "Schubertring 4, Vienna, Austria",
      city: "Vienna",
      state: "Vienna",
      zip: "1010",
      country: "Austria",
      property_type: "apartment",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 48.2082,
      longitude: 16.3738,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "axesso-mock-singapore",
      title: "Orchard Road Apartment",
      description: "Modern luxury apartment along Orchard Road shopping district.",
      price: 3500,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      address: "30 Orchard Road, Singapore 238859",
      city: "Singapore",
      state: "",
      zip: "238859",
      country: "Singapore",
      property_type: "condo",
      listing_type: "rent",
      images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 1.3521,
      longitude: 103.8198,
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
    },
    {
      id: "loopnet-mock-houston",
      title: "Energy Corridor Office Tower",
      description: "Modern office tower in Houston's Energy Corridor with ample parking.",
      price: 14000,
      bedrooms: 0,
      bathrooms: 3,
      sqft: 6500,
      address: "1300 Enclave Pkwy, Houston, TX 77077",
      city: "Houston",
      state: "TX",
      zip: "77077",
      country: "USA",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 29.7604,
      longitude: -95.3698,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-atlanta",
      title: "Midtown Atlanta Retail Space",
      description: "Prime retail space on Peachtree Street with high foot traffic.",
      price: 7500,
      bedrooms: 0,
      bathrooms: 2,
      sqft: 2200,
      address: "1234 Peachtree St NE, Atlanta, GA 30309",
      city: "Atlanta",
      state: "GA",
      zip: "30309",
      country: "USA",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 33.7933,
      longitude: -84.3900,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-singapore",
      title: "Marina Bay Office Suite",
      description: "Premium office suite with Marina Bay views in Singapore's financial heart.",
      price: 18000,
      bedrooms: 0,
      bathrooms: 2,
      sqft: 4000,
      address: "12 Marina View, Singapore 018981",
      city: "Singapore",
      state: "",
      zip: "018981",
      country: "Singapore",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 1.2839,
      longitude: 103.8596,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-madrid",
      title: "Salamanca District Retail",
      description: "Elegant retail space in Madrid's upscale Salamanca shopping district.",
      price: 9500,
      bedrooms: 0,
      bathrooms: 1,
      sqft: 1800,
      address: "Calle de Serrano, 28006 Madrid, Spain",
      city: "Madrid",
      state: "Community of Madrid",
      zip: "28006",
      country: "Spain",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 40.4294,
      longitude: -3.6721,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-amsterdam",
      title: "Jordaan Canal Office",
      description: "Charming canal-side office in Amsterdam's historic Jordaan neighborhood.",
      price: 11000,
      bedrooms: 0,
      bathrooms: 2,
      sqft: 3200,
      address: "Prinsengracht, 1015 Amsterdam, Netherlands",
      city: "Amsterdam",
      state: "North Holland",
      zip: "1015",
      country: "Netherlands",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 52.3667,
      longitude: 4.8945,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-san-francisco",
      title: "SoMa Office Space",
      description: "Modern office space in San Francisco's SoMa district near tech companies.",
      price: 18000,
      bedrooms: 0,
      bathrooms: 3,
      sqft: 4500,
      address: "555 Howard St, San Francisco, CA 94105",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "USA",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 37.7749,
      longitude: -122.4194,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-boston",
      title: "Seaport Lab Space",
      description: "State-of-the-art lab/office space in Boston's Innovation District.",
      price: 22000,
      bedrooms: 0,
      bathrooms: 4,
      sqft: 5500,
      address: "101 Seaport Blvd, Boston, MA 02210",
      city: "Boston",
      state: "MA",
      zip: "02210",
      country: "USA",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 42.3467,
      longitude: -71.0514,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-berlin",
      title: "Mitte Office Suite",
      description: "Renovated office suite in Berlin's Mitte district near Alexanderplatz.",
      price: 9000,
      bedrooms: 0,
      bathrooms: 2,
      sqft: 2800,
      address: "Friedrichstraße, 10117 Berlin, Germany",
      city: "Berlin",
      state: "Berlin",
      zip: "10117",
      country: "Germany",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 52.5200,
      longitude: 13.4050,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-rome",
      title: "Historic Center Retail",
      description: "Prime retail space near Piazza Navona in Rome's historic center.",
      price: 11000,
      bedrooms: 0,
      bathrooms: 1,
      sqft: 2000,
      address: "Piazza Navona, 00186 Rome, Italy",
      city: "Rome",
      state: "Lazio",
      zip: "00186",
      country: "Italy",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 41.8986,
      longitude: 12.4769,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-barcelona",
      title: "Eixample Retail Space",
      description: "Corner retail space on Passeig de Gràcia in Barcelona's Eixample district.",
      price: 13000,
      bedrooms: 0,
      bathrooms: 2,
      sqft: 3000,
      address: "Passeig de Gràcia, 08007 Barcelona, Spain",
      city: "Barcelona",
      state: "Catalonia",
      zip: "08007",
      country: "Spain",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 41.3902,
      longitude: 2.1650,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-sydney",
      title: "Surry Hills Warehouse",
      description: "Converted warehouse loft space in Sydney's creative Surry Hills district.",
      price: 8500,
      bedrooms: 0,
      bathrooms: 2,
      sqft: 3800,
      address: "Crown St, Surry Hills, NSW 2010, Australia",
      city: "Sydney",
      state: "NSW",
      zip: "2010",
      country: "Australia",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: -33.8822,
      longitude: 151.2154,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-montreal",
      title: "Old Montreal Office",
      description: "Historic office building in Old Montreal with cobblestone streets and charm.",
      price: 7500,
      bedrooms: 0,
      bathrooms: 2,
      sqft: 2600,
      address: "Rue Saint-Paul, Montreal, QC H2Y 1Z5, Canada",
      city: "Montreal",
      state: "Quebec",
      zip: "H2Y 1Z5",
      country: "Canada",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 45.5017,
      longitude: -73.5673,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-stockholm",
      title: "Södermalm Office",
      description: "Bright office space in Stockholm's trendy Södermalm neighborhood.",
      price: 9500,
      bedrooms: 0,
      bathrooms: 2,
      sqft: 2900,
      address: "Folkungagatan, 118 76 Stockholm, Sweden",
      city: "Stockholm",
      state: "Stockholm County",
      zip: "118 76",
      country: "Sweden",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 59.3251,
      longitude: 18.0711,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-milan",
      title: "Galleria Office Space",
      description: "Premium office space in Milan's fashion district near the Galleria Vittorio Emanuele II.",
      price: 11000,
      bedrooms: 0,
      bathrooms: 2,
      sqft: 3500,
      address: "Via della Scala, Milan, Italy",
      city: "Milan",
      state: "Lombardy",
      zip: "20121",
      country: "Italy",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 45.4642,
      longitude: 9.1900,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-paris",
      title: "Le Marais Office",
      description: "Charming office space in Le Marais district with historic architecture.",
      price: 9500,
      bedrooms: 0,
      bathrooms: 1,
      sqft: 2500,
      address: "Rue des Francs-Bourgeois, Paris, France",
      city: "Paris",
      state: "Île-de-France",
      zip: "75004",
      country: "France",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 48.8566,
      longitude: 2.3522,
      source: "mock",
      price_period: "monthly"
    },
    {
      id: "loopnet-mock-berlin",
      title: "Mitte Creative Space",
      description: "Innovative creative space in Berlin's Mitte district with industrial charm.",
      price: 8500,
      bedrooms: 0,
      bathrooms: 1,
      sqft: 2800,
      address: "Mitte, Berlin, Germany",
      city: "Berlin",
      state: "Berlin",
      zip: "10115",
      country: "Germany",
      property_type: "commercial",
      listing_type: "lease",
      images: ["https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400"],
      status: "active",
      date_listed: new Date().toISOString(),
      latitude: 52.5200,
      longitude: 13.4050,
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