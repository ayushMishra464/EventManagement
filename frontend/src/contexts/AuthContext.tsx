// ============================================
// Member 6: Auth context – login, logout, token persistence
// ============================================

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { User } from '@/types'
import { authApi } from '@/services/api'

const TOKEN_KEY = 'eventhub_token'
const USER_KEY = 'eventhub_user'

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (firstName: string, lastName: string, email: string, password: string, role: 'ORGANIZER' | 'ATTENDEE') => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem(TOKEN_KEY),
    user: (() => {
      try {
        const u = localStorage.getItem(USER_KEY)
        return u ? JSON.parse(u) : null
      } catch {
        return null
      }
    })(),
    isLoading: true,
  })

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setState({ token: null, user: null, isLoading: false })
  }, [])

  useEffect(() => {
    if (!state.token) {
      setState((s) => ({ ...s, isLoading: false }))
      return
    }
    setState((s) => ({ ...s, isLoading: false }))
  }, [state.token])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    localStorage.setItem(TOKEN_KEY, res.token)
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    setState({ token: res.token, user: res.user, isLoading: false })
  }, [])

  const register = useCallback(
    async (firstName: string, lastName: string, email: string, password: string, role: 'ORGANIZER' | 'ATTENDEE') => {
      const res = await authApi.register(firstName, lastName, email, password, role)
      localStorage.setItem(TOKEN_KEY, res.token)
      localStorage.setItem(USER_KEY, JSON.stringify(res.user))
      setState({ token: res.token, user: res.user, isLoading: false })
    },
    []
  )

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    isAuthenticated: !!state.token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
