<template>
  <!-- ============================================================
       TRANG: Hồ sơ Admin
       LAYOUT: Sidebar trái + nội dung chính phải
       TAB: info | permissions | security | activity
  ============================================================ -->
  <div class="page">
    <Header />

    <div class="container">
      <div class="profile-layout">

        <!-- ════ SIDEBAR TRÁI ════ -->
        <aside class="sidebar">

          <!-- Card avatar + tên -->
          <div class="profile-card">
            <div class="avatar">{{ getInitials(profile?.fullName) }}</div>
            <h2>{{ profile?.fullName || 'Admin' }}</h2>
            <p class="email">{{ profile?.email }}</p>
            <span class="role-badge">Admin</span>

            <div class="meta-rows">
              <div class="meta-row">
                <span class="meta-label">Quyền hạn</span>
                <span class="meta-value">{{ profile?.permissions?.join(', ') || 'Chưa có' }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Đăng nhập cuối</span>
                <span class="meta-value">{{ formatDate(profile?.lastLogin) }}</span>
              </div>
            </div>
          </div>

          <!-- Menu tab điều hướng -->
          <nav class="profile-nav">
            <button :class="{ active: activeTab === 'info' }"        @click="activeTab = 'info'">        👤 Thông tin cá nhân </button>
            <button :class="{ active: activeTab === 'permissions' }" @click="activeTab = 'permissions'"> 🔑 Quyền hạn         </button>
            <button :class="{ active: activeTab === 'security' }"    @click="activeTab = 'security'">    🔒 Bảo mật           </button>
            <button :class="{ active: activeTab === 'activity' }"    @click="activeTab = 'activity'">    📊 Hoạt động         </button>
          </nav>
        </aside>

        <!-- ════ NỘI DUNG CHÍNH ════ -->
        <main class="main-content">

          <!-- ── TAB 1: Thông tin cá nhân ── -->
          <div v-if="activeTab === 'info'" class="tab-section">
            <div class="section-header">
              <h2>Thông tin cá nhân</h2>
              <button v-if="!editMode" class="btn btn-outline" @click="editMode = true">
                ✏️ Chỉnh sửa
              </button>
              <div v-else class="edit-actions">
                <button class="btn btn-primary" @click="handleSave">💾 Lưu</button>
                <button class="btn btn-outline" @click="handleCancel">✕ Hủy</button>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Họ và tên</label>
                <input v-model="formData.fullName" :disabled="!editMode" type="text" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input v-model="formData.email" disabled type="email" />
                <small>Email không thể thay đổi</small>
              </div>
              <div class="form-group">
                <label>Số điện thoại</label>
                <input v-model="formData.phone" :disabled="!editMode" type="tel" />
              </div>
            </div>

            <div v-if="message" class="alert" :class="isSuccess ? 'success' : 'error'">
              {{ message }}
            </div>
          </div>

          <!-- ── TAB 2: Quyền hạn ── -->
          <div v-if="activeTab === 'permissions'" class="tab-section">
            <div class="section-header">
              <h2>Quyền hạn</h2>
            </div>

            <!--
              Dùng v-for thay vì lặp HTML 6 lần
              permissionList khai báo bên dưới trong script
            -->
            <div class="permissions-grid">
              <div
                v-for="perm in permissionList"
                :key="perm.key"
                class="perm-card"
                :class="{ active: hasPermission(perm.key) }"
              >
                <div class="perm-icon">{{ perm.icon }}</div>
                <h4>{{ perm.name }}</h4>
                <p>{{ perm.desc }}</p>
                <span class="perm-status">
                  {{ hasPermission(perm.key) ? '✓ Đã cấp' : '✕ Chưa cấp' }}
                </span>
              </div>
            </div>

            <div class="note-box">
              <strong>Lưu ý:</strong> Quyền hạn được quản lý bởi hệ thống.
              Liên hệ quản trị viên nếu cần cập nhật quyền truy cập.
            </div>
          </div>

          <!-- ── TAB 3: Bảo mật ── -->
          <div v-if="activeTab === 'security'" class="tab-section">
            <div class="section-header">
              <h2>Đổi mật khẩu</h2>
            </div>

            <div class="password-form">
              <div class="form-group">
                <label>Mật khẩu hiện tại</label>
                <input v-model="passwordForm.currentPassword" type="password" placeholder="Nhập mật khẩu hiện tại" />
              </div>
              <div class="form-group">
                <label>Mật khẩu mới</label>
                <input v-model="passwordForm.newPassword" type="password" placeholder="Ít nhất 6 ký tự" />
              </div>
              <div class="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input v-model="passwordForm.confirmPassword" type="password" placeholder="Nhập lại mật khẩu mới" />
              </div>

              <div v-if="passwordMessage" class="alert" :class="passwordSuccess ? 'success' : 'error'">
                {{ passwordMessage }}
              </div>

              <button class="btn btn-primary" @click="handleChangePassword">
                🔒 Đổi mật khẩu
              </button>
            </div>

            <div class="tips-box">
              <h3>💡 Mẹo bảo mật</h3>
              <ul>
                <li v-for="tip in securityTips" :key="tip">{{ tip }}</li>
              </ul>
            </div>
          </div>

          <!-- ── TAB 4: Lịch sử hoạt động ── -->
          <div v-if="activeTab === 'activity'" class="tab-section">
            <div class="section-header">
              <h2>Lịch sử hoạt động</h2>
            </div>

            <div class="timeline">
              <div v-for="item in activityLog" :key="item.id" class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-body">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.desc }}</p>
                  <span class="timeline-time">{{ item.time }}</span>
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
// ── Import ──
import { ref, reactive, onMounted } from 'vue'
import Header from '../components/Header.vue'
import api from '../services/api'

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const activeTab = ref('info')   // Tab đang hiển thị
const editMode  = ref(false)    // Đang chỉnh sửa hay không
const message   = ref('')
const isSuccess = ref(false)
const profile   = ref(null)     // Dữ liệu profile từ API

const passwordMessage = ref('')
const passwordSuccess = ref(false)

// Form thông tin cá nhân
const formData = reactive({
  fullName:    '',
  email:       '',
  phone:       '',
  permissions: [],
})

// Form đổi mật khẩu
const passwordForm = reactive({
  currentPassword: '',
  newPassword:     '',
  confirmPassword: '',
})

// ════════════════════════════════════════
// DỮ LIỆU TĨNH – dùng v-for, tránh lặp HTML
// ════════════════════════════════════════

const permissionList = [
  { key: 'all',              icon: '🔓', name: 'Toàn quyền',             desc: 'Truy cập và quản lý tất cả tính năng' },
  { key: 'manage_users',     icon: '👥', name: 'Quản lý người dùng',     desc: 'Xem, thêm, sửa, xóa người dùng' },
  { key: 'manage_jobs',      icon: '📢', name: 'Quản lý tin tuyển dụng', desc: 'Duyệt và quản lý tin đăng tuyển' },
  { key: 'manage_companies', icon: '🏢', name: 'Quản lý công ty',        desc: 'Xác thực và quản lý công ty' },
  { key: 'view_reports',     icon: '📊', name: 'Xem báo cáo',            desc: 'Truy cập báo cáo và thống kê' },
  { key: 'system_settings',  icon: '⚙️', name: 'Cài đặt hệ thống',      desc: 'Cấu hình và tùy chỉnh hệ thống' },
]

const securityTips = [
  'Sử dụng mật khẩu mạnh với ít nhất 8 ký tự',
  'Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt',
  'Không chia sẻ mật khẩu với người khác',
  'Đổi mật khẩu định kỳ mỗi 3–6 tháng',
  'Không dùng cùng mật khẩu cho nhiều tài khoản',
]

// Lịch sử hoạt động – dữ liệu mẫu tĩnh
const activityLog = [
  { id: 1, title: 'Đăng nhập hệ thống', desc: 'Đăng nhập từ IP: 192.168.1.1',  time: '5 phút trước'  },
  { id: 2, title: 'Phê duyệt công ty',  desc: 'Đã phê duyệt FPT Software',     time: '2 giờ trước'   },
  { id: 3, title: 'Cập nhật profile',   desc: 'Thay đổi số điện thoại',         time: '1 ngày trước'  },
  { id: 4, title: 'Xóa người dùng',     desc: 'Xóa tài khoản spam@test.com',   time: '2 ngày trước'  },
  { id: 5, title: 'Đổi mật khẩu',       desc: 'Cập nhật mật khẩu thành công', time: '5 ngày trước'  },
]

// ════════════════════════════════════════
// HÀM TIỆN ÍCH
// ════════════════════════════════════════

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

function formatDate(date) {
  if (!date) return 'Chưa có'
  return new Date(date).toLocaleString('vi-VN')
}

// Kiểm tra admin có quyền đó không
// Nếu có quyền 'all' thì coi như có tất cả quyền
function hasPermission(permission) {
  if (!profile.value?.permissions) return false
  return profile.value.permissions.includes('all') ||
         profile.value.permissions.includes(permission)
}

// ════════════════════════════════════════
// HÀM GỌI API
// ════════════════════════════════════════

async function fetchProfile() {
  try {
    const res = await api.get('/profile')
    profile.value = res.data.profile

    // Điền dữ liệu vào form
    Object.assign(formData, {
      fullName:    profile.value.fullName    || '',
      email:       profile.value.email       || '',
      phone:       profile.value.phone       || '',
      permissions: profile.value.permissions || [],
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
}

async function handleSave() {
  try {
    message.value = ''
    const res = await api.put('/profile', formData)
    profile.value   = res.data.profile
    message.value   = 'Cập nhật thành công! ✅'
    isSuccess.value  = true
    editMode.value   = false
    setTimeout(() => { message.value = '' }, 3000)
  } catch (error) {
    message.value  = error.response?.data?.message || 'Cập nhật thất bại'
    isSuccess.value = false
  }
}

function handleCancel() {
  editMode.value = false
  message.value  = ''
  fetchProfile()  // Load lại dữ liệu gốc, bỏ qua thay đổi chưa lưu
}

async function handleChangePassword() {
  passwordMessage.value = ''

  // Validate trước khi gọi API
  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    passwordMessage.value  = 'Vui lòng điền đầy đủ thông tin'
    passwordSuccess.value  = false
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordMessage.value  = 'Mật khẩu mới không khớp'
    passwordSuccess.value  = false
    return
  }

  if (passwordForm.newPassword.length < 6) {
    passwordMessage.value  = 'Mật khẩu mới phải có ít nhất 6 ký tự'
    passwordSuccess.value  = false
    return
  }

  try {
    await api.put('/profile/change-password', {
      currentPassword: passwordForm.currentPassword,
      newPassword:     passwordForm.newPassword,
    })

    passwordMessage.value  = 'Đổi mật khẩu thành công! ✅'
    passwordSuccess.value  = true

    // Reset form sau khi thành công
    passwordForm.currentPassword = ''
    passwordForm.newPassword     = ''
    passwordForm.confirmPassword = ''

    setTimeout(() => { passwordMessage.value = '' }, 3000)
  } catch (error) {
    passwordMessage.value  = error.response?.data?.message || 'Đổi mật khẩu thất bại'
    passwordSuccess.value  = false
  }
}

// Gọi API khi component được mount
onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
/* ════════════════════════════════════
   LAYOUT
════════════════════════════════════ */
.page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 40px 48px;
}

/* Grid 2 cột: sidebar + content */
.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  align-items: flex-start;
}

/* ════════════════════════════════════
   SIDEBAR
════════════════════════════════════ */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 20px;
}

