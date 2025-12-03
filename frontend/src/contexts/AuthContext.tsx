import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

interface User {
  id: number
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      authService.setToken(token)
      fetchUser()
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    }
  }

  const login = async (username: string, password: string) => {
    const response = await authService.login(username, password)
    setToken(response.access_token)
    localStorage.setItem('token', response.access_token)
    await fetchUser()
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    authService.logout()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!token,
        login,
        logout,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


