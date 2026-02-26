import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AuthSuccess from './components/AuthSuccess';
import './index.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />} />
          <Route path="/auth-success" element={<AuthSuccess setToken={setToken} />} />
          <Route path="/" element={token ? <Dashboard token={token} setToken={setToken} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
