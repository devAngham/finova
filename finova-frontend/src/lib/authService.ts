import api from './api';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string };
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async register(
    name: string,
    email: string,
    phone: string,
    password: string,
  ): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      phone,
      password,
    });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  logout(): void {
    localStorage.clear();
    window.location.href = '/login';
  },

  getUser(): AuthResponse['user'] | null {
    const u = localStorage.getItem('user');
    return u ? (JSON.parse(u) as AuthResponse['user']) : null;
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};
