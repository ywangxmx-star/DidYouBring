const TOKEN_KEY = 'dyb_token'

// #ifdef H5
const BASE_URL = '/api/v1'
// #endif
// #ifndef H5
const BASE_URL = 'http://127.0.0.1:8080/api/v1'
// #endif

export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token: string) {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function clearToken() {
  uni.removeStorageSync(TOKEN_KEY)
}

type ApiResult<T> = { code: number; message: string; data: T }

let loginPromise: Promise<void> | null = null

export async function request<T>(options: {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: unknown
  auth?: boolean
}): Promise<T> {
  const auth = options.auth !== false
  const header: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) header.Authorization = `Bearer ${token}`
  }

  const res = await new Promise<UniApp.RequestSuccessCallbackResult>((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data as AnyObject,
      header,
      success: resolve,
      fail: reject,
    })
  })

  const body = res.data as ApiResult<T>
  if (res.statusCode === 401 || body?.code === 40100) {
    clearToken()
    if (!loginPromise) {
      loginPromise = import('@/stores/user').then(({ useUserStore }) => useUserStore().ensureLogin()).finally(() => {
        loginPromise = null
      })
    }
    await loginPromise
    return request(options)
  }

  if (res.statusCode >= 400 || (body && body.code !== 0)) {
    const err = new Error(body?.message || '请求失败') as Error & { code?: number; data?: unknown; status?: number }
    err.code = body?.code
    err.data = body?.data
    err.status = res.statusCode
    throw err
  }
  return body.data
}
