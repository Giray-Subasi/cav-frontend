import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import '../App.css'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const data = await login(username, password)

      sessionStorage.setItem('token', data.token)

      setPassword('')

      navigate('/dashboard')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand">C.A.V</div>

        <h1>Management System</h1>
        <p className="subtitle">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">
            Username
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            placeholder="Enter your username"
            autoComplete="username"
            required
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="message error-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Signing in...'
              : 'Sign In'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage