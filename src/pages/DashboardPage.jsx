import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'
import {
  completeDownload,
  createProfile,
  deleteProfile,
  enableProfile,
  getProfiles,
  startDownload,
} from '../services/api'
import {
  getCurrentUser,
  logout,
} from '../services/auth'
import '../App.css'

const DEFAULT_QUERY = {
  status: '',
  operator: '',
  sortBy: 'id',
  direction: 'asc',
  pageSize: 10,
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

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  const navigate = useNavigate()
  const user = getCurrentUser()

  const loadProfiles = useCallback(
    async (
      page = 0,
      query = DEFAULT_QUERY
    ) => {
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
    loadProfiles(0, getCurrentQuery())
  }

  const handleResetFilters = () => {
    setStatusFilter('')
    setOperatorFilter('')
    setSortBy('id')
    setDirection('asc')
    setPageSize(10)

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

      setCreateSuccess(
        'Profile created successfully'
      )

      setEid('')
      setIccid('')
      setOperator('TURKCELL')

      await loadProfiles(
        currentPage,
        getCurrentQuery()
      )
    } catch (error) {
      setCreateError(error.message)
    } finally {
      setCreating(false)
    }
  }

  const handleProfileAction = async (
    profile,
    action
  ) => {
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

      await loadProfiles(
        currentPage,
        getCurrentQuery()
      )
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

      await loadProfiles(
        currentPage,
        getCurrentQuery()
      )
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
      loadProfiles(
        currentPage - 1,
        getCurrentQuery()
      )
    }
  }

  const handleNextPage = () => {
    if (currentPage + 1 < totalPages) {
      loadProfiles(
        currentPage + 1,
        getCurrentQuery()
      )
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="brand">C.A.V</p>
          <h1>Dashboard</h1>

          <p>
            Signed in as <strong>{user?.username}</strong>
            {' '}·{' '}
            Role: <strong>{user?.role}</strong>
          </p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </section>

      {user?.role === 'ADMIN' && (
        <section className="create-profile-card">
          <h2>Create Profile</h2>
          <p>Create a new eSIM profile</p>

          <form onSubmit={handleCreateProfile}>
            <div>
              <label htmlFor="iccid">
                ICCID
              </label>

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

            <div>
              <label htmlFor="eid">
                EID
              </label>

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

            <div>
              <label htmlFor="operator">
                Operator
              </label>

              <select
                id="operator"
                value={operator}
                onChange={(event) =>
                  setOperator(event.target.value)
                }
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

            {createError && (
              <p className="message error-message">
                {createError}
              </p>
            )}

            {createSuccess && (
              <p className="message success-message">
                {createSuccess}
              </p>
            )}

            <button
              type="submit"
              className="create-button"
              disabled={creating}
            >
              {creating
                ? 'Creating...'
                : 'Create Profile'}
            </button>
          </form>
        </section>
      )}

      <section className="filter-card">
        <h2>Filter Profiles</h2>

        <div className="filter-grid">
          <div>
            <label>Status</label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="">All Statuses</option>
              <option value="CREATED">CREATED</option>
              <option value="DOWNLOADING">
                DOWNLOADING
              </option>
              <option value="DOWNLOADED">
                DOWNLOADED
              </option>
              <option value="ENABLED">ENABLED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div>
            <label>Operator</label>

            <select
              value={operatorFilter}
              onChange={(event) =>
                setOperatorFilter(event.target.value)
              }
            >
              <option value="">All Operators</option>
              <option value="TURKCELL">TURKCELL</option>
              <option value="VODAFONE">VODAFONE</option>
              <option value="TURK_TELEKOM">
                TURK_TELEKOM
              </option>
            </select>
          </div>

          <div>
            <label>Sort By</label>

            <select
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

          <div>
            <label>Direction</label>

            <select
              value={direction}
              onChange={(event) =>
                setDirection(event.target.value)
              }
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div>
            <label>Page Size</label>

            <select
              value={pageSize}
              onChange={(event) =>
                setPageSize(
                  Number(event.target.value)
                )
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

        <div className="filter-actions">
          <button
            className="refresh-button"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </button>

          <button
            className="secondary-button"
            onClick={handleResetFilters}
          >
            Reset
          </button>
        </div>
      </section>

      <section className="profiles-card">
        <div className="profiles-header">
          <div>
            <h2>Profiles</h2>
            <p>
              Total profiles: {totalElements}
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={() =>
              loadProfiles(
                currentPage,
                getCurrentQuery()
              )
            }
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {actionError && (
          <p className="message error-message">
            {actionError}
          </p>
        )}

        {loading && <p>Loading profiles...</p>}

        {error && (
          <p className="message error-message">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          profiles.length === 0 && (
            <p>No profiles found.</p>
          )}

        {!loading && profiles.length > 0 && (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ICCID</th>
                    <th>EID</th>
                    <th>Operator</th>
                    <th>Status</th>

                    {user?.role === 'ADMIN' && (
                      <th>Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {profiles.map((profile) => {
                    const isWorking =
                      workingProfile ===
                      profile.iccid

                    return (
                      <tr key={profile.iccid}>
                        <td>
                          <Link
                            className="profile-link"
                            to={`/profiles/${profile.iccid}`}
                          >
                            {profile.iccid}
                          </Link>
                        </td>

                        <td>{profile.eid}</td>
                        <td>{profile.operator}</td>

                        <td>
                          <span className="status-badge">
                            {profile.status}
                          </span>
                        </td>

                        {user?.role === 'ADMIN' && (
                          <td>
                            <div className="action-buttons">
                              {profile.status ===
                                'CREATED' && (
                                <button
                                  className="action-button"
                                  disabled={isWorking}
                                  onClick={() =>
                                    handleProfileAction(
                                      profile,
                                      'download'
                                    )
                                  }
                                >
                                  Start Download
                                </button>
                              )}

                              {profile.status ===
                                'DOWNLOADING' && (
                                <button
                                  className="action-button"
                                  disabled={isWorking}
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

                              {profile.status ===
                                'DOWNLOADED' && (
                                <button
                                  className="action-button"
                                  disabled={isWorking}
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
                                className="delete-button"
                                disabled={isWorking}
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

            <div className="pagination">
              <button
                className="secondary-button"
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
              >
                Previous
              </button>

              <span>
                Page {currentPage + 1} of {totalPages}
              </span>

              <button
                className="secondary-button"
                onClick={handleNextPage}
                disabled={
                  currentPage + 1 >= totalPages
                }
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default DashboardPage