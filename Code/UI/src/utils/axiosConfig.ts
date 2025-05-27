import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { showSessionExpiredToast } from './toastUtils';
// Interceptor to attach AuthToken to every request
axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('AuthToken='))?.split('=')[1];

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        showSessionExpiredToast();
      }
      return Promise.reject(error);
    }
  );

export default axios;
