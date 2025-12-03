import api from './api'

interface LoginRequest {
  username: string
  password: string
}

interface RegisterRequest {
  username: string
  email: string
  password: string
}

interface AuthResponse {
  token: string
}

interface User {
  id: number
  username: string
  email: string
}

class AuthService {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/authenticate', {
      username,
      password,
    } as LoginRequest)
    this.setToken(response.data.token)
    return response.data
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    this.setToken(response.data.token)
    return response.data
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me')
    return response.data
  }

  logout() {
    this.token = null
    delete api.defaults.headers.common['Authorization']
    api.post('/auth/logout')
  }
}

export const authService = new AuthService()


