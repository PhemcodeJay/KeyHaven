import React, { useState } from 'react';
import { Search, MapPin, Home, Building2, TrendingUp, Users, Globe } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (query: string, type: string) => void;
  totalProperties: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, totalProperties }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'rent' | 'lease'>('rent');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, activeTab);
  };

  const stats = [
    { icon: Home, value: `${totalProperties}+`, label: 'Active Listings' },
    { icon: Globe, value: '50+', label: 'Cities Covered' },
    { icon: Users, value: '10K+', label: 'Happy Renters' },
    { icon: TrendingUp, value: '98%', label: 'Satisfaction' },
  ];

  return (
    <section className="relative min-h-[600px] lg:min-h-[680px] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
          alt="Modern cityscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Powered by Zillow & LoopNet APIs</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Rental or Lease
            </span>
          </h1>

          <p className="text-lg text-gray-300 mb-8 max-w-xl leading-relaxed">
            Discover thousands of rental properties and commercial spaces across the USA and worldwide. 
            Real-time data from trusted sources, all in one place.
          </p>

          {/* Search Box */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 max-w-2xl">
            {/* Tabs */}
            <div className="flex gap-1 mb-2 px-1">
              <button
                onClick={() => setActiveTab('rent')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'rent'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Home className="w-4 h-4" />
                Residential Rentals
              </button>
              <button
                onClick={() => setActiveTab('lease')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'lease'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Commercial Leases
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'rent' ? 'Search by city, state, or ZIP code...' : 'Search commercial spaces by location...'}
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-gray-900 placeholder-gray-400 text-base focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>
          </div>

          {/* Popular searches */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-gray-400 text-sm">Popular:</span>
            {['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco'].map(city => (
              <button
                key={city}
                onClick={() => {
                  setSearchQuery(city);
                  onSearch(city, activeTab);
                }}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg text-sm transition-colors border border-white/10"
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors">
              <stat.icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
