import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      alert('Too many requests. Please try again later.');
    }
    return Promise.reject(error);
  }
);

export const districtAPI = {
  getDistricts: (state) => api.get(`/districts?state=${state}`),
  getDistrictData: (state, district, finYear) => 
    api.get(`/district-data`, { params: { state, district, finYear } }),
  getHistoricalData: (state, district) => 
    api.get(`/historical-data`, { params: { state, district } }),
  reverseGeocode: (lat, lng) => 
    api.get(`/reverse-geocode`, { params: { lat, lng } }),
};

export default api;
