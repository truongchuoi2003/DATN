<template>
  <!-- ============================================================
       TRANG: Đăng nhập
       LAYOUT: 2 cột – trái là branding, phải là form
       CHỨC NĂNG: Đăng nhập, chuyển hướng theo role
  ============================================================ -->
  <div class="login-page">
    <div class="login-container">

      <!-- ════ CỘT TRÁI: Branding ════ -->
      <div class="login-left">
        <h1>🎓 DATN Platform</h1>
        <p class="tagline">Chào mừng trở lại!</p>

        <!-- Thống kê nền tảng -->
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

        <div class="quote">"Nơi kết nối tài năng với cơ hội"</div>
      </div>

      <!-- ════ CỘT PHẢI: Form đăng nhập ════ -->
      <div class="login-right">
        <div class="form-wrapper">
          <h2>Đăng nhập</h2>
          <p class="subtitle">Tiếp tục hành trình của bạn</p>

          <!--
            @submit.prevent: ngăn form reload trang,
            thay vào đó gọi hàm handleLogin
          -->
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
            </div>

            <!-- Thông báo lỗi hoặc thành công -->
            <div v-if="message" class="alert" :class="isSuccess ? 'success' : 'error'">
              {{ message }}
            </div>

            <button type="submit" class="btn-submit" :disabled="loading">
              <!-- Hiển thị spinner khi đang gọi API -->
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
            </button>

          </form>

          <div class="divider"><span>hoặc</span></div>

          <p class="register-link">
            Chưa có tài khoản?
            <router-link to="/register">Đăng ký ngay</router-link>
          </p>

          <p class="back-home">
            <router-link to="/home">← Quay lại trang chủ</router-link>
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// ── Import ──
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { useAuth } from '../composables/useAuth'

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const router     = useRouter()
const message    = ref('')     // Thông báo hiển thị cho user
const isSuccess  = ref(false)  // true = thành công (xanh), false = lỗi (đỏ)
const loading    = ref(false)  // Đang gọi API hay không
const rememberMe = ref(false)  // Checkbox ghi nhớ đăng nhập

// Dữ liệu form – dùng reactive vì là object nhiều trường
const form = reactive({
  email:    '',
  password: '',
})

// ════════════════════════════════════════
// HÀM GỌI API
// ════════════════════════════════════════

async function handleLogin() {
  try {
    loading.value = true
    message.value = ''

    // Gọi API đăng nhập, truyền email + password
    const res = await api.post('/auth/login', form)

    // Lưu token và thông tin user vào localStorage thông qua useAuth
    const { setAuth } = useAuth()
    setAuth(res.data.token, res.data.user)

    message.value  = 'Đăng nhập thành công! 🎉'
    isSuccess.value = true

    // Chuyển hướng sau 1 giây, khác nhau theo role
    setTimeout(() => {
      const role = res.data.user.role
      if (role === 'admin') {
        router.push('/admin')
      } else if (role === 'employer') {
        router.push('/employer')
      } else {
        router.push('/student')
      }
    }, 1000)

  } catch (err) {
    isSuccess.value = false
    message.value   = err.response?.data?.message || 'Đăng nhập thất bại'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
* { box-sizing: border-box; }

/* ════════════════════════════════════
   TRANG ĐĂNG NHẬP
   Nền gradient tím, card trắng giữa
════════════════════════════════════ */
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Card trắng chia 2 cột */
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

/* ════════════════════════════════════
   CỘT TRÁI – Branding
════════════════════════════════════ */
.login-left {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-left h1 {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 12px;
}

.tagline {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 48px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 28px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 36px;
}

.stat { text-align: center; }
.stat h3 { font-size: 30px; font-weight: 700; margin-bottom: 4px; }
.stat p  { font-size: 13px; opacity: 0.85; }

.quote {
  text-align: center;
  font-size: 16px;
  font-style: italic;
  opacity: 0.9;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

/* ════════════════════════════════════
   CỘT PHẢI – Form
════════════════════════════════════ */
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
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 7px;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-options { margin-bottom: 24px; }

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
}

/* Alert thông báo */
.alert {
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  margin-bottom: 18px;
}

.alert.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.alert.error   { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

/* Nút submit */
.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* Spinner nhỏ trong nút */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Đường kẻ "hoặc" */
.divider {
  text-align: center;
  margin: 24px 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  width: 100%; height: 1px;
  background: #e0e0e0;
}

.divider span {
  background: white;
  padding: 0 14px;
  color: #999;
  font-size: 14px;
  position: relative;  /* Nổi lên trên đường kẻ */
}

.register-link { text-align: center; color: #666; font-size: 14px; }
.register-link a { color: #667eea; font-weight: 600; text-decoration: none; }
.register-link a:hover { text-decoration: underline; }

.back-home { text-align: center; margin-top: 12px; font-size: 14px; }
.back-home a { color: #999; text-decoration: none; }
.back-home a:hover { color: #667eea; }

/* ════════════════════════════════════
   RESPONSIVE
════════════════════════════════════ */
@media (max-width: 968px) {
  .login-container { grid-template-columns: 1fr; }
  .login-left  { padding: 36px 28px; }
  .login-right { padding: 40px 28px; }
}

@media (max-width: 480px) {
  .login-left  { display: none; }
  .login-right { padding: 32px 20px; }
}
</style>