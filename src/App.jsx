import React, { useState, useEffect } from 'react';
import { Search, MapPin, Wind, Droplets, Sun, Cloud, CloudRain, CloudLightning, CloudSnow } from 'lucide-react';
import './index.css';

const WeatherApp = () => {
  const [search, setSearch] = useState('Helsinki');
  const [location, setLocation] = useState({ name: 'Helsinki', country: 'Finland', lat: 60.1695, lon: 24.9354 });
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeatherData = async (lat, lon) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const data = await response.json();
      setWeather(data.current);
      
      const forecastData = data.daily.time.map((time, index) => ({
        date: new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
        max: Math.round(data.daily.temperature_2m_max[index]),
        min: Math.round(data.daily.temperature_2m_min[index]),
        code: data.daily.weather_code[index]
      }));
      setForecast(forecastData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch weather data');
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search) return;

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${search}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      if (geoData.results && geoData.results.length > 0) {
        const result = geoData.results[0];
        const newLocation = {
          name: result.name,
          country: result.country,
          lat: result.latitude,
          lon: result.longitude
        };
        setLocation(newLocation);
        fetchWeatherData(result.latitude, result.longitude);
        setError(null);
      } else {
        setError('Location not found');
      }
    } catch (err) {
      setError('Search failed');
    }
  };

  useEffect(() => {
    fetchWeatherData(location.lat, location.lon);
  }, []);

  const getWeatherIcon = (code, size = 24, className = "") => {
    if (code === 0) return <Sun size={size} className={className} color="#fbbf24" />;
    if (code <= 3) return <Cloud size={size} className={className} color="#94a3b8" />;
    if (code <= 48) return <Cloud size={size} className={className} color="#64748b" />;
    if (code <= 67) return <CloudRain size={size} className={className} color="#38bdf8" />;
    if (code <= 77) return <CloudSnow size={size} className={className} color="#e2e8f0" />;
    if (code <= 82) return <CloudRain size={size} className={className} color="#0284c7" />;
    if (code <= 99) return <CloudLightning size={size} className={className} color="#818cf8" />;
    return <Sun size={size} className={className} color="#fbbf24" />;
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return 'Clear Sky';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 67) return 'Rainy';
    if (code <= 77) return 'Snowy';
    if (code <= 82) return 'Rain Showers';
    if (code <= 99) return 'Thunderstorm';
    return 'Clear';
  };

  return (
    <div className="app-container">
      <header className="header fade-in">
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>
        <div className="location-badge glass" style={{ padding: '0.8rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={18} color="#38bdf8" />
          <span style={{ fontWeight: 500 }}>{location.name}, {location.country}</span>
        </div>
      </header>

      {error && (
        <div className="glass fade-in" style={{ padding: '1rem', textAlign: 'center', color: '#f87171', border: '1px solid #f87171' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass fade-in" style={{ padding: '5rem', textAlign: 'center' }}>
          <div className="loader">Loading...</div>
        </div>
      ) : weather && (
        <>
          <main className="weather-card glass fade-in">
            <div className="weather-info">
              <h1 className="location-name">{location.name}</h1>
              <p className="weather-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              
              <div className="temp-main">
                {Math.round(weather.temperature_2m)}°
              </div>
              <p className="condition-text">{getWeatherDescription(weather.weather_code)}</p>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Feels Like</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="detail-value">{Math.round(weather.apparent_temperature)}°</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Humidity</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Droplets size={16} color="#38bdf8" />
                    <span className="detail-value">{weather.relative_humidity_2m}%</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Wind Speed</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wind size={16} color="#38bdf8" />
                    <span className="detail-value">{weather.wind_speed_10m} km/h</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="weather-visual">
              {getWeatherIcon(weather.weather_code, 180)}
            </div>
          </main>

          <section className="forecast-section fade-in">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>7-Day Forecast</h2>
            <div className="forecast-container">
              {forecast.map((day, i) => (
                <div key={i} className="forecast-item glass">
                  <span className="forecast-day">{day.date}</span>
                  <div className="forecast-icon">
                    {getWeatherIcon(day.code, 40)}
                  </div>
                  <div className="forecast-temp">
                    {day.max}° <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{day.min}°</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default WeatherApp;
