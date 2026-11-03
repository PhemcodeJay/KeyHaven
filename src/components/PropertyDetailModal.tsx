import React, { useState } from 'react';
import { Property } from '@/types/property';
import {
  X, MapPin, Bed, Bath, Maximize, Calendar, Building2, Home, Phone, Mail,
  Heart, Share2, ExternalLink, ChevronLeft, ChevronRight, User, Tag
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({ property, onClose, isFavorite, onToggleFavorite }) => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!property) return null;

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setShowContactForm(false);
      setContactSent(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    }, 2000);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(`${property.title} - ${formatPrice(property.price)}/${property.price_period} | ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Just Listed': return 'bg-emerald-500 text-white';
      case 'For Rent': return 'bg-sky-500 text-white';
      case 'For Lease': return 'bg-violet-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Image */}
        <div className="relative h-72 md:h-96 overflow-hidden rounded-t-3xl">
          <img
            src={property.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {property.badge && (
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getBadgeColor(property.badge)} shadow-lg`}>
                {property.badge}
              </span>
            )}
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/90 text-gray-700 shadow-lg capitalize">
              {property.source}
            </span>
          </div>

          {/* Actions */}
          <div className="absolute top-4 right-16 flex gap-2">
            <button
              onClick={() => onToggleFavorite?.(property.id)}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-colors"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {copied && (
            <div className="absolute top-16 right-16 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
              Link copied!
            </div>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg">
              <span className="text-2xl font-bold text-gray-900">{formatPrice(property.price)}</span>
              <span className="text-gray-500 text-lg">/{property.price_period}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
          
          <div className="flex items-center gap-2 text-gray-500 mb-6">
            <MapPin className="w-4 h-4" />
            <span>{property.address}{property.city ? `, ${property.city}` : ''}{property.state ? `, ${property.state}` : ''} {property.zip_code}</span>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {property.bedrooms !== undefined && property.bedrooms !== null && (
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <Bed className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">{property.bedrooms === 0 ? 'Studio' : property.bedrooms}</div>
                <div className="text-xs text-gray-500">{property.bedrooms === 0 ? '' : 'Bedrooms'}</div>
              </div>
            )}
            {property.bathrooms !== undefined && property.bathrooms > 0 && (
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <Bath className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">{property.bathrooms}</div>
                <div className="text-xs text-gray-500">Bathrooms</div>
              </div>
            )}
            {property.sqft !== undefined && property.sqft > 0 && (
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <Maximize className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">{property.sqft.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Sq Ft</div>
              </div>
            )}
            {property.year_built && (
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <Calendar className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">{property.year_built}</div>
                <div className="text-xs text-gray-500">Year Built</div>
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About This Property</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Amenities & Features</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, i) => (
                  <span key={i} className="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-xl text-sm font-medium">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Property Details */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Property Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Type:</span>
                <span className="font-medium text-gray-900 capitalize">{property.property_type}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Listing:</span>
                <span className="font-medium text-gray-900 capitalize">{property.listing_type === 'rent' ? 'For Rent' : 'For Lease'}</span>
              </div>
              {property.country && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Country:</span>
                  <span className="font-medium text-gray-900">{property.country}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Source:</span>
                <span className="font-medium text-gray-900 capitalize">{property.source}</span>
              </div>
            </div>
          </div>

          {/* Broker Contact */}
          {(property.broker_name || property.broker_phone || property.broker_email) && (
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4">Contact Agent</h2>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  {property.broker_name && (
                    <div className="text-white font-semibold text-lg mb-1">{property.broker_name}</div>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {property.broker_phone && (
                      <a href={`tel:${property.broker_phone}`} className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 text-sm transition-colors">
                        <Phone className="w-4 h-4" />
                        {property.broker_phone}
                      </a>
                    )}
                    {property.broker_email && (
                      <a href={`mailto:${property.broker_email}`} className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 text-sm transition-colors">
                        <Mail className="w-4 h-4" />
                        {property.broker_email}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {!showContactForm ? (
                <button
                  onClick={() => setShowContactForm(true)}
                  className="mt-4 w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-colors"
                >
                  Send Inquiry
                </button>
              ) : (
                <form onSubmit={handleContactSubmit} className="mt-4 space-y-3">
                  {contactSent ? (
                    <div className="text-center py-4">
                      <div className="text-emerald-400 font-semibold text-lg">Message Sent!</div>
                      <p className="text-gray-400 text-sm mt-1">The agent will get back to you shortly.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                          className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                        />
                      </div>
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                      />
                      <textarea
                        placeholder="I'm interested in this property..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-colors text-sm">
                          Send Message
                        </button>
                        <button type="button" onClick={() => setShowContactForm(false)} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm">
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailModal;
