import React from 'react';
import { Search, Filter, Phone, Key } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Search Properties',
    description: 'Browse thousands of rental and commercial listings aggregated from Zillow and LoopNet in real-time.',
    color: 'from-cyan-500 to-blue-600',
    shadow: 'shadow-cyan-500/20',
  },
  {
    icon: Filter,
    title: 'Filter & Compare',
    description: 'Narrow down results by price, location, bedrooms, property type, and more with our advanced filters.',
    color: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/20',
  },
  {
    icon: Phone,
    title: 'Contact Agents',
    description: 'Connect directly with property agents and brokers through our integrated contact system.',
    color: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/20',
  },
  {
    icon: Key,
    title: 'Move In',
    description: 'Complete your lease agreement and get the keys to your new home or business space.',
    color: 'from-orange-500 to-red-500',
    shadow: 'shadow-orange-500/20',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How KeyHaven Works</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Find your perfect rental or lease in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center group">
              <div className="relative mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto shadow-lg ${step.shadow} group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-400 mx-auto" style={{ left: 'calc(50% + 20px)' }}>
                  {i + 1}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
