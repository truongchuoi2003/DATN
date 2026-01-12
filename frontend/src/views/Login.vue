<template>
  <div class="login-container">
    <h2>Login</h2>

    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <input 
          v-model="form.email" 
          type="email"
          placeholder="Email" 
          required
        />
      </div>

      <div class="form-group">
        <input 
          v-model="form.password" 
          type="password" 
          placeholder="Password" 
          required
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Loading...' : 'Login' }}
      </button>
    </form>

    <p v-if="message" :class="{ success: isSuccess, error: !isSuccess }">
      {{ message }}
    </p>

    <p class="register-link">
      Chưa có tài khoản? 
      <router-link to="/register">Đăng ký ngay</router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const message = ref('');
const isSuccess = ref(false);
const loading = ref(false);

const form = reactive({
  email: '',
  password: '',
});

const handleLogin = async () => {
  try {
    loading.value = true;
    message.value = '';

    const res = await api.post('/auth/login', form);
    
    // Sử dụng useAuth để lưu thông tin
    const { setAuth } = useAuth();
    setAuth(res.data.token, res.data.user);

    message.value = 'Đăng nhập thành công! 🎉';
    isSuccess.value = true;

    // Chuyển hướng sau 1 giây
    setTimeout(() => {
      if (res.data.user.role === 'admin') {
        router.push('/admin');
      } else if (res.data.user.role === 'employer') {
        router.push('/employer');
      } else {
        router.push('/student');
      }
    }, 1000);

  } catch (err) {
    isSuccess.value = false;
    message.value = err.response?.data?.message || 'Đăng nhập thất bại';
    console.error('Login error:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success {
  color: green;
  text-align: center;
  margin-top: 15px;
}

.error {
  color: red;
  text-align: center;
  margin-top: 15px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.register-link a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>