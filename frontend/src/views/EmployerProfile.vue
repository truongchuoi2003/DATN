<template>
  <!-- ============================================================
       TRANG: Hồ sơ Nhà tuyển dụng
       LAYOUT: Sidebar trái + nội dung chính phải
       TAB: company | contact | security
  ============================================================ -->
  <div class="page">
    <Header />

    <div class="container">
      <div class="profile-layout">

        <!-- ════ SIDEBAR TRÁI ════ -->
        <aside class="sidebar">

          <!-- Card logo + tên công ty -->
          <div class="profile-card">
            <div class="company-logo">{{ getInitials(profile?.companyName) }}</div>
            <h2>{{ profile?.companyName || 'Công ty' }}</h2>
            <p class="email-text">{{ profile?.email }}</p>
            <span class="role-badge">Nhà tuyển dụng</span>

            <!-- Mini stats: xác thực + số tin -->
            <div class="mini-stats">
              <div class="mini-stat">
                <span class="mini-val">{{ profile?.verified ? '✓' : '✕' }}</span>
                <span class="mini-lbl">Xác thực</span>
              </div>
              <div class="mini-stat">
                <span class="mini-val">8</span>
                <span class="mini-lbl">Tin tuyển dụng</span>
              </div>
            </div>
          </div>

          <!-- Menu điều hướng tab -->
          <nav class="profile-nav">
            <button :class="{ active: activeTab === 'company' }"  @click="activeTab = 'company'">  🏢 Thông tin công ty </button>
            <button :class="{ active: activeTab === 'contact' }"  @click="activeTab = 'contact'">  📞 Liên hệ           </button>
            <button :class="{ active: activeTab === 'security' }" @click="activeTab = 'security'"> 🔒 Bảo mật           </button>
          </nav>
        </aside>

        <!-- ════ NỘI DUNG CHÍNH ════ -->
        <main class="main-content">

          <!-- ── TAB 1: Thông tin công ty ── -->
          <div v-if="activeTab === 'company'" class="tab-section">
            <div class="section-header">
              <h2>Thông tin công ty</h2>
              <button v-if="!editMode" class="btn btn-outline" @click="editMode = true">✏️ Chỉnh sửa</button>
              <div v-else class="edit-actions">
                <button class="btn btn-primary" @click="handleSave">💾 Lưu</button>
                <button class="btn btn-outline" @click="handleCancel">✕ Hủy</button>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Tên công ty</label>
                <input v-model="formData.companyName" :disabled="!editMode" type="text" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input v-model="formData.email" disabled type="email" />
                <small>Email không thể thay đổi</small>
              </div>
              <div class="form-group">
                <label>Quy mô công ty</label>
                <select v-model="formData.companySize" :disabled="!editMode">
                  <option value="">-- Chọn quy mô --</option>
                  <option value="1-10">1–10 nhân viên</option>
                  <option value="11-50">11–50 nhân viên</option>
                  <option value="51-200">51–200 nhân viên</option>
                  <option value="201-500">201–500 nhân viên</option>
                  <option value="500+">500+ nhân viên</option>
                </select>
              </div>
              <div class="form-group">
                <label>Lĩnh vực</label>
                <input v-model="formData.industry" :disabled="!editMode" type="text" placeholder="VD: Công nghệ thông tin" />
              </div>
              <div class="form-group">
                <label>Website</label>
                <input v-model="formData.website" :disabled="!editMode" type="url" placeholder="https://example.com" />
              </div>
              <div class="form-group">
                <label>Mã số thuế</label>
                <input v-model="formData.taxCode" :disabled="!editMode" type="text" />
              </div>
              <div class="form-group full">
                <label>Địa chỉ</label>
                <input v-model="formData.address" :disabled="!editMode" type="text" />
              </div>
              <div class="form-group full">
                <label>Giới thiệu công ty</label>
                <textarea
                  v-model="formData.description"
                  :disabled="!editMode"
                  rows="6"
                  placeholder="Mô tả về công ty, văn hóa, giá trị cốt lõi..."
                ></textarea>
              </div>
            </div>

            <!-- Trạng thái xác thực công ty -->
            <div class="verification-box">
              <h3>Trạng thái xác thực</h3>
              <div class="verify-card" :class="{ verified: profile?.verified }">
                <span class="verify-icon">{{ profile?.verified ? '✓' : '⏳' }}</span>
                <div>
                  <h4>{{ profile?.verified ? 'Đã xác thực' : 'Chưa xác thực' }}</h4>
                  <p>{{ profile?.verified ? 'Công ty của bạn đã được xác thực' : 'Đang chờ admin phê duyệt' }}</p>
                </div>
              </div>
            </div>

            <div v-if="message" class="alert" :class="isSuccess ? 'success' : 'error'">
              {{ message }}
            </div>
          </div>

          <!-- ── TAB 2: Thông tin liên hệ ── -->
          <div v-if="activeTab === 'contact'" class="tab-section">
            <div class="section-header">
              <h2>Thông tin liên hệ</h2>
              <button v-if="!editMode" class="btn btn-outline" @click="editMode = true">✏️ Chỉnh sửa</button>
              <div v-else class="edit-actions">
                <button class="btn btn-primary" @click="handleSave">💾 Lưu</button>
                <button class="btn btn-outline" @click="handleCancel">✕ Hủy</button>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Người đại diện</label>
                <input v-model="formData.fullName" :disabled="!editMode" type="text" />
              </div>
              <div class="form-group">
                <label>Số điện thoại</label>
                <input v-model="formData.phone" :disabled="!editMode" type="tel" />
              </div>
              <div class="form-group">
                <label>Ngày sinh</label>
                <input v-model="formData.birthday" :disabled="!editMode" type="date" />
              </div>
            </div>

            <div v-if="message" class="alert" :class="isSuccess ? 'success' : 'error'">
              {{ message }}
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

              <button class="btn btn-primary" @click="handleChangePassword">🔒 Đổi mật khẩu</button>
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

