import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import { MapPin, X, Navigation, Crosshair, Check, Locate, Info, Zap } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon for light theme
const createCustomIcon = (color = '#3b82f6') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative;">
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, ${color}, ${color}dd);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.3);
          animation: pulse 2s ease-in-out infinite;
        "></div>
        <div style="
          position: absolute;
          top: 8px;
          left: 8px;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: rotate(-45deg) scale(1); }
          50% { transform: rotate(-45deg) scale(1.1); }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Component to handle map clicks and user location
const MapClickHandler = ({ onLocationSelect, selectedLocation, setUserLocation }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, [setUserLocation]);

  return null;
};

const LocationPickerMap = ({ onLocationSelect, onClose, initialLocation = null }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [userLocation, setUserLocation] = useState(null);
  const [showAccuracyCircle, setShowAccuracyCircle] = useState(true);
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const [mapReady, setMapReady] = useState(false);

  // Update coordinates display when location changes
  useEffect(() => {
    if (selectedLocation) {
      setCoordinates({
        lat: selectedLocation.lat.toFixed(6),
        lng: selectedLocation.lng.toFixed(6)
      });
    }
  }, [selectedLocation]);

  const handleLocationSelect = (latlng) => {
    setSelectedLocation(latlng);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  const handleUseMyLocation = () => {
    if (userLocation) {
      setSelectedLocation(userLocation);
    } else {
      // Try to get location again
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            setSelectedLocation(location);
          },
          (error) => {
            alert('Unable to access your location. Please select manually on the map.');
          }
        );
      }
    }
  };

  const handleClear = () => {
    setSelectedLocation(null);
    setCoordinates({ lat: '', lng: '' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 animate-[fadeIn_0.3s_ease-out]">
      {/* Animated background pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#e0e7ff_1px,transparent_1px),linear-gradient(to_bottom,#e0e7ff_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none"></div>
      
      {/* Top Control Panel */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-6 bg-gradient-to-b from-white/95 to-transparent backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 tracking-tight">
                  Pin Location
                </h2>
                <p className="text-sm text-gray-600 font-medium">Select the exact damage location on the map</p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-3 bg-gray-100 hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl transition-all group"
            >
              <X className="w-6 h-6 text-gray-600 group-hover:text-red-500 transition-colors" />
            </button>
          </div>

          {/* Instruction Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Instructions */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-900 font-semibold text-sm">Click anywhere on the map to set pin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    <span className="text-gray-600 text-sm">Or use your current location</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleUseMyLocation}
                  disabled={!userLocation && !navigator.geolocation}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Locate className="w-4 h-4" />
                  <span>Use My Location</span>
                </button>

                {selectedLocation && (
                  <button 
                    onClick={handleClear}
                    className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm transition-all"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Coordinates Display */}
            {selectedLocation && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1 font-semibold uppercase tracking-wide">Latitude</div>
                    <div className="text-lg font-bold text-gray-900 font-mono">{coordinates.lat}°</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1 font-semibold uppercase tracking-wide">Longitude</div>
                    <div className="text-lg font-bold text-gray-900 font-mono">{coordinates.lng}°</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="text-xs text-green-700 mb-1 font-semibold uppercase tracking-wide flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Status
                    </div>
                    <div className="text-lg font-bold text-green-700">Location Set</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-full">
        <MapContainer 
          center={initialLocation || [7.8731, 80.7718]} 
          zoom={initialLocation ? 15 : 8}
          className="w-full h-full"
          whenReady={() => setMapReady(true)}
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          
          <MapClickHandler 
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
            setUserLocation={setUserLocation}
          />
          
          {/* Selected Location Marker */}
          {selectedLocation && (
            <>
              <Marker 
                position={[selectedLocation.lat, selectedLocation.lng]}
                icon={createCustomIcon('#3b82f6')}
              />
              {showAccuracyCircle && (
                <Circle
                  center={[selectedLocation.lat, selectedLocation.lng]}
                  radius={50}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                    weight: 2,
                    dashArray: '5, 10'
                  }}
                />
              )}
            </>
          )}
          
          {/* User Location Marker (if different from selected) */}
          {userLocation && (!selectedLocation || 
            (selectedLocation.lat !== userLocation.lat || selectedLocation.lng !== userLocation.lng)) && (
            <Marker 
              position={[userLocation.lat, userLocation.lng]}
              icon={createCustomIcon('#8b5cf6')}
            />
          )}
        </MapContainer>

        {/* Crosshair in center when no location selected */}
        {!selectedLocation && mapReady && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[999]">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <Crosshair className="w-12 h-12 text-blue-500 relative animate-pulse" strokeWidth={3} />
            </div>
          </div>
        )}

        {/* Map Controls - Bottom Right */}
        <div className="absolute bottom-6 right-6 z-[999] space-y-3">
          {/* Accuracy Circle Toggle */}
          {selectedLocation && (
            <button
              onClick={() => setShowAccuracyCircle(!showAccuracyCircle)}
              className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-105 ${
                showAccuracyCircle 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-white hover:bg-gray-50'
              } border ${showAccuracyCircle ? 'border-blue-500' : 'border-gray-300'}`}
              title="Toggle accuracy circle"
            >
              <Navigation className={`w-6 h-6 ${showAccuracyCircle ? 'text-white' : 'text-gray-600'}`} />
            </button>
          )}
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-6 left-6 z-[999] space-y-3">
          {selectedLocation && (
            <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Precision</div>
                  <div className="text-sm font-bold text-gray-900">±50 meters</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Confirmation Bar */}
      {selectedLocation && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] p-6 bg-gradient-to-t from-white/95 to-transparent backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold">Location Selected</div>
                    <div className="text-sm text-gray-600">
                      {coordinates.lat}°, {coordinates.lng}°
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={onClose}
                    className="flex-1 md:flex-none px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirm}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Check className="w-5 h-5" />
                    <span>Confirm Location</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .leaflet-container {
          background: #f8fafc;
        }
        
        .custom-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default LocationPickerMap;