import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export function useAuth() {
  const router = useRouter();
  
  // Lấy thông tin user từ localStorage
  const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const user = ref(getUser());
  const token = ref(localStorage.getItem('token'));

  // Check đã login chưa
  const isLoggedIn = computed(() => !!token.value);

  // Hàm logout
  const logout = () => {
    // Xóa token và user khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset state
    token.value = null;
    user.value = null;
    
    // Redirect về trang login
    router.push('/login');
  };

  // Hàm login (lưu thông tin sau khi đăng nhập thành công)
  const setAuth = (authToken, userData) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    token.value = authToken;
    user.value = userData;
  };

  // Refresh user data từ localStorage
  const refreshUser = () => {
    user.value = getUser();
    token.value = localStorage.getItem('token');
  };

  return {
    user,
    token,
    isLoggedIn,
    logout,
    setAuth,
    refreshUser
  };
}