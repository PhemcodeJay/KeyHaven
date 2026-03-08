import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Property, PropertyFilters } from '@/types/property';
import Header from './Header';
import HeroSection from './HeroSection';
import PropertyGrid from './PropertyGrid';
import FilterSidebar from './FilterSidebar';
import PropertyDetailModal from './PropertyDetailModal';
import FeaturedCities from './FeaturedCities';
import HowItWorks from './HowItWorks';
import CTASection from './CTASection';
import LoginModal from './LoginModal';
import AdminDashboard from './AdminDashboard';
import Footer from './Footer';
import { SlidersHorizontal, ArrowUp } from 'lucide-react';

const defaultFilters: PropertyFilters = {
  search: '',
  city: '',
  state: '',
  property_type: 'all',
  listing_type: 'all',
  min_price: 0,
  max_price: 0,
  bedrooms: 0,
  bathrooms: 0,
  min_sqft: 0,
  sort_by: 'date_listed',
  sort_order: 'desc',
};

// Helper functions for data transformation - defined outside component to avoid initialization issues
const determinePropertyType = (data: any): string => {
  if (data.propertyType?.toLowerCase().includes('commercial') || 
      data.propertyType?.toLowerCase().includes('office') ||
      data.propertyType?.toLowerCase().includes('retail')) {
    return 'commercial';
  }
  if (data.propertyType?.toLowerCase().includes('apartment')) {
    return 'apartment';
  }
  if (data.propertyType?.toLowerCase().includes('condo')) {
    return 'condo';
  }
  if (data.propertyType?.toLowerCase().includes('townhouse')) {
    return 'townhouse';
  }
  return 'house';
};

const determineListingType = (data: any, propertyType: string): string => {
  // If it's commercial property, it's likely a lease
  if (propertyType === 'commercial' || 
      data.listingType?.toLowerCase().includes('lease') ||
      data.listingType?.toLowerCase().includes('commercial')) {
    return 'lease';
  }
  // Default to rent
  return 'rent';
};

const extractPrice = (data: any): number => {
  return data.price || 
         data.listPrice || 
         data.amount || 
         data.leaseRate || 
         data.monthlyRent || 
         0;
};

const extractCity = (addressParts: string[], data: any): string => {
  if (data.city) return data.city;
  if (addressParts.length > 1) return addressParts[1];
  return 'Unknown';
};

const extractState = (addressParts: string[], data: any): string => {
  if (data.state) return data.state;
  if (addressParts.length > 2) {
    const stateZip = addressParts[2].trim().split(' ');
    return stateZip[0] || 'Unknown';
  }
  return 'Unknown';
};

const extractZip = (addressParts: string[], data: any): string => {
  if (data.zipCode || data.zip) return data.zipCode || data.zip;
  if (addressParts.length > 2) {
    const stateZip = addressParts[2].trim().split(' ');
    return stateZip[1] || '';
  }
  return '';
};

const extractImages = (data: any): string[] => {
  if (data.images && Array.isArray(data.images)) {
    return data.images.map((img: any) => img.url || img);
  }
  if (data.imageUrl) return [data.imageUrl];
  if (data.photo) return [data.photo];
  if (data.photos && Array.isArray(data.photos)) {
    return data.photos.map((p: any) => p.url || p);
  }
  // Fallback image
  return ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'];
};

interface AppLayoutProps {
  listings?: any[];
  isLoading?: boolean;
  error?: string | null;
}

