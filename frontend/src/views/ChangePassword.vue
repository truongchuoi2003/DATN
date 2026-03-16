<template>
  <!-- ============================================================
       TRANG: Đổi mật khẩu
       CHỨC NĂNG: Nhập mật khẩu hiện tại + mật khẩu mới + xác nhận
  ============================================================ -->
  <div class="page">
    <div class="card-wrap">
      <div class="card">

        <h1>Đổi mật khẩu</h1>
        <p class="subtitle">Nhập mật khẩu hiện tại và mật khẩu mới của bạn.</p>

        <!-- @submit.prevent: ngăn reload trang, gọi handleSubmit -->
        <form @submit.prevent="handleSubmit">

          <div class="form-group">
            <label>Mật khẩu hiện tại</label>
            <input v-model="form.currentPassword" type="password" placeholder="Nhập mật khẩu hiện tại" required />
          </div>

          <div class="form-group">
            <label>Mật khẩu mới</label>
            <input v-model="form.newPassword" type="password" placeholder="Ít nhất 6 ký tự" required />
          </div>

          <div class="form-group">
            <label>Xác nhận mật khẩu mới</label>
            <input v-model="form.confirmNewPassword" type="password" placeholder="Nhập lại mật khẩu mới" required />
          </div>

          <!-- Thông báo thành công / lỗi -->
          <div v-if="success" class="alert alert-success">{{ success }}</div>
          <div v-if="error"   class="alert alert-error">{{ error }}</div>

          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Đang cập nhật...' : 'Đổi mật khẩu' }}
          </button>

        </form>

        <p class="back-link">
          <router-link to="/student/profile">← Quay lại hồ sơ</router-link>
        </p>

      </div>
    </div>
  </div>
</template>

<script setup>
// ── Import ──
import { reactive, ref } from 'vue'
import api from '../services/api'

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const loading = ref(false)
const success = ref('')
const error   = ref('')

const form = reactive({
  currentPassword:    '',
  newPassword:        '',
  confirmNewPassword: '',
})

// ════════════════════════════════════════
// HÀM GỌI API
// ════════════════════════════════════════

async function handleSubmit() {
  try {
    loading.value = true
    success.value = ''
    error.value   = ''

    // Validate ở frontend trước khi gọi API
    if (form.newPassword.length < 6) {
      error.value = 'Mật khẩu mới phải có ít nhất 6 ký tự'
      return
    }

    if (form.newPassword !== form.confirmNewPassword) {
      error.value = 'Mật khẩu mới không khớp'
      return
    }

    // Gọi API
    const { data } = await api.put('/auth/change-password', form)
    success.value = data.message || 'Đổi mật khẩu thành công! ✅'

    // Reset form
    form.currentPassword    = ''
    form.newPassword        = ''
    form.confirmNewPassword = ''

  } catch (err) {
    error.value = err.response?.data?.message || 'Có lỗi xảy ra'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Căn giữa trang */
.page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card-wrap {
  width: 100%;
  max-width: 480px;
}

/* Card trắng */
.card {
  background: white;
  border-radius: 16px;
  padding: 36px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card h1 { font-size: 24px; font-weight: 700; color: #2c3e50; margin-bottom: 8px; }
.subtitle { font-size: 14px; color: #888; margin-bottom: 28px; }

/* Form */
.form-group { display: flex; flex-direction: column; margin-bottom: 18px; }

.form-group label { font-size: 13px; font-weight: 600; color: #555; margin-bottom: 7px; }

.form-group input {
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Alert */
.alert { padding: 12px 15px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }
.alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.alert-error   { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

/* Nút submit */
.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* Link quay lại */
.back-link { text-align: center; margin-top: 16px; font-size: 14px; }
.back-link a { color: #667eea; text-decoration: none; font-weight: 500; }
.back-link a:hover { text-decoration: underline; }
</style>