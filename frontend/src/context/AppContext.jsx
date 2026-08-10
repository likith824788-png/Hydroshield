import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { weatherAPI, floodAPI, settingsAPI } from '../api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [weather, setWeather] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [settings, setSettings] = useState({
    latitude: 13.0827,
    longitude: 80.2707,
    location_name: 'Chennai, India',
    refresh_interval_seconds: 30,
  });
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingPrediction, setLoadingPrediction] = useState(true);
  const [weatherError, setWeatherError] = useState(null);

  const loadSettings = useCallback(async () => {
    try {
      const res = await settingsAPI.get();
      if (res?.data) setSettings(res.data);
    } catch {
      // Use defaults
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    setLoadingWeather(true);
    setWeatherError(null);
    try {
      const res = await weatherAPI.get(settings.latitude, settings.longitude);
      setWeather(res?.data || null);
    } catch (e) {
      setWeatherError(e.message);
    } finally {
      setLoadingWeather(false);
    }
  }, [settings.latitude, settings.longitude]);

  const fetchPrediction = useCallback(async () => {
    setLoadingPrediction(true);
    try {
      const res = await floodAPI.getPrediction(settings.latitude, settings.longitude);
      setPrediction(res?.data || null);
    } catch {
      // Keep previous
    } finally {
      setLoadingPrediction(false);
    }
  }, [settings.latitude, settings.longitude]);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    fetchWeather();
    fetchPrediction();
    const interval = setInterval(() => {
      fetchWeather();
      fetchPrediction();
    }, (settings.refresh_interval_seconds || 30) * 1000);
    return () => clearInterval(interval);
  }, [settings.latitude, settings.longitude, settings.refresh_interval_seconds]);

  const refreshData = () => {
    fetchWeather();
    fetchPrediction();
  };

  return (
    <AppContext.Provider value={{
      weather, prediction, settings, setSettings,
      loadingWeather, loadingPrediction, weatherError,
      refreshData, loadSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
