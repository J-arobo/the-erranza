const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api'
const TOKEN_KEY = 'erranza_token'

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// A 401 means the stored token is invalid/expired — clear everything
// auth-related and send the user to log back in, rather than letting each
// page silently render a generic "please log in" error inline.
function handleUnauthorized() {
  if (typeof window === 'undefined') return
  if (window.location.pathname.startsWith('/login')) return

  setToken(null)
  sessionStorage.removeItem('erranza_admin_verified')
  sessionStorage.removeItem('erranza_super_admin_verified')
  window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
}

//Uploading progress
// Uses XMLHttpRequest instead of fetch specifically because fetch has no
// way to report upload progress — xhr.upload.onprogress is the only way
// to get real byte-level progress for a document upload.
export function uploadWithProgress<T>(path: string, formData: FormData, onProgress: (percent: number) => void): Promise<T> {
  const token = getToken()

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE_URL}${path}`)
    xhr.setRequestHeader('Accept', 'application/json')
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      let body: unknown = null
      try { body = xhr.responseText ? JSON.parse(xhr.responseText) : null } catch { }

      if (xhr.status === 401) {
        handleUnauthorized()
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as T)
      } else {
        const parsed = body as { message?: string; errors?: Record<string, string[]> } | null
        reject(new ApiError(parsed?.message ?? 'Something went wrong.', xhr.status, parsed?.errors))
      }
    }

    xhr.onerror = () => reject(new ApiError('Check your internet connection and try again.', 0))

    xhr.send(formData)
  })
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const isFormData = options.body instanceof FormData

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json() : null

  if (res.status === 401) {
    handleUnauthorized()
  }

  if (!res.ok) {
    throw new ApiError(body?.message ?? 'Something went wrong.', res.status, body?.errors)
  }

  return body as T
}

// failed to login
export function apiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Please log in to continue.'
    if (err.status >= 500) return 'Something went wrong on our end. Please try again in a moment.'
    const firstFieldError = err.errors ? Object.values(err.errors)[0]?.[0] : undefined
    return firstFieldError ?? err.message
  }
  if (err instanceof TypeError) return 'Check your internet connection and try again.'
  if (err instanceof Error && err.message) return err.message
  return 'Something went wrong. Please try again.'
}

// Email validation 
export function apiFieldErrors(err: unknown): Record<string, string> {
  if (err instanceof ApiError && err.errors) {
    return Object.fromEntries(
      Object.entries(err.errors).map(([field, messages]) => [field, messages[0]])
    )
  }
  return {}
}
