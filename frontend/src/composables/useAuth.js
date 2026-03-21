import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authStorage } from '../utils/authStorage'

const userState = ref(authStorage.getUser())
const tokenState = ref(authStorage.getToken())

function syncAuthFromStorage() {
  userState.value = authStorage.getUser()
  tokenState.value = authStorage.getToken()
}

export function useAuth() {
  const router = useRouter()

  const isLoggedIn = computed(() => !!tokenState.value)

  const logout = () => {
    authStorage.clear()
    tokenState.value = null
    userState.value = null
    router.push('/login')
  }

  const setAuth = (authToken, userData) => {
    authStorage.setAuth(authToken, userData)
    tokenState.value = authToken
    userState.value = userData
  }

  const refreshUser = () => {
    syncAuthFromStorage()
  }

  const updateUser = (userData) => {
    const nextUser = {
      ...(authStorage.getUser() || {}),
      ...(userData || {}),
    }

    authStorage.setUser(nextUser)
    userState.value = nextUser
    tokenState.value = authStorage.getToken()

    return nextUser
  }

  return {
    user: userState,
    token: tokenState,
    isLoggedIn,
    logout,
    setAuth,
    refreshUser,
    updateUser,
  }
}