import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';

interface FeaturedCitiesProps {
  onCityClick: (city: string) => void;
}

const cities = [
  { name: 'New York', state: 'NY', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600', count: 4 },
  { name: 'Los Angeles', state: 'CA', image: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=600', count: 2 },
  { name: 'Chicago', state: 'IL', image: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=600', count: 2 },
  { name: 'Miami', state: 'FL', image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=600', count: 2 },
  { name: 'San Francisco', state: 'CA', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600', count: 2 },
  { name: 'Austin', state: 'TX', image: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=600', count: 1 },
];

const FeaturedCities: React.FC<FeaturedCitiesProps> = ({ onCityClick }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Explore by City</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Browse rental properties and commercial spaces in top US cities
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map((city) => (
            <button
              key={city.name}
              onClick={() => onCityClick(city.name)}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-gray-200"
            >
              <img
                src={city.image}
                alt={city.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-white font-bold text-lg">{city.name}</div>
                <div className="text-white/70 text-sm">{city.state}</div>
                <div className="flex items-center gap-1 text-cyan-300 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>{city.count} listings</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCities;
