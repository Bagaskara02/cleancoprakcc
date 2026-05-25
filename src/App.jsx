import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import Tracking from './pages/Tracking';
import Profile from './pages/Profile';
import Services from './pages/Services';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes - no navbar/footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with navbar + footer */}
        <Route path="/" element={
          <ProtectedRoute>
            <div className="app-layout">
              <Navbar />
              <main className="main-content"><Home /></main>
              <Footer />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/services" element={
          <ProtectedRoute>
            <div className="app-layout">
              <Navbar />
              <main className="main-content"><Services /></main>
              <Footer />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <div className="app-layout">
              <Navbar />
              <main className="main-content"><Orders /></main>
              <Footer />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute>
            <div className="app-layout">
              <Navbar />
              <main className="main-content"><Payment /></main>
              <Footer />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <div className="app-layout">
              <Navbar />
              <main className="main-content"><Chat /></main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <div className="app-layout">
              <Navbar />
              <main className="main-content"><Notifications /></main>
              <Footer />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/tracking" element={
          <ProtectedRoute>
            <div className="app-layout">
              <Navbar />
              <main className="main-content"><Tracking /></main>
              <Footer />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <div className="app-layout">
              <Navbar />
              <main className="main-content"><Profile /></main>
              <Footer />
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
