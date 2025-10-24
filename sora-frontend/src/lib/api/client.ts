import axios from 'axios';
import { stackClientApp } from '@/stack-client';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Stack Auth token to requests
// Note: Stack Auth uses cookies for authentication, but we need to extract
// the JWT token to send in the Authorization header for the backend API
apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    try {
      // Stack Auth stores the JWT in cookies with format "stack-client-access-token-{projectId}"
      // For now, we'll extract it from document.cookie
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(c => c.trim().startsWith('stack-client-access-token'));

      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        if (token) {
          config.headers.Authorization = `Bearer ${decodeURIComponent(token)}`;
        }
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to sign-in
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
