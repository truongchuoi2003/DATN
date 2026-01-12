import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export function useAuth() {
  const router = useRouter();
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
  const token = ref(localStorage.getItem('token'));

  const isLoggedIn = computed(() => !!token.value);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token.value = null;
    user.value = null;
    router.push('/login');
  };

  return {
    user,
    token,
    isLoggedIn,
    logout
  };
}