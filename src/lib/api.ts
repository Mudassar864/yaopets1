import axios from "axios";

// Get base URL from Vite environment variable
const baseURL = import.meta.env.VITE_API_URL || "https://yaopets.lat/api";

// Create axios instance with base URL
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: any) => api.post("/auth/register", userData),
  login: (credentials: any) => api.post("/auth/login", credentials),
  getCurrentUser: () => api.get("/auth/me"),
  changePassword: (data: any) => api.post("/auth/change-password", data),
  requestPasswordReset: (email: string) =>
    api.post("/auth/request-reset", { email }),
  resetPassword: (data: any) => api.post("/auth/reset-password", data),
};

// User API
export const userAPI = {
  getProfile: (id: string) => api.get(`/users/${id}`),
  updateProfile: (data: any) => api.put("/users/profile", data),
  updateProfileImage: (formData: FormData) =>
    api.put("/users/profile/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  getUserPosts: (id: string, page = 1, limit = 10) =>
    api.get(`/users/${id}/posts?page=${page}&limit=${limit}`),
  getUserPets: (id: string) => api.get(`/users/${id}/pets`),
  getSavedPosts: (page = 1, limit = 10) =>
    api.get(`/users/saved/posts?page=${page}&limit=${limit}`),
  followUser: (id: string) => api.post(`/users/${id}/follow`),
  unfollowUser: (id: string) => api.delete(`/users/${id}/follow`),
  getFollowers: (id: string, page = 1, limit = 10) =>
    api.get(`/users/${id}/followers?page=${page}&limit=${limit}`),
  getFollowing: (id: string, page = 1, limit = 10) =>
    api.get(`/users/${id}/following?page=${page}&limit=${limit}`),
};

// Post API
export const postAPI = {
  createPost: (formData: FormData) =>
    api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  getPosts: (page = 1, limit = 10) =>
    api.get(`/posts?page=${page}&limit=${limit}`),
  getPostById: (id: string) => api.get(`/posts/${id}`),
  updatePost: (id: string, data: any) => api.put(`/posts/${id}`, data),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
  likePost: (id: string) => api.post(`/posts/${id}/like`),
  unlikePost: (id: string) => api.delete(`/posts/${id}/like`),
  savePost: (id: string) => api.post(`/posts/${id}/save`),
  unsavePost: (id: string) => api.delete(`/posts/${id}/save`),
  addComment: (id: string, data: any) =>
    api.post(`/posts/${id}/comments`, data),
  getComments: (id: string, page = 1, limit = 10) =>
    api.get(`/posts/${id}/comments?page=${page}&limit=${limit}`),
  likeComment: (id: string) => api.post(`/posts/comments/${id}/like`),
  unlikeComment: (id: string) => api.delete(`/posts/comments/${id}/like`),
  deleteComment: (id: string) => api.delete(`/posts/comments/${id}`),
};

// Pet API
export const petAPI = {
  createPet: (formData: FormData) =>
    api.post("/pets", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  getPets: (status?: string, page = 1, limit = 10) =>
    api.get(
      `/pets?${status ? `status=${status}&` : ""}page=${page}&limit=${limit}`
    ),
  getPetById: (id: string) => api.get(`/pets/${id}`),
  updatePet: (id: string, formData: FormData) =>
    api.put(`/pets/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deletePet: (id: string) => api.delete(`/pets/${id}`),
  reportFound: (id: string, data: any) => api.post(`/pets/${id}/found`, data),
  searchPets: (params: any) => api.get("/pets/search", { params }),
};

// Donation API
export const donationAPI = {
  createDonation: (formData: FormData) =>
    api.post("/donations", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  getDonations: (category?: string, page = 1, limit = 10) =>
    api.get(
      `/donations?${
        category ? `category=${category}&` : ""
      }page=${page}&limit=${limit}`
    ),
  getDonationById: (id: string) => api.get(`/donations/${id}`),
  updateDonation: (id: string, formData: FormData) =>
    api.put(`/donations/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deleteDonation: (id: string) => api.delete(`/donations/${id}`),
  searchDonations: (params: any) => api.get("/donations/search", { params }),
  reserveDonation: (id: string) => api.post(`/donations/${id}/reserve`),
};

// VetHelp API
export const vetHelpAPI = {
  createVetHelp: (formData: FormData) =>
    api.post("/vet-help", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  getVetHelp: (status?: string, page = 1, limit = 10) =>
    api.get(
      `/vet-help?${
        status ? `status=${status}&` : ""
      }page=${page}&limit=${limit}`
    ),
  getVetHelpById: (id: string) => api.get(`/vet-help/${id}`),
  updateVetHelp: (id: string, formData: FormData) =>
    api.put(`/vet-help/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deleteVetHelp: (id: string) => api.delete(`/vet-help/${id}`),
  getDonations: (id: string, page = 1, limit = 10) =>
    api.get(`/vet-help/${id}/donations?page=${page}&limit=${limit}`),
  createCheckoutSession: (data: any) =>
    api.post("/vet-help/checkout-session", data),
  createPaymentIntent: (data: any) =>
    api.post("/vet-help/payment-intent", data),
};

// Chat API
export const chatAPI = {
  getChats: () => api.get("/chats"),
  getOrCreateChat: (userId: string) => api.get(`/chats/user/${userId}`),
  getMessages: (chatId: string, page = 1, limit = 20) =>
    api.get(`/chats/${chatId}/messages?page=${page}&limit=${limit}`),
  sendMessage: (chatId: string, data: any) =>
    api.post(`/chats/${chatId}/messages`, data),
  sendMessageWithAttachment: (chatId: string, formData: FormData) =>
    api.post(`/chats/${chatId}/messages`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deleteMessage: (chatId: string, messageId: string) =>
    api.delete(`/chats/${chatId}/messages/${messageId}`),
  getUnreadCount: () => api.get("/chats/unread"),
};

// Upload API
export const uploadAPI = {
  uploadFile: (formData: FormData) =>
    api.post("/uploads/file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  uploadFiles: (formData: FormData) =>
    api.post("/uploads/files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  convertBlob: (formData: FormData) =>
    api.post("/uploads/blob", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default {
  auth: authAPI,
  user: userAPI,
  post: postAPI,
  pet: petAPI,
  donation: donationAPI,
  vetHelp: vetHelpAPI,
  chat: chatAPI,
  upload: uploadAPI,
};