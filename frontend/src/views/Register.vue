<template>
  <!-- ============================================================
       TRANG: Đăng ký tài khoản
       LAYOUT: 2 cột – trái là branding, phải là form
       CHỨC NĂNG: Chọn role (sinh viên / nhà tuyển dụng),
                  điền thông tin, validate, gọi API đăng ký
  ============================================================ -->
  <div class="register-page">
    <div class="register-container">

      <!-- ════ CỘT TRÁI: Branding ════ -->
      <div class="register-left">
        <h1>🎓 DATN Platform</h1>
        <p class="tagline">Nền tảng kết nối sinh viên và nhà tuyển dụng</p>

        <!--
          Dùng v-for để render danh sách tính năng
          thay vì lặp lại HTML 3 lần
        -->
        <div class="feature-list">
          <div v-for="feat in features" :key="feat.title" class="feature-item">
            <div class="feat-icon">{{ feat.icon }}</div>
            <div>
              <h3>{{ feat.title }}</h3>
              <p>{{ feat.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ════ CỘT PHẢI: Form đăng ký ════ -->
      <div class="register-right">
        <div class="form-wrapper">
          <h2>Tạo tài khoản</h2>
          <p class="subtitle">Bắt đầu hành trình nghề nghiệp của bạn</p>

          <form @submit.prevent="handleRegister">

            <!-- BƯỚC 1: Chọn loại tài khoản -->
            <div class="role-selection">
              <!--
                Dùng label bao radio button để click cả card đều chọn được
                :class="{ active: ... }" thêm viền xanh khi được chọn
              -->
              <label class="role-option" :class="{ active: form.role === 'student' }">
                <input type="radio" v-model="form.role" value="student" required />
                <div class="role-card">
                  <div class="role-icon">🎓</div>
                  <h4>Sinh viên</h4>
                  <p>Tìm kiếm cơ hội việc làm</p>
                </div>
              </label>

              <label class="role-option" :class="{ active: form.role === 'employer' }">
                <input type="radio" v-model="form.role" value="employer" required />
                <div class="role-card">
                  <div class="role-icon">💼</div>
                  <h4>Nhà tuyển dụng</h4>
                  <p>Đăng tin và tìm ứng viên</p>
                </div>
              </label>
            </div>

            <!-- BƯỚC 2: Điền thông tin -->
            <div class="form-grid">

              <div class="form-group">
                <label>Họ và tên <span class="required">*</span></label>
                <input v-model="form.fullName" type="text" placeholder="Nguyễn Văn A" required />
              </div>

              <div class="form-group">
                <label>Email <span class="required">*</span></label>
                <input v-model="form.email" type="email" placeholder="example@email.com" required />
              </div>

              <div class="form-group">
                <label>Mật khẩu <span class="required">*</span></label>
                <input v-model="form.password" type="password" placeholder="Ít nhất 6 ký tự" required minlength="6" />
              </div>

              <div class="form-group">
                <label>Số điện thoại <span class="required">*</span></label>
                <input v-model="form.phone" type="tel" placeholder="0123456789" required pattern="[0-9]{10,11}" />
              </div>

              <!-- Chỉ hiển thị trường "Ngày sinh" nếu chọn role = sinh viên -->
              <div v-if="form.role === 'student'" class="form-group">
                <label>Ngày sinh <span class="required">*</span></label>
                <input v-model="form.birthday" type="date" required />
              </div>

              <!-- Chỉ hiển thị trường "Tên công ty" nếu chọn role = nhà tuyển dụng -->
              <div v-if="form.role === 'employer'" class="form-group">
                <label>Tên công ty <span class="required">*</span></label>
                <input v-model="form.companyName" type="text" placeholder="VD: FPT Software" :required="form.role === 'employer'" />
              </div>

            </div>

            <!-- Thông báo lỗi hoặc thành công -->
            <div v-if="message" class="alert" :class="isSuccess ? 'success' : 'error'">
              {{ message }}
            </div>

            <button type="submit" class="btn-submit" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Đang xử lý...' : 'Đăng ký ngay' }}
            </button>

          </form>

          <p class="login-link">
            Đã có tài khoản?
            <router-link to="/login">Đăng nhập</router-link>
          </p>

          <p class="back-home">
            <router-link to="/">← Quay lại trang chủ</router-link>
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

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const router    = useRouter()
const message   = ref('')
const isSuccess = ref(false)
const loading   = ref(false)

// Dữ liệu form
const form = reactive({
  fullName:    '',
  email:       '',
  password:    '',
  birthday:    '',
  phone:       '',
  role:        '',    // 'student' hoặc 'employer'
  companyName: '',
})

// ════════════════════════════════════════
// DỮ LIỆU TĨNH
// ════════════════════════════════════════

// Danh sách tính năng bên trái – dùng v-for thay vì lặp HTML
const features = [
  { icon: '✨', title: 'Cơ hội việc làm',      desc: 'Hàng ngàn công việc từ các công ty hàng đầu' },
  { icon: '🚀', title: 'Phát triển sự nghiệp', desc: 'Xây dựng hồ sơ chuyên nghiệp và phát triển kỹ năng' },
  { icon: '🤝', title: 'Kết nối doanh nghiệp', desc: 'Tìm kiếm ứng viên tài năng cho doanh nghiệp' },
]

// ════════════════════════════════════════
// HÀM GỌI API
// ════════════════════════════════════════

async function handleRegister() {
  try {
    loading.value = true
    message.value = ''

    // Validate số điện thoại
    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(form.phone)) {
      message.value  = 'Số điện thoại không hợp lệ (10–11 chữ số)'
      isSuccess.value = false
      loading.value  = false
      return
    }

    // Validate tuổi >= 18 (chỉ áp dụng cho sinh viên)
    if (form.role === 'student' && form.birthday) {
      const age = new Date().getFullYear() - new Date(form.birthday).getFullYear()
      if (age < 18) {
        message.value  = 'Bạn phải đủ 18 tuổi để đăng ký'
        isSuccess.value = false
        loading.value  = false
        return
      }
    }

    // Gọi API đăng ký
    await api.post('/auth/register', form)

    message.value  = 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...'
    isSuccess.value = true

    // Chuyển sang trang login sau 2 giây
    setTimeout(() => {
      router.push('/login')
    }, 2000)

  } catch (err) {
    isSuccess.value = false
    message.value   = err.response?.data?.message || 'Đăng ký thất bại'
    console.error('Register error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
* { box-sizing: border-box; }

/* ════════════════════════════════════
   TRANG ĐĂNG KÝ
════════════════════════════════════ */
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* ════════════════════════════════════
   CỘT TRÁI – Branding
════════════════════════════════════ */
.register-left {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.register-left h1 {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 12px;
}

.tagline {
  font-size: 17px;
  opacity: 0.9;
  margin-bottom: 48px;
  line-height: 1.5;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.feature-item {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.feat-icon {
  font-size: 30px;
  flex-shrink: 0;
}

.feature-item h3 {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 5px;
}

.feature-item p {
  font-size: 13px;
  opacity: 0.85;
  line-height: 1.5;
}

/* ════════════════════════════════════
   CỘT PHẢI – Form
════════════════════════════════════ */
.register-right {
  padding: 48px 50px;
  overflow-y: auto;
  max-height: 95vh;
}

.form-wrapper h2 {
  font-size: 30px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 15px;
  margin-bottom: 28px;
}

/* ── Chọn loại tài khoản ── */
.role-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

/* Ẩn radio button mặc định, dùng label làm card */
.role-option input[type="radio"] { display: none; }

.role-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 18px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.role-option:hover .role-card {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

/* Khi được chọn: viền xanh + nền nhạt */
.role-option.active .role-card {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%);
}

.role-icon { font-size: 32px; margin-bottom: 8px; }
.role-card h4 { font-size: 15px; color: #2c3e50; margin-bottom: 4px; }
.role-card p  { font-size: 12px; color: #888; }

/* ── Form grid 2 cột ── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group { display: flex; flex-direction: column; }

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 6px;
}

.required { color: #e74c3c; }

.form-group input {
  padding: 11px 14px;
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

/* Alert */
.alert {
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
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

.spinner {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Links dưới form */
.login-link {
  text-align: center;
  margin-top: 18px;
  color: #666;
  font-size: 14px;
}

.login-link a { color: #667eea; font-weight: 600; text-decoration: none; }
.login-link a:hover { text-decoration: underline; }

.back-home { text-align: center; margin-top: 10px; font-size: 14px; }
.back-home a { color: #999; text-decoration: none; }
.back-home a:hover { color: #667eea; }

/* ════════════════════════════════════
   RESPONSIVE
════════════════════════════════════ */
@media (max-width: 968px) {
  .register-container { grid-template-columns: 1fr; }
  .register-left  { padding: 36px 28px; }
  .register-right { padding: 36px 28px; max-height: none; }
  .form-grid      { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .register-left { display: none; }
  .register-right { padding: 28px 20px; }
}
</style>