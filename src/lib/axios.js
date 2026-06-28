import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
  try {
    const res = await fetch('/api/auth/get-session');
    const data = await res.json();
    if (data?.session?.token) {
      config.headers['Authorization'] = `Bearer ${data.session.token}`;
    }
  } catch (err) {}
  return config;
});

export default axiosInstance;