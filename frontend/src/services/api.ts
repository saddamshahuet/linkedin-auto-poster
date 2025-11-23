import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    organizationName?: string;
  }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Posts
  async getPosts(organizationId: string, params?: any) {
    const response = await this.client.get(`/organizations/${organizationId}/posts`, { params });
    return response.data;
  }

  async getPost(organizationId: string, postId: string) {
    const response = await this.client.get(`/organizations/${organizationId}/posts/${postId}`);
    return response.data;
  }

  async createPost(organizationId: string, data: any) {
    const response = await this.client.post(`/organizations/${organizationId}/posts`, data);
    return response.data;
  }

  async updatePost(organizationId: string, postId: string, data: any) {
    const response = await this.client.patch(
      `/organizations/${organizationId}/posts/${postId}`,
      data
    );
    return response.data;
  }

  async deletePost(organizationId: string, postId: string) {
    const response = await this.client.delete(`/organizations/${organizationId}/posts/${postId}`);
    return response.data;
  }

  async publishPost(organizationId: string, postId: string) {
    const response = await this.client.post(
      `/organizations/${organizationId}/posts/${postId}/publish`
    );
    return response.data;
  }

  async getScheduledPosts(organizationId: string, startDate?: string, endDate?: string) {
    const response = await this.client.get(
      `/organizations/${organizationId}/posts/scheduled`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  }

  // Accounts
  async getAccounts(organizationId: string) {
    const response = await this.client.get(`/organizations/${organizationId}/accounts`);
    return response.data;
  }

  async connectAccount(organizationId: string, data: any) {
    const response = await this.client.post(`/organizations/${organizationId}/accounts`, data);
    return response.data;
  }

  async deleteAccount(organizationId: string, accountId: string) {
    const response = await this.client.delete(
      `/organizations/${organizationId}/accounts/${accountId}`
    );
    return response.data;
  }

  // Content
  async generateContent(organizationId: string, data: any) {
    const response = await this.client.post(
      `/organizations/${organizationId}/content/generate`,
      data
    );
    return response.data;
  }

  async getTemplates(organizationId: string) {
    const response = await this.client.get(`/organizations/${organizationId}/content/templates`);
    return response.data;
  }

  // Analytics
  async getAnalytics(organizationId: string, params?: any) {
    const response = await this.client.get(`/organizations/${organizationId}/analytics/overview`, {
      params,
    });
    return response.data;
  }

  // Subscriptions
  async getSubscription(organizationId: string) {
    const response = await this.client.get(`/organizations/${organizationId}/subscriptions`);
    return response.data;
  }

  async createCheckoutSession(organizationId: string, planId: string) {
    const response = await this.client.post(
      `/organizations/${organizationId}/subscriptions/checkout`,
      { planId }
    );
    return response.data;
  }

  // Organizations
  async getOrganizations() {
    const response = await this.client.get('/organizations');
    return response.data;
  }

  async getOrganization(organizationId: string) {
    const response = await this.client.get(`/organizations/${organizationId}`);
    return response.data;
  }

  async getMembers(organizationId: string) {
    const response = await this.client.get(`/organizations/${organizationId}/members`);
    return response.data;
  }
}

export const api = new ApiClient();
