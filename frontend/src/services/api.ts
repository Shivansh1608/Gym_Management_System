const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
  results?: number;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`Server returned error ${response.status}: ${text.slice(0, 100)}`);
        }
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Expected JSON response but received ${contentType || 'non-JSON'}`);
        }
      }

      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Request failed');
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Network error');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const token = response.data?.token || (response as any).token;
    if (token) {
      this.setToken(token);
    }
    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) {
    const response = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    const token = response.data?.token || (response as any).token;
    if (token) {
      this.setToken(token);
    }
    return response;
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Member Home
  async getMemberHomeData() {
    return this.request<any>('/member-home');
  }

  // Workouts
  async getMyWorkouts() {
    return this.request<{ workouts: any[] }>('/workouts');
  }

  async createWorkout(workout: any) {
    return this.request<any>('/workouts', {
      method: 'POST',
      body: JSON.stringify(workout),
    });
  }

  async updateWorkout(id: string, workout: any) {
    return this.request<any>(`/workouts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(workout),
    });
  }

  async deleteWorkout(id: string) {
    return this.request<any>(`/workouts/${id}`, {
      method: 'DELETE',
    });
  }

  async getWorkoutStats() {
    return this.request<any>('/workouts/stats');
  }

  // Progress
  async getMyProgress() {
    return this.request<{ progress: any[] }>('/progress');
  }

  async createProgress(progress: any) {
    return this.request<any>('/progress', {
      method: 'POST',
      body: JSON.stringify(progress),
    });
  }

  async getProgressStats() {
    return this.request<any>('/progress/stats');
  }

  // Sessions
  async getAvailableSessions(date?: string) {
    const query = date ? `?date=${date}` : '';
    return this.request<{ sessions: any[] }>(`/sessions/available${query}`);
  }

  async getMyBookings() {
    return this.request<{ bookings: any[] }>('/sessions/my-bookings');
  }

  async bookSession(sessionId: string) {
    return this.request<any>('/sessions/book', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async cancelBooking(bookingId: string) {
    return this.request<any>(`/sessions/cancel/${bookingId}`, {
      method: 'PATCH',
    });
  }

  // Check-ins
  async checkIn(location?: string) {
    return this.request<any>('/checkins', {
      method: 'POST',
      body: JSON.stringify({ location }),
    });
  }

  async getMyCheckIns() {
    return this.request<{ checkIns: any[] }>('/checkins');
  }

  // Members (Admin)
  async getAllMembers(status?: string, search?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ members: any[] }>(`/members${query}`);
  }

  // Analytics (Admin)
  async getDashboardStats() {
    return this.request<any>('/analytics/dashboard');
  }

  async getRevenueAnalytics(months?: number) {
    const query = months ? `?months=${months}` : '';
    return this.request<any>(`/analytics/revenue${query}`);
  }

  // Staff (Admin)
  async getAllStaff(filter?: string) {
    const query = filter ? `?filter=${filter}` : '';
    return this.request<{ staff: any[] }>(`/staff${query}`);
  }

  // Workout Plans
  async getAllPlans(category?: string) {
    const query = category ? `?category=${category}` : '';
    return this.request<{ plans: any[] }>(`/plans${query}`);
  }

  async createPlan(plan: any) {
    return this.request<any>('/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }

  async assignPlan(planId: string, memberId: string) {
    return this.request<any>(`/plans/${planId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ memberId }),
    });
  }

  async updatePlan(id: string, plan: any) {
    return this.request<any>(`/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(plan),
    });
  }

  async deletePlan(id: string) {
    return this.request<any>(`/plans/${id}`, {
      method: 'DELETE',
    });
  }

  // Members (Admin) - CRUD
  async getMember(id: string) {
    return this.request<any>(`/members/${id}`);
  }

  async createMember(member: any) {
    return this.request<any>('/members', {
      method: 'POST',
      body: JSON.stringify(member),
    });
  }

  async updateMember(id: string, member: any) {
    return this.request<any>(`/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(member),
    });
  }

  async deleteMember(id: string) {
    return this.request<any>(`/members/${id}`, {
      method: 'DELETE',
    });
  }

  // Sessions (Trainer/Admin)
  async createSession(session: any) {
    return this.request<any>('/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  async getTrainerSessions(params?: { trainerId?: string; date?: string } | string) {
    let query = '';
    if (typeof params === 'string') {
      query = `?date=${params}`;
    } else if (params) {
      const q = new URLSearchParams();
      if (params.trainerId) q.append('trainerId', params.trainerId);
      if (params.date) q.append('date', params.date);
      query = q.toString() ? `?${q.toString()}` : '';
    }
    return this.request<{ sessions: any[] }>(`/sessions/trainer${query}`);
  }

  async updateSession(id: string, session: any) {
    return this.request<any>(`/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(session),
    });
  }

  async deleteSession(id: string) {
    return this.request<any>(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  // Trainer Clients
  async getTrainerClients() {
    return this.request<{ clients: any[] }>('/trainer/clients');
  }

  // Staff (Admin)
  async createStaff(staff: any) {
    return this.request<any>('/staff', {
      method: 'POST',
      body: JSON.stringify(staff),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;

