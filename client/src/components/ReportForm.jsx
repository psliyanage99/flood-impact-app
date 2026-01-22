import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, 
  Locate, 
  Navigation, 
  AlertTriangle, 
  FileText, 
  Phone, 
  User, 
  CheckCircle, 
  XCircle, 
  Send,
  Zap,
  Info,
  ChevronRight,
  Check
} from 'lucide-react';

const ReportForm = ({ user, initialLocation, onOpenMapPicker }) => {
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [formData, setFormData] = useState({
    district: '', 
    location: '', 
    type: '', 
    criticality: '', 
    description: '',
    latitude: '', 
    longitude: '', 
    reporterName: user.name, 
    contactNumber: ''
  });
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  // Calculate form completion progress
  useEffect(() => {
    const fields = ['district', 'location', 'type', 'criticality', 'description', 'contactNumber'];
    const completed = fields.filter(field => formData[field]).length;
    const hasCoordinates = formData.latitude && formData.longitude;
    const total = fields.length + (hasCoordinates ? 1 : 0);
    setFormProgress(Math.round((completed / fields.length) * 100));
  }, [formData]);

  // Effect: Use initialLocation if provided (from Map Picker)
  useEffect(() => {
    if (initialLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: initialLocation.lat.toFixed(6),
        longitude: initialLocation.lng.toFixed(6)
      }));
      setStatus({ 
        type: 'success', 
        msg: '✓ Location pinned from map successfully!' 
      });
      setTimeout(() => setStatus({ type: '', msg: '' }), 5000);
    }
  }, [initialLocation]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setStatus({ 
        type: 'error', 
        msg: 'Geolocation is not supported by your browser' 
      });
      return;
    }
    setLoadingLoc(true);
    setStatus({ type: 'info', msg: 'Detecting your location...' });
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        setStatus({ 
          type: 'success', 
          msg: `✓ Location detected: ${position.coords.latitude.toFixed(4)}°, ${position.coords.longitude.toFixed(4)}°` 
        });
        setLoadingLoc(false);
        setTimeout(() => setStatus({ type: '', msg: '' }), 5000);
      },
      (error) => {
        setStatus({ 
          type: 'error', 
          msg: '❌ Location access denied. Please use the map picker or enter coordinates manually.' 
        });
        setLoadingLoc(false);
        setTimeout(() => setStatus({ type: '', msg: '' }), 5000);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await axios.post('http://localhost:8080/api/reports', formData);
      setShowSuccess(true);
      
      // Reset form after delay
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          district: '', 
          location: '', 
          type: '', 
          criticality: '', 
          description: '',
          latitude: '', 
          longitude: '', 
          reporterName: user.name, 
          contactNumber: ''
        });
      }, 3000);
    } catch (err) {
      setStatus({ 
        type: 'error', 
        msg: '❌ Error submitting report. Please try again.' 
      });
      setTimeout(() => setStatus({ type: '', msg: '' }), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const getCriticalityColor = (criticality) => {
    switch(criticality) {
      case 'critical': return 'from-red-500 to-pink-500';
      case 'high': return 'from-orange-500 to-amber-500';
      case 'medium': return 'from-yellow-500 to-orange-400';
      default: return 'from-blue-600 to-indigo-600';
    }
  };

  const getCriticalityBadgeColor = (criticality) => {
    switch(criticality) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Animated background pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#e0e7ff_1px,transparent_1px),linear-gradient(to_bottom,#e0e7ff_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none"></div>
      
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md shadow-2xl animate-[slideUp_0.5s_ease-out]">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Report Submitted!</h3>
                <p className="text-gray-600">Your damage report has been successfully submitted and will be reviewed shortly.</p>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 animate-[slideRight_3s_ease-out]"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <AlertTriangle className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Report Infrastructure Damage
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Provide detailed information to help us respond quickly
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-semibold">Form Progress</span>
              <span className="text-sm font-bold text-blue-600">{formProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            
            {/* Status Messages */}
            {status.msg && (
              <div className={`p-4 rounded-xl border-2 flex items-center gap-3 animate-[slideDown_0.3s_ease-out] ${
                status.type === 'success' 
                  ? 'bg-green-50 border-green-300 text-green-700' 
                  : status.type === 'error'
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-blue-50 border-blue-300 text-blue-700'
              }`}>
                {status.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {status.type === 'error' && <XCircle className="w-5 h-5" />}
                {status.type === 'info' && <Info className="w-5 h-5 animate-pulse" />}
                <span className="font-semibold">{status.msg}</span>
              </div>
            )}

            {/* Location Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Location Information</h2>
                  <p className="text-sm text-gray-600">Where is the damage located?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-3 text-gray-900 font-semibold text-sm flex items-center gap-2">
                    District *
                    <span className="text-red-500">●</span>
                  </label>
                  <div className="relative">
                    <select 
                      className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-medium transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none cursor-pointer hover:border-gray-400"
                      required 
                      value={formData.district}
                      onChange={e => setFormData({...formData, district: e.target.value})}
                    >
                      <option value="">Select District</option>
                      <option value="Ampara">Ampara</option>   
                      <option value="Anuradhapura">Anuradhapura</option>  
                      <option value="Badulla">Badulla</option>                  
                      <option value="Batticaloa">Batticaloa</option>                  
                      <option value="Colombo">Colombo</option>                  
                      <option value="Galle">Galle</option>                  
                      <option value="Gampaha">Gampaha</option>                  
                      <option value="Hambantota">Hambantota</option>                  
                      <option value="Jaffna">Jaffna</option>                  
                      <option value="Kalutara">Kalutara</option>                  
                      <option value="Kandy">Kandy</option>                  
                      <option value="Kegalle">Kegalle</option>                  
                      <option value="Kilinochchi">Kilinochchi</option>                  
                      <option value="Kurunegala">Kurunegala</option>                  
                      <option value="Mannar">Mannar</option>                  
                      <option value="Matale">Matale</option>                  
                      <option value="Matara">Matara</option>                  
                      <option value="Monaragala">Monaragala</option>                  
                      <option value="Mullaitivu">Mullaitivu</option>                  
                      <option value="Nuwara Eliya">Nuwara Eliya</option>                  
                      <option value="Polonnaruwa">Polonnaruwa</option>                  
                      <option value="Puttalam">Puttalam</option>                  
                      <option value="Ratnapura">Ratnapura</option>                  
                      <option value="Trincomalee">Trincomalee</option>                  
                      <option value="Vavuniya">Vavuniya</option>                  
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block mb-3 text-gray-900 font-semibold text-sm flex items-center gap-2">
                    Specific Location *
                    <span className="text-red-500">●</span>
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-medium placeholder-gray-500 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400"
                    placeholder="e.g., Main Street, Galle Road"
                    required
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">GPS Coordinates</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block mb-3 text-gray-700 font-semibold text-sm">
                      Latitude
                    </label>
                    <input 
                      type="number" 
                      step="any"
                      className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-mono placeholder-gray-500 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={formData.latitude} 
                      onChange={e => setFormData({...formData, latitude: e.target.value})}
                      placeholder="e.g. 6.927079"
                    />
                  </div>
                  <div>
                    <label className="block mb-3 text-gray-700 font-semibold text-sm">
                      Longitude
                    </label>
                    <input 
                      type="number" 
                      step="any"
                      className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-mono placeholder-gray-500 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={formData.longitude} 
                      onChange={e => setFormData({...formData, longitude: e.target.value})}
                      placeholder="e.g. 79.861244"
                    />
                  </div>
                </div>

                {/* Location Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    type="button" 
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    onClick={getLocation} 
                    disabled={loadingLoc}
                  >
                    {loadingLoc ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Detecting...</span>
                      </>
                    ) : (
                      <>
                        <Locate className="w-5 h-5" />
                        <span>Use My Location</span>
                      </>
                    )}
                  </button>

                  {onOpenMapPicker && (
                    <button 
                      type="button" 
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                      onClick={onOpenMapPicker}
                    >
                      <MapPin className="w-5 h-5" />
                      <span>Pick on Map</span>
                    </button>
                  )}
                </div>

                {/* Coordinates Preview */}
                {formData.latitude && formData.longitude && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 text-green-700">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold">
                        Coordinates Set: {parseFloat(formData.latitude).toFixed(4)}°, {parseFloat(formData.longitude).toFixed(4)}°
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Damage Details Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Damage Details</h2>
                  <p className="text-sm text-gray-600">What type of damage occurred?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-3 text-gray-900 font-semibold text-sm flex items-center gap-2">
                    Infrastructure Type *
                    <span className="text-red-500">●</span>
                  </label>
                  <div className="relative">
                    <select 
                      className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-medium transition-all focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 appearance-none cursor-pointer hover:border-gray-400"
                      required
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="">Select Type</option> 
                      <option value="Bridge">🌉 Bridge</option>
                      <option value="Road">🛣️ Road</option>
                      <option value="Electricity">⚡ Electricity</option>
                      <option value="Water Line">💧 Water Line</option>
                      <option value="Telecommunication">📡 Telecommunication</option>
                      <option value="Railway">🚂 Railway</option>
                      <option value="Other">📦 Other</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block mb-3 text-gray-900 font-semibold text-sm flex items-center gap-2">
                    Criticality Level *
                    <span className="text-red-500">●</span>
                  </label>
                  <div className="relative">
                    <select 
                      className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-medium transition-all focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 appearance-none cursor-pointer hover:border-gray-400"
                      required
                      value={formData.criticality}
                      onChange={e => setFormData({...formData, criticality: e.target.value})}
                    >
                      <option value="">Select Level</option>
                      <option value="critical">🔴 Critical (Immediate Action)</option>
                      <option value="high">🟠 High (Urgent)</option>
                      <option value="medium">🟡 Medium (Important)</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Criticality Preview */}
              {formData.criticality && (
                <div className={`p-4 rounded-xl border-2 ${getCriticalityBadgeColor(formData.criticality)}`}>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5" />
                    <div>
                      <div className="font-semibold uppercase tracking-wide text-xs mb-1">Selected Criticality</div>
                      <div className="font-bold text-lg capitalize">{formData.criticality}</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-3 text-gray-900 font-semibold text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Detailed Description *
                  <span className="text-red-500">●</span>
                </label>
                <textarea 
                  className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-medium placeholder-gray-500 transition-all focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 min-h-[160px] resize-y hover:border-gray-400"
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Provide detailed information about the damage, including severity, affected area, safety concerns, and any immediate actions taken..."
                ></textarea>
                <div className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  <span>Be as specific as possible to help emergency responders</span>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Contact Information</h2>
                  <p className="text-sm text-gray-600">How can we reach you?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-3 text-gray-900 font-semibold text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Reporter Name
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-gray-100 border-2 border-gray-300 rounded-xl text-gray-600 font-medium placeholder-gray-500 transition-all focus:outline-none "
                    value={formData.reporterName}
                    onChange={e => setFormData({...formData, reporterName: e.target.value})}
                    // readOnly
                    // disabled
                  />
                </div>

                <div>
                  <label className="block mb-3 text-gray-900 font-semibold text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Number *
                    <span className="text-red-500">●</span>
                  </label>
                  <input 
                    type="tel" 
                    className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-medium placeholder-gray-500 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 hover:border-gray-400"
                    required
                    value={formData.contactNumber}
                    onChange={e => setFormData({...formData, contactNumber: e.target.value})}
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button 
                type="submit" 
                disabled={submitting}
                className={`w-full p-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg ${
                  submitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : `bg-gradient-to-r ${getCriticalityColor(formData.criticality || 'medium')} hover:scale-[1.02] hover:shadow-xl`
                } text-white`}
              >
                {submitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Report...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    <span>Submit Damage Report</span>
                  </>
                )}
              </button>
              
              <p className="text-center text-sm text-gray-600 mt-4">
                By submitting, you confirm that the information provided is accurate
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideRight {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ReportForm;