<template>
  <div class="profile-page">
    <Header />
    
    <div class="container">
      <div class="profile-layout">
        <!-- Sidebar -->
        <aside class="profile-sidebar">
          <div class="profile-card">
            <div class="avatar-section">
              <div class="avatar-large company">
                {{ getInitials(profile?.companyName) }}
              </div>
              <button class="btn-upload">
                📷 Thay logo
              </button>
            </div>
            
            <h2>{{ profile?.companyName }}</h2>
            <p class="email">{{ profile?.email }}</p>
            <span class="role-badge employer">Nhà tuyển dụng</span>
            
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-value">{{ profile?.verified ? '✓' : '✕' }}</span>
                <span class="stat-label">Xác thực</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">8</span>
                <span class="stat-label">Tin tuyển dụng</span>
              </div>
            </div>
          </div>

          <nav class="profile-nav">
            <button 
              :class="{ active: activeTab === 'company' }"
              @click="activeTab = 'company'"
            >
              🏢 Thông tin công ty
            </button>
            <button 
              :class="{ active: activeTab === 'contact' }"
              @click="activeTab = 'contact'"
            >
              📞 Liên hệ
            </button>
            <button 
              :class="{ active: activeTab === 'security' }"
              @click="activeTab = 'security'"
            >
              🔒 Bảo mật
            </button>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="profile-main">
          <!-- Company Info -->
          <div v-if="activeTab === 'company'" class="content-section">
            <div class="section-header">
              <h2>Thông tin công ty</h2>
              <button v-if="!editMode" @click="editMode = true" class="btn btn-outline">
                ✏️ Chỉnh sửa
              </button>
              <div v-else class="edit-actions">
                <button @click="handleSave" class="btn btn-primary">
                  💾 Lưu
                </button>
                <button @click="handleCancel" class="btn btn-outline">
                  ✕ Hủy
                </button>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Tên công ty</label>
                <input 
                  v-model="formData.companyName" 
                  :disabled="!editMode"
                  type="text"
                />
              </div>

              <div class="form-group">
                <label>Email</label>
                <input 
                  v-model="formData.email" 
                  disabled
                  type="email"
                />
                <small>Email không thể thay đổi</small>
              </div>

              <div class="form-group">
                <label>Quy mô công ty</label>
                <select v-model="formData.companySize" :disabled="!editMode">
                  <option value="">-- Chọn quy mô --</option>
                  <option value="1-10">1-10 nhân viên</option>
                  <option value="11-50">11-50 nhân viên</option>
                  <option value="51-200">51-200 nhân viên</option>
                  <option value="201-500">201-500 nhân viên</option>
                  <option value="500+">500+ nhân viên</option>
                </select>
              </div>

              <div class="form-group">
                <label>Lĩnh vực</label>
                <input 
                  v-model="formData.industry" 
                  :disabled="!editMode"
                  type="text"
                  placeholder="VD: Công nghệ thông tin"
                />
              </div>

              <div class="form-group">
                <label>Website</label>
                <input 
                  v-model="formData.website" 
                  :disabled="!editMode"
                  type="url"
                  placeholder="https://example.com"
                />
              </div>

              <div class="form-group">
                <label>Mã số thuế</label>
                <input 
                  v-model="formData.taxCode" 
                  :disabled="!editMode"
                  type="text"
                />
              </div>

              <div class="form-group full-width">
                <label>Địa chỉ</label>
                <input 
                  v-model="formData.address" 
                  :disabled="!editMode"
                  type="text"
                />
              </div>

              <div class="form-group full-width">
                <label>Giới thiệu công ty</label>
                <textarea 
                  v-model="formData.description" 
                  :disabled="!editMode"
                  rows="6"
                  placeholder="Mô tả về công ty, văn hóa, giá trị cốt lõi..."
                ></textarea>
              </div>
            </div>

            <div class="verification-status">
              <h3>Trạng thái xác thực</h3>
              <div class="status-card" :class="{ verified: profile?.verified }">
                <span class="status-icon">{{ profile?.verified ? '✓' : '⏳' }}</span>
                <div class="status-info">
                  <h4>{{ profile?.verified ? 'Đã xác thực' : 'Chưa xác thực' }}</h4>
                  <p>{{ profile?.verified ? 'Công ty của bạn đã được xác thực' : 'Đang chờ admin phê duyệt' }}</p>
                </div>
              </div>
            </div>

            <div v-if="message" class="alert" :class="{ success: isSuccess, error: !isSuccess }">
              {{ message }}
            </div>
          </div>

          <!-- Contact Info -->
          <div v-if="activeTab === 'contact'" class="content-section">
            <div class="section-header">
              <h2>Thông tin liên hệ</h2>
              <button v-if="!editMode" @click="editMode = true" class="btn btn-outline">
                ✏️ Chỉnh sửa
              </button>
              <div v-else class="edit-actions">
                <button @click="handleSave" class="btn btn-primary">
                  💾 Lưu
                </button>
                <button @click="handleCancel" class="btn btn-outline">
                  ✕ Hủy
                </button>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Người đại diện</label>
                <input 
                  v-model="formData.fullName" 
                  :disabled="!editMode"
                  type="text"
                />
              </div>

              <div class="form-group">
                <label>Số điện thoại</label>
                <input 
                  v-model="formData.phone" 
                  :disabled="!editMode"
                  type="tel"
                />
              </div>

              <div class="form-group">
                <label>Ngày sinh</label>
                <input 
                  v-model="formData.birthday" 
                  :disabled="!editMode"
                  type="date"
                />
              </div>
            </div>
          </div>

          <!-- Security -->
          <div v-if="activeTab === 'security'" class="content-section">
            <div class="section-header">
              <h2>Đổi mật khẩu</h2>
            </div>

            <div class="password-form">
              <div class="form-group">
                <label>Mật khẩu hiện tại</label>
                <input 
                  v-model="passwordForm.currentPassword" 
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div class="form-group">
                <label>Mật khẩu mới</label>
                <input 
                  v-model="passwordForm.newPassword" 
                  type="password"
                  placeholder="Ít nhất 6 ký tự"
                />
              </div>

              <div class="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input 
                  v-model="passwordForm.confirmPassword" 
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <div v-if="passwordMessage" class="alert" :class="{ success: passwordSuccess, error: !passwordSuccess }">
                {{ passwordMessage }}
              </div>

              <button @click="handleChangePassword" class="btn btn-primary">
                🔒 Đổi mật khẩu
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import Header from '../components/Header.vue';
import api from '../services/api';

