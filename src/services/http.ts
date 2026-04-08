import { Capacitor, CapacitorHttp } from '@capacitor/core'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestOptions = {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

function hasHeader(headers: Record<string, string>, name: string) {
  const target = name.toLowerCase()
  return Object.keys(headers).some((key) => key.toLowerCase() === target)
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('auth_token')
  const devRole = localStorage.getItem('solvec_dev_role')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {})
  }

  if (token && !hasHeader(headers, 'Authorization')) {
    headers.Authorization = `Bearer ${token}`
  }
  if (devRole && !hasHeader(headers, 'X-Dev-Role')) {
    headers['X-Dev-Role'] = devRole
  }

  const url = `${API_URL}${path}`
  const method = options.method ?? 'GET'

  // On native Android/iOS, use CapacitorHttp so requests go through the
  // native HTTP stack — bypassing the WebView's mixed-content restriction.
  if (Capacitor.isNativePlatform()) {
    const res = await CapacitorHttp.request({
      method,
      url,
      headers,
      data: options.body ?? undefined
    })

    if (res.status < 200 || res.status >= 300) {
      const message = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
      throw new Error(message || 'Request failed')
    }

    return res.data as T
  }

  // Web: use standard fetch
  const res = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || 'Request failed')
  }

  return res.json() as Promise<T>
}
