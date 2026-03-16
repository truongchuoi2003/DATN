<template>
  <!-- ============================================================
       TRANG: Chi tiết việc làm (Sinh viên)
       CHỨC NĂNG: Xem chi tiết job, ứng tuyển, lưu job,
                  report bài đăng, report nhà tuyển dụng
       MODAL: ứng tuyển | report job | report employer
  ============================================================ -->
  <div class="page">
    <Header />

    <div class="container">
      <button class="btn-back" @click="$router.go(-1)">← Quay lại</button>

      <!-- Đang tải -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải thông tin công việc...</p>
      </div>

      <!-- Không tìm thấy -->
      <div v-else-if="!job" class="not-found">
        <p>❌ Không tìm thấy tin tuyển dụng</p>
        <router-link to="/student/jobs" class="btn btn-primary">Xem danh sách công việc</router-link>
      </div>

      <!-- Nội dung chính -->
      <div v-else>

        <!-- ── HEADER: logo + tên + nút hành động ── -->
        <div class="job-header-card">
          <div class="header-left">
            <div class="company-logo">{{ getInitials(job.employer?.companyName) }}</div>
            <div>
              <h1>{{ job.title }}</h1>
              <h3 class="company-name">{{ job.employer?.companyName }}</h3>
              <div class="job-tags">
                <span>📍 {{ job.location?.city || '—' }}</span>
                <span>💼 {{ getJobTypeLabel(job.jobType) }}</span>
                <span>⭐ {{ getLevelLabel(job.level) }}</span>
                <span>👁️ {{ job.views || 0 }} lượt xem</span>
              </div>
            </div>
          </div>

          <!-- Các nút hành động: ứng tuyển, lưu, report -->
          <div class="header-actions">
            <button v-if="!hasApplied" class="btn btn-apply" @click="showApplyModal = true">
              📝 Ứng tuyển ngay
            </button>
            <button v-else class="btn btn-applied" disabled>✅ Đã ứng tuyển</button>
            <button class="btn btn-save" @click="toggleSave">
              {{ isSaved ? '❤️ Đã lưu' : '🤍 Lưu tin' }}
            </button>
            <button class="btn btn-report" @click="openReportJob">🚨 Report bài đăng</button>
            <button class="btn btn-report-employer" @click="openReportEmployer">🏢 Report NTD</button>
          </div>
        </div>

        <!-- ── INFO CARDS: 4 thẻ lương / hạn / số lượng / kinh nghiệm ── -->
        <div class="info-cards">
          <div class="info-card">
            <div class="ic-icon">💰</div>
            <div>
              <span class="ic-label">Mức lương</span>
              <span class="ic-value">{{ formatSalary(job.salary) }}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="ic-icon">📅</div>
            <div>
              <span class="ic-label">Hạn nộp hồ sơ</span>
              <span class="ic-value" :class="{ expired: isExpired(job.deadline) }">
                {{ formatDate(job.deadline) }}
                {{ isExpired(job.deadline) ? '(Hết hạn)' : '' }}
              </span>
            </div>
          </div>
          <div class="info-card">
            <div class="ic-icon">👥</div>
            <div>
              <span class="ic-label">Số lượng tuyển</span>
              <span class="ic-value">{{ job.slots || 0 }} người</span>
            </div>
          </div>
          <div class="info-card">
            <div class="ic-icon">💼</div>
            <div>
              <span class="ic-label">Kinh nghiệm</span>
              <span class="ic-value">{{ getExperienceLabel(job.experience) }}</span>
            </div>
          </div>
        </div>

        <!-- ── MAIN GRID: nội dung + sidebar ── -->
        <div class="main-grid">

          <!-- Cột trái: mô tả, yêu cầu, quyền lợi, kỹ năng -->
          <div class="left-col">
            <div class="content-card">
              <h2>📋 Mô tả công việc</h2>
              <p class="multiline-text">{{ job.description }}</p>
            </div>
            <div class="content-card">
              <h2>✅ Yêu cầu ứng viên</h2>
              <p class="multiline-text">{{ job.requirements }}</p>
            </div>
            <div v-if="job.benefits" class="content-card">
              <h2>🎁 Quyền lợi</h2>
              <p class="multiline-text">{{ job.benefits }}</p>
            </div>
            <div v-if="job.skills?.length" class="content-card">
              <h2>🔧 Kỹ năng yêu cầu</h2>
              <div class="skill-list">
                <span v-for="skill in job.skills" :key="skill" class="skill-chip">{{ skill }}</span>
              </div>
            </div>
          </div>

          <!-- Cột phải: thông tin công ty, địa điểm, thống kê -->
          <div class="right-col">

            <div class="sidebar-card">
              <h3>🏢 Thông tin công ty</h3>
              <div class="detail-rows">
                <div class="dr"><span class="dr-lbl">Tên công ty</span><span>{{ job.employer?.companyName || '—' }}</span></div>
                <div v-if="job.employer?.companySize" class="dr"><span class="dr-lbl">Quy mô</span><span>{{ job.employer.companySize }}</span></div>
                <div v-if="job.employer?.website" class="dr">
                  <span class="dr-lbl">Website</span>
                  <a :href="normalizeUrl(job.employer.website)" target="_blank" rel="noopener noreferrer" class="ext-link">
                    {{ job.employer.website }}
                  </a>
                </div>
              </div>
            </div>

            <div class="sidebar-card">
              <h3>📍 Địa điểm làm việc</h3>
              <p><strong>{{ job.location?.address || 'Chưa cập nhật' }}</strong></p>
              <p class="text-muted">{{ job.location?.city || '—' }}</p>
            </div>

            <div class="sidebar-card">
              <h3>📊 Thống kê</h3>
              <div class="stats-row">
                <div class="stat-item">
                  <span class="stat-num">{{ job.applicationsCount || 0 }}</span>
                  <span class="stat-lbl">Người ứng tuyển</span>
                </div>
                <div class="stat-item">
                  <span class="stat-num">{{ job.views || 0 }}</span>
                  <span class="stat-lbl">Lượt xem</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div><!-- /v-else -->
    </div><!-- /container -->


    <!-- ============================================================
         MODAL 1: ỨNG TUYỂN
    ============================================================ -->
    <div v-if="showApplyModal" class="modal-overlay" @click="closeApplyModal">
      <div class="modal-box" @click.stop>
        <button class="modal-close-btn" @click="closeApplyModal">✕</button>
        <h2 class="modal-title">📝 Ứng tuyển: {{ job?.title }}</h2>

        <form @submit.prevent="submitApplication">
          <div class="form-group">
            <label class="form-label required-label">✍️ Thư xin việc</label>
            <textarea
              v-model="application.coverLetter"
              placeholder="Giới thiệu bản thân và lý do bạn phù hợp với vị trí này..."
              rows="6" required maxlength="1000"
              class="form-ctrl"
            ></textarea>
            <small class="form-hint">{{ application.coverLetter.length }}/1000 ký tự</small>
          </div>

          <div class="form-group">
            <label class="form-label">💰 Lương mong muốn (VND/tháng)</label>
            <input v-model.number="application.expectedSalary" type="number" placeholder="VD: 15000000" min="0" step="1000000" class="form-ctrl" />
          </div>

          <div class="form-group">
            <label class="form-label">📅 Có thể bắt đầu từ</label>
            <input v-model="application.availableFrom" type="date" :min="today" class="form-ctrl" />
          </div>

          <div class="form-group">
            <label class="form-label">💬 Thông tin thêm (không bắt buộc)</label>
            <textarea v-model="application.additionalInfo" placeholder="Kinh nghiệm, dự án, chứng chỉ bổ sung..." rows="4" maxlength="500" class="form-ctrl"></textarea>
            <small class="form-hint">{{ application.additionalInfo.length }}/500 ký tự</small>
          </div>

          <div class="info-box">
            ℹ️ Hệ thống sẽ dùng CV đã tải trong hồ sơ của bạn.
            <router-link to="/student/profile">Cập nhật hồ sơ</router-link> nếu chưa có CV.
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeApplyModal">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting">⏳ Đang gửi...</span>
              <span v-else>📤 Gửi hồ sơ</span>
            </button>
          </div>
        </form>
      </div>
    </div>


    <!-- ============================================================
         MODAL 2: REPORT BÀI ĐĂNG
    ============================================================ -->
    <div v-if="showReportJobModal" class="modal-overlay" @click="closeReportJob">
      <div class="modal-box" @click.stop>
        <button class="modal-close-btn" @click="closeReportJob">✕</button>
        <h2 class="modal-title">🚨 Report bài đăng</h2>

        <div class="report-target">
          <strong>{{ job?.title }}</strong>
          <p>{{ job?.employer?.companyName }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">Lý do report</label>
          <select v-model="reportJobForm.reason" class="form-ctrl">
            <option value="">-- Chọn lý do --</option>
            <option value="spam">Spam</option>
            <option value="fake_information">Thông tin giả</option>
            <option value="fraud">Lừa đảo</option>
            <option value="inappropriate_content">Nội dung không phù hợp</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Mô tả chi tiết</label>
          <textarea v-model="reportJobForm.description" rows="5" maxlength="1000" placeholder="Mô tả rõ lý do..." class="form-ctrl"></textarea>
          <small class="form-hint">{{ reportJobForm.description.length }}/1000 ký tự</small>
        </div>
        <div class="form-group">
          <label class="form-label">Link bằng chứng (không bắt buộc, mỗi dòng 1 link)</label>
          <textarea v-model="reportJobEvidenceText" rows="3" placeholder="https://..." class="form-ctrl"></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeReportJob">Hủy</button>
          <button class="btn btn-warning" @click="submitReportJob">🚨 Gửi report</button>
        </div>
      </div>
    </div>


    <!-- ============================================================
         MODAL 3: REPORT NHÀ TUYỂN DỤNG
    ============================================================ -->
    <div v-if="showReportEmployerModal" class="modal-overlay" @click="closeReportEmployer">
      <div class="modal-box" @click.stop>
        <button class="modal-close-btn" @click="closeReportEmployer">✕</button>
        <h2 class="modal-title">🏢 Report nhà tuyển dụng</h2>

        <div class="report-target">
          <strong>{{ job?.employer?.companyName }}</strong>
          <p>{{ job?.title }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">Lý do report</label>
          <select v-model="reportEmployerForm.reason" class="form-ctrl">
            <option value="">-- Chọn lý do --</option>
            <option value="fake_information">Thông tin giả</option>
            <option value="fraud">Lừa đảo</option>
            <option value="harassment">Quấy rối</option>
            <option value="unprofessional_behavior">Hành vi thiếu chuyên nghiệp</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Mô tả chi tiết</label>
          <textarea v-model="reportEmployerForm.description" rows="5" maxlength="1000" placeholder="Mô tả rõ lý do..." class="form-ctrl"></textarea>
          <small class="form-hint">{{ reportEmployerForm.description.length }}/1000 ký tự</small>
        </div>
        <div class="form-group">
          <label class="form-label">Link bằng chứng (không bắt buộc)</label>
          <textarea v-model="reportEmployerEvidenceText" rows="3" placeholder="https://..." class="form-ctrl"></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeReportEmployer">Hủy</button>
          <button class="btn btn-warning" @click="submitReportEmployer">🏢 Gửi report</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
// ── Import ──
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import axios from 'axios'

const route   = useRoute()
const router  = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const loading   = ref(true)
const job       = ref(null)
const hasApplied = ref(false)
const isSaved   = ref(false)
const submitting = ref(false)

// Modal controls
const showApplyModal          = ref(false)
const showReportJobModal      = ref(false)
const showReportEmployerModal = ref(false)

// Form ứng tuyển
const application = reactive({
  coverLetter:    '',
  expectedSalary: null,
  availableFrom:  '',
  additionalInfo: '',
})

// Form report job
const reportJobForm         = reactive({ reason: '', description: '' })
const reportJobEvidenceText = ref('')

// Form report employer
const reportEmployerForm         = reactive({ reason: '', description: '' })
const reportEmployerEvidenceText = ref('')

// Ngày hôm nay làm min cho input date
const today = new Date().toISOString().split('T')[0]

// ════════════════════════════════════════
// HÀM TIỆN ÍCH
// ════════════════════════════════════════

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : null
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ').filter(Boolean)
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase()
}

function formatSalary(salary) {
  if (!salary || salary.negotiable) return 'Thỏa thuận'
  const min = salary.min ? (salary.min / 1000000).toFixed(0) : 0
  const max = salary.max ? (salary.max / 1000000).toFixed(0) : 0
  return `${min} – ${max} triệu ${salary.currency || 'VND'}`
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}

function isExpired(deadline) {
  return deadline ? new Date(deadline) < new Date() : false
}

function getJobTypeLabel(type) {
  const map = { 'full-time':'Toàn thời gian','part-time':'Bán thời gian',internship:'Thực tập',contract:'Hợp đồng',freelance:'Freelance' }
  return map[type] || type || '—'
}

function getLevelLabel(level) {
  const map = { intern:'Thực tập sinh',fresher:'Fresher',junior:'Junior',middle:'Middle',senior:'Senior',leader:'Leader',manager:'Manager' }
  return map[level] || level || '—'
}

function getExperienceLabel(exp) {
  if (!exp) return 'Không yêu cầu'
  const map = { 'no-experience':'Không yêu cầu','0-1-year':'0–1 năm','1-3-years':'1–3 năm','3-5-years':'3–5 năm','5+-years':'Trên 5 năm' }
  return map[exp] || exp
}

// Đảm bảo URL có https:// ở đầu
function normalizeUrl(url) {
  if (!url) return ''
  const u = String(url).trim()
  return /^https?:\/\//i.test(u) ? u : `https://${u}`
}

// ════════════════════════════════════════
// HÀM GỌI API
// ════════════════════════════════════════

// Ghi nhận tương tác của sinh viên với job (click, view, apply)
async function recordInteraction(type) {
  try {
    const headers = getAuthHeaders()
    if (!headers) return
    await axios.post(`${API_URL}/jobs/${route.params.id}/interactions/${type}`, {}, { headers })
  } catch (error) { }
}

async function fetchJobDetail() {
  try {
    loading.value = true
    const res = await axios.get(`${API_URL}/jobs/public/${route.params.id}`)
    job.value = res.data.job

    // Ghi nhận click và view, kiểm tra trạng thái đã ứng tuyển và đã lưu
    await Promise.allSettled([
      recordInteraction('click'),
      recordInteraction('view'),
      checkApplicationStatus(),
      fetchSavedStatus(),
    ])
  } catch (error) {
    console.error('Error fetching job:', error)
  } finally {
    loading.value = false
  }
}

async function checkApplicationStatus() {
  try {
    const headers = getAuthHeaders()
    if (!headers) return
    const res = await axios.get(`${API_URL}/applications/check/${route.params.id}`, { headers })
    hasApplied.value = res.data.hasApplied
  } catch {
    hasApplied.value = false
  }
}

async function fetchSavedStatus() {
  try {
    const headers = getAuthHeaders()
    if (!headers) return
    const res = await axios.get(`${API_URL}/jobs/saved/my`, { headers })
    isSaved.value = (res.data.jobs || []).some(j => String(j._id) === String(route.params.id))
  } catch {
    isSaved.value = false
  }
}

// Toggle lưu/bỏ lưu job
async function toggleSave() {
  const headers = getAuthHeaders()
  if (!headers) { alert('Vui lòng đăng nhập'); router.push('/login'); return }
  if (!job.value?._id) return
  try {
    if (isSaved.value) {
      await axios.delete(`${API_URL}/jobs/${job.value._id}/save`, { headers })
      isSaved.value = false
    } else {
      await axios.post(`${API_URL}/jobs/${job.value._id}/save`, {}, { headers })
      isSaved.value = true
    }
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể cập nhật trạng thái lưu')
  }
}

// Gửi đơn ứng tuyển
async function submitApplication() {
  const headers = getAuthHeaders()
  if (!headers) { alert('Vui lòng đăng nhập để ứng tuyển'); router.push('/login'); return }

  try {
    submitting.value = true
    await axios.post(`${API_URL}/applications`, {
      jobId:          route.params.id,
      coverLetter:    application.coverLetter,
      expectedSalary: application.expectedSalary || null,
      availableFrom:  application.availableFrom  || null,
      additionalInfo: application.additionalInfo || null,
    }, { headers })

    alert('✅ Ứng tuyển thành công! Chúc bạn may mắn!')
    hasApplied.value = true
    closeApplyModal()
    router.push('/student/applications')
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể gửi đơn ứng tuyển')
  } finally {
    submitting.value = false
  }
}

// ── Các hàm mở/đóng modal ──

function closeApplyModal() {
  showApplyModal.value = false
  Object.assign(application, { coverLetter: '', expectedSalary: null, availableFrom: '', additionalInfo: '' })
}

function openReportJob() {
  Object.assign(reportJobForm, { reason: '', description: '' })
  reportJobEvidenceText.value = ''
  showReportJobModal.value = true
}

function closeReportJob() {
  showReportJobModal.value = false
}

function openReportEmployer() {
  Object.assign(reportEmployerForm, { reason: '', description: '' })
  reportEmployerEvidenceText.value = ''
  showReportEmployerModal.value = true
}

function closeReportEmployer() {
  showReportEmployerModal.value = false
}

// Gửi report bài đăng
async function submitReportJob() {
  if (!reportJobForm.reason)       { alert('Vui lòng chọn lý do report'); return }
  if (!reportJobForm.description.trim()) { alert('Vui lòng nhập mô tả'); return }

  const token = localStorage.getItem('token')
  if (!token) { alert('Vui lòng đăng nhập lại'); return }

  try {
    const evidenceUrls = reportJobEvidenceText.value.split('\n').map(s => s.trim()).filter(Boolean)
    await axios.post(`${API_URL}/reports/student/job`, {
      jobId:       job.value._id,
      reason:      reportJobForm.reason,
      description: reportJobForm.description.trim(),
      evidenceUrls,
    }, { headers: { Authorization: `Bearer ${token}` } })

    alert('✅ Đã gửi report thành công!')
    closeReportJob()
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể gửi report')
  }
}

// Gửi report nhà tuyển dụng
async function submitReportEmployer() {
  const employerId = job.value?.employer?._id || job.value?.employer
  if (!employerId)                          { alert('Không tìm thấy nhà tuyển dụng'); return }
  if (!reportEmployerForm.reason)           { alert('Vui lòng chọn lý do report'); return }
  if (!reportEmployerForm.description.trim()) { alert('Vui lòng nhập mô tả'); return }

  const token = localStorage.getItem('token')
  if (!token) { alert('Vui lòng đăng nhập lại'); return }

  try {
    const evidenceUrls = reportEmployerEvidenceText.value.split('\n').map(s => s.trim()).filter(Boolean)
    await axios.post(`${API_URL}/reports/student/employer`, {
      employerId,
      jobId:       job.value?._id || null,
      reason:      reportEmployerForm.reason,
      description: reportEmployerForm.description.trim(),
      evidenceUrls,
    }, { headers: { Authorization: `Bearer ${token}` } })

    alert('✅ Đã gửi report thành công!')
    closeReportEmployer()
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể gửi report')
  }
}

onMounted(() => { fetchJobDetail() })
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

.btn-back {
  padding: 9px 18px; background: white; border: 1.5px solid #e0e0e0;
  border-radius: 8px; cursor: pointer; font-weight: 500; margin-bottom: 20px;
  transition: all 0.15s; font-family: inherit;
}

.btn-back:hover { border-color: #667eea; color: #667eea; }

/* ── Loading / Not found ── */
.loading-state { text-align: center; padding: 60px; background: white; border-radius: 12px; color: #999; }

.spinner {
  width: 36px; height: 36px; border: 4px solid #e0e0e0; border-top-color: #667eea;
  border-radius: 50%; margin: 0 auto 16px; animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.not-found { text-align: center; padding: 80px; background: white; border-radius: 12px; color: #999; }

/* ── Job header card ── */
.job-header-card {
  background: white; border-radius: 12px; padding: 28px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05); margin-bottom: 16px;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 24px;
}

.header-left { display: flex; gap: 18px; flex: 1; }

.company-logo {
  width: 76px; height: 76px; border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 26px; flex-shrink: 0;
}

.header-left h1 { font-size: 26px; font-weight: 700; color: #2c3e50; margin-bottom: 6px; }
.company-name   { font-size: 16px; color: #667eea; font-weight: 500; margin-bottom: 10px; }

.job-tags { display: flex; flex-wrap: wrap; gap: 16px; font-size: 14px; color: #666; }

/* Các nút hành động */
.header-actions { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }

.btn {
  padding: 10px 20px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.15s; text-decoration: none; display: inline-block;
  text-align: center; white-space: nowrap; font-family: inherit;
}

.btn:hover:not(:disabled) { transform: translateY(-1px); }

.btn-apply   { background: linear-gradient(135deg,#667eea,#764ba2); color: white; }
.btn-apply:hover { box-shadow: 0 4px 12px rgba(102,126,234,.4); }
.btn-applied { background: #d4edda; color: #155724; cursor: not-allowed; }
.btn-save    { background: white; border: 1.5px solid #e0e0e0; color: #666; }
.btn-save:hover { border-color: #667eea; color: #667eea; }
.btn-report  { background: #fff7ed; color: #c2410c; border: 1px solid #fdba74; }
.btn-report:hover  { background: #ffedd5; }
.btn-report-employer { background: #eff6ff; color: #1d4ed8; border: 1px solid #93c5fd; }
.btn-report-employer:hover { background: #dbeafe; }
.btn-primary  { background: linear-gradient(135deg,#667eea,#764ba2); color: white; }
.btn-primary:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(102,126,234,.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary{ background: white; border: 1.5px solid #e0e0e0; color: #666; }
.btn-warning  { background: #f59e0b; color: white; }

/* ── Info cards: 4 thẻ ── */
.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.info-card {
  background: white; border-radius: 12px; padding: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
  display: flex; align-items: center; gap: 14px;
}

.ic-icon { width: 46px; height: 46px; background: #f0f0f0; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.ic-label { display: block; font-size: 12px; color: #aaa; margin-bottom: 3px; }
.ic-value { font-size: 15px; font-weight: 600; color: #2c3e50; }
.ic-value.expired { color: #dc3545; }

/* ── Main grid ── */
.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.left-col { display: flex; flex-direction: column; gap: 14px; }
.right-col { display: flex; flex-direction: column; gap: 14px; }

.content-card {
  background: white; border-radius: 12px; padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
}

.content-card h2 { font-size: 18px; color: #2c3e50; margin-bottom: 14px; }

.multiline-text { font-size: 14px; line-height: 1.8; color: #555; white-space: pre-line; }

.skill-list { display: flex; flex-wrap: wrap; gap: 8px; }
.skill-chip { padding: 6px 14px; background: #f0f0f0; border-radius: 20px; font-size: 13px; color: #555; }

/* Sidebar cards */
.sidebar-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.05); }
.sidebar-card h3 { font-size: 15px; font-weight: 700; color: #2c3e50; margin-bottom: 14px; }

.detail-rows { display: flex; flex-direction: column; gap: 10px; }
.dr { display: flex; flex-direction: column; gap: 3px; font-size: 13px; }
.dr-lbl { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .5px; }
.ext-link { color: #667eea; text-decoration: none; word-break: break-all; }
.ext-link:hover { text-decoration: underline; }
.text-muted { font-size: 13px; color: #999; margin-top: 4px; }

.stats-row { display: flex; justify-content: space-around; }
.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-num  { font-size: 26px; font-weight: 700; color: #667eea; margin-bottom: 4px; }
.stat-lbl  { font-size: 12px; color: #bbb; }

/* ════════════════════════════════════
   MODAL CHUNG
════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
  padding: 20px; z-index: 100; backdrop-filter: blur(3px);
  animation: fadeIn 0.2s ease;
}

.modal-box {
  background: white; border-radius: 16px; padding: 28px;
  max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;
  position: relative; box-shadow: 0 20px 60px rgba(0,0,0,.15); animation: slideUp 0.22s ease;
}

@keyframes fadeIn  { from{opacity:0;} to{opacity:1;} }
@keyframes slideUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:none;} }

.modal-close-btn {
  position: absolute; top: 16px; right: 16px;
  width: 30px; height: 30px; border-radius: 8px; background: #f0f0f0;
  border: none; cursor: pointer; font-size: 15px; color: #666;
}

.modal-close-btn:hover { background: #e0e0e0; }
.modal-title { font-size: 20px; font-weight: 700; color: #2c3e50; margin-bottom: 20px; }

/* Form trong modal */
.form-group { margin-bottom: 16px; }

.form-label { display: block; font-size: 13px; font-weight: 600; color: #555; margin-bottom: 6px; }
.required-label::after { content: ' *'; color: #dc3545; }
.form-hint { font-size: 12px; color: #aaa; margin-top: 4px; display: block; }

.form-ctrl {
  width: 100%; padding: 11px 14px; border: 2px solid #e0e0e0; border-radius: 8px;
  font-size: 14px; font-family: inherit; outline: none; box-sizing: border-box; transition: border-color 0.2s;
}

.form-ctrl:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.1); }

textarea.form-ctrl { resize: vertical; }

/* Info box */
.info-box {
  background: #e3f2fd; border-left: 4px solid #2196f3;
  padding: 14px; border-radius: 8px; margin-bottom: 16px;
  font-size: 13px; color: #1976d2;
}

.info-box a { color: #1565c0; text-decoration: underline; }

/* Report target box */
.report-target { background: #f8fafc; padding: 14px; border-radius: 8px; margin-bottom: 16px; }
.report-target strong { font-size: 15px; color: #2c3e50; }
.report-target p { font-size: 13px; color: #888; margin-top: 4px; }

.modal-actions {
  display: flex; gap: 10px; justify-content: flex-end;
  margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f0f0;
}

/* ════════════════════════════════════
   RESPONSIVE
════════════════════════════════════ */
@media (max-width: 1024px) { .main-grid { grid-template-columns: 1fr; } }

@media (max-width: 768px) {
  .container { padding: 20px 16px; }
  .job-header-card { flex-direction: column; }
  .header-left { flex-direction: column; align-items: center; text-align: center; }
  .header-actions { width: 100%; }
  .header-actions .btn { width: 100%; }
  .info-cards { grid-template-columns: 1fr 1fr; }
}
</style>