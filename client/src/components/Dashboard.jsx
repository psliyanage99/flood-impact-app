import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { AlertTriangle, TrendingUp, MapPin, Clock, Filter, Download, RefreshCw, Bell, ChevronDown, Activity, Zap, Shield, Droplets, Navigation, Info, Users, CheckCircle, Wind, Eye, AlertCircle, CloudRain, Calendar, TrendingDown, BarChart3, Settings, Phone, Mail, Github, Linkedin, Twitter, Heart, FileText, Menu, X, CheckSquare } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, Title, Tooltip, Legend, ArcElement, Filler);

// --- CONFIGURATION ---
const LOCATION_COORDS = { lat: 6.9271, lon: 79.8612 }; // Colombo Coordinates

const Dashboard = ({ user }) => {
  // --- STATE MANAGEMENT ---
  const [activeReports, setActiveReports] = useState([]); // Map & Feed Data
  const [allStatsReports, setAllStatsReports] = useState([]); // Stats Data
  const [filteredActiveReports, setFilteredActiveReports] = useState([]); // Filtered Data
  
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCriticality, setSelectedCriticality] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [showFilters, setShowFilters] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [weatherData, setWeatherData] = useState({ temp: 0, condition: 'Loading...', humidity: 0, windSpeed: 0, rainfall: 0 });


  const getIncidentIcon = (type) => {
  const typeLower = (type || '').toLowerCase();
  
  if (typeLower.includes('road')) return Construction;
  if (typeLower.includes('bridge')) return Bridge;
  if (typeLower.includes('electricity') || typeLower.includes('electric') || typeLower.includes('power')) return ElectricityIcon;
  if (typeLower.includes('water') || typeLower.includes('flood')) return Droplets;
  if (typeLower.includes('railway') || typeLower.includes('train')) return Train;
  // if (typeLower.includes('building') || typeLower.includes('house') || typeLower.includes('home')) return Home;
  // if (typeLower.includes('tree') || typeLower.includes('vegetation')) return TreeDeciduous;
  // if (typeLower.includes('factory') || typeLower.includes('industrial')) return Factory;
  // if (typeLower.includes('hospital') || typeLower.includes('medical')) return Hospital;
  // if (typeLower.includes('school') || typeLower.includes('education')) return School;
  
  return HelpCircle; // Default icon
};

  useEffect(() => {
    fetchReports();
    fetchWeatherData();
    const interval = setInterval(() => { fetchReports(); fetchWeatherData(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- API CALLS ---
  const getWeatherCondition = (code) => {
    const codes = { 0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain', 95: 'Thunderstorm' };
    return codes[code] || 'Unknown';
  };

  const fetchWeatherData = async () => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${LOCATION_COORDS.lat}&longitude=${LOCATION_COORDS.lon}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code&timezone=auto`;
      const res = await axios.get(url);
      const current = res.data.current;
      setWeatherData({
        temp: Math.round(current.temperature_2m),
        condition: getWeatherCondition(current.weather_code),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        rainfall: current.rain || 0
      });
    } catch (error) { setWeatherData(prev => ({ ...prev, condition: 'Unavailable' })); }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/reports');
      const data = res.data;
      
      setAllStatsReports(data); // Store Full History for Stats
      
      const activeOnly = data.filter(r => r.status !== 'resolved'); // Filter out resolved for Map
      setActiveReports(activeOnly);
      
      setLastUpdate(new Date());
      
      // Helper function to handle adding and auto-removing notifications
const addNotification = (message, type) => {
  const id = Date.now();
  
  // 1. Add the new notification to the state
  setNotifications(prev => [...prev, { id, message, type, timestamp: new Date() }]);

  // 2. Automatically remove it after 20 seconds
  setTimeout(() => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, 20000); 
};

// Your main logic
try {
  const criticalAlerts = activeOnly.filter(r => r.criticality === 'critical' && isRecent(r.timestamp));
  
  if (criticalAlerts.length > 0) {
    addNotification(`${criticalAlerts.length} new critical incidents`, 'critical');
  }
} catch (err) { 
  console.error(err); 
} finally { 
  setLoading(false); 
}
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // --- ADMIN ACTION: RESOLVE INCIDENT ---
  const handleResolve = async (id) => {
    try {
        // 1. Update Database
        await axios.put(`http://localhost:8080/api/reports/${id}/resolve`);
        
        // 2. Remove marker from Map/Live Feed instantly
        setActiveReports(prev => prev.filter(r => r.id !== id));
        
        // 3. Update Statistics (Resolved count goes up, Active goes down)
        setAllStatsReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));

        // 4. Show success notification
        setNotifications(prev => [...prev, { id: Date.now(), message: 'Incident marked as Resolved', type: 'success', timestamp: new Date() }]);
    } catch (err) { 
        alert("Failed to update status. Please try again."); 
    }
  };

  const isRecent = (timestamp) => {
    return (new Date() - new Date(timestamp)) / (1000 * 60 * 60) < 24;
  };

  // --- FILTERING ---
  useEffect(() => {
    let filtered = activeReports; // Filter active reports only
    if (selectedDistrict !== 'all') filtered = filtered.filter(r => r.district === selectedDistrict);
    if (selectedCriticality !== 'all') filtered = filtered.filter(r => r.criticality === selectedCriticality);
    if (timeRange !== 'all') {
      const days = parseInt(timeRange);
      filtered = filtered.filter(r => (new Date() - new Date(r.timestamp)) / (1000 * 60 * 60 * 720) <= days);
    }
    setFilteredActiveReports(filtered);
  }, [selectedDistrict, selectedCriticality, timeRange, activeReports]);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const total = allStatsReports.length;
    const resolved = allStatsReports.filter(r => r.status === 'resolved').length;
    const activeRaw = allStatsReports.filter(r => r.status !== 'resolved');
    const active = activeRaw.length;
    
    // Priorities based on Active incidents
    const critical = activeRaw.filter(r => r.criticality === 'critical').length;
    const high = activeRaw.filter(r => r.criticality === 'high').length;
    
    const completionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const criticalTrend = activeRaw.filter(r => r.criticality === 'critical' && isRecent(r.timestamp)).length > 0 ? '+' + activeRaw.filter(r => r.criticality === 'critical' && isRecent(r.timestamp)).length : '0';
    
    return { total, active, resolved, critical, high, completionRate, criticalTrend };
  }, [allStatsReports]);

  // --- CHARTS ---
  const radarData = useMemo(() => {
    const axisMapping = { 'Roads': ['road'], 'Bridges': ['bridge'], 'Utilities': ['electricity', 'water'], 'Railways': ['railway', 'train'], 'Other': ['other'] };
    const categories = Object.keys(axisMapping);
    return {
      labels: categories,
      datasets: [{
        label: 'Severity Index',
        data: categories.map(cat => {
          const catReports = filteredActiveReports.filter(r => axisMapping[cat].some(k => (r.type||'').toLowerCase().includes(k)));
          const score = catReports.reduce((acc, r) => acc + (r.criticality === 'critical' ? 4 : r.criticality === 'high' ? 3 : r.criticality === 'medium' ? 2 : 1), 0);
          return Math.min(score * 10, 100); 
        }),
        backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 1)', borderWidth: 2, pointBackgroundColor: 'rgba(239, 68, 68, 1)'
      }]
    };
  }, [filteredActiveReports]);

  const districtData = useMemo(() => {
    const districts = [...new Set(filteredActiveReports.map(r => r.district))];
    return {
      labels: districts,
      datasets: [
        { label: 'Critical', data: districts.map(d => filteredActiveReports.filter(r => r.district === d && r.criticality === 'critical').length), backgroundColor: 'rgba(239, 68, 68, 0.8)', borderRadius: 8 },
        { label: 'High', data: districts.map(d => filteredActiveReports.filter(r => r.district === d && r.criticality === 'high').length), backgroundColor: 'rgba(251, 146, 60, 0.8)', borderRadius: 8 },
        { label: 'Medium', data: districts.map(d => filteredActiveReports.filter(r => r.district === d && r.criticality === 'medium').length), backgroundColor: 'rgba(234, 179, 8, 0.8)', borderRadius: 8 }
      ]
    };
  }, [filteredActiveReports]);

  const typeData = useMemo(() => {
    const types = [...new Set(filteredActiveReports.map(r => r.type))];
    return {
      labels: types,
      datasets: [{
        data: types.map(t => filteredActiveReports.filter(r => r.type === t).length),
        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'], borderWidth: 2
      }]
    };
  }, [filteredActiveReports]);

  const timelineData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
    return {
      labels: last7Days.map(d => days[d.getDay()]),
      datasets: [{
        label: 'New Incidents',
        data: last7Days.map(d => filteredActiveReports.filter(r => new Date(r.timestamp).toDateString() === d.toDateString()).length),
        borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.4, fill: true
      }]
    };
  }, [filteredActiveReports]);

  // --- UI HELPERS ---
  const exportData = () => {
    const dataStr = JSON.stringify(filteredActiveReports, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a'); link.href = url; link.download = `report-${new Date().toISOString()}.json`; link.click();
  };

  const getCriticalityColor = (c) => c === 'critical' ? '#ef4444' : c === 'high' ? '#fb923c' : c === 'medium' ? '#eab308' : '#22c55e';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-x-hidden">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* ADMIN BANNER */}
      {user?.role === 'admin' && (
        <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 text-white text-xs sm:text-sm font-bold text-center py-2.5 sm:py-3 sticky top-0 z-50 shadow-2xl border-b border-gray-700">
          <div className="flex items-center justify-center gap-2 px-4">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-pulse" />
            <span className="uppercase tracking-wider">Admin Mode Active: Click markers to resolve incidents</span>
          </div>
        </div>
      )}

      {/* Notifications Toast */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full px-4 sm:px-0">
        {notifications.slice(-3).map(n => (
          <div 
            key={n.id} 
            className={`transform transition-all duration-500 ease-out backdrop-blur-lg bg-white/95 shadow-2xl rounded-2xl border-l-4 overflow-hidden ${
              n.type === 'success' ? 'border-emerald-500' : 'border-red-500'
            } animate-slideInRight`}
          >
            <div className="px-4 sm:px-6 py-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                n.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                {n.type === 'success' ? 
                  <CheckCircle className="w-5 h-5 text-emerald-600" /> : 
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm sm:text-base">{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto">
        {/* HEADER */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            {/* Title Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${
                  user?.role === 'admin' 
                    ? 'from-gray-700 via-slate-800 to-black' 
                    : 'from-blue-500 via-indigo-600 to-purple-600'
                } rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300`}>
                  <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 tracking-tight leading-tight">
                    {user?.role === 'admin' ? 'Admin Dashboard' : 'Infrastructure Command'}
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium mt-1">Real-time flood damage monitoring & response</p>
                </div>
              </div>
              
              {/* Status Bar */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-gray-600 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="font-medium">Updated: {lastUpdate.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 shadow-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-bold">Live</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold border border-gray-200 hover:border-gray-300"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <button 
                onClick={fetchReports} 
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <button 
                onClick={exportData} 
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        {showFilters && (
          <div className="mb-6 sm:mb-8 bg-white/90 backdrop-blur-2xl border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl animate-slideDown">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-gray-700 uppercase tracking-wider">District</label>
                <select 
                  value={selectedDistrict} 
                  onChange={e => setSelectedDistrict(e.target.value)} 
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 bg-white shadow-sm font-medium text-sm sm:text-base"
                >
                  <option value="all">All Districts</option>
                  {[...new Set(activeReports.map(r => r.district))].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-gray-700 uppercase tracking-wider">Criticality</label>
                <select 
                  value={selectedCriticality} 
                  onChange={e => setSelectedCriticality(e.target.value)} 
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all duration-300 bg-white shadow-sm font-medium text-sm sm:text-base"
                >
                  <option value="all">All Levels</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-gray-700 uppercase tracking-wider">Time Range</label>
                <select 
                  value={timeRange} 
                  onChange={e => setTimeRange(e.target.value)} 
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 bg-white shadow-sm font-medium text-sm sm:text-base"
                >
                  <option value="1">Last 24 Hours</option>
                  <option value="7">Last 7 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* WEATHER CARD */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-100 border-2 border-blue-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            {/* Weather Info */}
            <div className="flex gap-3 sm:gap-4 items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl sm:rounded-3xl flex justify-center items-center shadow-lg">
                <CloudRain className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Weather Alert (Colombo)</h3>
                <p className="text-xs sm:text-sm text-gray-700 font-medium mt-0.5">
                  {weatherData.rainfall > 0 ? `⚠️ Rain detected: ${weatherData.rainfall}mm` : "✓ No heavy rain alerts"}
                </p>
              </div>
            </div>
            
            {/* Weather Stats */}
            <div className="flex gap-4 sm:gap-6 items-center w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-blue-600">{weatherData.temp}°C</div>
                <div className="text-xs font-semibold text-gray-600 mt-1">{weatherData.condition}</div>
              </div>
              <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-gray-700">
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 bg-white/60 px-3 py-2 rounded-xl">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span>{weatherData.humidity}%</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 bg-white/60 px-3 py-2 rounded-xl">
                  <Wind className="w-4 h-4 text-blue-600" />
                  <span>{weatherData.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* Active Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-blue-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-full">Active</span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-1 sm:mb-2">{stats.active}</div>
            <div className="text-gray-600 text-xs sm:text-sm font-semibold">Under Review</div>
          </div>

          {/* Critical Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-red-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 sm:px-3 py-1 rounded-full">Critical</span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-1 sm:mb-2">{stats.critical}</div>
            <div className="text-gray-600 text-xs sm:text-sm font-semibold">Needs Attention</div>
          </div>

          {/* Resolved Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-emerald-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-100 to-green-200 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-1 rounded-full">{stats.completionRate}%</span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-1 sm:mb-2">{stats.resolved}</div>
            <div className="text-gray-600 text-xs sm:text-sm font-semibold">Resolved</div>
          </div>

          {/* High Priority Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 sm:px-3 py-1 rounded-full">High</span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-1 sm:mb-2">{stats.high}</div>
            <div className="text-gray-600 text-xs sm:text-sm font-semibold">Urgent</div>
          </div>

          {/* Total Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-purple-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 sm:px-3 py-1 rounded-full">Total</span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-1 sm:mb-2">{stats.total}</div>
            <div className="text-gray-600 text-xs sm:text-sm font-semibold">All Time</div>
          </div>
        </div>

        {/* MAP & LIVE FEED */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Map Section */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-2xl border-2 border-gray-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Active Incident Map</h2>
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-white/60 px-3 py-1.5 rounded-lg">
                  {user?.role === 'admin' ? '🎯 Click Marker to Resolve' : '👁️ View Only Mode'}
                </div>
              </div>
            </div>
            <div className="h-[400px] sm:h-[500px] lg:h-[600px]">
              <MapContainer center={[7.8731, 80.7718]} zoom={8} className="w-full h-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filteredActiveReports.map(r => (
                  <CircleMarker 
                    key={r.id} 
                    center={[r.latitude, r.longitude]} 
                    pathOptions={{ 
                      color: '#fff', 
                      fillColor: getCriticalityColor(r.criticality), 
                      fillOpacity: 0.9, 
                      weight: 3 
                    }} 
                    radius={14}
                  >
                    <Popup>
                      <div className="font-sans p-2 min-w-[220px]">
                        <div className="font-bold text-base mb-2 text-gray-900">{r.type}</div>
                        <div className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {r.location}, {r.district}
                        </div>
                        <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider mb-3 ${
                          r.criticality === 'critical' 
                            ? 'bg-red-100 text-red-700' 
                            : r.criticality === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {r.criticality}
                        </div>

                        {/* Admin Resolve Button */}
                        {user?.role === 'admin' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if(window.confirm('Mark this incident as resolved?')) handleResolve(r.id);
                            }}
                            className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-2.5 px-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300 text-xs uppercase tracking-wide"
                          >
                            <CheckSquare size={14} /> Mark as Resolved
                          </button>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Live Feed Section */}
          <div className="bg-white/90 backdrop-blur-2xl border-2 border-gray-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Live Feed</h2>
                <div className="ml-auto">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] custom-scrollbar">
              {filteredActiveReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No active incidents</p>
                  <p className="text-xs text-gray-400 mt-1">All clear at the moment</p>
                </div>
              ) : (
                filteredActiveReports.slice(0, 10).map(r => (
                  <div 
                    key={r.id} 
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border-l-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-x-1" 
                    style={{ borderLeftColor: getCriticalityColor(r.criticality) }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm sm:text-base text-gray-900">{r.type}</div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        r.criticality === 'critical' 
                          ? 'bg-red-100 text-red-700' 
                          : r.criticality === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {r.criticality}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 flex items-center gap-1.5 mb-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{r.location}</span>
                    </div>
                    <div className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {new Date(r.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ANALYTICS CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* District Breakdown */}
          <div className="bg-white/90 backdrop-blur-2xl border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-gray-900">District Breakdown</h3>
            </div>
            <div className="h-[250px] sm:h-[300px]">
              <Bar 
                data={districtData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { padding: 15, font: { size: 11, weight: 'bold' } }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Incident Trend */}
          <div className="bg-white/90 backdrop-blur-2xl border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-gray-900">Incident Trend (7 Days)</h3>
            </div>
            <div className="h-[250px] sm:h-[300px]">
              <Line 
                data={timelineData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { padding: 15, font: { size: 11, weight: 'bold' } }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Type Distribution */}
          <div className="bg-white/90 backdrop-blur-2xl border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-gray-900">Type Distribution</h3>
            </div>
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
              <Doughnut 
                data={typeData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { padding: 15, font: { size: 10, weight: 'bold' } }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Severity Index */}
          <div className="bg-white/90 backdrop-blur-2xl border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-gray-900">Severity Index</h3>
            </div>
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
              <Radar 
                data={radarData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { padding: 15, font: { size: 11, weight: 'bold' } }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-8 sm:mt-12 bg-white/90 backdrop-blur-2xl border-t-2 border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl">
  {/* Copyright Line */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-600 text-xs sm:text-sm">
            <span className="font-semibold">© {new Date().getFullYear()} Infrastructure Command Center.</span>
            <span className="hidden sm:inline">•</span>
            <span>All rights reserved.</span>
          </div>

          {/* Credits Section */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-gray-500">
            
            {/* Project Idea Credit */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <span className="text-gray-400">Concept by</span>
              <span className="font-bold text-gray-700">Sahan Wanniarachchi</span>
            </div>

            {/* Developer Credit */}
            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              <span className="text-blue-400">Designed & Developed by</span>
              <span className="font-bold text-blue-700">Praneeth Liyanage</span>
            </div>

          </div>
        </footer>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;