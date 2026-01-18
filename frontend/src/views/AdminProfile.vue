<template>
  <div class="profile-page">
    <Header />
    
    <div class="container">
      <div class="profile-layout">
        <!-- Sidebar -->
        <aside class="profile-sidebar">
          <div class="profile-card">
            <div class="avatar-section">
              <div class="avatar-large admin">
                {{ getInitials(profile?.fullName) }}
              </div>
              <button class="btn-upload">
                📷 Thay ảnh
              </button>
            </div>
            
            <h2>{{ profile?.fullName }}</h2>
            <p class="email">{{ profile?.email }}</p>
            <span class="role-badge admin">{{ getRoleLabel(profile?.role) }}</span>
            
            <div class="admin-info">
              <div class="info-item">
                <span class="label">Quyền hạn:</span>
                <span class="value">{{ profile?.permissions?.join(', ') }}</span>
              </div>
              <div class="info-item">
                <span class="label">Đăng nhập lần cuối:</span>
                <span class="value">{{ formatDate(profile?.lastLogin) }}</span>
              </div>
            </div>
          </div>

          <nav class="profile-nav">
            <button 
              :class="{ active: activeTab === 'info' }"
              @click="activeTab = 'info'"
            >
              👤 Thông tin cá nhân
            </button>
            <button 
              :class="{ active: activeTab === 'permissions' }"
              @click="activeTab = 'permissions'"
            >
              🔑 Quyền hạn
            </button>
            <button 
              :class="{ active: activeTab === 'security' }"
              @click="activeTab = 'security'"
            >
              🔒 Bảo mật
            </button>
            <button 
              :class="{ active: activeTab === 'activity' }"
              @click="activeTab = 'activity'"
            >
              📊 Hoạt động
            </button>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="profile-main">
          <!-- Personal Info -->
          <div v-if="activeTab === 'info'" class="content-section">
            <div class="section-header">
              <h2>Thông tin cá nhân</h2>
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
                <label>Họ và tên</label>
                <input 
                  v-model="formData.fullName" 
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
                <label>Số điện thoại</label>
                <input 
                  v-model="formData.phone" 
                  :disabled="!editMode"
                  type="tel"
                />
              </div>
            </div>

            <div v-if="message" class="alert" :class="{ success: isSuccess, error: !isSuccess }">
              {{ message }}
            </div>
          </div>

          <!-- Permissions -->
          <div v-if="activeTab === 'permissions'" class="content-section">
            <div class="section-header">
              <h2>Quyền hạn</h2>
            </div>

            <div class="permissions-grid">
              <div class="permission-card" :class="{ active: hasPermission('all') }">
                <div class="permission-icon">🔓</div>
                <h4>Toàn quyền</h4>
                <p>Truy cập và quản lý tất cả tính năng</p>
                <span class="permission-status">
                  {{ hasPermission('all') ? '✓ Đã cấp' : '✕ Chưa cấp' }}
                </span>
              </div>

              <div class="permission-card" :class="{ active: hasPermission('manage_users') }">
                <div class="permission-icon">👥</div>
                <h4>Quản lý người dùng</h4>
                <p>Xem, thêm, sửa, xóa người dùng</p>
                <span class="permission-status">
                  {{ hasPermission('manage_users') ? '✓ Đã cấp' : '✕ Chưa cấp' }}
                </span>
              </div>

              <div class="permission-card" :class="{ active: hasPermission('manage_jobs') }">
                <div class="permission-icon">📢</div>
                <h4>Quản lý tin tuyển dụng</h4>
                <p>Duyệt và quản lý tin đăng tuyển</p>
                <span class="permission-status">
                  {{ hasPermission('manage_jobs') ? '✓ Đã cấp' : '✕ Chưa cấp' }}
                </span>
              </div>

              <div class="permission-card" :class="{ active: hasPermission('manage_companies') }">
                <div class="permission-icon">🏢</div>
                <h4>Quản lý công ty</h4>
                <p>Xác thực và quản lý công ty</p>
                <span class="permission-status">
                  {{ hasPermission('manage_companies') ? '✓ Đã cấp' : '✕ Chưa cấp' }}
                </span>
              </div>

              <div class="permission-card" :class="{ active: hasPermission('view_reports') }">
                <div class="permission-icon">📊</div>
                <h4>Xem báo cáo</h4>
                <p>Truy cập báo cáo và thống kê</p>
                <span class="permission-status">
                  {{ hasPermission('view_reports') ? '✓ Đã cấp' : '✕ Chưa cấp' }}
                </span>
              </div>

              <div class="permission-card" :class="{ active: hasPermission('system_settings') }">
                <div class="permission-icon">⚙️</div>
                <h4>Cài đặt hệ thống</h4>
                <p>Cấu hình và tùy chỉnh hệ thống</p>
                <span class="permission-status">
                  {{ hasPermission('system_settings') ? '✓ Đã cấp' : '✕ Chưa cấp' }}
                </span>
              </div>
            </div>

            <div class="permission-note">
              <strong>Lưu ý:</strong> Quyền hạn được quản lý bởi hệ thống. Liên hệ quản trị viên nếu bạn cần cập nhật quyền truy cập.
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

            <div class="security-tips">
              <h3>💡 Mẹo bảo mật</h3>
              <ul>
                <li>Sử dụng mật khẩu mạnh với ít nhất 8 ký tự</li>
                <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                <li>Không chia sẻ mật khẩu với người khác</li>
                <li>Đổi mật khẩu định kỳ (3-6 tháng/lần)</li>
                <li>Không sử dụng cùng một mật khẩu cho nhiều tài khoản</li>
              </ul>
            </div>
          </div>

          <!-- Activity Log -->
          <div v-if="activeTab === 'activity'" class="content-section">
            <div class="section-header">
              <h2>Lịch sử hoạt động</h2>
              <select class="filter-select">
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
                <option>Tất cả</option>
              </select>
            </div>

            <div class="activity-timeline">
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>Đăng nhập hệ thống</h4>
                  <p>Đăng nhập từ IP: 192.168.1.1</p>
                  <span class="timeline-time">5 phút trước</span>
                </div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>Phê duyệt công ty</h4>
                  <p>Đã phê duyệt FPT Software</p>
                  <span class="timeline-time">2 giờ trước</span>
                </div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>Cập nhật profile</h4>
                  <p>Thay đổi số điện thoại</p>
                  <span class="timeline-time">1 ngày trước</span>
                </div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>Xóa người dùng</h4>
                  <p>Xóa tài khoản spam@test.com</p>
                  <span class="timeline-time">2 ngày trước</span>
                </div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>Đổi mật khẩu</h4>
                  <p>Cập nhật mật khẩu thành công</p>
                  <span class="timeline-time">5 ngày trước</span>
                </div>
              </div>
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

