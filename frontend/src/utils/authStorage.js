const TOKEN_KEY = 'token'
const USER_KEY = 'user'

function getStorage() {
  if (typeof window === 'undefined') return null
  return window.sessionStorage
}

function safeParse(value) {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export const authStorage = {
  getToken() {
    const storage = getStorage()
    return storage ? storage.getItem(TOKEN_KEY) : null
  },

  getUser() {
    const storage = getStorage()
    return storage ? safeParse(storage.getItem(USER_KEY)) : null
  },

  setAuth(token, user) {
    const storage = getStorage()
    if (!storage) return

    storage.setItem(TOKEN_KEY, token)
    storage.setItem(USER_KEY, JSON.stringify(user))
  },

  setUser(user) {
    const storage = getStorage()
    if (!storage) return
    storage.setItem(USER_KEY, JSON.stringify(user))
  },

  clear() {
    const storage = getStorage()
    if (!storage) return
    storage.removeItem(TOKEN_KEY)
    storage.removeItem(USER_KEY)
  },
}