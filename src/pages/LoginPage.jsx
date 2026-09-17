
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import '../App.css'
import './LoginPage.css'

const lifecycleStages = [
  'CREATED',
  'DOWNLOADING',
  'DOWNLOADED',
  'ENABLED',
]

function ChipIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </svg>
  )
}

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="cav-login-page">
      <div className="cav-login-shell">
        <section
          className="cav-login-intro"
          aria-labelledby="cav-intro-title"
        >
          <div className="cav-login-brand">
            <span className="cav-login-brand-mark">
              <ChipIcon />
            </span>

            <span className="cav-login-brand-name">C.A.V</span>

            <span className="cav-login-brand-divider" />

            <span className="cav-login-brand-caption">
              eSIM MANAGEMENT
            </span>
          </div>

          <div className="cav-login-intro-content">
            <span className="cav-login-eyebrow">
              YOUR PROFILE MANAGEMENT WORKSPACE
            </span>

            <h1 id="cav-intro-title">
              Your eSIM
              <br />
              operations,
              <br />
              <span>in one place.</span>
            </h1>

            <p>
              Manage eSIM profiles, track their lifecycle,
              and bring user and administrator operations
              together in one workspace.
            </p>

            <div className="cav-login-workflow">
              <div className="cav-login-workflow-heading">
                <span
                  className="cav-login-workflow-icon"
                  aria-hidden="true"
                >
                  <ChipIcon />
                </span>

                <div>
                  <span className="cav-login-workflow-label">
                    PROFILE LIFECYCLE
                  </span>
                  <strong>From creation to activation</strong>
                </div>
              </div>

              <div className="cav-login-stage-list">
                {lifecycleStages.map((stage, index) => (
                  <div className="cav-login-stage" key={stage}>
                    <span className="cav-login-stage-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span>{stage}</span>

                    {index < lifecycleStages.length - 1 && (
                      <span
                        className="cav-login-stage-arrow"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <p className="cav-login-workflow-note">
                Illustration of the supported profile workflow.
              </p>
            </div>
          </div>

          <div className="cav-login-intro-footer">
            <span>ROLE-BASED ACCESS</span>
            <span className="cav-login-footer-dot" />
            <span>REST API</span>
            <span className="cav-login-footer-dot" />
            <span>PROFILE LIFECYCLE</span>
          </div>
        </section>

        <section
          className="cav-login-form-section"
          aria-labelledby="cav-login-title"
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

            <div className="cav-login-form-heading">
              <span className="cav-login-welcome">
                WELCOME BACK
              </span>

              <h2 id="cav-login-title">
                Sign in to your workspace
              </h2>

              <p>
                Enter your credentials to access the
                eSIM management dashboard.
              </p>
            </div>

            <form
              className="cav-login-form"
              onSubmit={handleSubmit}
            >
              <div className="cav-login-field">
                <label htmlFor="username">
                  Username
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={loading}
                  required
                />
              </div>

              <div className="cav-login-field">
                <label htmlFor="password">
                  Password
                </label>

                <div className="cav-login-password-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
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
                  {loading ? 'Signing in...' : 'Sign in'}
                </span>

                {!loading && (
                  <span aria-hidden="true">→</span>
                )}
              </button>
            </form>

            <div className="cav-login-form-footer">
              <span className="cav-login-footer-line" />

              <p>C.A.V · eSIM Management System</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default LoginPage