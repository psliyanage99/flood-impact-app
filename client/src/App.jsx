import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import Header from './components/Header';
import LocationPickerMap from './components/LocationPickerMap';
import { Loader } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [pickedLocation, setPickedLocation] = useState(null);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const SESSION_DURATION = 5 * 60 * 1000; 

  useEffect(() => {
    const checkSession = () => {
      const storedData = localStorage.getItem('floodTrackerSession');
      
      if (storedData) {
        const { user: storedUser, expiry } = JSON.parse(storedData);
        const now = new Date().getTime();

        if (now > expiry) {
          console.log("Session expired. Logging out.");
          localStorage.removeItem('floodTrackerSession');
          setUser(null);
        } else {
          setUser(storedUser);
        }
      }
      setIsInitializing(false);
    };

    checkSession();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    const sessionData = {
      user: userData,
      expiry: new Date().getTime() + SESSION_DURATION
    };
    localStorage.setItem('floodTrackerSession', JSON.stringify(sessionData));
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    setPickedLocation(null);
    localStorage.removeItem('floodTrackerSession'); 
  };

  const openMapPicker = () => {
    setCurrentView('map-picker');
  };

  const handleLocationSelected = (latlng) => {
    setPickedLocation(latlng); 
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="app-container font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
          {currentView !== 'map-picker' && (
             <Header 
                user={user} 
                onLogout={handleLogout} 
                currentView={currentView} 
                onReportClick={() => {
                    setPickedLocation(null); 
                    setCurrentView('report-form');
                }}
                onDashboardClick={() => setCurrentView('dashboard')}
             />
          )}
          
          <main className="flex-1 w-full">
            {currentView === 'dashboard' && (
                <Dashboard user={user} onLogout={handleLogout} />
            )}
            
            {currentView === 'map-picker' && (
              <LocationPickerMap 
                  onLocationSelect={handleLocationSelected} 
                  onClose={() => setCurrentView('report-form')} 
                  initialLocation={pickedLocation}
              />
            )}

            {currentView === 'report-form' && (
              <ReportForm 
                  user={user} 
                  initialLocation={pickedLocation} 
                  onOpenMapPicker={openMapPicker} 
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;