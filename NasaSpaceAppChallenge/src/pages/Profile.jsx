import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Modal from '../components/Modal';
import MapPicker from '../components/MapPicker';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Trash2,
  AlertTriangle,
  Activity,
  Thermometer,
  Wind,
  CloudRain,
  Droplets,
  Cloud,
  Map,
} from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [forecasts, setForecasts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [isConfirmingLocation, setIsConfirmingLocation] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/favorite-locations`);
      
      let favoritesData = [];
      if (Array.isArray(response.data)) {
        favoritesData = response.data;
      } else if (response.data?.location) {
        favoritesData = [response.data.location];
      } else if (response.data?.locations) {
        favoritesData = response.data.locations;
      } else if (typeof response.data === 'object' && response.data !== null) {
        favoritesData = [response.data];
      }
      
      setFavorites(favoritesData);

      if (Array.isArray(favoritesData) && favoritesData.length > 0 && favoritesData.some(loc => loc && loc.id)) {
        const forecastsData = {};
        for (const location of favoritesData) {
          if (!location || !location.id) continue;

          try {
            const forecastResponse = await api.get(
              `/favorite-locations/${location.id}/forecast`
            );
            
            let forecastData = forecastResponse.data;
            
            if (Array.isArray(forecastData) && forecastData.length > 0) {
              forecastData = forecastData[0];
            }
            else if (forecastData?.forecast) {
              let extracted = forecastData.forecast;
              if (Array.isArray(extracted) && extracted.length > 0) {
                extracted = extracted[0];
              }
              forecastData = extracted;
            } else if (forecastData?.weather) {
              let extracted = forecastData.weather;
              if (Array.isArray(extracted) && extracted.length > 0) {
                extracted = extracted[0];
              }
              forecastData = extracted;
            }
            
            forecastsData[location.id] = forecastData;
          } catch (err) {
            forecastsData[location.id] = null;
          }
        }
        setForecasts(forecastsData);
      } else {
        setForecasts({});
      }
    } catch (err) {
      setError('Failed to load favorite locations');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = (location) => {
    setSelectedLocation(location);
    setIsConfirmingLocation(true);
  };

  const handleConfirmLocation = async () => {
    if (!selectedLocation || !locationName.trim()) {
      alert('Por favor ingresa un nombre para la ubicación');
      return;
    }

    try {
      const response = await api.post('/favorite-locations', {
        name: locationName,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      });

      if (response.status === 201) {
        setIsModalOpen(false);
        setSelectedLocation(null);
        setLocationName('');
        setIsConfirmingLocation(false);
        await fetchFavorites();
      }
    } catch (err) {
      alert('Error agregando ubicación: ' + err.message);
    }
  };

  const handleCancelLocation = () => {
    setIsConfirmingLocation(false);
    setLocationName('');
    setSelectedLocation(null);
  };

  const handleDeleteLocation = async (locationId) => {
    try {
      await api.delete(`/favorite-locations/${locationId}`);
      fetchFavorites();
    } catch (err) {
      setError('Failed to delete location');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatWeatherPreview = (forecast) => {
    if (!forecast) return 'N/A';
    
    try {
      let temp = forecast.temperature || forecast.predicted?.temperature;
      if (!temp) return 'N/A';
      
      const max = temp.max?.value || temp.max || 'N/A';
      const min = temp.min?.value || temp.min || 'N/A';
      return `${max}°C / ${min}°C`;
    } catch (err) {
      return 'N/A';
    }
  };

  const getWeatherIcon = (forecast) => {
    if (!forecast) return null;

    try {
      const precipitation = forecast.precipitation || forecast.predicted?.precipitation || 0;
      const windSpeed = forecast.wind_speed?.value || forecast.wind_speed || forecast.predicted?.wind_speed?.value || 0;
      const humidity = forecast.humidity?.value || forecast.humidity || forecast.predicted?.humidity?.value || 0;

      if (precipitation > 10) {
        return <CloudRain size={20} style={{ color: '#3b82f6' }} />;
      } else if (windSpeed > 15) {
        return <Wind size={20} style={{ color: '#f59e0b' }} />;
      } else if (humidity > 80) {
        return <Droplets size={20} style={{ color: '#8b5cf6' }} />;
      }
      return <Cloud size={20} style={{ color: '#6b7280' }} />;
    } catch (err) {
      return <Cloud size={20} style={{ color: '#6b7280' }} />;
    }
  };

  const getWeatherDetails = (forecast) => {
    if (!forecast) return [];

    try {
      const details = [];
      
      const temp = forecast.temperature || forecast.predicted?.temperature;
      if (temp) {
        const max = temp.max?.value || temp.max || 'N/A';
        details.push({ 
          icon: <Thermometer size={16} />, 
          label: `${max}°C`,
          color: '#ef4444'
        });
      }

      const wind = forecast.wind_speed || forecast.predicted?.wind_speed?.value || 0;
      if (wind) {
        details.push({ 
          icon: <Wind size={16} />, 
          label: `${wind} m/s`,
          color: '#f59e0b'
        });
      }

      const rain = forecast.precipitation || forecast.predicted?.precipitation || 0;
      if (rain) {
        details.push({ 
          icon: <CloudRain size={16} />, 
          label: `${rain} mm`,
          color: '#3b82f6'
        });
      }

      const humidity = forecast.humidity || forecast.predicted?.humidity?.value || 0;
      if (humidity) {
        details.push({ 
          icon: <Droplets size={16} />, 
          label: `${humidity}%`,
          color: '#8b5cf6'
        });
      }

      return details;
    } catch (err) {
      return [];
    }
  };

  return (
    <div className="profile-container">
      {!user ? (
        <div className="profile-not-logged-in">
          <MapPin size={60} style={{ color: 'var(--primary-blue)' }} />
          <h2>Sign in to view your favorite locations</h2>
          <p>Create an account or log in to save and manage your favorite weather locations.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              className="add-location-btn"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="add-location-btn"
              onClick={() => navigate('/register')}
              style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}
            >
              Register
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="profile-header">
            <button className="profile-back" onClick={() => navigate('/')}>
              <ArrowLeft size={18} />
              Back to Home
            </button>
            <div className="profile-info">
              <h1 className="profile-title">My Profile</h1>
              <p className="profile-username">@{user?.username}</p>
            </div>
            <button className="profile-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <div className="profile-content">
            <div className="favorites-section">
              <div className="favorites-header">
                <h2>
              <MapPin size={24} />
              Favorite Locations
            </h2>
            <button
              className="add-location-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              Add Location
            </button>
          </div>

          {error && (
            <div className="profile-error">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="loading-spinner">
              <Activity size={24} />
              <p>Loading locations...</p>
            </div>
          ) : !Array.isArray(favorites) || favorites.length === 0 ? (
            <div className="empty-state">
              <MapPin size={40} />
              <h3>No Favorite Locations Yet</h3>
              <p>Add your first favorite location to get started!</p>
              <button
                className="add-location-btn"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={18} />
                Add First Location
              </button>
            </div>
          ) : (
            <div className="favorites-grid">
              {Array.isArray(favorites) && favorites.map((location) => (
                <div key={location.id} className="favorite-card">
                  <div className="card-header">
                    <div className="location-info">
                      <h3>{location.name || 'Location'}</h3>
                      <p className="coordinates">
                        {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                      </p>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteLocation(location.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {forecasts[location.id] ? (
                    <div className="forecast-preview">
                      <div className="forecast-main">
                        <div className="forecast-icon">
                          {getWeatherIcon(forecasts[location.id])}
                        </div>
                        <div className="forecast-info">
                          <p className="temperature">
                            {formatWeatherPreview(forecasts[location.id])}
                          </p>
                          <p className="forecast-date">
                            {forecasts[location.id].date || 'Hoy'}
                          </p>
                        </div>
                      </div>
                      <div className="forecast-details">
                        {getWeatherDetails(forecasts[location.id]).map((detail, idx) => (
                          <div key={idx} className="detail-item" style={{ color: detail.color }}>
                            {detail.icon}
                            <span>{detail.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="forecast-loading">
                      <Activity size={16} />
                      <span>Loading forecast...</span>
                    </div>
                  )}

                  <div className="card-footer">
                    <button
                      className="view-details-btn"
                      onClick={() =>
                        navigate('/favorite-forecast', {
                          state: {
                            locationId: location.id,
                          },
                        })
                      }
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for adding location */}
      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setSelectedLocation(null);
        setIsConfirmingLocation(false);
        setLocationName('');
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'transparent',
        }}>
          {!isConfirmingLocation ? (
            <>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                margin: '0 0 1.5rem 0',
                color: 'var(--text-primary)',
                fontSize: '1.5rem',
                fontWeight: '600',
              }}>
                <Map size={24} />
                Select a Location
              </h3>
              
              {/* Display selected location */}
              {selectedLocation && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  margin: '0 0 1.5rem 0',
                  padding: '1rem',
                  background: 'var(--surface-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}>
                  <MapPin size={16} />
                  <span>Location: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</span>
                </div>
              )}
              
              <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
              }}>
                <MapPicker onSelect={handleAddLocation} />
              </div>
            </>
          ) : (
            <>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                margin: '0 0 1.5rem 0',
                color: 'var(--text-primary)',
                fontSize: '1.5rem',
                fontWeight: '600',
              }}>
                <MapPin size={24} />
                Confirm Location
              </h3>

              {/* Display selected location coordinates */}
              <div style={{
                padding: '1rem',
                background: 'var(--surface-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}>
                <p style={{ margin: '0.5rem 0' }}>
                  <strong>Latitude:</strong> {selectedLocation.lat.toFixed(6)}
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                  <strong>Longitude:</strong> {selectedLocation.lng.toFixed(6)}
                </p>
              </div>

              {/* Location name input */}
              <input
                type="text"
                placeholder="Enter location name (e.g., My House, Office)"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-blue)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(100, 150, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-medium)';
                  e.target.style.boxShadow = 'none';
                }}
              />

              {/* Action buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <button
                  onClick={handleCancelLocation}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--surface-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--surface-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'var(--surface-tertiary)';
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmLocation}
                  disabled={!locationName.trim()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: locationName.trim() ? 'linear-gradient(135deg, #4ade80, #22c55e)' : 'var(--surface-tertiary)',
                    border: 'none',
                    color: locationName.trim() ? 'white' : 'var(--text-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    cursor: locationName.trim() ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    opacity: locationName.trim() ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => {
                    if (locationName.trim()) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = 'var(--shadow-soft)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <Plus size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
                  Add Location
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
        </>
      )}
    </div>
  );
}
