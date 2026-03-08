import React, { useState } from 'react';
import { PropertyFilters } from '@/types/property';
import { SlidersHorizontal, ChevronDown, ChevronUp, X, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  resultCount: number;
  isOpen: boolean;
  onClose: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFiltersChange, resultCount, isOpen, onClose }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    type: true,
    price: true,
    rooms: true,
    size: false,
    sort: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (key: keyof PropertyFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
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
    });
  };

  const hasActiveFilters = filters.property_type !== 'all' || filters.listing_type !== 'all' ||
    filters.min_price > 0 || filters.max_price > 0 || filters.bedrooms > 0 || filters.bathrooms > 0 || filters.min_sqft > 0;

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
      >
        {title}
        {expandedSections[id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expandedSections[id] && <div className="pb-4 px-1">{children}</div>}
    </div>
  );

  const propertyTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'apartment', label: 'Apartments' },
    { value: 'house', label: 'Houses' },
    { value: 'condo', label: 'Condos' },
    { value: 'commercial', label: 'Commercial' },
  ];

  const listingTypes = [
    { value: 'all', label: 'All Listings' },
    { value: 'rent', label: 'For Rent' },
    { value: 'lease', label: 'For Lease' },
  ];

  const bedroomOptions = [0, 1, 2, 3, 4, 5];
  const bathroomOptions = [0, 1, 1.5, 2, 2.5, 3];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed lg:sticky top-0 lg:top-4 left-0 h-full lg:h-auto w-80 lg:w-72 bg-white lg:bg-white
        rounded-none lg:rounded-2xl shadow-2xl lg:shadow-sm border-0 lg:border lg:border-gray-100
        z-50 lg:z-auto transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto lg:max-h-[calc(100vh-2rem)]
      `}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-600" />
            <h2 className="font-bold text-gray-900">Filters</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{resultCount} results</span>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-2">
          {/* Property Type */}
          <Section id="type" title="Property Type">
            <div className="grid grid-cols-2 gap-2">
              {propertyTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => updateFilter('property_type', type.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    filters.property_type === type.value
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {listingTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => updateFilter('listing_type', type.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    filters.listing_type === type.value
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Price Range */}
          <Section id="price" title="Price Range">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Min</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    value={filters.min_price || ''}
                    onChange={(e) => updateFilter('min_price', Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Max</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    value={filters.max_price || ''}
                    onChange={(e) => updateFilter('max_price', Number(e.target.value) || 0)}
                    placeholder="Any"
                    className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
            {/* Quick price buttons */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[1000, 2000, 3000, 5000, 10000].map(price => (
                <button
                  key={price}
                  onClick={() => updateFilter('max_price', price)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    filters.max_price === price ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Under ${price >= 1000 ? `${price / 1000}k` : price}
                </button>
              ))}
            </div>
          </Section>

          {/* Bedrooms & Bathrooms */}
          <Section id="rooms" title="Rooms">
            <div className="mb-3">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 block">Bedrooms</label>
              <div className="flex gap-1.5">
                {bedroomOptions.map(num => (
                  <button
                    key={num}
                    onClick={() => updateFilter('bedrooms', filters.bedrooms === num ? 0 : num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      filters.bedrooms === num && num > 0
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {num === 0 ? 'Any' : num === 5 ? '5+' : num}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 block">Bathrooms</label>
              <div className="flex gap-1.5">
                {bathroomOptions.map(num => (
                  <button
                    key={num}
                    onClick={() => updateFilter('bathrooms', filters.bathrooms === num ? 0 : num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      filters.bathrooms === num && num > 0
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {num === 0 ? 'Any' : num}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Square Footage */}
          <Section id="size" title="Square Footage">
            <div className="flex flex-wrap gap-1.5">
              {[0, 500, 1000, 2000, 5000].map(sqft => (
                <button
                  key={sqft}
                  onClick={() => updateFilter('min_sqft', filters.min_sqft === sqft ? 0 : sqft)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    filters.min_sqft === sqft && sqft > 0
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {sqft === 0 ? 'Any' : `${sqft.toLocaleString()}+ sqft`}
                </button>
              ))}
            </div>
          </Section>

          {/* Sort */}
          <Section id="sort" title="Sort By">
            <select
              value={`${filters.sort_by}-${filters.sort_order}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                updateFilter('sort_by', field);
                setTimeout(() => updateFilter('sort_order', order), 0);
              }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none appearance-none cursor-pointer"
            >
              <option value="date_listed-desc">Newest First</option>
              <option value="date_listed-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="sqft-desc">Largest First</option>
              <option value="sqft-asc">Smallest First</option>
            </select>
          </Section>
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;