const activeTab = ref('company')  // Tab đang hiển thị
const editMode  = ref(false)
const message   = ref('')
const isSuccess = ref(false)
const profile   = ref(null)

const passwordMessage = ref('')
const passwordSuccess = ref(false)

// Form thông tin công ty + liên hệ
const formData = reactive({
  companyName:  '',
  email:        '',
  fullName:     '',
  phone:        '',
  birthday:     '',
  address:      '',
  companySize:  '',
  industry:     '',
  website:      '',
  taxCode:      '',
  description:  '',
})

// Form đổi mật khẩu
const passwordForm = reactive({
  currentPassword: '',
  newPassword:     '',
  confirmPassword: '',
})

// ════════════════════════════════════════
// HÀM TIỆN ÍCH
// ════════════════════════════════════════

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
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
      companyName:  profile.value.companyName  || '',
      email:        profile.value.email        || '',
      fullName:     profile.value.fullName     || '',
      phone:        profile.value.phone        || '',
      // birthday về dạng YYYY-MM-DD cho input type="date"
      birthday:     profile.value.birthday ? profile.value.birthday.split('T')[0] : '',
      address:      profile.value.address      || '',
      companySize:  profile.value.companySize  || '',
      industry:     profile.value.industry     || '',
      website:      profile.value.website      || '',
      taxCode:      profile.value.taxCode      || '',
      description:  profile.value.description  || '',
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
}

async function handleSave() {
  try {
    message.value = ''
    const res = await api.put('/profile', formData)
    profile.value  = res.data.profile
    message.value  = 'Cập nhật thành công! ✅'
    isSuccess.value = true
    editMode.value  = false
    setTimeout(() => { message.value = '' }, 3000)
  } catch (error) {
    message.value  = error.response?.data?.message || 'Cập nhật thất bại'
    isSuccess.value = false
  }
}

