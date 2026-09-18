import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'
import AuthIntro, { ChipIcon } from '../components/AuthIntro'
import '../App.css'
import './LoginPage.css'
import './AuthPageExtras.css'

function RegisterPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const cleanUsername = username.trim()

    if (!cleanUsername) {
      setError('Please enter a username.')
      return
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await register(cleanUsername, password)

      setPassword('')
      setConfirmPassword('')

      navigate('/login', {
        replace: true,
        state: {
          registrationSuccess: true,
          registeredUsername: cleanUsername,
        },
      })
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to create your account. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="cav-login-page">
      <div className="cav-login-shell">
        <AuthIntro />

        <section
          className="cav-login-form-section cav-register-form-section"
          aria-labelledby="cav-register-title"
        >
          <div className="cav-login-form-inner">
            <div className="cav-login-form-topline">
              <span className="cav-login-form-brand-mark">
                <ChipIcon />
              </span>

              <div className="cav-login-form-brand-text">
                <strong>C.A.V</strong>
                <span>eSIM MANAGEMENT PLATFORM</span>
              </div>
            </div>

            <div className="cav-login-form-heading cav-register-form-heading">
              <span className="cav-login-welcome">
                GET STARTED
              </span>

              <h2 id="cav-register-title">
                Create your account
              </h2>

              <p>
                Join the workspace to view and track
                eSIM profiles.
              </p>
            </div>

            <form
              className="cav-login-form cav-register-form"
              onSubmit={handleSubmit}
            >
              <div className="cav-login-field">
                <label htmlFor="register-username">
                  Username
                </label>

                <input
                  id="register-username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  placeholder="Choose a username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={loading}
                  required
                />
              </div>

              <div className="cav-login-field">
                <label htmlFor="register-password">
                  Password
                </label>

                <div className="cav-login-password-wrap">
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    disabled={loading}
                    required
                  />

                  <button
                    className="cav-login-password-toggle"
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    aria-pressed={showPassword}
                    disabled={loading}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="cav-login-field">
                <label htmlFor="register-confirm-password">
                  Confirm password
                </label>

                <div className="cav-login-password-wrap">
                  <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type={
                      showConfirmPassword ? 'text' : 'password'
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    minLength={6}
                    disabled={loading}
                    required
                  />

                  <button
                    className="cav-login-password-toggle"
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    aria-label={
                      showConfirmPassword
                        ? 'Hide password confirmation'
                        : 'Show password confirmation'
                    }
                    aria-pressed={showConfirmPassword}
                    disabled={loading}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <p className="cav-login-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="cav-login-submit"
                type="submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? 'Creating account...'
                    : 'Create account'}
                </span>

                {!loading && (
                  <span aria-hidden="true">→</span>
                )}
              </button>
            </form>

            <p className="cav-register-note">
              New accounts receive the USER role.
            </p>

            <p className="cav-auth-switch cav-register-auth-switch">
              Already have an account?{' '}
              <Link to="/login">
                Sign in
              </Link>
            </p>

            <div className="cav-login-form-footer cav-register-form-footer">
              <span className="cav-login-footer-line" />

              <p>C.A.V · eSIM Management System</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default RegisterPage