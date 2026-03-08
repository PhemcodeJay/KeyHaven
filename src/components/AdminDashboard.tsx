import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Property, AdminStats, ApiLog } from '@/types/property';
import {
  BarChart3, RefreshCw, Plus, Trash2, Edit3, Save, X, AlertCircle,
  Database, Zap, Globe, Home, Building2, Clock, CheckCircle, XCircle,
  Loader2, ChevronDown, Activity, Server, ArrowUpRight
} from 'lucide-react';

interface AdminDashboardProps {
  sessionToken: string;
  onSessionExpired: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ sessionToken, onSessionExpired }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'api'>('overview');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [newProperty, setNewProperty] = useState({
    title: '', description: '', property_type: 'apartment', listing_type: 'rent',
    price: '', price_period: 'month', address: '', city: '', state: '', zip_code: '',
    country: 'USA', bedrooms: '', bathrooms: '', sqft: '', image_url: '',
    broker_name: '', broker_phone: '', broker_email: '', badge: 'For Rent',
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const adminRequest = useCallback(async (body: any) => {
    // Replit dynamic port detection
    let apiUrl = 'http://localhost:3001';
    if (typeof window !== 'undefined' && window.location.hostname.includes('replit.dev')) {
      const hostname = window.location.hostname;
      if (hostname.includes('-5000')) {
        apiUrl = `https://${hostname.replace('-5000', '-3001')}`;
      } else if (hostname.includes('-3000')) {
        apiUrl = `https://${hostname.replace('-3000', '-3001')}`;
      } else if (hostname.includes('-5173')) {
        apiUrl = `https://${hostname.replace('-5173', '-3001')}`;
      } else {
        apiUrl = '/api';
      }
    } else if (import.meta.env.VITE_API_URL) {
      apiUrl = import.meta.env.VITE_API_URL;
    }

    try {
      const response = await fetch(`${apiUrl}/admin/properties`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': sessionToken
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.status === 401 || data?.error === 'Unauthorized. Please login again.') {
        onSessionExpired();
        return null;
      }
      
      if (data?.error) {
        showNotification('error', data.error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Admin request error:', error);
      return null;
    }
  }, [sessionToken, onSessionExpired]);

  const fetchStats = useCallback(async () => {
    const data = await adminRequest({ action: 'stats' });
    if (data) setStats(data);
  }, [adminRequest]);

  const fetchProperties = useCallback(async () => {
    const data = await adminRequest({ action: 'list_properties', page, per_page: 10, source: sourceFilter });
    if (data) {
      setProperties(data.properties || []);
      setTotalProperties(data.total || data.results?.length || 0);
    } else {
      setProperties([]);
      setTotalProperties(0);
    }
  }, [adminRequest, page, sourceFilter]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchProperties()]);
      setLoading(false);
    };
    loadData();
  }, [fetchStats, fetchProperties]);

  const handleRefreshAPIs = async (source: string = 'both') => {
    setRefreshing(true);
    try {
      // Replit dynamic port detection for refresh call
      let apiUrl = 'http://localhost:3001';
      if (typeof window !== 'undefined' && window.location.hostname.includes('replit.dev')) {
        const hostname = window.location.hostname;
        if (hostname.includes('-5000')) {
          apiUrl = `https://${hostname.replace('-5000', '-3001')}`;
        } else if (hostname.includes('-3000')) {
          apiUrl = `https://${hostname.replace('-3000', '-3001')}`;
        } else if (hostname.includes('-5173')) {
          apiUrl = `https://${hostname.replace('-5173', '-3001')}`;
        } else {
          apiUrl = '/api';
        }
      } else if (import.meta.env.VITE_API_URL) {
        apiUrl = import.meta.env.VITE_API_URL;
      }

      const response = await fetch(`${apiUrl}/admin/properties`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': sessionToken
        },
        body: JSON.stringify({ action: 'refresh', source }),
      });
      
      const data = await response.json();
      
      if (data?.success) {
        showNotification('success', `Fetched ${data.fetched} properties from APIs`);
        await Promise.all([fetchStats(), fetchProperties()]);
      } else {
        showNotification('error', data?.error || 'API refresh failed.');
      }
    } catch (err) {
      showNotification('error', 'Failed to connect to API service.');
    }
    setRefreshing(false);
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    const property = {
      ...newProperty,
      price: Number(newProperty.price),
      bedrooms: newProperty.bedrooms ? Number(newProperty.bedrooms) : null,
      bathrooms: newProperty.bathrooms ? Number(newProperty.bathrooms) : null,
      sqft: newProperty.sqft ? Number(newProperty.sqft) : null,
    };
    const data = await adminRequest({ action: 'add_property', property });
    if (data?.success) {
      showNotification('success', 'Property added successfully');
      setShowAddForm(false);
      setNewProperty({
        title: '', description: '', property_type: 'apartment', listing_type: 'rent',
        price: '', price_period: 'month', address: '', city: '', state: '', zip_code: '',
        country: 'USA', bedrooms: '', bathrooms: '', sqft: '', image_url: '',
        broker_name: '', broker_phone: '', broker_email: '', badge: 'For Rent',
      });
      await fetchProperties();
      await fetchStats();
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    const data = await adminRequest({ action: 'delete_property', id });
    if (data?.success) {
      showNotification('success', 'Property deleted');
      await fetchProperties();
      await fetchStats();
    }
  };

  const handleUpdateProperty = async (id: string, updates: Partial<Property>) => {
    const data = await adminRequest({ action: 'update_property', id, updates });
    if (data?.success) {
      showNotification('success', 'Property updated');
      setEditingId(null);
      await fetchProperties();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-cyan-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage properties, API connections, and monitor usage</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRefreshAPIs('both')}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all text-sm shadow-lg shadow-cyan-500/25"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh APIs'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'properties', label: 'Properties', icon: Home },
          { id: 'api', label: 'API Logs', icon: Activity },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats ? (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total', value: stats.properties.total, icon: Database, color: 'text-cyan-600 bg-cyan-50' },
              { label: 'Zillow', value: stats.properties.zillow, icon: Home, color: 'text-blue-600 bg-blue-50' },
              { label: 'LoopNet', value: stats.properties.loopnet, icon: Building2, color: 'text-orange-600 bg-orange-50' },
              { label: 'Manual', value: stats.properties.manual, icon: Edit3, color: 'text-violet-600 bg-violet-50' },
              { label: 'Rentals', value: stats.properties.rentals, icon: Home, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Leases', value: stats.properties.leases, icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* API Usage */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                API Usage (Last 24h)
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Zillow Calls</span>
                  <span className="font-semibold text-blue-600">{stats.api_usage.last_24h.zillow_calls}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">LoopNet Calls</span>
                  <span className="font-semibold text-orange-600">{stats.api_usage.last_24h.loopnet_calls}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Calls</span>
                  <span className="font-semibold text-gray-900">{stats.api_usage.last_24h.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Errors</span>
                  <span className={`font-semibold ${stats.api_usage.last_24h.errors > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {stats.api_usage.last_24h.errors}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-500" />
                API Connections
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <div>
                      <div className="font-medium text-sm text-gray-900">Zillow API</div>
                      <div className="text-xs text-gray-500">zillow-com1.p.rapidapi.com</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRefreshAPIs('zillow')}
                    disabled={refreshing}
                    className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Fetch
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <div>
                      <div className="font-medium text-sm text-gray-900">LoopNet API</div>
                      <div className="text-xs text-gray-500">loopnet.p.rapidapi.com</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRefreshAPIs('loopnet')}
                    disabled={refreshing}
                    className="text-xs px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors"
                  >
                    Fetch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">Loading overview...</div>
      )}

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <select
                value={sourceFilter}
                onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                <option value="all">All Sources</option>
                <option value="zillow">Zillow</option>
                <option value="loopnet">LoopNet</option>
                <option value="manual">Manual</option>
              </select>
              <span className="text-sm text-gray-500">{totalProperties} total</span>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Property
            </button>
          </div>

          {/* Add Property Form */}
          {showAddForm && (
            <form onSubmit={handleAddProperty} className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Add New Property</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input value={newProperty.title} onChange={e => setNewProperty(p => ({...p, title: e.target.value}))} placeholder="Title *" required className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                <select value={newProperty.property_type} onChange={e => setNewProperty(p => ({...p, property_type: e.target.value}))} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="commercial">Commercial</option>
                </select>
                <select value={newProperty.listing_type} onChange={e => setNewProperty(p => ({...p, listing_type: e.target.value}))} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
                  <option value="rent">For Rent</option>
                  <option value="lease">For Lease</option>
                </select>
                <input value={newProperty.price} onChange={e => setNewProperty(p => ({...p, price: e.target.value}))} placeholder="Price *" type="number" required className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                <input value={newProperty.city} onChange={e => setNewProperty(p => ({...p, city: e.target.value}))} placeholder="City" className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                <input value={newProperty.state} onChange={e => setNewProperty(p => ({...p, state: e.target.value}))} placeholder="State" className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                <input value={newProperty.bedrooms} onChange={e => setNewProperty(p => ({...p, bedrooms: e.target.value}))} placeholder="Bedrooms" type="number" className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                <input value={newProperty.bathrooms} onChange={e => setNewProperty(p => ({...p, bathrooms: e.target.value}))} placeholder="Bathrooms" type="number" step="0.5" className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                <input value={newProperty.sqft} onChange={e => setNewProperty(p => ({...p, sqft: e.target.value}))} placeholder="Sq Ft" type="number" className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                <input value={newProperty.address} onChange={e => setNewProperty(p => ({...p, address: e.target.value}))} placeholder="Address" className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                <input value={newProperty.image_url} onChange={e => setNewProperty(p => ({...p, image_url: e.target.value}))} placeholder="Image URL" className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                <input value={newProperty.broker_name} onChange={e => setNewProperty(p => ({...p, broker_name: e.target.value}))} placeholder="Broker Name" className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
              </div>
              <textarea value={newProperty.description} onChange={e => setNewProperty(p => ({...p, description: e.target.value}))} placeholder="Description" rows={2} className="w-full mt-4 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none resize-none" />
              <div className="flex gap-2 mt-4">
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors">
                  <Save className="w-4 h-4 inline mr-1" /> Save Property
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-xl transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Properties Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Property</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Source</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {properties.map(prop => (
                    <tr key={prop.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={prop.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{prop.title}</div>
                            <div className="text-xs text-gray-400 capitalize">{prop.property_type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{prop.city}, {prop.state}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">${prop.price.toLocaleString()}/{prop.price_period}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          prop.source === 'zillow' ? 'bg-blue-50 text-blue-700' :
                          prop.source === 'loopnet' ? 'bg-orange-50 text-orange-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>{prop.source}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          prop.listing_type === 'rent' ? 'bg-sky-50 text-sky-700' : 'bg-violet-50 text-violet-700'
                        }`}>{prop.listing_type === 'rent' ? 'Rent' : 'Lease'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDeleteProperty(prop.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalProperties > 10 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">Page {page} of {Math.ceil(totalProperties / 10)}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(totalProperties / 10)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Logs Tab */}
      {activeTab === 'api' && stats && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Recent API Activity</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recent_logs.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-400">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No API activity recorded yet</p>
                <p className="text-xs mt-1">Click "Refresh APIs" to fetch data</p>
              </div>
            ) : (
              stats.recent_logs.map(log => (
                <div key={log.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${log.status_code === 200 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div>
                      <div className="text-sm font-medium text-gray-900 capitalize">{log.api_source}</div>
                      <div className="text-xs text-gray-400">{log.endpoint}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${log.status_code === 200 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {log.status_code}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
