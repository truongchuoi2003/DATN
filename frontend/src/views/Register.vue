<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Left Side - Branding -->
      <div class="register-left">
        <div class="branding">
          <h1>🎓 DATN Platform</h1>
          <p class="tagline">Nền tảng kết nối sinh viên và nhà tuyển dụng</p>
          
          <div class="features">
            <div class="feature-item">
              <div class="icon">✨</div>
              <div>
                <h3>Cơ hội việc làm</h3>
                <p>Hàng ngàn công việc từ các công ty hàng đầu</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="icon">🚀</div>
              <div>
                <h3>Phát triển sự nghiệp</h3>
                <p>Xây dựng hồ sơ chuyên nghiệp và phát triển kỹ năng</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="icon">🤝</div>
              <div>
                <h3>Kết nối doanh nghiệp</h3>
                <p>Tìm kiếm ứng viên tài năng cho doanh nghiệp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Form -->
      <div class="register-right">
        <div class="form-wrapper">
          <h2>Tạo tài khoản</h2>
          <p class="subtitle">Bắt đầu hành trình nghề nghiệp của bạn</p>

          <form @submit.prevent="handleRegister">
            <!-- Role Selection - Prominent -->
            <div class="role-selection">
              <label class="role-option" :class="{ active: form.role === 'student' }">
                <input type="radio" v-model="form.role" value="student" required />
                <div class="role-card">
                  <div class="role-icon">🎓</div>
                  <div class="role-info">
                    <h4>Sinh viên</h4>
                    <p>Tìm kiếm cơ hội việc làm</p>
                  </div>
                </div>
              </label>

              <label class="role-option" :class="{ active: form.role === 'employer' }">
                <input type="radio" v-model="form.role" value="employer" required />
                <div class="role-card">
                  <div class="role-icon">💼</div>
                  <div class="role-info">
                    <h4>Nhà tuyển dụng</h4>
                    <p>Đăng tin và tìm ứng viên</p>
                  </div>
                </div>
              </label>
            </div>

            <!-- Form Fields in 2 columns -->
            <div class="form-grid">
              <div class="form-group">
                <label>Họ và tên <span class="required">*</span></label>
                <input 
                  v-model="form.fullName" 
                  type="text"
                  placeholder="Nguyễn Văn A" 
                  required
                />
              </div>

              <div class="form-group">
                <label>Email <span class="required">*</span></label>
                <input 
                  v-model="form.email" 
                  type="email"
                  placeholder="example@email.com" 
                  required
                />
              </div>

              <div class="form-group">
                <label>Mật khẩu <span class="required">*</span></label>
                <input 
                  v-model="form.password" 
                  type="password" 
                  placeholder="Ít nhất 6 ký tự" 
                  required
                  minlength="6"
                />
              </div>

              <div class="form-group" v-if="form.role === 'student'">
                <label>Ngày sinh <span class="required">*</span></label>
                <input 
                  v-model="form.birthday" 
                  type="date"
                  required
                />
              </div>

              <div class="form-group">
                <label>Số điện thoại <span class="required">*</span></label>
                <input 
                  v-model="form.phone" 
                  type="tel"
                  placeholder="0123456789" 
                  required
                  pattern="[0-9]{10,11}"
                />
              </div>

              <!-- Company Name for Employer -->
              <div class="form-group" v-if="form.role === 'employer'">
                <label>Tên công ty <span class="required">*</span></label>
                <input 
                  v-model="form.companyName" 
                  type="text"
                  placeholder="VD: FPT Software" 
                  :required="form.role === 'employer'"
                />
              </div>
            </div>

            <!-- Alert Message -->
            <div v-if="message" class="alert" :class="{ success: isSuccess, error: !isSuccess }">
              {{ message }}
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn-submit" :disabled="loading">
              <span v-if="loading">
                <span class="spinner"></span> Đang xử lý...
              </span>
              <span v-else>Đăng ký ngay</span>
            </button>

            <!-- Login Link -->
            <p class="login-link">
              Đã có tài khoản? 
              <router-link to="/login">Đăng nhập</router-link>
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

const router = useRouter();
const message = ref('');
const isSuccess = ref(false);
const loading = ref(false);

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  birthday: '',
  phone: '',
  role: '',
  companyName: '',
});

const handleRegister = async () => {
  try {
    loading.value = true;
    message.value = '';

    // Validate phone number
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(form.phone)) {
      message.value = 'Số điện thoại không hợp lệ (10-11 chữ số)';
      isSuccess.value = false;
      loading.value = false;
      return;
    }

    // Validate birthday (phải >= 18 tuổi)
    const birthday = new Date(form.birthday);
    const today = new Date();
    const age = today.getFullYear() - birthday.getFullYear();
    if (age < 18) {
      message.value = 'Bạn phải đủ 18 tuổi để đăng ký';
      isSuccess.value = false;
      loading.value = false;
      return;
    }

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
* {
  box-sizing: border-box;
}

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

/* Left Side - Branding */
.register-left {
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
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 50px;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.feature-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.icon {
  font-size: 32px;
  flex-shrink: 0;
}

.feature-item h3 {
  font-size: 18px;
  margin-bottom: 8px;
  font-weight: 600;
}

.feature-item p {
  font-size: 14px;
  opacity: 0.85;
  line-height: 1.5;
}

/* Right Side - Form */
.register-right {
  padding: 60px 50px;
  overflow-y: auto;
  max-height: 90vh;
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

/* Role Selection */
.role-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 30px;
}

.role-option {
  cursor: pointer;
}

.role-option input[type="radio"] {
  display: none;
}

.role-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
  background: white;
}

.role-option:hover .role-card {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.role-option.active .role-card {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.role-icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.role-info h4 {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.role-info p {
  font-size: 13px;
  color: #666;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.required {
  color: #e74c3c;
}

.form-group input {
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

/* Alert */
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

/* Submit Button */
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

/* Login Link */
.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 968px) {
  .register-container {
    grid-template-columns: 1fr;
  }

  .register-left {
    padding: 40px 30px;
  }

  .register-right {
    padding: 40px 30px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>