import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* REPLACE WITH YOUR ACTUAL CLIENT ID */}
    <GoogleOAuthProvider clientId="1067543339348-7cl0t1fslpq76852j6vtkivehe80vl9f.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)