const activeTab = ref('info');
const editMode = ref(false);
const message = ref('');
const isSuccess = ref(false);
const profile = ref(null);

const passwordMessage = ref('');
const passwordSuccess = ref(false);

const formData = reactive({
  fullName: '',
  email: '',
  phone: '',
  permissions: [],
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

const getRoleLabel = (role) => {
  const roles = {
    admin: 'Admin',
  };
  return roles[role] || role;
};

const formatDate = (date) => {
  if (!date) return 'Chưa có';
  return new Date(date).toLocaleString('vi-VN');
};

const hasPermission = (permission) => {
  if (!profile.value?.permissions) return false;
  return profile.value.permissions.includes('all') || profile.value.permissions.includes(permission);
};

const fetchProfile = async () => {
  try {
    const res = await api.get('/profile');
    profile.value = res.data.profile;
    
    Object.assign(formData, {
      fullName: profile.value.fullName || '',
      email: profile.value.email || '',
      phone: profile.value.phone || '',
      permissions: profile.value.permissions || [],
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
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.role-badge.admin {
  background: #ffe0e0;
  color: #c62828;
}

.admin-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  text-align: left;
}

.info-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.info-item .label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.info-item .value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: white;
  border: 1px solid #e0e0e0;
  color: #666;
}

.btn-outline:hover {
  border-color: #667eea;
  color: #667eea;
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

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  font-family: inherit;
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group small {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
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

/* Permissions */
.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.permission-card {
  padding: 25px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s;
}

.permission-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
}

.permission-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.permission-card h4 {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.permission-card p {
  font-size: 13px;
  color: #666;
  margin-bottom: 15px;
}

.permission-status {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.permission-card.active .permission-status {
  background: #d4edda;
  color: #155724;
}

.permission-card:not(.active) .permission-status {
  background: #f8d7da;
  color: #721c24;
}

.permission-note {
  padding: 15px 20px;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
  font-size: 14px;
  color: #856404;
}

/* Password */
.password-form {
  max-width: 500px;
  margin-bottom: 30px;
}

.password-form .form-group {
  margin-bottom: 20px;
}

.security-tips {
  padding: 25px;
  background: #f8f9fa;
  border-radius: 8px;
  max-width: 600px;
}

.security-tips h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #2c3e50;
}

.security-tips ul {
  list-style: none;
  padding: 0;
}

.security-tips li {
  padding: 8px 0;
  padding-left: 25px;
  position: relative;
  font-size: 14px;
  color: #666;
}

.security-tips li:before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #43e97b;
  font-weight: bold;
}

/* Activity Timeline */
.activity-timeline {
  position: relative;
  padding-left: 30px;
}

.timeline-item {
  position: relative;
  padding-bottom: 30px;
}

.timeline-item:not(:last-child):before {
  content: '';
  position: absolute;
  left: -24px;
  top: 20px;
  width: 2px;
  height: 100%;
  background: #e0e0e0;
}

.timeline-dot {
  position: absolute;
  left: -30px;
  top: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #667eea;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #667eea;
}

.timeline-content h4 {
  font-size: 15px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.timeline-content p {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.timeline-time {
  font-size: 12px;
  color: #999;
}

@media (max-width: 968px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .permissions-grid {
    grid-template-columns: 1fr;
  }
}
</style>