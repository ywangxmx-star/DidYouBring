import { defineStore } from 'pinia'
import { ref } from 'vue'
import { clearToken, getToken, request, setToken } from '@/utils/request'

type User = { id: number; openid: string }

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const ready = ref(false)

  async function ensureLogin() {
    if (getToken() && user.value) {
      ready.value = true
      return
    }
    try {
      if (getToken()) {
        user.value = await request<User>({ url: '/users/me' })
        ready.value = true
        return
      }
    } catch {
      clearToken()
    }
    await login()
  }

  async function login() {
    const code = await getLoginCode()
    const res = await request<{ token: string; user: User }>({
      url: '/auth/wechat-login',
      method: 'POST',
      data: { code },
      auth: false,
    })
    setToken(res.token)
    user.value = res.user
    ready.value = true
  }

  function getLoginCode(): Promise<string> {
    return new Promise((resolve) => {
      // #ifdef MP-WEIXIN
      uni.login({
        provider: 'weixin',
        success: (r) => resolve(r.code || `dev_${Date.now()}`),
        fail: () => resolve(`dev_${Date.now()}`),
      })
      // #endif
      // #ifndef MP-WEIXIN
      resolve(`h5_${Date.now()}`)
      // #endif
    })
  }

  return { user, ready, ensureLogin, login }
})
