<template>
  <!-- ============================================================
       TRANG: Hồ sơ Sinh viên
       LAYOUT: Sidebar trái + nội dung chính phải
       TAB: info | education | skills
       ĐẶC BIỆT: Upload avatar, upload CV, % hoàn thiện hồ sơ
  ============================================================ -->
  <div class="page">
    <Header />

    <div class="container">
      <div class="profile-layout">

        <!-- ════ SIDEBAR TRÁI ════ -->
        <aside class="sidebar">

          <!-- Card avatar + tên + stats -->
          <div class="profile-card">
            <!-- Component upload avatar -->
            <div class="avatar-wrap">
              <UploadAvatar
                :current-avatar="profile?.avatar || ''"
                :full-name="profile?.fullName || ''"
                @uploaded="handleAvatarUploaded"
              />
            </div>

            <h2>{{ profile?.fullName || 'Sinh viên' }}</h2>
            <p class="email-text">{{ profile?.email }}</p>
            <span class="role-badge">Sinh viên</span>

            <!-- % hoàn thiện hồ sơ -->
            <div class="completion-stats">
              <div class="cs-item">
                <span class="cs-val">{{ profileCompletion }}%</span>
                <span class="cs-lbl">Hoàn thành</span>
              </div>
              <div class="cs-item">
                <span class="cs-val">{{ completedCount }}/{{ profileRequirements.length }}</span>
                <span class="cs-lbl">Mục đã đủ</span>
              </div>
            </div>
          </div>

          <!-- Menu điều hướng tab -->
          <nav class="profile-nav">
            <button :class="{ active: activeTab === 'info' }"      @click="activeTab = 'info'">      👤 Thông tin cá nhân </button>
            <button :class="{ active: activeTab === 'education' }" @click="activeTab = 'education'"> 🎓 Học vấn           </button>
            <button :class="{ active: activeTab === 'skills' }"    @click="activeTab = 'skills'">    ⭐ Kỹ năng           </button>
            <router-link to="/change-password" class="nav-link-ext">🔒 Đổi mật khẩu</router-link>
          </nav>
        </aside>

        <!-- ════ NỘI DUNG CHÍNH ════ -->
        <main class="main-content">

          <!-- ── TAB 1: Thông tin cá nhân ── -->
          <div v-if="activeTab === 'info'" class="tab-section">
            <div class="section-header">
              <h2>Thông tin cá nhân</h2>
              <button v-if="!editMode" class="btn btn-outline" @click="editMode = true">✏️ Chỉnh sửa</button>
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
              <div class="form-group">
                <label>Ngày sinh</label>
                <input v-model="formData.birthday" :disabled="!editMode" type="date" />
              </div>
              <div class="form-group full">
                <label>Địa chỉ</label>
                <input v-model="formData.address" :disabled="!editMode" type="text" />
              </div>
              <div class="form-group full">
                <label>Giới thiệu bản thân</label>
                <textarea v-model="formData.bio" :disabled="!editMode" rows="4" placeholder="Viết vài dòng giới thiệu về bản thân..."></textarea>
              </div>
            </div>

            <div v-if="message" class="alert" :class="isSuccess ? 'success' : 'error'">{{ message }}</div>
          </div>

          <!-- ── TAB 2: Học vấn + thông tin nghề nghiệp ── -->
          <div v-if="activeTab === 'education'" class="tab-section">
            <div class="section-header">
              <h2>Học vấn</h2>
              <button v-if="!editMode" class="btn btn-outline" @click="editMode = true">✏️ Chỉnh sửa</button>
              <div v-else class="edit-actions">
                <button class="btn btn-primary" @click="handleSave">💾 Lưu</button>
                <button class="btn btn-outline" @click="handleCancel">✕ Hủy</button>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Mã sinh viên</label>
                <input v-model="formData.studentId" :disabled="!editMode" type="text" />
              </div>
              <div class="form-group">
                <label>Trường đại học</label>
                <input v-model="formData.university" :disabled="!editMode" type="text" />
              </div>
              <div class="form-group">
                <label>Ngành học</label>
                <input v-model="formData.major" :disabled="!editMode" type="text" />
              </div>
              <div class="form-group">
                <label>Năm học hiện tại</label>
                <select v-model="formData.academicYear" :disabled="!editMode">
                  <option value="1">Năm 1</option>
                  <option value="2">Năm 2</option>
                  <option value="3">Năm 3</option>
                  <option value="4">Năm 4</option>
                  <option value="5">Năm 5</option>
                  <option value="graduated">Đã tốt nghiệp</option>
                </select>
              </div>
              <div class="form-group">
                <label>Năm tốt nghiệp</label>
                <input v-model="formData.graduationYear" :disabled="!editMode" type="number" min="2020" max="2035" />
              </div>
              <div class="form-group">
                <label>GPA</label>
                <input v-model="formData.gpa" :disabled="!editMode" type="number" step="0.01" min="0" max="4" />
              </div>

              <!-- Loại hình công việc mong muốn – chọn tag -->
              <div class="form-group full">
                <label>Loại hình công việc mong muốn</label>
                <div class="tag-select">
                  <div
                    v-for="opt in preferredJobTypeOptions"
                    :key="opt.value"
                    class="tag-option"
                    :class="{ 'tag-selected': formData.preferredJobTypes.includes(opt.value) }"
                  >
                    <span>{{ opt.label }}</span>
                    <button v-if="editMode" type="button" class="tag-toggle-btn" @click="toggleJobType(opt.value)">
                      {{ formData.preferredJobTypes.includes(opt.value) ? '✕' : '+' }}
                    </button>
                  </div>
                </div>
                <small>Chọn 1 hoặc nhiều để hệ thống gợi ý chính xác hơn</small>
              </div>

              <!-- Hình thức làm việc mong muốn – chọn tag -->
              <div class="form-group full">
                <label>Hình thức làm việc mong muốn</label>
                <div class="tag-select">
                  <div
                    v-for="opt in preferredWorkModeOptions"
                    :key="opt.value"
                    class="tag-option"
                    :class="{ 'tag-selected': formData.preferredWorkModes.includes(opt.value) }"
                  >
                    <span>{{ opt.label }}</span>
                    <button v-if="editMode" type="button" class="tag-toggle-btn" @click="toggleWorkMode(opt.value)">
                      {{ formData.preferredWorkModes.includes(opt.value) ? '✕' : '+' }}
                    </button>
                  </div>
                </div>
                <small>Onsite / Remote / Hybrid</small>
              </div>

              <!-- Các trường nhập text – mảng được join bằng dấu phẩy -->
              <div class="form-group full">
                <label>Nhóm nghề quan tâm</label>
                <input v-model="formData.preferredCategoriesText" :disabled="!editMode" type="text" placeholder="Frontend, Backend, Data Analyst, Tester" />
                <small>Ngăn cách bằng dấu phẩy</small>
              </div>
              <div class="form-group full">
                <label>Vị trí mong muốn</label>
                <input v-model="formData.desiredJobTitlesText" :disabled="!editMode" type="text" placeholder="Frontend Developer Intern, Backend Intern" />
                <small>Ngăn cách bằng dấu phẩy</small>
              </div>
              <div class="form-group full">
                <label>Khu vực mong muốn làm việc</label>
                <input v-model="formData.preferredLocationsText" :disabled="!editMode" type="text" placeholder="Hà Nội, TP. Hồ Chí Minh" />
                <small>Ngăn cách bằng dấu phẩy</small>
              </div>
              <div class="form-group full">
                <label>Dự án đã làm</label>
                <textarea v-model="formData.projectsText" :disabled="!editMode" rows="3" placeholder="Website tìm việc sinh viên, Hệ thống quản lý quán cafe"></textarea>
                <small>Ngăn cách bằng dấu phẩy</small>
              </div>
              <div class="form-group full">
                <label>Công nghệ đã dùng trong dự án</label>
                <input v-model="formData.projectTechnologiesText" :disabled="!editMode" type="text" placeholder="VueJS, NodeJS, MongoDB" />
                <small>Ngăn cách bằng dấu phẩy</small>
              </div>
              <div class="form-group full">
                <label>Chứng chỉ</label>
                <input v-model="formData.certificationsText" :disabled="!editMode" type="text" placeholder="TOEIC 750, MOS, Google Data Analytics" />
                <small>Ngăn cách bằng dấu phẩy</small>
              </div>
              <div class="form-group full">
                <label>Portfolio URL</label>
                <input v-model="formData.portfolioUrl" :disabled="!editMode" type="text" placeholder="https://..." />
              </div>
              <div class="form-group">
                <label>GitHub URL</label>
                <input v-model="formData.githubUrl" :disabled="!editMode" type="text" placeholder="https://github.com/..." />
              </div>
              <div class="form-group">
                <label>LinkedIn URL</label>
                <input v-model="formData.linkedinUrl" :disabled="!editMode" type="text" placeholder="https://linkedin.com/in/..." />
              </div>
            </div>

            <div v-if="message" class="alert" :class="isSuccess ? 'success' : 'error'">{{ message }}</div>
          </div>

          <!-- ── TAB 3: Kỹ năng + Upload CV ── -->
          <div v-if="activeTab === 'skills'" class="tab-section">
            <div class="section-header">
              <h2>Kỹ năng</h2>
              <button v-if="!editMode" class="btn btn-outline" @click="editMode = true">✏️ Chỉnh sửa</button>
              <div v-else class="edit-actions">
                <button class="btn btn-primary" @click="handleSave">💾 Lưu</button>
                <button class="btn btn-outline" @click="handleCancel">✕ Hủy</button>
              </div>
            </div>

            <!-- Danh sách kỹ năng hiện có -->
            <div class="skill-tags">
              <div v-for="(skill, index) in formData.skills" :key="index" class="skill-chip">
                <span>{{ skill }}</span>
                <button v-if="editMode" class="skill-remove-btn" @click="removeSkill(index)">✕</button>
              </div>
            </div>

            <!-- Form thêm kỹ năng mới -->
            <div v-if="editMode" class="add-skill-row">
              <input
                v-model="newSkill"
                @keyup.enter="addSkill"
                type="text"
                placeholder="Thêm kỹ năng mới (Enter để thêm)"
              />
              <button class="btn btn-primary" @click="addSkill">➕ Thêm</button>
            </div>

            <!-- Component upload CV -->
            <div class="cv-section">
              <UploadCV @uploaded="handleCVUploaded" />
            </div>

            <div v-if="message" class="alert" :class="isSuccess ? 'success' : 'error'">{{ message }}</div>
          </div>

        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
