import axios from 'axios';
import { authClient } from './auth-client';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Request interceptor — session token header এ পাঠাও
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const session = await authClient.getSession();
    if (session?.data?.session?.token) {
      config.headers['Authorization'] = `Bearer ${session.data.session.token}`;
    }
  } catch (err) {
    // session নেই
  }
  return config;
});

export default axiosInstance;