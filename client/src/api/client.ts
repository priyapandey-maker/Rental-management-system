import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor ─────────────────────────────────────────────────────
// Attaches the JWT Bearer token from localStorage to every request.
apiClient.interceptors.request.use((config) => {
  const jwt = localStorage.getItem('jwt_token');
  if (jwt) {
    config.headers['Authorization'] = `Bearer ${jwt}`;
  }
  return config;
});

// ── Response interceptor ────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  // Success: unwrap .data so callers get the payload directly
  (response) => response.data,

  (error) => {
    const status = error.response?.status;

    // 401 Unauthorized — session is invalid/expired. Clear state & redirect to login.
    if (status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('demo_user_id');
      localStorage.removeItem('demo_org_id');
      localStorage.removeItem('demo_user_role');
      // Avoid redirect loop if already on /login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // 403 Forbidden — authenticated but not authorized. Do NOT log out.
    // Just surface the error to the calling component.
    if (status === 403) {
      const backendMessage =
        error.response?.data?.error?.message ||
        'You do not have permission to access this resource.';
      return Promise.reject({ message: backendMessage, statusCode: 403 });
    }

    // All other errors — extract the backend error shape if present
    if (error.response?.data?.error) {
      return Promise.reject(error.response.data.error);
    }

    return Promise.reject(error);
  }
);
