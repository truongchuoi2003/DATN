<template>
  <!-- ============================================================
       TRANG: Chỉnh sửa tin tuyển dụng (Employer)
       CHỨC NĂNG: Load dữ liệu job hiện có, cho phép sửa, gọi API PUT
       GIỐNG JobCreate.vue nhưng có thêm:
         - onMounted gọi fetchJob() để load dữ liệu vào form
         - handleSubmit gọi PUT thay vì POST
  ============================================================ -->
  <div class="page">
    <Header />

    <div class="container">

      <div class="page-header">
        <div>
          <h1>✏️ Chỉnh sửa tin tuyển dụng</h1>
          <p class="page-sub">Cập nhật thông tin tin tuyển dụng</p>
        </div>
        <router-link to="/employer/jobs" class="btn btn-outline">← Quay lại</router-link>
      </div>

      <!-- Đang tải dữ liệu job -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Form chỉnh sửa (hiện sau khi load xong) -->
      <form v-else @submit.prevent="handleSubmit" class="job-form">

        <!-- ── SECTION 1: Thông tin cơ bản ── -->
        <div class="form-section">
          <h2>📋 Thông tin cơ bản</h2>
          <div class="form-grid">

            <div class="form-group full">
              <label>Tiêu đề công việc <span class="required">*</span></label>
              <input v-model="form.title" type="text" placeholder="VD: Senior Full Stack Developer" required maxlength="200" />
            </div>

            <div class="form-group">
              <label>Loại hình công việc <span class="required">*</span></label>
              <select v-model="form.jobType" required>
                <option value="">-- Chọn loại hình --</option>
                <option value="full-time">Toàn thời gian</option>
                <option value="part-time">Bán thời gian</option>
                <option value="internship">Thực tập</option>
                <option value="contract">Hợp đồng</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div class="form-group">
              <label>Cấp bậc <span class="required">*</span></label>
              <select v-model="form.level" required>
                <option value="">-- Chọn cấp bậc --</option>
                <option value="intern">Thực tập sinh</option>
                <option value="fresher">Fresher</option>
                <option value="junior">Junior</option>
                <option value="middle">Middle</option>
                <option value="senior">Senior</option>
                <option value="leader">Leader</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div class="form-group">
              <label>Kinh nghiệm <span class="required">*</span></label>
              <select v-model="form.experience" required>
                <option value="">-- Chọn kinh nghiệm --</option>
                <option value="no-experience">Không yêu cầu</option>
                <option value="0-1-year">0–1 năm</option>
                <option value="1-3-years">1–3 năm</option>
                <option value="3-5-years">3–5 năm</option>
                <option value="5+-years">Trên 5 năm</option>
              </select>
            </div>

            <div class="form-group">
              <label>Số lượng tuyển <span class="required">*</span></label>
              <input v-model.number="form.slots" type="number" min="1" required />
            </div>

            <div class="form-group">
              <label>Hạn nộp hồ sơ <span class="required">*</span></label>
              <input v-model="form.deadline" type="date" :min="today" required />
            </div>

          </div>
        </div>

        <!-- ── SECTION 2: Mức lương ── -->
        <div class="form-section">
          <h2>💰 Mức lương</h2>
          <div class="form-grid">

            <div class="form-group">
              <label>Lương tối thiểu (VND) <span class="required">*</span></label>
              <input v-model.number="form.salary.min" type="number" min="0" step="1000000" required />
              <small>{{ formatCurrency(form.salary.min) }}</small>
            </div>

            <div class="form-group">
              <label>Lương tối đa (VND) <span class="required">*</span></label>
              <input v-model.number="form.salary.max" type="number" min="0" step="1000000" required />
              <small>{{ formatCurrency(form.salary.max) }}</small>
            </div>

            <div class="form-group">
              <label>Đơn vị tiền tệ</label>
              <select v-model="form.salary.currency">
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.salary.negotiable" />
                <span>Có thể thương lượng</span>
              </label>
            </div>

          </div>
        </div>

        <!-- ── SECTION 3: Địa điểm ── -->
        <div class="form-section">
          <h2>📍 Địa điểm làm việc</h2>
          <div class="form-grid">

            <div class="form-group">
              <label>Thành phố <span class="required">*</span></label>
              <select v-model="form.location.city" required>
                <option value="">-- Chọn thành phố --</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Hải Phòng">Hải Phòng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div class="form-group full">
              <label>Địa chỉ cụ thể <span class="required">*</span></label>
              <input v-model="form.location.address" type="text" placeholder="VD: 123 Đường ABC, Quận XYZ" required />
            </div>

          </div>
        </div>

        <!-- ── SECTION 4: Mô tả chi tiết ── -->
        <div class="form-section">
          <h2>📝 Mô tả chi tiết</h2>

          <div class="form-group">
            <label>Mô tả công việc <span class="required">*</span></label>
            <textarea v-model="form.description" rows="8" required maxlength="5000"></textarea>
            <small>{{ form.description.length }}/5000 ký tự</small>
          </div>

          <div class="form-group">
            <label>Yêu cầu ứng viên <span class="required">*</span></label>
            <textarea v-model="form.requirements" rows="8" required maxlength="3000"></textarea>
            <small>{{ form.requirements.length }}/3000 ký tự</small>
          </div>

          <div class="form-group">
            <label>Quyền lợi</label>
            <textarea v-model="form.benefits" rows="6" maxlength="2000"></textarea>
            <small>{{ form.benefits.length }}/2000 ký tự</small>
          </div>
        </div>

        <!-- ── SECTION 5: Kỹ năng & Lĩnh vực ── -->
        <div class="form-section">
          <h2>🔧 Kỹ năng & Lĩnh vực</h2>

          <div class="form-group">
            <label>Kỹ năng yêu cầu</label>
            <div class="tags-input">
              <div class="tags-list">
                <span v-for="(skill, i) in form.skills" :key="i" class="tag">
                  {{ skill }}
                  <button type="button" @click="removeSkill(i)" class="tag-remove">×</button>
                </span>
              </div>
              <input v-model="newSkill" @keyup.enter="addSkill" type="text" placeholder="Thêm kỹ năng (Enter để thêm)" />
            </div>
            <small>VD: React, Node.js, MongoDB...</small>
          </div>

          <div class="form-group">
            <label>Lĩnh vực</label>
            <div class="tags-input">
              <div class="tags-list">
                <span v-for="(cat, i) in form.categories" :key="i" class="tag">
                  {{ cat }}
                  <button type="button" @click="removeCategory(i)" class="tag-remove">×</button>
                </span>
              </div>
              <input v-model="newCategory" @keyup.enter="addCategory" type="text" placeholder="Thêm lĩnh vực (Enter để thêm)" />
            </div>
            <small>VD: IT, Software Development...</small>
          </div>
        </div>

        <div v-if="message" class="alert" :class="isSuccess ? 'success' : 'error'">
          {{ message }}
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span v-if="submitting" class="spinner"></span>
            {{ submitting ? 'Đang xử lý...' : '💾 Lưu thay đổi' }}
          </button>
          <router-link to="/employer/jobs" class="btn btn-outline">Hủy</router-link>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
