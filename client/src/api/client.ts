import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach auth headers
apiClient.interceptors.request.use((config) => {
  const userId = localStorage.getItem('demo_user_id');
  const orgId = localStorage.getItem('demo_org_id');

  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  if (orgId) {
    config.headers['x-organization-id'] = orgId;
  }

  return config;
});

// Interceptor for error formatting
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Extract standardized backend error
    if (error.response && error.response.data && error.response.data.error) {
      return Promise.reject(error.response.data.error);
    }
    return Promise.reject(error);
  }
);
