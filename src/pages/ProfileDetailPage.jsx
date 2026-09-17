
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProfile, updateProfile } from '../services/api'
import { getCurrentUser, logout } from '../services/auth'
import '../App.css'
import './ProfileDetailPage.css'

const STATUS_CLASSES = {
  CREATED: 'cav-detail-status-created',
  DOWNLOADING: 'cav-detail-status-downloading',
  DOWNLOADED: 'cav-detail-status-downloaded',
  ENABLED: 'cav-detail-status-enabled',
  FAILED: 'cav-detail-status-failed',
}

function ChipIcon() {
  return (
    <svg
      width="23"
      height="23"
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

function formatDate(value) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString()
}

function ProfileDetailPage() {
  const { iccid } = useParams()
  const navigate = useNavigate()
  const user = getCurrentUser()
  const isAdmin = user?.role === 'ADMIN'

  const [profile, setProfile] = useState(null)
  const [eid, setEid] = useState('')
  const [operator, setOperator] = useState('TURKCELL')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getProfile(iccid)

      setProfile(data)
      setEid(data.eid)
      setOperator(data.operator)
    } catch (requestError) {
      if (requestError.status === 401) {
        logout()
        navigate('/login')
        return
      }

      setProfile(null)
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [iccid, navigate])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleUpdate = async (event) => {
    event.preventDefault()

    if (!isAdmin) {
      return
    }

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const updatedProfile = await updateProfile(iccid, {
        eid,
        operator,
      })

      setProfile(updatedProfile)
      setEid(updatedProfile.eid)
      setOperator(updatedProfile.operator)
      setSuccess('Profile updated successfully.')
    } catch (requestError) {
      if (requestError.status === 401) {
        logout()
        navigate('/login')
        return
      }

      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <main className="dashboard-page cav-detail-page">
        <div className="cav-detail-container">
          <div className="cav-detail-feedback" role="status">
            Loading profile...
          </div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="dashboard-page cav-detail-page">
        <div className="cav-detail-container">
          <section className="cav-detail-feedback">
            <h1>Profile unavailable</h1>

            <p role="alert">
              {error || 'Profile not found.'}
            </p>

            <button
              type="button"
              className="cav-detail-primary-button"
              onClick={handleBack}
            >
              ← Back to dashboard
            </button>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="dashboard-page cav-detail-page">
      <div className="cav-detail-container">
        <header className="cav-detail-topbar">
          <div className="cav-detail-brand">
            <span className="cav-detail-brand-icon">
              <ChipIcon />
            </span>

            <div className="cav-detail-brand-text">
              <strong>C.A.V</strong>
              <span>eSIM MANAGEMENT PLATFORM</span>
            </div>
          </div>

          <button
            type="button"
            className="cav-detail-back-button"
            onClick={handleBack}
          >
            ← Back to dashboard
          </button>
        </header>

        <section className="cav-detail-hero">
          <div className="cav-detail-hero-content">
            <span className="cav-detail-eyebrow">
              PROFILE INVENTORY / DETAILS
            </span>

            <h1>Profile details</h1>

            <p>
              Review profile information and its current
              lifecycle status.
            </p>

            <span className="cav-detail-role-tag">
              {isAdmin ? 'ADMIN WORKSPACE' : 'USER WORKSPACE'}
            </span>
          </div>

          <div className="cav-detail-hero-status">
            <span>CURRENT STATUS</span>

            <strong
              className={`cav-detail-status ${
                STATUS_CLASSES[profile.status] || ''
              }`}
            >
              <span
                className="cav-detail-status-dot"
                aria-hidden="true"
              />
              {profile.status}
            </strong>
          </div>
        </section>

        <section className="cav-detail-panel">
          <div className="cav-detail-section-heading">
            <span className="cav-detail-section-kicker">
              PROFILE OVERVIEW
            </span>

            <h2>Profile information</h2>

            <p>
              Identification, status and record timestamps.
            </p>
          </div>

          <div className="cav-detail-info-grid">
            <div className="cav-detail-info-item">
              <span>ICCID</span>
              <strong>{profile.iccid}</strong>
            </div>

            <div className="cav-detail-info-item">
              <span>Status</span>

              <strong
                className={`cav-detail-status ${
                  STATUS_CLASSES[profile.status] || ''
                }`}
              >
                <span
                  className="cav-detail-status-dot"
                  aria-hidden="true"
                />
                {profile.status}
              </strong>
            </div>

            <div className="cav-detail-info-item">
              <span>Created at</span>
              <strong>{formatDate(profile.createdAt)}</strong>
            </div>

            <div className="cav-detail-info-item">
              <span>Updated at</span>
              <strong>{formatDate(profile.updatedAt)}</strong>
            </div>
          </div>
        </section>

        <section className="cav-detail-panel">
          <div className="cav-detail-section-heading">
            <div>
              <span className="cav-detail-section-kicker">
                PROFILE CONFIGURATION
              </span>

              <h2>
                {isAdmin
                  ? 'Manage profile'
                  : 'Profile configuration'}
              </h2>

              <p>
                {isAdmin
                  ? 'Update the EID or mobile network operator.'
                  : 'These settings are available in read-only mode.'}
              </p>
            </div>

            <span className="cav-detail-access-tag">
              {isAdmin ? 'ADMIN ACCESS' : 'READ ONLY'}
            </span>
          </div>

          <form
            className="cav-detail-form"
            onSubmit={handleUpdate}
          >
            <div className="cav-detail-field">
              <label htmlFor="detail-eid">
                EID
              </label>

              <input
                id="detail-eid"
                type="text"
                value={eid}
                onChange={(event) =>
                  setEid(event.target.value)
                }
                disabled={!isAdmin || saving}
                required
              />
            </div>

            <div className="cav-detail-field">
              <label htmlFor="detail-operator">
                Operator
              </label>

              <select
                id="detail-operator"
                value={operator}
                onChange={(event) =>
                  setOperator(event.target.value)
                }
                disabled={!isAdmin || saving}
              >
                <option value="TURKCELL">
                  TURKCELL
                </option>

                <option value="VODAFONE">
                  VODAFONE
                </option>

                <option value="TURK_TELEKOM">
                  TURK_TELEKOM
                </option>
              </select>
            </div>

            {error && (
              <p
                className="cav-detail-message cav-detail-message-error"
                role="alert"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                className="cav-detail-message cav-detail-message-success"
                role="status"
              >
                {success}
              </p>
            )}

            {isAdmin && (
              <div className="cav-detail-form-actions">
                <button
                  type="submit"
                  className="cav-detail-primary-button"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save changes →'}
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  )
}

export default ProfileDetailPage