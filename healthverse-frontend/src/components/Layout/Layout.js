// src/components/Layout/Layout.js
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  MessageCircle, 
  Heart, 
  Gamepad2, 
  Flower2, 
  User, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/chatbot', icon: MessageCircle, label: 'AI Chatbot' },
    { path: '/mood', icon: Heart, label: 'Mood Tracker' },
    { path: '/games', icon: Gamepad2, label: 'Brain Games' },
    { path: '/meditation', icon: Flower2, label: 'Meditation' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="layout">
      {/* Navigation Sidebar */}
      <nav className={`sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-content">
          {/* Logo */}
          <div className="sidebar-header">
            <Link to="/dashboard" className="logo">
              <Flower2 className="logo-icon" />
              <span className="logo-text">HealthVerse</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* User Profile */}
          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="user-avatar">
                <User className="user-icon" />
              </div>
              <div className="user-info">
                <p className="user-name">{user?.name}</p>
                <p className="user-email">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="logout-btn"
              title="Logout"
            >
              <LogOut className="logout-icon" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="mobile-header">
        <button 
          onClick={toggleMobileMenu}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
        <Link to="/dashboard" className="mobile-logo">
          <Flower2 className="logo-icon" />
          <span>HealthVerse</span>
        </Link>
        <div className="mobile-user">
          <User className="user-icon" />
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;