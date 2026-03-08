import React, { useState } from 'react';
import { Building, MapPin, Phone, Mail, ArrowRight, Globe, Shield, Zap } from 'lucide-react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const footerLinks = {
    'Property Types': [
      { label: 'Apartments', href: '#' },
      { label: 'Houses', href: '#' },
      { label: 'Condos', href: '#' },
      { label: 'Commercial Spaces', href: '#' },
      { label: 'Office Suites', href: '#' },
      { label: 'Retail Spaces', href: '#' },
    ],
    'Popular Cities': [
      { label: 'New York, NY', href: '#' },
      { label: 'Los Angeles, CA', href: '#' },
      { label: 'Chicago, IL', href: '#' },
      { label: 'Houston, TX', href: '#' },
      { label: 'Miami, FL', href: '#' },
      { label: 'San Francisco, CA', href: '#' },
    ],
    'Resources': [
      { label: 'Renter\'s Guide', href: '#' },
      { label: 'Lease Calculator', href: '#' },
      { label: 'Market Reports', href: '#' },
      { label: 'Moving Checklist', href: '#' },
      { label: 'Neighborhood Guide', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
    'Company': [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  };

  return (
    <footer className="bg-slate-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold mb-2">Stay Updated on New Listings</h3>
              <p className="text-gray-400 max-w-md">Get notified when new properties matching your criteria become available.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">KeyHaven</span>
                <span className="text-[10px] text-gray-500 block -mt-1 tracking-wider">PROPERTY PLATFORM</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Your trusted source for rental properties and commercial leases across the USA and worldwide.
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-500" />
                <span>New York, NY 10001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-500" />
                <span>(800) 555-RENT</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-500" />
                <span>hello@keyhaven.com</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4 text-sm">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Verified Listings</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Real-Time Data</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>USA & Worldwide</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; 2026 KeyHaven. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Data powered by</span>
            <span className="text-blue-400 font-medium">Zillow API</span>
            <span>&</span>
            <span className="text-orange-400 font-medium">LoopNet API</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
