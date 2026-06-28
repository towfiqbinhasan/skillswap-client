import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Session token cache
let cachedToken = null;
let tokenExpiry = null;

const getSessionToken = async () => {
  try {
    // Cache check
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
      return cachedToken;
    }
    const res = await fetch('https://skillswap-client-2ngr.vercel.app/api/auth/get-session');
    const data = await res.json();
    if (data?.session?.token) {
      cachedToken = data.session.token;
      tokenExpiry = new Date(data.session.expiresAt);
      return cachedToken;
    }
  } catch (err) {
    console.error('Failed to get session token:', err);
  }
  return null;
};

axiosInstance.interceptors.request.use(async (config) => {
  try {
    const token = await getSessionToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {}
  return config;
});

export default axiosInstance;