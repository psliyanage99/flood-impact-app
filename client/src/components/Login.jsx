import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User, Eye, EyeOff, AlertTriangle, CheckCircle, Loader, LogIn, UserPlus, ArrowLeft, KeyRound, Activity, UserCog } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [view, setView] = useState('login'); // login, register, forgot, admin
  const [formData, setFormData] = useState({ email: '', password: '', name: '', role: 'user' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('floodTrackerSession');
    if (savedUser) {
        // Logic handled in App.jsx
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    onLogin(userData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const endpoint = view === 'register' ? '/api/auth/register' : '/api/auth/login';
      const response = await axios.post(`http://localhost:8080${endpoint}`, formData);
      const userData = response.data;

      // --- SECURITY CHECK FOR ADMIN LOGIN ---
      if (view === 'admin') {
          // If user tries to login as admin but the DB says they are NOT an admin
          if (userData.role !== 'admin') {
              setError("Access Denied: You do not have Administrator privileges.");
              setLoading(false);
              return;
          }
          setSuccess('Admin credentials verified. Accessing Dashboard...');
      } else if (view === 'register') {
          setSuccess('Account created successfully!');
      } else {
          setSuccess('Login successful!');
      }

      // Proceed to login
      setTimeout(() => {
        handleLoginSuccess(userData);
      }, 1000);

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Authentication failed. Please check your credentials.';
      setError(errorMsg);
    } finally {
        if (view !== 'admin') { // Keep loading spinner for admin transition
            setLoading(false);
        }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        await axios.post('http://localhost:8080/api/auth/forgot-password', { email: formData.email });
        setSuccess(`Reset link sent to ${formData.email}`);
        setTimeout(() => setView('login'), 3000);
    } catch (err) {
        setError('Email address not found.');
    } finally {
        setLoading(false);
    }
  };

  // --- GOOGLE LOGIN HOOK ---
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const res = await axios.post('http://localhost:8080/api/auth/google', { token: tokenResponse.access_token });
        setSuccess('Google login successful!');
        setTimeout(() => handleLoginSuccess(res.data), 1000);
      } catch (err) {
        setError('Google login failed.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError('Google login failed.'),
  });

  const switchView = (newView) => {
    setView(newView);
    setError('');
    setSuccess('');
    // Reset form but keep role as 'user' by default for security
    setFormData({ email: '', password: '', name: '', role: 'user' });
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#e0e7ff_1px,transparent_1px),linear-gradient(to_bottom,#e0e7ff_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-md my-auto">
        <div className={`bg-white/80 backdrop-blur-xl border-2 ${view === 'admin' ? 'border-purple-300 shadow-purple-500/20' : 'border-gray-200'} rounded-3xl shadow-xl overflow-hidden transition-all duration-300`}>
          
          {/* Header */}
          <div className="p-6 md:p-8 pb-4 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${view === 'admin' ? 'from-purple-300/50 to-pink-300/50' : 'from-blue-300/50 to-indigo-300/50'} rounded-3xl blur-xl`}></div>
                <div className={`relative w-20 h-20 bg-gradient-to-br ${view === 'admin' ? 'from-purple-600 to-pink-600' : 'from-blue-600 to-indigo-600'} rounded-2xl flex items-center justify-center shadow-lg`}>
                  {view === 'admin' ? <UserCog className="w-10 h-10 text-white" /> : <Activity className="w-10 h-10 text-white" />}
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
              {view === 'admin' ? 'Admin Portal' : 'Infrastructure Command'}
            </h1>
            <p className="text-gray-600 text-sm font-medium">
              {view === 'admin' ? 'Secure Access Required' : 'Flood Damage Management System'}
            </p>
          </div>

          {/* Error/Success Messages */}
          <div className="px-6 md:px-8">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3 animate-[slideDown_0.3s_ease-out]">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 text-sm font-semibold">{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3 animate-[slideDown_0.3s_ease-out]">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 text-sm font-semibold">{success}</span>
              </div>
            )}
          </div>

          {/* Forms */}
          {view === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="px-6 md:px-8 pb-6 md:pb-8 space-y-4">
               <div className="text-center mb-4"><p className="text-gray-600 text-sm">Enter email to reset password</p></div>
               <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl" placeholder="Email" />
               <button type="submit" disabled={loading} className="w-full p-4 bg-blue-600 text-white rounded-xl font-bold">{loading ? 'Sending...' : 'Send Link'}</button>
               <button type="button" onClick={() => switchView('login')} className="w-full py-2 text-sm text-gray-600 font-semibold">Back to Login</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 md:px-8 pb-6 md:pb-8 space-y-4">
              {/* Registration Fields - Role Input is Hidden intentionally */}
              {view === 'register' && (
                <div className="relative">
                  <input type="text" className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl font-medium" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              )}

              <div className="relative">
                <input type="email" className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl font-medium" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="w-full p-4 pl-12 pr-12 bg-white border-2 border-gray-200 rounded-xl font-medium" placeholder="Password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>

              {view === 'login' && (
                 <div className="flex justify-between items-center text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-600"><input type="checkbox" className="w-4 h-4 rounded text-blue-600" /> Remember me</label>
                    <button type="button" onClick={() => switchView('forgot')} className="text-blue-600 font-semibold">Forgot password?</button>
                 </div>
              )}

              <button type="submit" disabled={loading} className={`w-full p-4 ${view === 'admin' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all`}>
                {loading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : (view === 'register' ? 'Create Account' : (view === 'admin' ? 'Access Dashboard' : 'Sign In'))}
              </button>

              {/* --- GOOGLE LOGIN BUTTON (Restored) --- */}
              {view !== 'admin' && view !== 'forgot' && (
                <button
                  type="button"
                  onClick={() => googleLogin()}
                  disabled={googleLoading}
                  className="w-full p-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold shadow-sm hover:bg-gray-50 flex items-center justify-center gap-3 transition-all"
                >
                  {googleLoading ? <Loader className="w-5 h-5 animate-spin" /> : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Continue with Google
                    </>
                  )}
                </button>
              )}

              {/* Admin Toggle & Links */}
              {view !== 'admin' ? (
                  <div className="space-y-4 pt-2">
                      <div className="relative flex justify-center text-xs text-gray-500 font-bold"><span>OR</span></div>
                      <div className="flex gap-2">
                          <button type="button" onClick={() => switchView(view === 'login' ? 'register' : 'login')} className="flex-1 py-3 bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
                              {view === 'login' ? 'Create Account' : 'Back to Login'}
                          </button>
                          <button type="button" onClick={() => switchView('admin')} className="flex-1 py-3 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-100 transition-colors border border-purple-100">
                              Login as Admin
                          </button>
                      </div>
                  </div>
              ) : (
                  <button type="button" onClick={() => switchView('login')} className="w-full py-3 text-gray-600 font-semibold text-sm flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back to User Login
                  </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;