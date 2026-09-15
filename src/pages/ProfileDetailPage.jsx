import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  getProfile,
  updateProfile,
} from '../services/api'
import {
  getCurrentUser,
  logout,
} from '../services/auth'
import '../App.css'

function ProfileDetailPage() {
  const { iccid } = useParams()

  const navigate = useNavigate()
  const user = getCurrentUser()

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
    } catch (error) {
      if (error.status === 401) {
        logout()
        navigate('/login')
        return
      }

      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [iccid, navigate])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleUpdate = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const updatedProfile = await updateProfile(
        iccid,
        {
          eid,
          operator,
        }
      )

      setProfile(updatedProfile)
      setSuccess('Profile updated successfully')
    } catch (error) {
      if (error.status === 401) {
        logout()
        navigate('/login')
        return
      }

      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="dashboard-page">
        <p>Loading profile...</p>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="dashboard-page">
        <p className="message error-message">
          {error || 'Profile not found'}
        </p>

        <button
          className="refresh-button"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </main>
    )
  }

  return (
    <main className="dashboard-page">
      <section className="profile-detail-card">
        <div className="detail-header">
          <div>
            <p className="brand">C.A.V</p>
            <h1>Profile Details</h1>
          </div>

          <button
            className="refresh-button"
            onClick={() => navigate('/dashboard')}
          >
            Back
          </button>
        </div>

        <div className="profile-info">
          <div>
            <span>ICCID</span>
            <strong>{profile.iccid}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong>{profile.status}</strong>
          </div>

          <div>
            <span>Created At</span>
            <strong>
              {profile.createdAt
                ? new Date(profile.createdAt).toLocaleString()
                : '-'}
            </strong>
          </div>

          <div>
            <span>Updated At</span>
            <strong>
              {profile.updatedAt
                ? new Date(profile.updatedAt).toLocaleString()
                : '-'}
            </strong>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
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
            disabled={user?.role !== 'ADMIN'}
          />

          <label htmlFor="detail-operator">
            Operator
          </label>

          <select
            id="detail-operator"
            value={operator}
            onChange={(event) =>
              setOperator(event.target.value)
            }
            disabled={user?.role !== 'ADMIN'}
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

          {error && (
            <p className="message error-message">
              {error}
            </p>
          )}

          {success && (
            <p className="message success-message">
              {success}
            </p>
          )}

          {user?.role === 'ADMIN' && (
            <button
              type="submit"
              className="create-button"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </button>
          )}
        </form>
      </section>
    </main>
  )
}

export default ProfileDetailPage