const activeTab = ref('company');
const editMode = ref(false);
const message = ref('');
const isSuccess = ref(false);
const profile = ref(null);

const passwordMessage = ref('');
const passwordSuccess = ref(false);

const formData = reactive({
  companyName: '',
  email: '',
  fullName: '',
  phone: '',
  birthday: '',
  address: '',
  companySize: '',
  industry: '',
  website: '',
  taxCode: '',
  description: '',
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0];
  }
  return name.substring(0, 2).toUpperCase();
};

const fetchProfile = async () => {
  try {
    const res = await api.get('/profile');
    profile.value = res.data.profile;
    
    Object.assign(formData, {
      companyName: profile.value.companyName || '',
      email: profile.value.email || '',
      fullName: profile.value.fullName || '',
      phone: profile.value.phone || '',
      birthday: profile.value.birthday ? profile.value.birthday.split('T')[0] : '',
      address: profile.value.address || '',
      companySize: profile.value.companySize || '',
      industry: profile.value.industry || '',
      website: profile.value.website || '',
      taxCode: profile.value.taxCode || '',
      description: profile.value.description || '',
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
};

const handleSave = async () => {
  try {
    message.value = '';
    const res = await api.put('/profile', formData);
    
    profile.value = res.data.profile;
    message.value = 'Cập nhật thành công! ✅';
    isSuccess.value = true;
    editMode.value = false;
    
    setTimeout(() => {
      message.value = '';
    }, 3000);
  } catch (error) {
    message.value = error.response?.data?.message || 'Cập nhật thất bại';
    isSuccess.value = false;
  }
};

const handleCancel = () => {
  editMode.value = false;
  message.value = '';
  fetchProfile();
};

const handleChangePassword = async () => {
  try {
    passwordMessage.value = '';

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      passwordMessage.value = 'Vui lòng điền đầy đủ thông tin';
      passwordSuccess.value = false;
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      passwordMessage.value = 'Mật khẩu mới không khớp';
      passwordSuccess.value = false;
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      passwordMessage.value = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      passwordSuccess.value = false;
      return;
    }

    await api.put('/profile/change-password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    passwordMessage.value = 'Đổi mật khẩu thành công! ✅';
    passwordSuccess.value = true;

    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';

    setTimeout(() => {
      passwordMessage.value = '';
    }, 3000);
  } catch (error) {
    passwordMessage.value = error.response?.data?.message || 'Đổi mật khẩu thất bại';
    passwordSuccess.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

.profile-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.avatar-section {
  margin-bottom: 20px;
}

.avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  margin: 0 auto 15px;
}

.btn-upload {
  padding: 8px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-upload:hover {
  background: #e0e0e0;
}

.profile-card h2 {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.email {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.role-badge {
  display: inline-block;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.role-badge.employer {
  background: #f3e5f5;
  color: #7b1fa2;
}

.profile-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #4ecdc4;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 13px;
  color: #999;
}

.profile-nav {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.profile-nav button {
  padding: 12px 15px;
  background: transparent;
  border: none;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  color: #666;
}

.profile-nav button:hover {
  background: #f5f5f5;
}

.profile-nav button.active {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.profile-main {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h2 {
  font-size: 24px;
  color: #2c3e50;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.4);
}

.btn-outline {
  background: white;
  border: 1px solid #e0e0e0;
  color: #666;
}

.btn-outline:hover {
  border-color: #4ecdc4;
  color: #4ecdc4;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  font-family: inherit;
}

.form-group input:disabled,
.form-group textarea:disabled,
.form-group select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #4ecdc4;
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
}

.form-group small {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.verification-status {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;
}

.verification-status h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #2c3e50;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border: 2px solid #fff3cd;
  background: #fffef7;
  border-radius: 8px;
}

.status-card.verified {
  border-color: #d4edda;
  background: #f1f9f3;
}

.status-icon {
  font-size: 48px;
}

.status-info h4 {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.status-info p {
  font-size: 14px;
  color: #666;
}

.alert {
  padding: 12px 15px;
  border-radius: 8px;
  margin-top: 20px;
  font-size: 14px;
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

.password-form {
  max-width: 500px;
}

.password-form .form-group {
  margin-bottom: 20px;
}

@media (max-width: 968px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>