function handleCancel() {
  editMode.value = false
  message.value  = ''
  fetchProfile()  // Load lại dữ liệu gốc
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

    // Reset form
    passwordForm.currentPassword = ''
    passwordForm.newPassword     = ''
    passwordForm.confirmPassword = ''

    setTimeout(() => { passwordMessage.value = '' }, 3000)
  } catch (error) {
    passwordMessage.value  = error.response?.data?.message || 'Đổi mật khẩu thất bại'
    passwordSuccess.value  = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
/* ════════════════════════════════════
   LAYOUT
════════════════════════════════════ */
.page { min-height: 100vh; background: #f5f7fa; }

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 40px 48px;
}

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

/* Card avatar công ty */
.profile-card {
  background: white;
  border-radius: 12px;
  padding: 28px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}

/* Logo công ty: hình vuông bo góc thay vì tròn */
.company-logo {
  width: 90px;
  height: 90px;
  border-radius: 16px;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  margin: 0 auto 16px;
}

.profile-card h2 { font-size: 18px; color: #2c3e50; margin-bottom: 4px; }
.email-text      { font-size: 13px; color: #999; margin-bottom: 10px; }

.role-badge {
  display: inline-block;
  padding: 4px 14px;
  background: #f3e5f5;
  color: #7b1fa2;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
}

.mini-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
  margin-top: 4px;
}

.mini-stat { display: flex; flex-direction: column; align-items: center; }
.mini-val  { font-size: 20px; font-weight: 700; color: #4ecdc4; margin-bottom: 2px; }
.mini-lbl  { font-size: 11px; color: #bbb; }

/* Nav tabs */
.profile-nav {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}

.profile-nav button {
  display: block; width: 100%;
  padding: 13px 18px; text-align: left;
  background: transparent; border: none;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer; font-size: 14px; font-weight: 500;
  color: #666; transition: all 0.15s; font-family: inherit;
}

.profile-nav button:last-child { border-bottom: none; }
.profile-nav button:hover  { background: #f5f5f5; color: #2c3e50; }
.profile-nav button.active { background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; }

/* ════════════════════════════════════
   NỘI DUNG CHÍNH
════════════════════════════════════ */
.main-content {
  background: white;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
  min-height: 500px;
}

.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #f0f0f0;
}

.section-header h2 { font-size: 20px; color: #2c3e50; }
.edit-actions { display: flex; gap: 10px; }

/* Form grid 2 cột */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 24px; }

.form-group { display: flex; flex-direction: column; }
.form-group.full { grid-column: 1 / -1; }

.form-group label { font-size: 13px; font-weight: 600; color: #555; margin-bottom: 7px; }

.form-group input,
.form-group select,
.form-group textarea {
  padding: 11px 14px; border: 2px solid #e0e0e0; border-radius: 8px;
  font-size: 14px; font-family: inherit; transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none; border-color: #4ecdc4; box-shadow: 0 0 0 3px rgba(78,205,196,.1);
}

.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled { background: #f5f5f5; cursor: not-allowed; }

.form-group small { font-size: 12px; color: #aaa; margin-top: 4px; }

/* Trạng thái xác thực */
.verification-box { margin-top: 24px; padding-top: 20px; border-top: 1px solid #f0f0f0; }
.verification-box h3 { font-size: 16px; color: #2c3e50; margin-bottom: 12px; }

.verify-card {
  display: flex; align-items: center; gap: 18px;
  padding: 18px 20px; border: 2px solid #fff3cd; background: #fffef7; border-radius: 10px;
}

.verify-card.verified { border-color: #c3e6cb; background: #f1f9f3; }

.verify-icon { font-size: 36px; flex-shrink: 0; }
.verify-card h4 { font-size: 15px; color: #2c3e50; margin-bottom: 4px; }
.verify-card p  { font-size: 13px; color: #888; }

/* Alert */
.alert { padding: 12px 15px; border-radius: 8px; font-size: 14px; margin-top: 16px; }
.alert.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.alert.error   { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

/* Buttons */
.btn {
  padding: 9px 20px; border: none; border-radius: 8px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: inherit;
}

.btn-primary { background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(78,205,196,.4); }
.btn-outline { background: white; border: 1.5px solid #e0e0e0; color: #666; }
.btn-outline:hover { border-color: #4ecdc4; color: #4ecdc4; }

/* Form đổi mật khẩu */
.password-form { max-width: 460px; }
.password-form .form-group { margin-bottom: 18px; }

/* ════════════════════════════════════
   RESPONSIVE
════════════════════════════════════ */
@media (max-width: 1024px) {
  .profile-layout { grid-template-columns: 1fr; }
  .sidebar { position: static; }
}

@media (max-width: 768px) {
  .container { padding: 20px 16px; }
  .form-grid  { grid-template-columns: 1fr; }
}
</style>