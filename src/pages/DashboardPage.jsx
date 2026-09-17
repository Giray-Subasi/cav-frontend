
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  completeDownload,
  createProfile,
  deleteProfile,
  enableProfile,
  getProfiles,
  startDownload,
} from '../services/api'
import { getCurrentUser, logout } from '../services/auth'
import '../App.css'
import './DashboardPage.css'

const DEFAULT_QUERY = {
  status: '',
  operator: '',
  sortBy: 'id',
  direction: 'asc',
  pageSize: 10,
}

const LIFECYCLE_STAGES = [
  'CREATED',
  'DOWNLOADING',
  'DOWNLOADED',
  'ENABLED',
]

const STATUS_CLASSES = {
  CREATED: 'cav-status-created',
  DOWNLOADING: 'cav-status-downloading',
  DOWNLOADED: 'cav-status-downloaded',
  ENABLED: 'cav-status-enabled',
  FAILED: 'cav-status-failed',
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

function DashboardPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [eid, setEid] = useState('')
  const [iccid, setIccid] = useState('')
  const [operator, setOperator] = useState('TURKCELL')
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [creating, setCreating] = useState(false)

  const [actionError, setActionError] = useState('')
  const [workingProfile, setWorkingProfile] = useState(null)

  const [statusFilter, setStatusFilter] = useState('')
  const [operatorFilter, setOperatorFilter] = useState('')
  const [sortBy, setSortBy] = useState('id')
  const [direction, setDirection] = useState('asc')
  const [pageSize, setPageSize] = useState(10)

  const [appliedQuery, setAppliedQuery] = useState(DEFAULT_QUERY)

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  const navigate = useNavigate()
  const user = getCurrentUser()
  const isAdmin = user?.role === 'ADMIN'

  const loadProfiles = useCallback(
    async (page = 0, query = DEFAULT_QUERY) => {
      setLoading(true)
      setError('')

      try {
        const data = await getProfiles({
          page,
          size: query.pageSize,
          status: query.status,
          operator: query.operator,
          sortBy: query.sortBy,
          direction: query.direction,
        })

        if (Array.isArray(data)) {
          setProfiles(data)
          setCurrentPage(0)
          setTotalPages(1)
          setTotalElements(data.length)
        } else {
          setProfiles(data.content || [])
          setCurrentPage(data.page ?? page)
          setTotalPages(data.totalPages ?? 1)
          setTotalElements(
            data.totalElements ??
              data.content?.length ??
              0
          )
        }
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
    },
    [navigate]
  )

  useEffect(() => {
    loadProfiles(0, DEFAULT_QUERY)
  }, [loadProfiles])

  const getCurrentQuery = () => ({
    status: statusFilter,
    operator: operatorFilter,
    sortBy,
    direction,
    pageSize,
  })

  const handleApplyFilters = () => {
    const nextQuery = getCurrentQuery()
    setAppliedQuery(nextQuery)
    loadProfiles(0, nextQuery)
  }

  const handleResetFilters = () => {
    setStatusFilter('')
    setOperatorFilter('')
    setSortBy('id')
    setDirection('asc')
    setPageSize(10)
    setAppliedQuery(DEFAULT_QUERY)

    loadProfiles(0, DEFAULT_QUERY)
  }

  const handleCreateProfile = async (event) => {
    event.preventDefault()

    setCreateError('')
    setCreateSuccess('')
    setCreating(true)

    try {
      await createProfile({
        eid,
        iccid,
        operator,
      })

      setCreateSuccess('Profile created successfully')
      setEid('')
      setIccid('')
      setOperator('TURKCELL')

      await loadProfiles(currentPage, appliedQuery)
    } catch (error) {
      if (error.status === 401) {
        logout()
        navigate('/login')
        return
      }

      setCreateError(error.message)
    } finally {
      setCreating(false)
    }
  }

  const handleProfileAction = async (profile, action) => {
    setActionError('')
    setWorkingProfile(profile.iccid)

    try {
      if (action === 'download') {
        await startDownload(profile.iccid)
      }

      if (action === 'complete') {
        await completeDownload(profile.iccid)
      }

      if (action === 'enable') {
        await enableProfile(profile.iccid)
      }

      await loadProfiles(currentPage, appliedQuery)
    } catch (error) {
      if (error.status === 401) {
        logout()
        navigate('/login')
        return
      }

      setActionError(error.message)
    } finally {
      setWorkingProfile(null)
    }
  }

  const handleDelete = async (profile) => {
    const confirmed = window.confirm(
      `Delete profile ${profile.iccid}?`
    )

    if (!confirmed) {
      return
    }

    setActionError('')
    setWorkingProfile(profile.iccid)

    try {
      await deleteProfile(profile.iccid)
      await loadProfiles(currentPage, appliedQuery)
    } catch (error) {
      if (error.status === 401) {
        logout()
        navigate('/login')
        return
      }

      setActionError(error.message)
    } finally {
      setWorkingProfile(null)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      loadProfiles(currentPage - 1, appliedQuery)
    }
  }

  const handleNextPage = () => {
    if (currentPage + 1 < totalPages) {
      loadProfiles(currentPage + 1, appliedQuery)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visibleCount = profiles.length

  const enabledOnPage = profiles.filter(
    (profile) => profile.status === 'ENABLED'
  ).length

  const inProgressOnPage = profiles.filter(
    (profile) =>
      profile.status === 'DOWNLOADING' ||
      profile.status === 'DOWNLOADED'
  ).length

  return (
    <main className="dashboard-page cav-dashboard">
      <div className="cav-dashboard-container">
        <header className="cav-dashboard-topbar">
          <div className="cav-dashboard-brand">
            <span className="cav-dashboard-brand-icon">
              <ChipIcon />
            </span>

            <div className="cav-dashboard-brand-text">
              <strong>C.A.V</strong>
              <span>eSIM MANAGEMENT PLATFORM</span>
            </div>
          </div>

          <div className="cav-dashboard-account">
            <div className="cav-dashboard-account-text">
              <strong>{user?.username || 'User'}</strong>
              <span>{user?.role || 'USER'} ACCOUNT</span>
            </div>

            <span className="cav-dashboard-avatar" aria-hidden="true">
              {(user?.username || 'U').charAt(0).toUpperCase()}
            </span>

            <button
              type="button"
              className="cav-dashboard-logout"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </header>

        <section className="cav-dashboard-hero">
          <div className="cav-dashboard-hero-content">
            <div className="cav-dashboard-eyebrow">
              <span className="cav-dashboard-eyebrow-dot" />
              PROFILE OPERATIONS
            </div>

            <h1>eSIM profile dashboard</h1>

            <p>
              Manage profiles, follow their lifecycle,
              and access the tools available to your role.
            </p>

            <span className="cav-dashboard-hero-role">
              {isAdmin ? 'ADMIN WORKSPACE' : 'USER WORKSPACE'}
            </span>
          </div>

          <div className="cav-dashboard-hero-workflow">
            <span className="cav-dashboard-workflow-label">
              PROFILE LIFECYCLE
            </span>

            <div className="cav-dashboard-workflow-stages">
              {LIFECYCLE_STAGES.map((stage, index) => (
                <div
                  key={stage}
                  className="cav-dashboard-workflow-stage"
                >
                  <span className="cav-dashboard-workflow-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span>{stage}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="cav-dashboard-stats"
          aria-label="Profile overview"
        >
          <article className="cav-dashboard-stat cav-dashboard-stat-primary">
            <span className="cav-dashboard-stat-label">
              MATCHING PROFILES
            </span>
            <strong>{totalElements}</strong>
            <span className="cav-dashboard-stat-note">
              Total for applied filters
            </span>
          </article>

          <article className="cav-dashboard-stat">
            <span className="cav-dashboard-stat-label">
              ON THIS PAGE
            </span>
            <strong>{visibleCount}</strong>
            <span className="cav-dashboard-stat-note">
              Profiles currently displayed
            </span>
          </article>

          <article className="cav-dashboard-stat">
            <span className="cav-dashboard-stat-label">
              ENABLED ON THIS PAGE
            </span>
            <strong>{enabledOnPage}</strong>
            <span className="cav-dashboard-stat-note">
              Activated profiles in view
            </span>
          </article>

          <article className="cav-dashboard-stat">
            <span className="cav-dashboard-stat-label">
              IN PROGRESS ON THIS PAGE
            </span>
            <strong>{inProgressOnPage}</strong>
            <span className="cav-dashboard-stat-note">
              Downloading or downloaded
            </span>
          </article>
        </section>

        {isAdmin && (
          <section className="cav-dashboard-panel">
            <div className="cav-dashboard-section-heading">
              <div>
                <span className="cav-dashboard-section-kicker">
                  ADMIN TOOLS
                </span>
                <h2>Create a profile</h2>
                <p>
                  Add a new eSIM profile to the management system.
                </p>
              </div>

              <span className="cav-dashboard-section-tag">
                ADMIN ONLY
              </span>
            </div>

            <form
              className="cav-dashboard-create-form"
              onSubmit={handleCreateProfile}
            >
              <div className="cav-dashboard-field">
                <label htmlFor="iccid">ICCID</label>
                <input
                  id="iccid"
                  type="text"
                  value={iccid}
                  onChange={(event) =>
                    setIccid(event.target.value)
                  }
                  placeholder="Enter ICCID"
                  required
                />
              </div>

              <div className="cav-dashboard-field">
                <label htmlFor="eid">EID</label>
                <input
                  id="eid"
                  type="text"
                  value={eid}
                  onChange={(event) =>
                    setEid(event.target.value)
                  }
                  placeholder="Enter EID"
                  required
                />
              </div>

              <div className="cav-dashboard-field">
                <label htmlFor="operator">Operator</label>
                <select
                  id="operator"
                  value={operator}
                  onChange={(event) =>
                    setOperator(event.target.value)
                  }
                >
                  <option value="TURKCELL">TURKCELL</option>
                  <option value="VODAFONE">VODAFONE</option>
                  <option value="TURK_TELEKOM">
                    TURK_TELEKOM
                  </option>
                </select>
              </div>

              <button
                className="cav-dashboard-primary-button cav-dashboard-create-button"
                type="submit"
                disabled={creating}
              >
                {creating ? 'Creating...' : '+ Create profile'}
              </button>
            </form>

            {createError && (
              <p className="cav-dashboard-message cav-dashboard-message-error" role="alert">
                {createError}
              </p>
            )}

            {createSuccess && (
              <p className="cav-dashboard-message cav-dashboard-message-success" role="status">
                {createSuccess}
              </p>
            )}
          </section>
        )}

        <section className="cav-dashboard-panel">
          <div className="cav-dashboard-section-heading">
            <div>
              <span className="cav-dashboard-section-kicker">
                SEARCH &amp; DISCOVERY
              </span>
              <h2>Filter profiles</h2>
              <p>
                Narrow your results and choose how they are displayed.
              </p>
            </div>
          </div>

          <div className="cav-dashboard-filter-grid">
            <div className="cav-dashboard-field">
              <label htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="">All statuses</option>
                <option value="CREATED">CREATED</option>
                <option value="DOWNLOADING">DOWNLOADING</option>
                <option value="DOWNLOADED">DOWNLOADED</option>
                <option value="ENABLED">ENABLED</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <div className="cav-dashboard-field">
              <label htmlFor="operator-filter">Operator</label>
              <select
                id="operator-filter"
                value={operatorFilter}
                onChange={(event) =>
                  setOperatorFilter(event.target.value)
                }
              >
                <option value="">All operators</option>
                <option value="TURKCELL">TURKCELL</option>
                <option value="VODAFONE">VODAFONE</option>
                <option value="TURK_TELEKOM">
                  TURK_TELEKOM
                </option>
              </select>
            </div>

            <div className="cav-dashboard-field">
              <label htmlFor="sort-by">Sort by</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
              >
                <option value="id">ID</option>
                <option value="iccid">ICCID</option>
                <option value="eid">EID</option>
                <option value="operator">Operator</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div className="cav-dashboard-field">
              <label htmlFor="sort-direction">Direction</label>
              <select
                id="sort-direction"
                value={direction}
                onChange={(event) =>
                  setDirection(event.target.value)
                }
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <div className="cav-dashboard-field">
              <label htmlFor="page-size">Page size</label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(event) =>
                  setPageSize(Number(event.target.value))
                }
              >
                <option value={1}>1</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="cav-dashboard-filter-actions">
            <button
              type="button"
              className="cav-dashboard-primary-button"
              onClick={handleApplyFilters}
              disabled={loading}
            >
              Apply filters
            </button>

            <button
              type="button"
              className="cav-dashboard-outline-button"
              onClick={handleResetFilters}
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </section>

        <section className="cav-dashboard-panel cav-dashboard-profiles-panel">
          <div className="cav-dashboard-section-heading cav-dashboard-profiles-heading">
            <div>
              <span className="cav-dashboard-section-kicker">
                PROFILE INVENTORY
              </span>
              <h2>Profiles</h2>
              <p>
                {totalElements} matching profile
                {totalElements === 1 ? '' : 's'}
              </p>
            </div>

            <button
              type="button"
              className="cav-dashboard-outline-button"
              onClick={() =>
                loadProfiles(currentPage, appliedQuery)
              }
              disabled={loading}
            >
              {loading ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>

          {actionError && (
            <p className="cav-dashboard-message cav-dashboard-message-error" role="alert">
              {actionError}
            </p>
          )}

          {loading && (
            <p className="cav-dashboard-loading" role="status">
              Loading profiles...
            </p>
          )}

          {error && (
            <p className="cav-dashboard-message cav-dashboard-message-error" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && profiles.length === 0 && (
            <div className="cav-dashboard-empty">
              <span className="cav-dashboard-empty-icon">
                <ChipIcon />
              </span>
              <h3>No profiles found</h3>
              <p>
                {totalElements === 0 &&
                !appliedQuery.status &&
                !appliedQuery.operator
                  ? 'There are no profiles to display yet.'
                  : 'Try changing or resetting your filters.'}
              </p>
            </div>
          )}

          {!loading && !error && profiles.length > 0 && (
            <>
              <div className="cav-dashboard-table-scroll">
                <table className="cav-dashboard-table">
                  <thead>
                    <tr>
                      <th scope="col">ICCID</th>
                      <th scope="col">EID</th>
                      <th scope="col">Operator</th>
                      <th scope="col">Status</th>

                      {isAdmin && (
                        <th scope="col">Actions</th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {profiles.map((profile) => {
                      const isWorking =
                        workingProfile === profile.iccid

                      return (
                        <tr key={profile.iccid}>
                          <td>
                            <Link
                              className="cav-dashboard-profile-link"
                              to={`/profiles/${profile.iccid}`}
                              title={profile.iccid}
                            >
                              {profile.iccid}
                            </Link>
                          </td>

                          <td className="cav-dashboard-eid">
                            {profile.eid}
                          </td>

                          <td>
                            <span className="cav-dashboard-operator">
                              {profile.operator}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`cav-dashboard-status ${
                                STATUS_CLASSES[profile.status] || ''
                              }`}
                            >
                              <span className="cav-dashboard-status-dot" />
                              {profile.status}
                            </span>
                          </td>

                          {isAdmin && (
                            <td>
                              <div className="cav-dashboard-row-actions">
                                {profile.status === 'CREATED' && (
                                  <button
                                    type="button"
                                    className="cav-dashboard-row-button"
                                    disabled={isWorking || loading}
                                    onClick={() =>
                                      handleProfileAction(
                                        profile,
                                        'download'
                                      )
                                    }
                                  >
                                    Start download
                                  </button>
                                )}

                                {profile.status === 'DOWNLOADING' && (
                                  <button
                                    type="button"
                                    className="cav-dashboard-row-button"
                                    disabled={isWorking || loading}
                                    onClick={() =>
                                      handleProfileAction(
                                        profile,
                                        'complete'
                                      )
                                    }
                                  >
                                    Complete
                                  </button>
                                )}

                                {profile.status === 'DOWNLOADED' && (
                                  <button
                                    type="button"
                                    className="cav-dashboard-row-button"
                                    disabled={isWorking || loading}
                                    onClick={() =>
                                      handleProfileAction(
                                        profile,
                                        'enable'
                                      )
                                    }
                                  >
                                    Enable
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="cav-dashboard-delete-button"
                                  disabled={isWorking || loading}
                                  onClick={() =>
                                    handleDelete(profile)
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="cav-dashboard-pagination">
                <span>
                  Page {currentPage + 1} of {totalPages}
                </span>

                <div className="cav-dashboard-pagination-buttons">
                  <button
                    type="button"
                    className="cav-dashboard-outline-button"
                    onClick={handlePreviousPage}
                    disabled={loading || currentPage === 0}
                  >
                    ← Previous
                  </button>

                  <button
                    type="button"
                    className="cav-dashboard-outline-button"
                    onClick={handleNextPage}
                    disabled={
                      loading ||
                      currentPage + 1 >= totalPages
                    }
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default DashboardPage