const AppLayout: React.FC<AppLayoutProps> = ({ listings = [], isLoading = false, error = null }) => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('keyhaven_favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('keyhaven_admin_token'));
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('keyhaven_admin_token'));
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Transform API data to Property type
  const transformedProperties = useMemo(() => {
    if (!listings || listings.length === 0) return [];

    return listings.map((item: any, index: number) => {
      const propertyData = item.result || item;
      const addressStr = propertyData.address || propertyData.addressLine1 || 'Unknown';
      const addressParts = addressStr.split(',').map((s: string) => s.trim());
      const propertyType = determinePropertyType(propertyData);
      const listingType = determineListingType(propertyData, propertyType);
      const price = extractPrice(propertyData);
      
      return {
        id: propertyData.propertyId || propertyData.id || `api-${index}`,
        title: propertyData.address || propertyData.title || 'Property',
        description: propertyData.description || propertyData.text || 'No description available',
        price: price,
        bedrooms: propertyData.bedrooms || propertyData.beds || 0,
        bathrooms: propertyData.bathrooms || propertyData.baths || 0,
        sqft: propertyData.sqft || propertyData.squareFeet || propertyData.livingArea || 0,
        address: addressStr,
        city: extractCity(addressParts, propertyData),
        state: extractState(addressParts, propertyData),
        zip: extractZip(addressParts, propertyData),
        country: propertyData.country || 'USA',
        property_type: propertyType,
        listing_type: listingType,
        images: extractImages(propertyData),
        status: 'active',
        date_listed: propertyData.datePosted || propertyData.listDate || new Date().toISOString(),
        latitude: propertyData.latitude || propertyData.lat || 0,
        longitude: propertyData.longitude || propertyData.lng || 0,
        source: 'manual' as const,
        price_period: 'monthly'
      } as Property;
    });
  }, [listings]);

  // Sync state with memoized properties
  useEffect(() => {
    if (listings && listings.length > 0) {
      setAllProperties(prev => {
        if (prev.length === transformedProperties.length && 
            prev.length > 0 && 
            prev[0].id === transformedProperties[0].id) {
          return prev;
        }
        return transformedProperties;
      });
      setLoading(false);
    } else if (!isLoading) {
      setLoading(false);
    }
  }, [transformedProperties, isLoading, listings]);

  // Load favorites from localStorage
  useEffect(() => {
    localStorage.setItem('keyhaven_favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter properties based on current filters and view
  const filteredProperties = useMemo(() => {
    let result = [...allProperties];
    
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) || 
        p.city?.toLowerCase().includes(q) ||
        p.state?.toLowerCase().includes(q) || 
        p.address?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    
    if (filters.city) {
      result = result.filter(p => 
        p.city?.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    
    if (filters.state) {
      result = result.filter(p => 
        p.state?.toLowerCase().includes(filters.state!.toLowerCase())
      );
    }
    
    if (filters.property_type !== 'all') {
      result = result.filter(p => p.property_type === filters.property_type);
    }
    
    if (filters.listing_type !== 'all') {
      result = result.filter(p => p.listing_type === filters.listing_type);
    }
    
    if (filters.min_price) {
      result = result.filter(p => p.price >= filters.min_price!);
    }
    if (filters.max_price) {
      result = result.filter(p => p.price <= filters.max_price!);
    }
    
    if (filters.bedrooms) {
      result = result.filter(p => p.bedrooms >= filters.bedrooms!);
    }
    
    if (filters.bathrooms) {
      result = result.filter(p => p.bathrooms >= filters.bathrooms!);
    }
    
    if (filters.min_sqft) {
      result = result.filter(p => p.sqft >= filters.min_sqft!);
    }

    if (currentView === 'rentals') {
      result = result.filter(p => p.listing_type === 'rent');
    } else if (currentView === 'commercial') {
      result = result.filter(p => p.listing_type === 'lease' || p.property_type === 'commercial');
    } else if (currentView === 'favorites') {
      result = result.filter(p => favorites.has(p.id));
    }
    
    return result;
  }, [allProperties, filters, currentView, favorites]);

  const handleSearch = (query: string, type: string) => {
    const parts = query.split(',').map(s => s.trim());
    setFilters(prev => ({ 
      ...prev, 
      city: parts[0] || '', 
      state: parts[1] || '', 
      listing_type: type === 'lease' ? 'lease' : type === 'rent' ? 'rent' : 'all', 
      search: query 
    }));
    setCurrentView(type === 'lease' ? 'commercial' : 'rentals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view === 'home') {
      setFilters(defaultFilters);
    } else if (view === 'rentals') {
      setFilters(prev => ({ ...prev, listing_type: 'rent', property_type: 'all' }));
    } else if (view === 'commercial') {
      setFilters(prev => ({ ...prev, listing_type: 'lease', property_type: 'commercial' }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCityClick = (city: string) => {
    setFilters(prev => ({ ...prev, city, search: city }));
    setCurrentView('rentals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => { 
      const next = new Set(prev); 
      next.has(id) ? next.delete(id) : next.add(id); 
      return next; 
    });
  };

  const handleLoginSuccess = (token: string) => {
    setAdminToken(token); 
    setIsAdmin(true); 
    localStorage.setItem('keyhaven_admin_token', token); 
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setAdminToken(null); 
    setIsAdmin(false); 
    localStorage.removeItem('keyhaven_admin_token'); 
    setCurrentView('home');
  };

  const handleSessionExpired = () => {
    setAdminToken(null); 
    setIsAdmin(false); 
    localStorage.removeItem('keyhaven_admin_token'); 
    setCurrentView('home'); 
    setShowLoginModal(true);
  };

  const getViewTitle = () => {
    switch (currentView) { 
      case 'rentals': return 'Residential Rentals'; 
      case 'commercial': return 'Commercial Leases'; 
      case 'favorites': return 'Saved Properties'; 
      default: return 'All Properties'; 
    }
  };

  const getViewSubtitle = () => {
    switch (currentView) { 
      case 'rentals': return 'Apartments, houses, and condos for rent across the USA'; 
      case 'commercial': return 'Office spaces, retail, and warehouse leases'; 
      case 'favorites': return 'Properties you\'ve saved for later'; 
      default: return 'Browse all available rental and lease properties'; 
    }
  };

  const showListingsView = currentView === 'rentals' || currentView === 'commercial' || currentView === 'favorites';

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Properties</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        isAdmin={isAdmin} 
        onLoginClick={() => setShowLoginModal(true)} 
        onLogout={handleLogout} 
        favoritesCount={favorites.size} 
      />

      {currentView === 'home' && (
        <>
          <HeroSection onSearch={handleSearch} totalProperties={allProperties.length} />
          <FeaturedCities onCityClick={handleCityClick} />
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <PropertyGrid 
                properties={allProperties.slice(0, 8)} 
                loading={loading} 
                onSelectProperty={setSelectedProperty} 
                onToggleFavorite={toggleFavorite} 
                favorites={favorites} 
                title="Featured Properties" 
                subtitle="Hand-picked rentals and leases from top markets" 
              />
            </div>
          </section>
          <CTASection onNavigate={handleNavigate} />
          <HowItWorks />
        </>
      )}

      {showListingsView && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{getViewTitle()}</h1>
                <p className="text-gray-500 text-sm mt-1">{getViewSubtitle()}</p>
              </div>
              <button 
                onClick={() => setFilterSidebarOpen(true)} 
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>
            <div className="flex gap-6">
              <div className="hidden lg:block flex-shrink-0">
                <FilterSidebar 
                  filters={filters} 
                  onFiltersChange={setFilters} 
                  resultCount={filteredProperties.length}
                  isOpen={false}
                  onClose={() => {}}
                />
              </div>
              <div className="lg:hidden">
                <FilterSidebar 
                  filters={filters} 
                  onFiltersChange={setFilters} 
                  resultCount={filteredProperties.length} 
                  isOpen={filterSidebarOpen} 
                  onClose={() => setFilterSidebarOpen(false)} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <PropertyGrid 
                  properties={filteredProperties} 
                  loading={loading} 
                  onSelectProperty={setSelectedProperty} 
                  onToggleFavorite={toggleFavorite} 
                  favorites={favorites} 
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {currentView === 'admin' && adminToken && (
        <AdminDashboard sessionToken={adminToken} onSessionExpired={handleSessionExpired} />
      )}

      <Footer />

      {selectedProperty && (
        <PropertyDetailModal 
          property={selectedProperty} 
          onClose={() => setSelectedProperty(null)} 
          isFavorite={favorites.has(selectedProperty.id)} 
          onToggleFavorite={toggleFavorite} 
        />
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLoginSuccess={handleLoginSuccess} />

      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="fixed bottom-6 right-6 w-12 h-12 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-lg shadow-cyan-500/25 flex items-center justify-center transition-all z-30 hover:scale-110"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default AppLayout;
