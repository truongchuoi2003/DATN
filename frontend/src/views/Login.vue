<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Left Side - Branding -->
      <div class="login-left">
        <div class="branding">
          <h1>🎓 DATN Platform</h1>
          <p class="tagline">Chào mừng trở lại!</p>
          
          <div class="illustration">
            <div class="stats-card">
              <div class="stat">
                <h3>10,000+</h3>
                <p>Sinh viên</p>
              </div>
              <div class="stat">
                <h3>500+</h3>
                <p>Công ty</p>
              </div>
              <div class="stat">
                <h3>5,000+</h3>
                <p>Việc làm</p>
              </div>
            </div>
          </div>

          <div class="quote">
            <p>"Nơi kết nối tài năng với cơ hội"</p>
          </div>
        </div>
      </div>

      <!-- Right Side - Form -->
      <div class="login-right">
        <div class="form-wrapper">
          <h2>Đăng nhập</h2>
          <p class="subtitle">Tiếp tục hành trình của bạn</p>

          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label>Email</label>
              <input 
                v-model="form.email" 
                type="email"
                placeholder="example@email.com" 
                required
                autofocus
              />
            </div>

            <div class="form-group">
              <label>Mật khẩu</label>
              <input 
                v-model="form.password" 
                type="password" 
                placeholder="Nhập mật khẩu" 
                required
              />
            </div>

            <div class="form-options">
              <label class="remember-me">
                <input type="checkbox" v-model="rememberMe" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" class="forgot-password">Quên mật khẩu?</a>
            </div>

            <div v-if="message" class="alert" :class="{ success: isSuccess, error: !isSuccess }">
              {{ message }}
            </div>

            <button type="submit" class="btn-submit" :disabled="loading">
              <span v-if="loading">
                <span class="spinner"></span> Đang xử lý...
              </span>
              <span v-else>Đăng nhập</span>
            </button>

            <div class="divider">
              <span>hoặc</span>
            </div>

            <p class="register-link">
              Chưa có tài khoản? 
              <router-link to="/register">Đăng ký ngay</router-link>
            </p>
          </form>
        </div>
      </div>
    </div>
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
const rememberMe = ref(false);

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
* {
  box-sizing: border-box;
}

.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1100px;
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  min-height: 600px;
}

/* Left Side - Branding */
.login-left {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.branding h1 {
  font-size: 42px;
  margin-bottom: 15px;
  font-weight: 700;
}

.tagline {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 50px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat {
  text-align: center;
}

.stat h3 {
  font-size: 32px;
  margin-bottom: 5px;
  font-weight: 700;
}

.stat p {
  font-size: 14px;
  opacity: 0.9;
}

.quote {
  text-align: center;
  font-size: 18px;
  font-style: italic;
  opacity: 0.95;
}

/* Right Side - Form */
.login-right {
  padding: 60px 50px;
  display: flex;
  align-items: center;
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.form-wrapper h2 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  margin-bottom: 35px;
  font-size: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  font-family: inherit;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
}

.remember-me input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.forgot-password:hover {
  text-decoration: underline;
}

.alert {
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.alert.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.btn-submit {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.divider {
  text-align: center;
  margin: 25px 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: #e0e0e0;
}

.divider span {
  background: white;
  padding: 0 15px;
  color: #999;
  font-size: 14px;
  position: relative;
  z-index: 1;
}

.register-link {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 968px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .login-left {
    padding: 40px 30px;
  }

  .stats-card {
    padding: 20px;
  }

  .login-right {
    padding: 40px 30px;
  }
}
</style>