// ── Import ──
import { ref, reactive, computed, onMounted } from 'vue'
import Header      from '../components/Header.vue'
import UploadAvatar from '../components/UploadAvatar.vue'
import UploadCV    from '../components/UploadCV.vue'
import api         from '../services/api'
import { useAuth } from '../composables/useAuth'

const { refreshUser, updateUser } = useAuth()

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const activeTab = ref('info')
const editMode  = ref(false)
const message   = ref('')
const isSuccess = ref(false)
const profile   = ref(null)
const newSkill  = ref('')   // Input thêm kỹ năng mới

// Form chứa tất cả dữ liệu hồ sơ sinh viên
const formData = reactive({
  fullName:   '', email: '', phone: '', birthday: '', address: '', bio: '',
  studentId:  '', university: '', major: '', academicYear: '1',
  graduationYear: null, gpa: null,
  skills:             [],   // Mảng kỹ năng
  preferredJobTypes:  [],   // Loại hình mong muốn
  preferredWorkModes: [],   // Hình thức làm việc
  // Các trường mảng được nhập dưới dạng text ngăn cách bằng ','
  preferredCategoriesText:  '',
  desiredJobTitlesText:     '',
  preferredLocationsText:   '',
  projectsText:             '',
  projectTechnologiesText:  '',
  certificationsText:       '',
  resumeUrl: '', portfolioUrl: '', githubUrl: '', linkedinUrl: '',
})

