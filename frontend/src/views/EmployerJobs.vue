<template>
  <!-- ============================================================
       TRANG: Quản lý tin tuyển dụng (Employer)
       CHỨC NĂNG: Xem danh sách tin, lọc, xem chi tiết,
                  bật/tắt trạng thái, xóa tin
  ============================================================ -->
  <div class="page">
    <Header />

    <div class="container">

      <!-- ── TIÊU ĐỀ + NÚT ĐĂNG TIN ── -->
      <div class="page-header">
        <div>
          <h1>Quản lý Tin tuyển dụng</h1>
          <p class="page-sub">Quản lý và theo dõi các tin tuyển dụng của bạn</p>
        </div>
        <router-link to="/employer/jobs/create" class="btn btn-primary">
          ➕ Đăng tin mới
        </router-link>
      </div>

      <!-- ── THỐNG KÊ ── -->
      <div class="stats-grid">
        <div v-for="stat in statCards" :key="stat.label" class="stat-card">
          <div class="stat-icon" :style="{ background: stat.bg }">{{ stat.icon }}</div>
          <div class="stat-info">
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- ── FILTER TABS ── -->
      <div class="filter-bar">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          class="filter-btn"
          :class="{ active: filter === tab.value }"
          @click="filter = tab.value"
        >
          {{ tab.label }}
          <span class="filter-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- ── ĐANG TẢI ── -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- ── DANH SÁCH TIN ── -->
      <div v-else>
        <!-- Trống -->
        <div v-if="filteredJobs.length === 0" class="empty-state">
          <p class="empty-icon">📭</p>
          <p>Chưa có tin tuyển dụng nào</p>
          <router-link to="/employer/jobs/create" class="btn btn-primary">Đăng tin đầu tiên</router-link>
        </div>

        <!-- Danh sách -->
        <div v-else class="jobs-list">
          <div v-for="job in filteredJobs" :key="job._id" class="job-card">

            <!-- Header card: tên + tags + badge trạng thái -->
            <div class="jc-header">
              <div class="jc-title-area">
                <h3>{{ job.title }}</h3>
                <div class="jc-tags">
                  <span class="tag">📍 {{ job.location?.city || '—' }}</span>
                  <span class="tag">💼 {{ getJobTypeLabel(job.jobType) }}</span>
                  <span class="tag">⭐ {{ getLevelLabel(job.level) }}</span>
                </div>
              </div>
              <span class="status-badge" :class="'status-' + job.status">
                {{ job.status === 'active' ? '✅ Đang tuyển' : '🔒 Đã đóng' }}
              </span>
            </div>

            <!-- Thông tin lương, hạn, số lượng -->
            <div class="jc-info">
              <div class="info-row">
                <span class="info-label">💰 Mức lương</span>
                <span class="info-value">{{ formatSalary(job.salary) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">⏰ Hạn nộp</span>
                <span class="info-value" :class="{ expired: isExpired(job.deadline) }">
                  {{ formatDate(job.deadline) }}
                  {{ isExpired(job.deadline) ? '(Hết hạn)' : '' }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">🎯 Số lượng</span>
                <span class="info-value">{{ job.slots }} vị trí</span>
              </div>
            </div>

            <!-- Mini thống kê -->
            <div class="jc-stats">
              <div class="mini-stat">
                <span class="mini-num">{{ job.views || 0 }}</span>
                <span class="mini-lbl">Lượt xem</span>
              </div>
              <div class="mini-stat">
                <span class="mini-num">{{ job.applicationsCount || 0 }}</span>
                <span class="mini-lbl">Ứng viên</span>
              </div>
              <div class="mini-stat">
                <span class="mini-num">{{ formatDate(job.createdAt) }}</span>
                <span class="mini-lbl">Ngày đăng</span>
              </div>
            </div>

            <!-- Các nút thao tác -->
            <div class="jc-actions">
              <router-link
                :to="`/employer/applications/${job._id}`"
                class="btn-action"
              >
                👥 Xem ứng viên
              </router-link>
              <button class="btn-action" @click="openDetail(job._id)">👁️ Xem</button>
              <router-link :to="`/employer/jobs/${job._id}/edit`" class="btn-action">✏️ Sửa</router-link>
              <button class="btn-action" @click="toggleStatus(job)">
                {{ job.status === 'active' ? '🔒 Đóng' : '🔓 Mở lại' }}
              </button>
              <button class="btn-action btn-del" @click="deleteJob(job._id)">🗑️ Xóa</button>
            </div>

          </div>
        </div>
      </div>

    </div><!-- /container -->

    <!-- ============================================================
         MODAL XEM CHI TIẾT TIN TUYỂN DỤNG
    ============================================================ -->
    <div v-if="selectedJob" class="modal-overlay" @click="closeModal">
      <div class="modal-box" @click.stop>
        <button class="modal-close-btn" @click="closeModal">✕</button>
        <h2 class="modal-title">{{ selectedJob.title }}</h2>

        <div class="detail-grid">
          <!-- Cột trái: thông tin cơ bản -->
          <div class="detail-section">
            <h3>📋 Thông tin cơ bản</h3>
            <div class="detail-rows">
              <div class="dr"><span class="dr-label">Loại hình</span><span>{{ getJobTypeLabel(selectedJob.jobType) }}</span></div>
              <div class="dr"><span class="dr-label">Cấp bậc</span><span>{{ getLevelLabel(selectedJob.level) }}</span></div>
              <div class="dr"><span class="dr-label">Kinh nghiệm</span><span>{{ getExperienceLabel(selectedJob.experience) }}</span></div>
              <div class="dr"><span class="dr-label">Số lượng</span><span>{{ selectedJob.slots }} người</span></div>
            </div>
          </div>

          <!-- Cột phải: lương và địa điểm -->
          <div class="detail-section">
            <h3>💰 Lương & Địa điểm</h3>
            <div class="detail-rows">
              <div class="dr"><span class="dr-label">Mức lương</span><span>{{ formatSalary(selectedJob.salary) }}</span></div>
              <div class="dr"><span class="dr-label">Địa chỉ</span><span>{{ selectedJob.location?.address || '—' }}</span></div>
              <div class="dr"><span class="dr-label">Thành phố</span><span>{{ selectedJob.location?.city || '—' }}</span></div>
              <div class="dr"><span class="dr-label">Hạn nộp</span><span>{{ formatDate(selectedJob.deadline) }}</span></div>
            </div>
          </div>

          <!-- Full width: mô tả, yêu cầu, quyền lợi, kỹ năng -->
          <div class="detail-section full">
            <h3>📝 Mô tả công việc</h3>
            <p class="multiline-text">{{ selectedJob.description }}</p>
          </div>
          <div class="detail-section full">
            <h3>✅ Yêu cầu ứng viên</h3>
            <p class="multiline-text">{{ selectedJob.requirements }}</p>
          </div>
          <div v-if="selectedJob.benefits" class="detail-section full">
            <h3>🎁 Quyền lợi</h3>
            <p class="multiline-text">{{ selectedJob.benefits }}</p>
          </div>
          <div v-if="selectedJob.skills?.length" class="detail-section full">
            <h3>🔧 Kỹ năng yêu cầu</h3>
            <div class="skill-list">
              <span v-for="skill in selectedJob.skills" :key="skill" class="skill-chip">{{ skill }}</span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <router-link :to="`/employer/jobs/${selectedJob._id}/edit`" class="btn btn-primary">✏️ Chỉnh sửa tin này</router-link>
          <button class="btn btn-secondary" @click="closeModal">Đóng</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
// ── Import ──
import { ref, computed, onMounted } from 'vue'
import Header from '../components/Header.vue'
import api from '../services/api'

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const loading    = ref(false)
const jobs       = ref([])       // Danh sách tất cả tin của employer
const statistics = ref({})       // Thống kê tổng quan
const filter     = ref('all')    // Bộ lọc: all | active | closed
const selectedJob = ref(null)    // Tin đang xem trong modal

// ════════════════════════════════════════
// COMPUTED
// ════════════════════════════════════════

const activeCount = computed(() => jobs.value.filter(j => j.status === 'active').length)
const closedCount = computed(() => jobs.value.filter(j => j.status === 'closed').length)

const filteredJobs = computed(() => {
  if (filter.value === 'all') return jobs.value
  return jobs.value.filter(j => j.status === filter.value)
})

// Cấu hình tabs lọc – dùng v-for
const filterTabs = computed(() => [
  { value: 'all',    label: 'Tất cả',     count: jobs.value.length },
  { value: 'active', label: 'Đang tuyển', count: activeCount.value },
  { value: 'closed', label: 'Đã đóng',    count: closedCount.value },
])

// Cấu hình 4 thẻ thống kê – dùng v-for
const statCards = computed(() => [
  { icon: '📋', label: 'Tổng số tin',  value: statistics.value.totalJobs        || 0, bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { icon: '✅', label: 'Đang tuyển',   value: statistics.value.activeJobs        || 0, bg: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { icon: '👁️', label: 'Lượt xem',    value: statistics.value.totalViews        || 0, bg: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { icon: '👥', label: 'Ứng viên',     value: statistics.value.totalApplications || 0, bg: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
])

// ════════════════════════════════════════
// HÀM TIỆN ÍCH
// ════════════════════════════════════════

function formatSalary(salary) {
  if (!salary) return 'Thỏa thuận'
  const min = (salary.min / 1000000).toFixed(0)
  const max = (salary.max / 1000000).toFixed(0)
  return `${min} – ${max} triệu ${salary.currency}${salary.negotiable ? ' (TT)' : ''}`
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}

// Kiểm tra tin có hết hạn chưa
function isExpired(deadline) {
  return new Date(deadline) < new Date()
}

function getJobTypeLabel(type) {
  const map = { 'full-time':'Toàn thời gian','part-time':'Bán thời gian',internship:'Thực tập',contract:'Hợp đồng',freelance:'Freelance' }
  return map[type] || type
}

function getLevelLabel(level) {
  const map = { intern:'Thực tập sinh',fresher:'Fresher',junior:'Junior',middle:'Middle',senior:'Senior',leader:'Leader',manager:'Manager' }
  return map[level] || level
}

function getExperienceLabel(exp) {
  const map = { 'no-experience':'Không yêu cầu','0-1-year':'0–1 năm','1-3-years':'1–3 năm','3-5-years':'3–5 năm','5+-years':'Trên 5 năm' }
  return map[exp] || exp
}

// ════════════════════════════════════════
// HÀM GỌI API
// ════════════════════════════════════════

async function fetchJobs() {
  try {
    loading.value = true
    const res = await api.get('/jobs/my-jobs')
    jobs.value = res.data.jobs || []
  } catch (error) {
    console.error('Error fetching jobs:', error)
    alert('Không thể tải danh sách tin tuyển dụng')
  } finally {
    loading.value = false
  }
}

async function fetchStatistics() {
  try {
    const res = await api.get('/jobs/statistics')
    statistics.value = res.data.statistics || {}
  } catch (error) {
    console.error('Error fetching statistics:', error)
  }
}

// Mở modal xem chi tiết
async function openDetail(jobId) {
  try {
    const res = await api.get(`/jobs/${jobId}`)
    selectedJob.value = res.data.job
  } catch (error) {
    console.error('Error fetching job:', error)
    alert('Không thể tải thông tin tin tuyển dụng')
  }
}

function closeModal() {
  selectedJob.value = null
}

// Bật/tắt trạng thái tin
async function toggleStatus(job) {
  const action = job.status === 'active' ? 'đóng' : 'mở lại'
  if (!confirm(`Bạn có chắc muốn ${action} tin này?`)) return
  try {
    await api.patch(`/jobs/${job._id}/toggle-status`)
    alert(`Đã ${action} tin tuyển dụng thành công!`)
    fetchJobs()
    fetchStatistics()
  } catch (error) {
    alert('Có lỗi xảy ra')
  }
}

// Xóa tin tuyển dụng
async function deleteJob(jobId) {
  if (!confirm('Bạn có chắc muốn xóa tin này? Hành động này không thể hoàn tác!')) return
  try {
    await api.delete(`/jobs/${jobId}`)
    alert('Đã xóa tin tuyển dụng thành công!')
    fetchJobs()
    fetchStatistics()
  } catch (error) {
    alert('Có lỗi xảy ra')
  }
}

onMounted(() => {
  fetchJobs()
  fetchStatistics()
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

/* Page header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h1 { font-size: 24px; font-weight: 700; color: #2c3e50; margin-bottom: 4px; }
.page-sub { font-size: 14px; color: #888; }

/* ── Stats ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
  transition: transform 0.2s;
}

.stat-card:hover { transform: translateY(-3px); }

.stat-icon {
  width: 52px; height: 52px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
}

.stat-info h3 { font-size: 28px; font-weight: 700; color: #2c3e50; margin-bottom: 3px; }
.stat-info p  { font-size: 13px; color: #888; }

/* ── Filter bar ── */
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 99px;
  border: 1.5px solid #e0e0e0;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.filter-btn:hover { border-color: #667eea; color: #667eea; }
.filter-btn.active { background: #667eea; border-color: #667eea; color: white; }

.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px; height: 18px;
  padding: 0 5px; border-radius: 99px;
  font-size: 11px; font-weight: 700;
  background: rgba(0,0,0,.08);
}

.filter-btn.active .filter-count { background: rgba(255,255,255,.25); }

/* ── Loading / Empty ── */
.loading-state { text-align: center; padding: 60px; color: #999; }

.spinner {
  width: 36px; height: 36px;
  border: 4px solid #e0e0e0; border-top-color: #667eea;
  border-radius: 50%; margin: 0 auto 16px;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; color: #bbb; }
.empty-icon  { font-size: 40px; margin-bottom: 10px; }

/* ════════════════════════════════════
   JOB CARD
════════════════════════════════════ */
.jobs-list { display: flex; flex-direction: column; gap: 12px; }

.job-card {
  background: white;
  border-radius: 12px;
  padding: 22px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
  border: 1.5px solid transparent;
  transition: all 0.15s;
}

.job-card:hover { border-color: #667eea; box-shadow: 0 4px 16px rgba(102,126,234,.1); }

/* Header: tên + tags + badge */
.jc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0f0f0;
}

.jc-title-area h3 { font-size: 18px; font-weight: 700; color: #2c3e50; margin-bottom: 8px; }

.jc-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tag { background: #f0f4ff; color: #555; padding: 4px 12px; border-radius: 20px; font-size: 12px; }

.status-badge { display: inline-block; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.status-active { background: #d4edda; color: #155724; }
.status-closed { background: #f8d7da; color: #721c24; }

/* Thông tin lương / hạn */
.jc-info {
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0f0f0;
}

.info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
.info-label { color: #888; }
.info-value { font-weight: 500; color: #2c3e50; }
.info-value.expired { color: #dc3545; }

/* Mini stats */
.jc-stats {
  display: flex;
  gap: 28px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0f0f0;
}

.mini-stat { display: flex; flex-direction: column; align-items: center; }
.mini-num  { font-size: 18px; font-weight: 700; color: #667eea; margin-bottom: 2px; }
.mini-lbl  { font-size: 11px; color: #bbb; }

/* Nút thao tác */
.jc-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.btn-action {
  padding: 7px 16px;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  color: #555;
  display: inline-block;
  transition: all 0.15s;
  font-family: inherit;
}

.btn-action:hover { border-color: #667eea; color: #667eea; transform: translateY(-1px); }
.btn-action.btn-del:hover { border-color: #dc3545; color: #dc3545; }

/* Buttons chung */
.btn {
  padding: 9px 18px; border: none; border-radius: 8px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all 0.15s; text-decoration: none; display: inline-block; font-family: inherit;
}

.btn-primary  { background: linear-gradient(135deg,#667eea,#764ba2); color: white; }
.btn-primary:hover  { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,.4); }
.btn-secondary { background: white; color: #666; border: 1.5px solid #e0e0e0; }
.btn-secondary:hover { background: #f5f5f5; }

/* ════════════════════════════════════
   MODAL
════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center;
  padding: 20px; z-index: 100; backdrop-filter: blur(3px); animation: fadeIn 0.2s ease;
}

.modal-box {
  background: white; border-radius: 16px; padding: 28px;
  max-width: 900px; width: 100%; max-height: 88vh; overflow-y: auto;
  position: relative; box-shadow: 0 20px 60px rgba(0,0,0,.15); animation: slideUp 0.22s ease;
}

@keyframes fadeIn  { from{opacity:0;} to{opacity:1;} }
@keyframes slideUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:none;} }

.modal-close-btn {
  position: absolute; top: 16px; right: 16px;
  width: 30px; height: 30px; border-radius: 8px; background: #f0f0f0;
  border: none; cursor: pointer; font-size: 15px;
  display: flex; align-items: center; justify-content: center; color: #666;
}

.modal-close-btn:hover { background: #e0e0e0; }
.modal-title { font-size: 22px; font-weight: 700; color: #2c3e50; margin-bottom: 20px; }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px; }

.detail-section { background: #f8f9fa; border-radius: 10px; padding: 16px 18px; }
.detail-section.full { grid-column: 1 / -1; }
.detail-section h3 { font-size: 14px; font-weight: 700; color: #2c3e50; margin-bottom: 12px; }

.detail-rows { display: flex; flex-direction: column; gap: 8px; }
.dr { display: flex; justify-content: space-between; font-size: 13px; }
.dr-label { color: #999; }
.dr span:last-child { font-weight: 500; color: #2c3e50; }

.multiline-text { font-size: 13px; color: #555; line-height: 1.7; white-space: pre-wrap; margin: 0; }

.skill-list { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 4px; }
.skill-chip { padding: 4px 12px; background: white; border: 1px solid #e0e0e0; border-radius: 20px; font-size: 12px; color: #555; }

.modal-actions {
  display: flex; gap: 10px; justify-content: flex-end;
  margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f0f0;
}

/* ════════════════════════════════════
   RESPONSIVE
════════════════════════════════════ */
@media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }

@media (max-width: 768px) {
  .container { padding: 20px 16px; }
  .page-header { flex-direction: column; }
  .detail-grid { grid-template-columns: 1fr; }
}
</style>