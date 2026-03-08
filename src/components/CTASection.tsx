import React from 'react';
import { ArrowRight, Building2, Home } from 'lucide-react';

interface CTASectionProps {
  onNavigate: (view: string) => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onNavigate }) => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Residential CTA */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-700 p-8 md:p-10 group cursor-pointer" onClick={() => onNavigate('rentals')}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Home className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Residential Rentals</h3>
              <p className="text-cyan-100 mb-6 leading-relaxed">
                Apartments, houses, and condos for rent across the USA. Powered by Zillow's extensive database.
              </p>
              <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
                Browse Rentals <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Commercial CTA */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 p-8 md:p-10 group cursor-pointer" onClick={() => onNavigate('commercial')}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Commercial Leases</h3>
              <p className="text-violet-100 mb-6 leading-relaxed">
                Office spaces, retail, warehouses, and more. Data sourced from LoopNet's commercial listings.
              </p>
              <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
                Browse Commercial <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
