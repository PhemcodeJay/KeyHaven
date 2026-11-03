import React from 'react';
import { Property } from '@/types/property';
import { MapPin, Bed, Bath, Maximize, Heart, ExternalLink, Building2, Home } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect, onToggleFavorite, isFavorite }) => {
  const formatPrice = (price: number, period: string) => {
    if (price >= 10000) {
      return `$${(price / 1000).toFixed(1)}k`;
    }
    return `$${price.toLocaleString()}`;
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Just Listed': return 'bg-emerald-500 text-white';
      case 'For Rent': return 'bg-sky-500 text-white';
      case 'For Lease': return 'bg-violet-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'zillow': return { label: 'Zillow', color: 'bg-blue-600' };
      case 'loopnet': return { label: 'LoopNet', color: 'bg-orange-500' };
      default: return { label: 'Manual', color: 'bg-gray-600' };
    }
  };

  const sourceBadge = getSourceBadge(property.source);

  const TypeIcon = property.listing_type === 'lease' ? Building2 : Home;

  return (
    <div
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onSelect(property)}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={property.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.badge && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeColor(property.badge)} shadow-lg`}>
              {property.badge}
            </span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${sourceBadge.color} text-white shadow-lg`}>
            {sourceBadge.label}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(property.id);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
        >
          <Heart
            className={`w-4.5 h-4.5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-400'}`}
            size={18}
          />
        </button>

        {/* Price */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
            <span className="text-lg font-bold text-gray-900">{formatPrice(property.price, property.price_period)}</span>
            <span className="text-sm text-gray-500">/{property.price_period}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-cyan-700 transition-colors">
            {property.title}
          </h3>
          <TypeIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{property.city}{property.state ? `, ${property.state}` : ''}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 text-gray-600 text-xs">
          {property.bedrooms !== undefined && property.bedrooms !== null && (
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-gray-400" />
              <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Bed`}</span>
            </div>
          )}
          {property.bathrooms !== undefined && property.bathrooms !== null && property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-gray-400" />
              <span>{property.bathrooms} Bath</span>
            </div>
          )}
          {property.sqft !== undefined && property.sqft > 0 && (
            <div className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5 text-gray-400" />
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Amenities preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {property.amenities.slice(0, 3).map((amenity, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md text-[10px] font-medium">
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md text-[10px]">
                +{property.amenities.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