// ── Import ──
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from '../components/Header.vue'
import api from '../services/api'

const router = useRouter()
const route  = useRoute()

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const loading     = ref(true)   // true khi đang tải dữ liệu job
const submitting  = ref(false)  // true khi đang gửi form
const message     = ref('')
const isSuccess   = ref(false)
const newSkill    = ref('')
const newCategory = ref('')

// Ngày hôm nay làm min cho hạn nộp
const today = computed(() => new Date().toISOString().split('T')[0])

// Form – giống JobCreate nhưng sẽ được điền bởi fetchJob()
const form = reactive({
  title:        '',
  description:  '',
  requirements: '',
  benefits:     '',
  location: { address: '', city: '' },
  salary:   { min: 0, max: 0, currency: 'VND', negotiable: false },
  jobType:    '',
  level:      '',
  experience: '',
  skills:     [],
  categories: [],
  deadline:   '',
  slots:      1,
})

// ════════════════════════════════════════
// HÀM TIỆN ÍCH
// ════════════════════════════════════════

function formatCurrency(value) {
  if (!value) return ''
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

function addSkill() {
  const s = newSkill.value.trim()
  if (s && !form.skills.includes(s)) form.skills.push(s)
  newSkill.value = ''
}

function removeSkill(i) { form.skills.splice(i, 1) }

function addCategory() {
  const c = newCategory.value.trim()
  if (c && !form.categories.includes(c)) form.categories.push(c)
  newCategory.value = ''
}

function removeCategory(i) { form.categories.splice(i, 1) }

// ════════════════════════════════════════
// HÀM GỌI API
// ════════════════════════════════════════

// Load dữ liệu job hiện có vào form để chỉnh sửa
async function fetchJob() {
  try {
    loading.value = true
    const jobId = route.params.jobId
    const res   = await api.get(`/jobs/${jobId}`)
    const job   = res.data.job

    // Điền từng trường vào form
    form.title        = job.title        || ''
    form.description  = job.description  || ''
    form.requirements = job.requirements || ''
    form.benefits     = job.benefits     || ''

    form.location.address = job.location?.address || ''
    form.location.city    = job.location?.city    || ''

    form.salary.min        = job.salary?.min        || 0
    form.salary.max        = job.salary?.max        || 0
    form.salary.currency   = job.salary?.currency   || 'VND'
    form.salary.negotiable = job.salary?.negotiable || false

    form.jobType    = job.jobType    || ''
    form.level      = job.level      || ''
    form.experience = job.experience || ''
    form.skills     = [...(job.skills     || [])]
    form.categories = [...(job.categories || [])]
    form.slots      = job.slots || 1

    // Chuyển ISO date → YYYY-MM-DD cho input type="date"
    form.deadline = job.deadline ? job.deadline.split('T')[0] : ''

  } catch (error) {
    console.error('Fetch job error:', error)
    alert('Không thể tải thông tin tin tuyển dụng')
    router.push('/employer/jobs')
  } finally {
    loading.value = false
  }
}

// Gửi form cập nhật – dùng PUT thay vì POST
async function handleSubmit() {
  try {
    submitting.value = true
    message.value    = ''

    // Validate lương
    if (form.salary.min > form.salary.max) {
      message.value  = 'Lương tối thiểu không được lớn hơn lương tối đa'
      isSuccess.value = false
      submitting.value = false
      return
    }

    // Validate hạn nộp
    if (new Date(form.deadline) <= new Date()) {
      message.value  = 'Hạn nộp hồ sơ phải là ngày trong tương lai'
      isSuccess.value = false
      submitting.value = false
      return
    }

    const jobId = route.params.jobId
    await api.put(`/jobs/${jobId}`, form)

    message.value  = 'Cập nhật thành công! 🎉'
    isSuccess.value = true

    setTimeout(() => { router.push('/employer/jobs') }, 2000)

  } catch (error) {
    message.value  = error.response?.data?.message || 'Cập nhật thất bại'
    isSuccess.value = false
  } finally {
    submitting.value = false
  }
}

// Load dữ liệu job ngay khi trang mở
onMounted(() => { fetchJob() })
</script>

<style scoped>
/* Giống hệt JobCreate.vue – chỉ thêm loading state */
.page { min-height: 100vh; background: #f5f7fa; }

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 28px 40px 48px;
}

.page-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 16px; margin-bottom: 24px;
}

