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

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json() : null

  if (!res.ok) {
    throw new ApiError(body?.message ?? 'Something went wrong.', res.status, body?.errors)
  }

  return body as T
}

export function apiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const firstFieldError = err.errors ? Object.values(err.errors)[0]?.[0] : undefined
    return firstFieldError ?? err.message
  }
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
