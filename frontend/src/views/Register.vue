<template>
  <div class="register-container">
    <h2>Register</h2>

    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <input 
          v-model="form.fullName" 
          placeholder="Full name" 
          required
        />
      </div>

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
          minlength="6"
        />
      </div>

      <div class="form-group">
        <select v-model="form.role">
          <option value="student">Student</option>
          <option value="employer">Employer</option>
        </select>
      </div>

      <!-- Hiện trường Company Name nếu chọn Employer -->
      <div class="form-group" v-if="form.role === 'employer'">
        <input 
          v-model="form.companyName" 
          placeholder="Company Name" 
          required
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Loading...' : 'Register' }}
      </button>
    </form>

    <p v-if="message" :class="{ success: isSuccess, error: !isSuccess }">
      {{ message }}
    </p>

    <p class="login-link">
      Đã có tài khoản? 
      <router-link to="/login">Đăng nhập ngay</router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const message = ref('');
const isSuccess = ref(false);
const loading = ref(false);

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  role: 'student',
  companyName: '', // Thêm field này
});

const handleRegister = async () => {
  try {
    loading.value = true;
    message.value = '';

    const res = await api.post('/auth/register', form);
    
    message.value = 'Đăng ký thành công! 🎉';
    isSuccess.value = true;
    console.log(res.data);

    // Tự động chuyển sang trang login sau 2 giây
    setTimeout(() => {
      router.push('/login');
    }, 2000);

  } catch (err) {
    isSuccess.value = false;
    message.value = err.response?.data?.message || 'Đăng ký thất bại';
    console.error('Register error:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
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

input,
select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus,
select:focus {
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
  font-weight: bold;
}

.error {
  color: red;
  text-align: center;
  margin-top: 15px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: bold;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>