.page-header h1 { font-size: 26px; font-weight: 700; color: #2c3e50; margin-bottom: 4px; }
.page-sub { font-size: 14px; color: #888; }

/* Loading state */
.loading-state {
  text-align: center; padding: 60px; background: white;
  border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.05); color: #999;
}

.spinner {
  display: inline-block; width: 36px; height: 36px;
  border: 4px solid #e0e0e0; border-top-color: #4ecdc4;
  border-radius: 50%; margin: 0 auto 16px; animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.job-form {
  background: white; border-radius: 12px; padding: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
}

.form-section {
  margin-bottom: 36px; padding-bottom: 36px; border-bottom: 2px solid #f0f0f0;
}

.form-section:last-of-type { border-bottom: none; margin-bottom: 24px; }
.form-section h2 { font-size: 18px; font-weight: 700; color: #2c3e50; margin-bottom: 20px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

.form-group { display: flex; flex-direction: column; margin-bottom: 4px; }
.form-group.full { grid-column: 1 / -1; }

.form-group label { font-size: 13px; font-weight: 600; color: #555; margin-bottom: 7px; }
.required { color: #e74c3c; }

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

.form-group small { font-size: 12px; color: #aaa; margin-top: 4px; }

.checkbox-label {
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; padding: 12px 0; font-size: 14px; color: #555;
}

.checkbox-label input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }

.tags-input {
  border: 2px solid #e0e0e0; border-radius: 8px; padding: 10px;
  min-height: 50px; transition: border-color 0.2s;
}

.tags-input:focus-within { border-color: #4ecdc4; box-shadow: 0 0 0 3px rgba(78,205,196,.1); }

.tags-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }

.tag {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; background: #4ecdc4; color: white; border-radius: 20px; font-size: 13px;
}

.tag-remove {
  background: none; border: none; color: white; font-size: 18px; cursor: pointer;
  padding: 0; width: 20px; height: 20px; display: flex; align-items: center;
  justify-content: center; border-radius: 50%; transition: background 0.15s;
}

.tag-remove:hover { background: rgba(255,255,255,.2); }

.tags-input input { border: none; outline: none; padding: 6px 8px; font-size: 14px; width: 100%; font-family: inherit; }

.alert { padding: 12px 15px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }
.alert.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.alert.error   { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

.form-actions { display: flex; gap: 12px; justify-content: flex-end; }

.btn {
  padding: 11px 22px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; text-decoration: none;
  display: inline-flex; align-items: center; gap: 8px; font-family: inherit;
}

.btn-primary { background: linear-gradient(135deg,#4ecdc4,#44a08d); color: white; }
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(78,205,196,.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-outline { background: white; border: 1.5px solid #e0e0e0; color: #666; }
.btn-outline:hover { border-color: #4ecdc4; color: #4ecdc4; }

@media (max-width: 768px) {
  .container { padding: 20px 16px; }
  .page-header { flex-direction: column; }
  .form-grid { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; }
  .btn { width: 100%; justify-content: center; }
}
</style>