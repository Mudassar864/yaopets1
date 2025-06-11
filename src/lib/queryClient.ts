import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: 'http://yaopets.lat/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// API request function
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const config = {
      method,
      url,
      data,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        "X-Requested-With": "XMLHttpRequest"
      },
    };
    
    const response = await axiosInstance(config);
    
    // Convert axios response to fetch Response
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers as any),
    });
  } catch (error: any) {
    if (error.response) {
      // Return error response
      return new Response(JSON.stringify(error.response.data), {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: new Headers(error.response.headers),
      });
    }
    
    // Network error or other error
    throw error;
  }
}

// Query function for TanStack Query
type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn = <T>({ on401 = "throw" as UnauthorizedBehavior }) => {
  return async ({ queryKey }: { queryKey: (string | object)[] }) => {
    try {
      const [endpoint, params] = queryKey;
      const url = typeof endpoint === 'string' ? endpoint : '';
      
      const response = await axiosInstance.get(url, { params });
      return response.data as T;
    } catch (error: any) {
      if (error.response && error.response.status === 401 && on401 === "returnNull") {
        return null;
      }
      throw error;
    }
  };
};

// Create query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});