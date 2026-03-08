# KeyHaven Property Listing Platform

A real estate property listing platform aggregating USA and worldwide residential rentals and commercial leases.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Express.js
- **API**: Custom Express backend on port 3001
- **Mock Data**: Axesso (residential) and LoopNet (commercial) simulation

## Environment & Configuration
- **Frontend Port**: 5000
- **Backend Port**: 3001
- **VITE_API_URL**: `http://localhost:3001` (local) or dynamic Replit URL (`*-3001.replit.dev`)
- **Admin Credentials**: username `admin`, password `admin123`
- **Environment File**: `.env` (use `.env.example` as a template)

## Available Properties

### Residential Rentals (7 listings)
**USA:**
- Los Angeles, CA: Luxury Apartment (2BR/$3,200), Modern Family Home (4BR/$4,500)
- New York, NY: Manhattan Loft (2BR/$6,500)
- Miami, FL: Oceanfront Condo (3BR/$5,200)

**Worldwide:**
- London, UK: Elegant Flat (1BR/£2,800)
- Paris, France: Charming Studio (Studio/€2,100)
- Berlin, Germany: Loft Apartment (1BR/€2,400)

### Commercial Leases (5 listings)
**USA:**
- Los Angeles, CA: Downtown Office Space (3,500 sqft/$8,500)
- Chicago, IL: Industrial Warehouse (10,000 sqft/$12,000)

**Worldwide:**
- Dubai, UAE: Sheikh Zayed Road Office (5,000 sqft/$15,000)
- Tokyo, Japan: Shinjuku Retail Outlet (1,200 sqft/$25,000)
- London, UK: Canary Wharf Office (4,000 sqft/£12,000)

## Key Features
- Aggregated USA and worldwide property listings
- Location-aware property search (supports city, state, country, or "worldwide")
- Filtering by property type, listing type, price, beds, baths, and sqft
- Admin dashboard for property management and API refresh
- Comprehensive mock data for both residential and commercial
- Replit-specific dynamic port mapping for cross-origin requests

## Deployment Note
The application uses a proxy for `/api` routes in `vite.config.ts` to handle backend requests. In Replit environments, it automatically detects the hostname and maps port 3001 accordingly. The `allowedHosts: true` configuration allows development in any Replit environment.
