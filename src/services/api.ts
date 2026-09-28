// API client wrapper for Brewlytics

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('brewlytics_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  auth: {
    register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    demoLogin: () => request<any>('/auth/demo-login', { method: 'POST' }),
    firebaseLogin: (idToken: string) => request<any>('/auth/firebase-login', { method: 'POST', body: JSON.stringify({ idToken }) }),
    me: () => request<any>('/auth/me'),
    updateProfile: (body: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
    changePassword: (body: any) => request<any>('/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),
  },
  products: {
    getAll: (params?: { search?: string; category?: string }) => {
      const sp = new URLSearchParams();
      if (params?.search) sp.set('search', params.search);
      if (params?.category) sp.set('category', params.category);
      const q = sp.toString() ? `?${sp.toString()}` : '';
      return request<any[]>(`/products${q}`);
    },
    create: (body: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: number) => request<any>(`/products/${id}`, { method: 'DELETE' }),
  },
  customers: {
    getAll: (params?: { search?: string }) => {
      const sp = new URLSearchParams();
      if (params?.search) sp.set('search', params.search);
      const q = sp.toString() ? `?${sp.toString()}` : '';
      return request<any[]>(`/customers${q}`);
    },
    getById: (id: number) => request<any>(`/customers/${id}`),
    create: (body: any) => request<any>('/customers', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: any) => request<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: number) => request<any>(`/customers/${id}`, { method: 'DELETE' }),
  },
  sales: {
    getAll: (params?: { search?: string; paymentMethod?: string; startDate?: string; endDate?: string }) => {
      const sp = new URLSearchParams();
      if (params?.search) sp.set('search', params.search);
      if (params?.paymentMethod) sp.set('paymentMethod', params.paymentMethod);
      if (params?.startDate) sp.set('startDate', params.startDate);
      if (params?.endDate) sp.set('endDate', params.endDate);
      const q = sp.toString() ? `?${sp.toString()}` : '';
      return request<any[]>(`/sales${q}`);
    },
    getById: (id: number) => request<any>(`/sales/${id}`),
    create: (body: any) => request<any>('/sales', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: number) => request<any>(`/sales/${id}`, { method: 'DELETE' }),
  },
  expenses: {
    getAll: (params?: { search?: string; category?: string; startDate?: string; endDate?: string }) => {
      const sp = new URLSearchParams();
      if (params?.search) sp.set('search', params.search);
      if (params?.category) sp.set('category', params.category);
      if (params?.startDate) sp.set('startDate', params.startDate);
      if (params?.endDate) sp.set('endDate', params.endDate);
      const q = sp.toString() ? `?${sp.toString()}` : '';
      return request<any[]>(`/expenses${q}`);
    },
    create: (body: any) => request<any>('/expenses', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: any) => request<any>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: number) => request<any>(`/expenses/${id}`, { method: 'DELETE' }),
  },
  analytics: {
    getDashboard: (params?: { period?: string; startDate?: string; endDate?: string }) => {
      const sp = new URLSearchParams();
      if (params?.period) sp.set('period', params.period);
      if (params?.startDate) sp.set('startDate', params.startDate);
      if (params?.endDate) sp.set('endDate', params.endDate);
      const q = sp.toString() ? `?${sp.toString()}` : '';
      return request<any>(`/analytics/dashboard${q}`);
    },
    getRevenue: (params?: { period?: string }) => {
      const q = params?.period ? `?period=${params.period}` : '';
      return request<any>(`/analytics/revenue${q}`);
    },
    getProducts: (params?: { period?: string }) => {
      const q = params?.period ? `?period=${params.period}` : '';
      return request<any>(`/analytics/products${q}`);
    },
    getExpenses: (params?: { period?: string }) => {
      const q = params?.period ? `?period=${params.period}` : '';
      return request<any>(`/analytics/expenses${q}`);
    },
  },
  ai: {
    getHistory: () => request<any[]>('/ai/history'),
    sendMessage: (message: string) => request<any>('/ai/chat', { method: 'POST', body: JSON.stringify({ message }) }),
    clearHistory: () => request<any>('/ai/history', { method: 'DELETE' }),
  },
  demo: {
    seed: () => request<any>('/demo/seed', { method: 'POST' }),
    clear: () => request<any>('/demo/clear', { method: 'POST' }),
  },
};
