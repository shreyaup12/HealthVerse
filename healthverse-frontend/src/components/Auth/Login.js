// src/components/Auth/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Flower2, Mail, Lock, Eye, EyeOff, Heart } from 'lucide-react';
import './AuthForm.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { email, password } = formData;

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      {/* Background decoration */}
      <div className="auth-background">
        <div className="auth-decoration auth-decoration-1"></div>
        <div className="auth-decoration auth-decoration-2"></div>
        <div className="auth-decoration auth-decoration-3"></div>
      </div>

      <div className="auth-content">
        {/* Left side - Branding */}
        <div className="auth-branding">
          <div className="brand-logo">
            <Flower2 className="brand-icon" />
            <h1 className="brand-title">HealthVerse</h1>
          </div>
          <div className="brand-tagline">
            <Heart className="tagline-icon" />
            <p>Your journey to mental wellness starts here</p>
          </div>
          <div className="brand-features">
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>AI-powered health insights</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Personalized wellness tracking</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Mindfulness & meditation tools</span>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h2 className="auth-title">Welcome back!</h2>
              <p className="auth-subtitle">Sign in to continue your wellness journey</p>
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="input-group">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-group">
                  <Lock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="password-toggle"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p className="auth-switch">
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Sign up now
                </Link>
              </p>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;