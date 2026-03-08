import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Mock data for fallback
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
    title: "Downtown Office Space",
    city: "Los Angeles",
    price: 8500,
    beds: 0,
    baths: 2,
    image: "https://via.placeholder.com/400",
    source: "mock-loopnet"
  },
  {
    id: 2,
    title: "Shinjuku Retail Outlet",
    city: "Tokyo",
    price: 25000,
    beds: 0,
    baths: 1,
    image: "https://via.placeholder.com/400",
    source: "mock-loopnet"
  }
];

// Fetch properties (rentals + commercial)
const fetchListings = async () => {
  const savedLocation = localStorage.getItem("selectedLocation") || "New York";

  let apiUrl = "http://localhost:3001"; // default local API

  if (import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }

  console.log("Using API URL:", apiUrl);

  try {
    const res = await fetch(`${apiUrl}/properties?location=${encodeURIComponent(savedLocation)}`);
    if (!res.ok) throw new Error("Backend unreachable");
    const data = await res.json();
    if (!data?.results) throw new Error("No data returned");
    return data.results;
  } catch (e) {
    console.error("Fetch failed, using mock data:", e);
    // Combine mock rentals + commercial as fallback
    return [...mockRentals, ...mockCommercial];
  }
};

// Listings provider using React Query
const ListingsProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ["listings"],
    queryFn: fetchListings,
    retry: 2,
    staleTime: 5 * 60 * 1000 // 5 min
  });

  if (error) console.error("Error fetching listings:", error);

  return children
    ? React.cloneElement(children as React.ReactElement, {
        listings,
        isLoading,
        error: error?.message || null
      })
    : null;
};

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ListingsProvider>
                  <Index />
                </ListingsProvider>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;