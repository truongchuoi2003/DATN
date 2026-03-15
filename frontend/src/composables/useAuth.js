import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Lỗi đọc user từ localStorage:', error);
    return null;
  }
};

const userState = ref(getUserFromStorage());
const tokenState = ref(localStorage.getItem('token'));

let storageListenerInitialized = false;

const syncAuthFromStorage = () => {
  userState.value = getUserFromStorage();
  tokenState.value = localStorage.getItem('token');
};

const initStorageListener = () => {
  if (storageListenerInitialized || typeof window === 'undefined') return;

  window.addEventListener('storage', (event) => {
    if (event.key === 'user' || event.key === 'token') {
      syncAuthFromStorage();
    }
  });

  storageListenerInitialized = true;
};

export function useAuth() {
  const router = useRouter();

  initStorageListener();

  const isLoggedIn = computed(() => !!tokenState.value);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    tokenState.value = null;
    userState.value = null;

    router.push('/login');
  };

  const setAuth = (authToken, userData) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));

    tokenState.value = authToken;
    userState.value = userData;
  };

  const refreshUser = () => {
    syncAuthFromStorage();
  };

  const updateUser = (userData) => {
    const nextUser = {
      ...(getUserFromStorage() || {}),
      ...(userData || {}),
    };

    localStorage.setItem('user', JSON.stringify(nextUser));
    userState.value = nextUser;
    tokenState.value = localStorage.getItem('token');

    return nextUser;
  };

  return {
    user: userState,
    token: tokenState,
    isLoggedIn,
    logout,
    setAuth,
    refreshUser,
    updateUser,
  };
}