/* Card avatar */
.profile-card {
  background: white;
  border-radius: 12px;
  padding: 28px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  margin: 0 auto 16px;
}

.profile-card h2 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.email {
  font-size: 13px;
  color: #999;
  margin-bottom: 10px;
}

.role-badge {
  display: inline-block;
  padding: 4px 14px;
  background: #ffe0e0;
  color: #c62828;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
}

.meta-rows {
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
.meta-value { font-size: 13px; color: #2c3e50; font-weight: 500; }

/* Nav tabs */
.profile-nav {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.profile-nav button {
  display: block;
  width: 100%;
  padding: 13px 18px;
  text-align: left;
  background: transparent;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.15s;
  font-family: inherit;
}

.profile-nav button:last-child { border-bottom: none; }
.profile-nav button:hover   { background: #f5f5f5; color: #2c3e50; }
.profile-nav button.active  { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }

/* ════════════════════════════════════
   NỘI DUNG CHÍNH
════════════════════════════════════ */
.main-content {
  background: white;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  min-height: 500px;
}


.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h2 {
  font-size: 20px;
  color: #2c3e50;
}

.edit-actions { display: flex; gap: 10px; }

/* Form grid 2 cột */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group { display: flex; flex-direction: column; }

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 7px;
}

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

.form-group input:disabled { background: #f5f5f5; cursor: not-allowed; }

.form-group small { font-size: 12px; color: #aaa; margin-top: 4px; }

/* Alert */
.alert {
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 16px;
}

.alert.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.alert.error   { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

/* Buttons */
.btn {
  padding: 9px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,.4); }

.btn-outline {
  background: white;
  border: 1.5px solid #e0e0e0;
  color: #666;
}

.btn-outline:hover { border-color: #667eea; color: #667eea; }

/* ════════════════════════════════════
   TAB QUYỀN HẠN
════════════════════════════════════ */
.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.perm-card {
  padding: 20px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  text-align: center;
  transition: all 0.2s;
}

.perm-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102,126,234,.05) 0%, rgba(118,75,162,.05) 100%);
}

.perm-icon { font-size: 36px; margin-bottom: 10px; }

.perm-card h4 { font-size: 15px; color: #2c3e50; margin-bottom: 6px; }
.perm-card p  { font-size: 13px; color: #888; margin-bottom: 12px; line-height: 1.5; }

.perm-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.perm-card.active     .perm-status { background: #d4edda; color: #155724; }
.perm-card:not(.active) .perm-status { background: #f8d7da; color: #721c24; }

.note-box {
  padding: 14px 18px;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
  font-size: 14px;
  color: #856404;
}

/* ════════════════════════════════════
   TAB BẢO MẬT
════════════════════════════════════ */
.password-form {
  max-width: 460px;
  margin-bottom: 28px;
}

.password-form .form-group { margin-bottom: 18px; }

.tips-box {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px 24px;
  max-width: 560px;
}

.tips-box h3 { font-size: 16px; color: #2c3e50; margin-bottom: 12px; }

.tips-box ul { list-style: none; padding: 0; }

.tips-box li {
  padding: 7px 0 7px 24px;
  position: relative;
  font-size: 14px;
  color: #555;
  border-bottom: 1px solid #eee;
}

.tips-box li:last-child { border-bottom: none; }

.tips-box li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #43e97b;
  font-weight: bold;
}

/* ════════════════════════════════════
   TAB HOẠT ĐỘNG
════════════════════════════════════ */
.timeline {
  padding-left: 24px;
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

/* Đường kẻ dọc nối các mốc */
.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: -18px;
  top: 18px;
  width: 2px;
  height: 100%;
  background: #e0e0e0;
}

/* Chấm tròn mốc sự kiện */
.timeline-dot {
  position: absolute;
  left: -24px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #667eea;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #667eea;
}

.timeline-body h4 { font-size: 15px; color: #2c3e50; margin-bottom: 4px; }
.timeline-body p  { font-size: 13px; color: #888; margin-bottom: 4px; }
.timeline-time    { font-size: 12px; color: #bbb; }

/* ════════════════════════════════════
   RESPONSIVE
════════════════════════════════════ */
@media (max-width: 1024px) {
  .profile-layout { grid-template-columns: 1fr; }
  .sidebar { position: static; }
}

@media (max-width: 768px) {
  .container { padding: 20px 16px; }
  .form-grid { grid-template-columns: 1fr; }
  .permissions-grid { grid-template-columns: 1fr; }
}
</style>