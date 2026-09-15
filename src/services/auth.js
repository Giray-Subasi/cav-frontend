import { jwtDecode } from 'jwt-decode'

export function getToken() {
  return sessionStorage.getItem('token')
}

export function getCurrentUser() {
  const token = getToken()

  if (!token) {
    return null
  }

  try {
    const decoded = jwtDecode(token)

    return {
      username: decoded.sub,
      role: decoded.role,
      expiresAt: decoded.exp,
    }
  } catch {
    return null
  }
}

export function isAuthenticated() {
  const user = getCurrentUser()

  if (!user) {
    return false
  }

  const currentTime = Math.floor(Date.now() / 1000)

  return user.expiresAt > currentTime
}

export function logout() {
  sessionStorage.removeItem('token')
}