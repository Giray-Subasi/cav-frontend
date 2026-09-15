const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function authenticatedRequest(path, options = {}) {
  const token = sessionStorage.getItem('token')

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const contentType =
    response.headers.get('content-type')

  let data = null

  if (contentType?.includes('application/json')) {
    data = await response.json()
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || 'Request failed'
    )

    error.status = response.status
    throw error
  }

  return data
}

export async function login(username, password) {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Login failed'
    )
  }

  return data
}

export function getProfiles({
  page = 0,
  size = 10,
  status = '',
  operator = '',
  sortBy = 'id',
  direction = 'asc',
} = {}) {
  const params = new URLSearchParams({
    page,
    size,
    sortBy,
    direction,
  })

  if (status) {
    params.append('status', status)
  }

  if (operator) {
    params.append('operator', operator)
  }

  return authenticatedRequest(
    `/profiles?${params.toString()}`
  )
}

export function getProfile(iccid) {
  return authenticatedRequest(
    `/profiles/${iccid}`
  )
}

export function createProfile(profile) {
  return authenticatedRequest('/profiles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  })
}

export function updateProfile(iccid, profile) {
  return authenticatedRequest(
    `/profiles/${iccid}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    }
  )
}

export function startDownload(iccid) {
  return authenticatedRequest(
    `/profiles/${iccid}/download`,
    {
      method: 'POST',
    }
  )
}

export function completeDownload(iccid) {
  return authenticatedRequest(
    `/profiles/${iccid}/complete`,
    {
      method: 'POST',
    }
  )
}

export function enableProfile(iccid) {
  return authenticatedRequest(
    `/profiles/${iccid}/enable`,
    {
      method: 'POST',
    }
  )
}

export function deleteProfile(iccid) {
  return authenticatedRequest(
    `/profiles/${iccid}`,
    {
      method: 'DELETE',
    }
  )
}