// ════════════════════════════════════════
// DỮ LIỆU TĨNH
// ════════════════════════════════════════

const preferredJobTypeOptions = [
  { value: 'internship', label: 'Internship' },
  { value: 'part-time',  label: 'Part-time' },
  { value: 'full-time',  label: 'Full-time' },
  { value: 'freelance',  label: 'Freelance' },
  { value: 'contract',   label: 'Contract' },
]

const preferredWorkModeOptions = [
  { value: 'onsite', label: 'Onsite' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
]

// ════════════════════════════════════════
// COMPUTED – tính % hoàn thiện hồ sơ
// ════════════════════════════════════════

function hasValue(val) {
  if (Array.isArray(val)) return val.length > 0
  return val !== null && val !== undefined && String(val).trim() !== ''
}

const profileRequirements = computed(() => {
  const p = profile.value || {}
  return [
    { label: 'Họ và tên',                    ok: hasValue(p.fullName) },
    { label: 'Số điện thoại',                ok: hasValue(p.phone) },
    { label: 'Ngày sinh',                    ok: hasValue(p.birthday) },
    { label: 'Địa chỉ',                      ok: hasValue(p.address) },
    { label: 'Trường đại học',               ok: hasValue(p.university) },
    { label: 'Chuyên ngành',                 ok: hasValue(p.major) },
    { label: 'Kỹ năng',                      ok: hasValue(p.skills) },
    { label: 'Loại hình công việc mong muốn',ok: hasValue(p.preferredJobTypes) },
    { label: 'Nhóm nghề quan tâm',           ok: hasValue(p.preferredCategories) },
    { label: 'Vị trí mong muốn',             ok: hasValue(p.desiredJobTitles) },
    { label: 'Khu vực mong muốn',            ok: hasValue(p.preferredLocations) },
    { label: 'CV',                            ok: hasValue(p.resumeUrl) },
  ]
})

const completedCount  = computed(() => profileRequirements.value.filter(r => r.ok).length)
const profileCompletion = computed(() => Math.round((completedCount.value / profileRequirements.value.length) * 100))

// ════════════════════════════════════════
// HÀM TIỆN ÍCH
// ════════════════════════════════════════

// Chuyển mảng → chuỗi ngăn cách bằng dấu phẩy
function arrayToText(arr) {
  return Array.isArray(arr) ? arr.filter(Boolean).join(', ') : ''
}

// Chuyển chuỗi ngăn cách bằng dấu phẩy → mảng (loại bỏ trùng lặp)
function textToArray(text) {
  if (!text) return []
  return [...new Set(String(text).split(',').map(s => s.trim()).filter(Boolean))]
}

// Toggle chọn/bỏ chọn loại hình công việc
function toggleJobType(value) {
  if (!editMode.value) return
  const i = formData.preferredJobTypes.indexOf(value)
  if (i >= 0) formData.preferredJobTypes.splice(i, 1)
  else        formData.preferredJobTypes.push(value)
}

// Toggle chọn/bỏ chọn hình thức làm việc
function toggleWorkMode(value) {
  if (!editMode.value) return
  const i = formData.preferredWorkModes.indexOf(value)
  if (i >= 0) formData.preferredWorkModes.splice(i, 1)
  else        formData.preferredWorkModes.push(value)
}

// Thêm kỹ năng mới
function addSkill() {
  const skill = newSkill.value.trim()
  if (skill && !formData.skills.includes(skill)) {
    formData.skills.push(skill)
  }
  newSkill.value = ''
}

// Xóa kỹ năng theo index
function removeSkill(index) {
  formData.skills.splice(index, 1)
}

// ════════════════════════════════════════
// HÀM GỌI API
// ════════════════════════════════════════

async function fetchProfile() {
  try {
    const res = await api.get('/profile')
    profile.value = res.data.profile

    // Điền dữ liệu vào form, chuyển đổi định dạng khi cần
    Object.assign(formData, {
      fullName:       profile.value.fullName       || '',
      email:          profile.value.email          || '',
      phone:          profile.value.phone          || '',
      birthday:       profile.value.birthday ? profile.value.birthday.split('T')[0] : '',
      address:        profile.value.address        || '',
      bio:            profile.value.bio            || '',
      studentId:      profile.value.studentId      || '',
      university:     profile.value.university     || '',
      major:          profile.value.major          || '',
      academicYear:   profile.value.academicYear   || '1',
      graduationYear: profile.value.graduationYear || null,
      gpa:            profile.value.gpa            || null,
      skills:         [...(profile.value.skills || [])],
      preferredJobTypes:  [...(profile.value.preferredJobTypes  || [])],
      preferredWorkModes: [...(profile.value.preferredWorkModes || [])],
      // Mảng → text để hiển thị trong input
      preferredCategoriesText:  arrayToText(profile.value.preferredCategories  || []),
      desiredJobTitlesText:     arrayToText(profile.value.desiredJobTitles     || []),
      preferredLocationsText:   arrayToText(profile.value.preferredLocations   || []),
      projectsText:             arrayToText(profile.value.projects             || []),
      projectTechnologiesText:  arrayToText(profile.value.projectTechnologies  || []),
      certificationsText:       arrayToText(profile.value.certifications       || []),
      resumeUrl:      profile.value.resumeUrl      || '',
      portfolioUrl:   profile.value.portfolioUrl   || '',
      githubUrl:      profile.value.githubUrl      || '',
      linkedinUrl:    profile.value.linkedinUrl    || '',
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
}

async function handleSave() {
  try {
    message.value = ''

    // Build payload – chuyển text → mảng trước khi gửi lên API
    const payload = {
      fullName:     formData.fullName,
      phone:        formData.phone,
      birthday:     formData.birthday || null,
      address:      formData.address,
      bio:          formData.bio,
      studentId:    formData.studentId,
      university:   formData.university,
      major:        formData.major,
      academicYear: formData.academicYear,
      graduationYear: formData.graduationYear ? Number(formData.graduationYear) : null,
      gpa:            formData.gpa !== null && formData.gpa !== '' ? Number(formData.gpa) : null,
      skills:              [...new Set(formData.skills)].filter(Boolean),
      preferredJobTypes:   [...new Set(formData.preferredJobTypes)].filter(Boolean),
      preferredWorkModes:  [...new Set(formData.preferredWorkModes)].filter(Boolean),
      preferredCategories: textToArray(formData.preferredCategoriesText),
      desiredJobTitles:    textToArray(formData.desiredJobTitlesText),
      preferredLocations:  textToArray(formData.preferredLocationsText),
      projects:            textToArray(formData.projectsText),
      projectTechnologies: textToArray(formData.projectTechnologiesText),
      certifications:      textToArray(formData.certificationsText),
      resumeUrl:    formData.resumeUrl,
      portfolioUrl: formData.portfolioUrl,
      githubUrl:    formData.githubUrl,
      linkedinUrl:  formData.linkedinUrl,
    }

    const res = await api.put('/profile', payload)
    profile.value = res.data.profile
    updateUser(res.data.profile)   // Cập nhật user trong composable
    refreshUser()

    message.value  = 'Cập nhật thành công! ✅'
    isSuccess.value = true
    editMode.value  = false
    setTimeout(() => { message.value = '' }, 3000)

    await fetchProfile()  // Reload để đồng bộ dữ liệu
  } catch (error) {
    message.value  = error.response?.data?.message || 'Cập nhật thất bại'
    isSuccess.value = false
  }
}

function handleCancel() {
  editMode.value = false
  message.value  = ''
  fetchProfile()
}

// Callback khi upload CV xong
async function handleCVUploaded(cvUrl) {
  formData.resumeUrl = cvUrl || ''
  message.value  = 'CV đã được tải lên thành công ✅'
  isSuccess.value = true
  await fetchProfile()
  setTimeout(() => { message.value = '' }, 3000)
}

// Callback khi upload avatar xong
async function handleAvatarUploaded(avatarUrl) {
  if (profile.value) profile.value = { ...profile.value, avatar: avatarUrl }
  updateUser({ avatar: avatarUrl })
  refreshUser()
  message.value  = 'Ảnh đại diện đã được cập nhật ✅'
  isSuccess.value = true
  setTimeout(() => { message.value = '' }, 3000)
}

onMounted(() => { fetchProfile() })
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

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 28px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}

.avatar-wrap { margin-bottom: 16px; }
.profile-card h2 { font-size: 18px; color: #2c3e50; margin-bottom: 4px; }
.email-text      { font-size: 13px; color: #999; margin-bottom: 10px; }

.role-badge {
  display: inline-block;
  padding: 4px 14px; background: #e3f2fd; color: #1976d2;
  border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px;
}

.completion-stats {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 10px; border-top: 1px solid #f0f0f0; padding-top: 14px;
}

.cs-item { display: flex; flex-direction: column; align-items: center; }
.cs-val  { font-size: 22px; font-weight: 700; color: #667eea; margin-bottom: 2px; }
.cs-lbl  { font-size: 11px; color: #bbb; }

/* Nav tabs */
.profile-nav {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}

.profile-nav button,
.nav-link-ext {
  display: block; width: 100%;
  padding: 13px 18px; text-align: left;
  background: transparent; border: none; border-bottom: 1px solid #f0f0f0;
  cursor: pointer; font-size: 14px; font-weight: 500; color: #666;
  text-decoration: none; transition: all 0.15s; font-family: inherit;
}

.profile-nav button:last-of-type,
.nav-link-ext { border-bottom: none; }
.profile-nav button:hover, .nav-link-ext:hover { background: #f5f5f5; color: #2c3e50; }
.profile-nav button.active { background: linear-gradient(135deg,#667eea,#764ba2); color: white; }

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
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 8px; }
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
.form-group textarea:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.1); }
.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled { background: #f5f5f5; cursor: not-allowed; }
.form-group small { font-size: 12px; color: #aaa; margin-top: 4px; }

/* Alert */
.alert { padding: 12px 15px; border-radius: 8px; font-size: 14px; margin-top: 16px; }
.alert.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.alert.error   { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

/* Chọn tag loại hình / hình thức làm việc */
.tag-select { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 6px; }

.tag-option {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; background: #f0f0f0; border-radius: 20px; font-size: 13px; color: #555;
}

.tag-option.tag-selected {
  background: #e8ecff; border: 1px solid #667eea; color: #4b5fd6;
}

.tag-toggle-btn {
  width: 18px; height: 18px; border: none; border-radius: 50%;
  cursor: pointer; font-size: 11px; display: flex; align-items: center; justify-content: center;
  background: #28a745; color: white; transition: background 0.15s;
}

.tag-option.tag-selected .tag-toggle-btn { background: #dc3545; }

/* Kỹ năng */
.skill-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; min-height: 40px; }

.skill-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; background: #f0f0f0; border-radius: 20px; font-size: 13px; color: #2c3e50;
}

.skill-remove-btn {
  width: 18px; height: 18px; background: #dc3545; color: white;
  border: none; border-radius: 50%; cursor: pointer; font-size: 11px;
  display: flex; align-items: center; justify-content: center;
}

/* Thêm kỹ năng */
.add-skill-row { display: flex; gap: 10px; margin-bottom: 24px; }
.add-skill-row input {
  flex: 1; padding: 11px 14px; border: 2px solid #e0e0e0; border-radius: 8px;
  font-size: 14px; font-family: inherit; outline: none;
}
.add-skill-row input:focus { border-color: #667eea; }

/* Upload CV section */
.cv-section { margin-top: 28px; }

/* Buttons */
.btn {
  padding: 9px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; font-family: inherit;
}

.btn-primary { background: linear-gradient(135deg,#667eea,#764ba2); color: white; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,.4); }
.btn-outline { background: white; border: 1.5px solid #e0e0e0; color: #666; }
.btn-outline:hover { border-color: #667eea; color: #667eea; }

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
}
</style>