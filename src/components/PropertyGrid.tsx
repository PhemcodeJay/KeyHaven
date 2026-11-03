import React from 'react';
import { Property } from '@/types/property';
import PropertyCard from './PropertyCard';
import { Search, Loader2, Home, Building2 } from 'lucide-react';

interface PropertyGridProps {
  properties: Property[];
  loading: boolean;
  onSelectProperty: (property: Property) => void;
  onToggleFavorite: (id: string) => void;
  favorites: Set<string>;
  title?: string;
  subtitle?: string;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties, loading, onSelectProperty, onToggleFavorite, favorites, title, subtitle
}) => {
  // Loading skeleton
  if (loading) {
    return (
      <div>
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-52 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
                <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                <div className="flex gap-3">
                  <div className="h-3 bg-gray-100 rounded-lg w-16" />
                  <div className="h-3 bg-gray-100 rounded-lg w-16" />
                  <div className="h-3 bg-gray-100 rounded-lg w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (properties.length === 0) {
    return (
      <div>
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
          </div>
        )}
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Properties Found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Try adjusting your filters or search criteria to find more properties.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <span className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            onSelect={onSelectProperty}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.has(property.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PropertyGrid;
