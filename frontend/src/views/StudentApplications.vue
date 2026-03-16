<template>
  <!-- ============================================================
       TRANG: Đơn ứng tuyển của tôi (Student)
       CHỨC NĂNG: Xem thống kê, lọc theo trạng thái, xem chi tiết,
                  xác nhận/từ chối lịch PV, rút đơn
  ============================================================ -->
  <div class="page">
    <Header />

    <div class="container">

      <!-- ── TIÊU ĐỀ ── -->
      <div class="page-header">
        <div>
          <h1>📄 Đơn ứng tuyển của tôi</h1>
          <p class="page-sub">Theo dõi trạng thái ứng tuyển và phản hồi từ nhà tuyển dụng</p>
        </div>
        <button class="btn btn-secondary" @click="router.back()">← Quay lại</button>
      </div>

      <!-- ── THỐNG KÊ ── -->
      <div class="stats-grid">
        <div v-for="stat in statCards" :key="stat.label" class="stat-card">
          <div class="stat-icon" :class="stat.colorClass">{{ stat.icon }}</div>
          <div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
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
          @click="changeFilter(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- ── ĐANG TẢI ── -->
      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p>Đang tải đơn ứng tuyển...</p>
      </div>

      <!-- ── TRỐNG ── -->
      <div v-else-if="applications.length === 0" class="state-box">
        <p class="empty-icon">📭</p>
        <p>Bạn chưa có đơn ứng tuyển nào.</p>
        <router-link to="/student/jobs" class="btn btn-primary">Tìm việc ngay</router-link>
      </div>

      <!-- ── DANH SÁCH ĐƠN ── -->
      <div v-else class="app-list">
        <div v-for="app in sortedApplications" :key="app._id" class="app-card">

          <!-- Header: tên job + công ty + badge trạng thái -->
          <div class="app-head">
            <div>
              <h3>{{ app.job?.title || 'Không xác định' }}</h3>
              <p class="company-name">{{ app.job?.employer?.companyName || 'Nhà tuyển dụng' }}</p>
              <p class="job-meta">
                {{ app.job?.location?.city || 'Không rõ địa điểm' }} •
                {{ getJobTypeLabel(app.job?.jobType) }}
              </p>
            </div>
            <div class="head-badges">
              <span class="status-badge" :class="'status-' + app.status">
                {{ getStatusLabel(app.status) }}
              </span>
              <!-- Badge lịch phỏng vấn nếu có -->
              <span
                v-if="app.interview?.status && app.interview.status !== 'none'"
                class="interview-badge"
                :class="'iv-' + app.interview.status"
              >
                {{ getInterviewStatusLabel(app.interview.status) }}
              </span>
            </div>
          </div>

          <!-- Thông tin: ngày nộp, lương kỳ vọng, hạn tin, cập nhật -->
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Ngày ứng tuyển</span>
              <span>{{ formatDateTime(app.appliedAt || app.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Lương kỳ vọng</span>
              <span>{{ app.expectedSalary ? formatCurrency(app.expectedSalary) : 'Không có' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Hạn nộp hồ sơ</span>
              <span>{{ formatDate(app.job?.deadline) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Cập nhật gần nhất</span>
              <span>{{ formatDateTime(app.reviewedAt || app.updatedAt) }}</span>
            </div>
          </div>

          <!-- Ghi chú từ nhà tuyển dụng -->
          <div v-if="app.employerNote" class="employer-note">
            <strong>💬 Ghi chú từ nhà tuyển dụng:</strong>
            <p>{{ app.employerNote }}</p>
          </div>

          <!-- Lịch phỏng vấn -->
          <div v-if="app.interview?.status && app.interview.status !== 'none'" class="interview-box">
            <strong>📅 Lịch phỏng vấn</strong>
            <p><b>Trạng thái:</b> {{ getInterviewStatusLabel(app.interview.status) }}</p>
            <p><b>Thời gian:</b> {{ formatDateTime(app.interview.scheduledAt) }}</p>
            <p><b>Hình thức:</b> {{ app.interview.mode === 'online' ? 'Online' : 'Offline' }}</p>
            <p v-if="app.interview.location"><b>Địa điểm:</b> {{ app.interview.location }}</p>
            <p v-if="app.interview.meetingLink">
              <b>Link:</b>
              <a :href="app.interview.meetingLink" target="_blank" rel="noopener noreferrer" class="iv-link">
                {{ app.interview.meetingLink }}
              </a>
            </p>
            <p v-if="app.interview.note"><b>Ghi chú:</b> {{ app.interview.note }}</p>
          </div>

          <!-- Nút hành động -->
          <div class="app-actions">
            <button class="btn btn-outline" @click="openDetail(app)">Xem chi tiết</button>
            <!-- Xác nhận / từ chối lịch PV (chỉ khi lịch đang chờ phản hồi) -->
            <button v-if="app.interview?.status === 'scheduled'" class="btn btn-primary" @click="respondInterview(app, 'accepted')">✅ Xác nhận lịch PV</button>
            <button v-if="app.interview?.status === 'scheduled'" class="btn btn-warning" @click="respondInterview(app, 'declined')">❌ Từ chối lịch PV</button>
            <!-- Rút đơn (chỉ khi còn pending/reviewing/shortlisted) -->
            <button v-if="canWithdraw(app)" class="btn btn-danger" @click="withdraw(app)">Rút đơn</button>
          </div>

        </div>
      </div>

    </div><!-- /container -->

    <!-- ============================================================
         MODAL: Chi tiết đơn ứng tuyển
    ============================================================ -->
    <div v-if="selectedApplication" class="modal-overlay" @click="closeDetail">
      <div class="modal-box" @click.stop>
        <button class="modal-close-btn" @click="closeDetail">✕</button>
        <h2 class="modal-title">📋 Chi tiết đơn ứng tuyển</h2>

        <!-- Thông tin công việc -->
        <div class="detail-section">
          <h3>Thông tin công việc</h3>
          <div class="detail-grid">
            <div class="detail-item"><label>Vị trí</label><span>{{ selectedApplication.job?.title }}</span></div>
            <div class="detail-item"><label>Công ty</label><span>{{ selectedApplication.job?.employer?.companyName || 'Nhà tuyển dụng' }}</span></div>
            <div class="detail-item"><label>Địa điểm</label><span>{{ selectedApplication.job?.location?.city || '—' }}</span></div>
            <div class="detail-item">
              <label>Trạng thái</label>
              <span class="status-badge" :class="'status-' + selectedApplication.status">
                {{ getStatusLabel(selectedApplication.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Thông tin đơn -->
        <div class="detail-section">
          <h3>Thông tin đơn</h3>
          <div class="detail-grid">
            <div class="detail-item"><label>Ngày ứng tuyển</label><span>{{ formatDateTime(selectedApplication.appliedAt || selectedApplication.createdAt) }}</span></div>
            <div class="detail-item"><label>Ngày sẵn sàng đi làm</label><span>{{ formatDate(selectedApplication.availableFrom) }}</span></div>
            <div class="detail-item"><label>Lương kỳ vọng</label><span>{{ selectedApplication.expectedSalary ? formatCurrency(selectedApplication.expectedSalary) : 'Không có' }}</span></div>
            <div class="detail-item">
              <label>CV</label>
              <a v-if="selectedApplication.resumeUrl" :href="getFullUrl(selectedApplication.resumeUrl)" target="_blank" class="iv-link">Xem CV</a>
              <span v-else>Không có</span>
            </div>
          </div>
        </div>

        <!-- Lịch phỏng vấn -->
        <div v-if="selectedApplication.interview?.status && selectedApplication.interview.status !== 'none'" class="detail-section">
          <h3>📅 Thông tin phỏng vấn</h3>
          <div class="detail-grid">
            <div class="detail-item"><label>Trạng thái</label><span>{{ getInterviewStatusLabel(selectedApplication.interview.status) }}</span></div>
            <div class="detail-item"><label>Thời gian</label><span>{{ formatDateTime(selectedApplication.interview.scheduledAt) }}</span></div>
            <div class="detail-item"><label>Hình thức</label><span>{{ selectedApplication.interview.mode === 'online' ? 'Online' : 'Offline' }}</span></div>
            <div v-if="selectedApplication.interview.location" class="detail-item"><label>Địa điểm</label><span>{{ selectedApplication.interview.location }}</span></div>
            <div v-if="selectedApplication.interview.meetingLink" class="detail-item">
              <label>Link meeting</label>
              <a :href="selectedApplication.interview.meetingLink" target="_blank" class="iv-link">{{ selectedApplication.interview.meetingLink }}</a>
            </div>
          </div>
          <div v-if="selectedApplication.interview.note" class="text-box">{{ selectedApplication.interview.note }}</div>
        </div>

        <!-- Thư xin việc -->
        <div v-if="selectedApplication.coverLetter" class="detail-section">
          <h3>Thư xin việc</h3>
          <div class="text-box">{{ selectedApplication.coverLetter }}</div>
        </div>

        <!-- Phản hồi từ nhà tuyển dụng -->
        <div v-if="selectedApplication.employerNote" class="detail-section">
          <h3>Phản hồi từ nhà tuyển dụng</h3>
          <div class="text-box employer-note-modal">{{ selectedApplication.employerNote }}</div>
        </div>

        <!-- Nút hành động modal -->
        <div class="modal-actions">
          <button v-if="selectedApplication.interview?.status === 'scheduled'" class="btn btn-primary" @click="respondInterview(selectedApplication, 'accepted')">✅ Xác nhận lịch PV</button>
          <button v-if="selectedApplication.interview?.status === 'scheduled'" class="btn btn-warning" @click="respondInterview(selectedApplication, 'declined')">❌ Từ chối lịch PV</button>
          <button v-if="canWithdraw(selectedApplication)" class="btn btn-danger" @click="withdraw(selectedApplication)">Rút đơn</button>
          <button class="btn btn-secondary" @click="closeDetail">Đóng</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
// ── Import ──
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import api from '../services/api'

const router = useRouter()

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const loading            = ref(false)
const filter             = ref('all')
const applications       = ref([])
const selectedApplication = ref(null)

// Thống kê đếm theo từng trạng thái
const stats = reactive({
  total: 0, pending: 0, reviewing: 0, shortlisted: 0,
  interviewing: 0, offered: 0, hired: 0, rejected: 0, withdrawn: 0,
})

// ════════════════════════════════════════
// COMPUTED
// ════════════════════════════════════════

// Sắp xếp: lịch PV chờ phản hồi lên đầu, sau đó mới sắp theo ngày
const sortedApplications = computed(() => {
  // Hàm trả về số ưu tiên: nhỏ hơn = hiển thị trước
  function getInterviewPriority(app) {
    const s = app?.interview?.status || 'none'
    if (s === 'scheduled') return 1   // ← Đang chờ phản hồi, quan trọng nhất
    if (s === 'accepted')  return 2
    if (s === 'declined')  return 3
    if (s === 'cancelled') return 4
    if (s === 'completed') return 5
    return 99
  }

  return [...applications.value].sort((a, b) => {
    const pDiff = getInterviewPriority(a) - getInterviewPriority(b)
    if (pDiff !== 0) return pDiff
    // Cùng priority → sắp xếp theo ngày mới nhất
    return new Date(b.appliedAt || b.createdAt || 0) - new Date(a.appliedAt || a.createdAt || 0)
  })
})

// Cấu hình 8 thẻ thống kê cho v-for
const statCards = computed(() => [
  { icon: '📌', label: 'Tổng đơn',        value: stats.total,       colorClass: 'color-all' },
  { icon: '⏳', label: 'Chờ xử lý',        value: stats.pending,     colorClass: 'color-pending' },
  { icon: '👀', label: 'Đang xem xét',     value: stats.reviewing,   colorClass: 'color-reviewing' },
  { icon: '📌', label: 'Đã shortlist',     value: stats.shortlisted, colorClass: 'color-shortlisted' },
  { icon: '🎤', label: 'Đang phỏng vấn',  value: stats.interviewing,colorClass: 'color-interviewing' },
  { icon: '🎁', label: 'Đã nhận offer',   value: stats.offered,     colorClass: 'color-offered' },
  { icon: '✅', label: 'Đã được tuyển',    value: stats.hired,       colorClass: 'color-hired' },
  { icon: '❌', label: 'Đã từ chối',       value: stats.rejected,    colorClass: 'color-rejected' },
])

// Filter tabs cho v-for
const filterTabs = [
  { value: 'all',         label: 'Tất cả' },
  { value: 'pending',     label: 'Chờ xử lý' },
  { value: 'reviewing',   label: 'Đang xem xét' },
  { value: 'shortlisted', label: 'Shortlist' },
  { value: 'interviewing',label: 'Phỏng vấn' },
  { value: 'offered',     label: 'Offer' },
  { value: 'hired',       label: 'Đã tuyển' },
  { value: 'rejected',    label: 'Đã từ chối' },
]

// ════════════════════════════════════════
// HÀM TIỆN ÍCH
// ════════════════════════════════════════

function getStatusLabel(status) {
  const labels = {
    pending:     '⏳ Chờ xử lý',
    reviewing:   '👀 Đang xem xét',
    shortlisted: '📌 Đã shortlist',
    interviewing:'🎤 Đang phỏng vấn',
    offered:     '🎁 Đã nhận offer',
    hired:       '✅ Đã được tuyển',
    rejected:    '❌ Đã từ chối',
    withdrawn:   '↩️ Đã rút',
  }
  return labels[status] || status
}

function getInterviewStatusLabel(status) {
  const map = {
    none:      'Chưa có lịch',
    scheduled: 'Đang chờ bạn phản hồi',
    accepted:  'Bạn đã xác nhận',
    declined:  'Bạn đã từ chối',
    cancelled: 'Nhà tuyển dụng đã hủy',
    completed: 'Đã hoàn thành',
  }
  return map[status] || status
}

function getJobTypeLabel(type) {
  const map = { 'full-time':'Toàn thời gian','part-time':'Bán thời gian',internship:'Thực tập',contract:'Hợp đồng',freelance:'Freelance' }
  return map[type] || 'Không xác định'
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}

function formatDateTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('vi-VN')
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

function getFullUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return (api.defaults.baseURL || '').replace(/\/api\/?$/, '') + url
}

// Điều kiện cho phép rút đơn: chỉ khi đang pending, reviewing, hoặc shortlisted
function canWithdraw(app) {
  return ['pending', 'reviewing', 'shortlisted'].includes(app?.status)
}

// ════════════════════════════════════════
// HÀM GỌI API
// ════════════════════════════════════════

async function fetchStats() {
  try {
    const res = await api.get('/applications/my-stats')
    const s = res.data.stats || res.data.statistics || {}
    Object.assign(stats, {
      total:       s.total       || 0,
      pending:     s.pending     || 0,
      reviewing:   s.reviewing   || 0,
      shortlisted: s.shortlisted || 0,
      interviewing:s.interviewing|| 0,
      offered:     s.offered     || 0,
      hired:       s.hired       || 0,
      rejected:    s.rejected    || 0,
      withdrawn:   s.withdrawn   || 0,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

async function fetchApplications() {
  try {
    loading.value = true
    const params = { sort: '-appliedAt' }
    if (filter.value !== 'all') params.status = filter.value
    const res = await api.get('/applications/my-applications', { params })
    applications.value = res.data.applications || []
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể tải đơn ứng tuyển')
  } finally {
    loading.value = false
  }
}

// Tải lại cả stats và danh sách
async function fetchAll() {
  await Promise.all([fetchStats(), fetchApplications()])
}

async function changeFilter(value) {
  filter.value = value
  await fetchApplications()
}

async function openDetail(app) {
  try {
    const res = await api.get(`/applications/${app._id}`)
    selectedApplication.value = res.data.application || app
  } catch {
    selectedApplication.value = app
  }
}

function closeDetail() {
  selectedApplication.value = null
}

// Làm mới dữ liệu của đơn đang mở trong modal
async function refreshDetail(appId) {
  try {
    const res = await api.get(`/applications/${appId}`)
    selectedApplication.value = res.data.application || null
  } catch { }
}

// Rút đơn ứng tuyển
async function withdraw(app) {
  if (!canWithdraw(app)) { alert('Chỉ rút đơn được khi đang chờ xử lý, xem xét hoặc shortlist'); return }
  if (!confirm('Bạn có chắc muốn rút đơn ứng tuyển này?')) return
  try {
    await api.put(`/applications/${app._id}/withdraw`)
    alert('✅ Đã rút đơn thành công')
    if (selectedApplication.value?._id === app._id) closeDetail()
    await fetchAll()
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể rút đơn')
  }
}

// Phản hồi lịch phỏng vấn: accepted hoặc declined
async function respondInterview(app, action) {
  const msg = action === 'accepted' ? 'Bạn xác nhận tham gia phỏng vấn?' : 'Bạn chắc chắn muốn từ chối lịch phỏng vấn?'
  if (!confirm(msg)) return
  try {
    const res = await api.put(`/applications/${app._id}/interview/respond`, { action })
    alert(res.data?.message || 'Đã phản hồi lịch phỏng vấn')
    await fetchAll()
    if (selectedApplication.value?._id === app._id) await refreshDetail(app._id)
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể phản hồi lịch phỏng vấn')
  }
}

onMounted(() => { fetchAll() })
</script>

<style scoped>
/* ════════════════════════════════════
   LAYOUT
════════════════════════════════════ */
.page { min-height: 100vh; background: #f8fafc; }

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 40px 48px;
}

.page-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 16px; margin-bottom: 24px;
}

.page-header h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
.page-sub { font-size: 14px; color: #64748b; }

/* ── Stats ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: white; border-radius: 14px; padding: 16px;
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 4px 14px rgba(0,0,0,.06);
}

.stat-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: white; flex-shrink: 0;
}

.color-all          { background: #6366f1; }
.color-pending      { background: #f59e0b; }
.color-reviewing    { background: #0ea5e9; }
.color-shortlisted  { background: #8b5cf6; }
.color-interviewing { background: #0284c7; }
.color-offered      { background: #f97316; }
.color-hired        { background: #22c55e; }
.color-rejected     { background: #ef4444; }

.stat-value { font-size: 24px; font-weight: 700; color: #0f172a; }
.stat-label { font-size: 12px; color: #64748b; }

/* ── Filter bar ── */
.filter-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }

.filter-btn {
  padding: 9px 16px; border: none; border-radius: 99px;
  background: #e2e8f0; color: #0f172a; cursor: pointer; font-weight: 600; font-size: 13px; font-family: inherit;
  transition: all 0.15s;
}

.filter-btn.active { background: #2563eb; color: white; }

/* ── State boxes ── */
.state-box { background: white; border-radius: 16px; padding: 48px; text-align: center; box-shadow: 0 4px 14px rgba(0,0,0,.06); }
.spinner { width: 36px; height: 36px; border: 4px solid #e0e0e0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 14px; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-icon { font-size: 40px; margin-bottom: 10px; }

/* ── App card ── */
.app-list { display: flex; flex-direction: column; gap: 14px; }

.app-card {
  background: white; border-radius: 16px; padding: 22px 24px;
  box-shadow: 0 4px 14px rgba(0,0,0,.06);
}

.app-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.app-head h3 { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
.company-name { font-size: 14px; color: #2563eb; margin-bottom: 3px; }
.job-meta     { font-size: 13px; color: #64748b; }

.head-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }

/* Status badges */
.status-badge, .interview-badge {
  display: inline-block; padding: 6px 13px; border-radius: 99px; font-weight: 700; font-size: 12px; white-space: nowrap;
}

.status-pending     { background: #fef3c7; color: #92400e; }
.status-reviewing   { background: #e0f2fe; color: #075985; }
.status-shortlisted { background: #ede9fe; color: #6d28d9; }
.status-interviewing{ background: #e0f2fe; color: #075985; }
.status-offered     { background: #fff7ed; color: #c2410c; }
.status-hired       { background: #dcfce7; color: #166534; }
.status-rejected    { background: #fee2e2; color: #991b1b; }
.status-withdrawn   { background: #e2e8f0; color: #334155; }

.iv-scheduled { background: #ede9fe; color: #6d28d9; }
.iv-accepted  { background: #dcfce7; color: #166534; }
.iv-declined  { background: #fff7ed; color: #c2410c; }
.iv-cancelled { background: #e2e8f0; color: #334155; }
.iv-completed { background: #e0f2fe; color: #075985; }

/* Info grid */
.info-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px; margin-bottom: 12px;
}

.info-item { background: #f8fafc; padding: 10px 14px; border-radius: 10px; font-size: 13px; }
.info-label { display: block; font-size: 11px; color: #94a3b8; margin-bottom: 3px; text-transform: uppercase; letter-spacing: .4px; }

/* Note / Interview boxes */
.employer-note { background: #fff7ed; border-left: 4px solid #f59e0b; padding: 12px 14px; border-radius: 8px; margin: 12px 0; font-size: 13px; }
.employer-note p { margin: 6px 0 0; color: #92400e; }

.interview-box { background: #eef6ff; border: 1px solid #cfe3ff; padding: 12px 14px; border-radius: 10px; margin: 12px 0; font-size: 13px; }
.interview-box p { margin: 5px 0; color: #374151; }
.iv-link { color: #2563eb; text-decoration: none; font-weight: 600; word-break: break-all; }
.iv-link:hover { text-decoration: underline; }

/* Actions */
.app-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #f0f0f0; }

/* Buttons */
.btn {
  padding: 9px 18px; border: none; border-radius: 10px; font-size: 13px; font-weight: 700;
  cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; transition: all 0.15s; font-family: inherit;
}

.btn:hover { transform: translateY(-1px); }
.btn-primary  { background: #2563eb; color: white; }
.btn-secondary{ background: #e2e8f0; color: #0f172a; }
.btn-outline  { background: white; color: #2563eb; border: 1.5px solid #bfdbfe; }
.btn-danger   { background: #ef4444; color: white; }
.btn-warning  { background: #f59e0b; color: white; }

/* ════════════════════════════════════
   MODAL
════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,.5);
  display: flex; align-items: center; justify-content: center;
  padding: 16px; z-index: 100; animation: fadeIn 0.2s ease;
}

.modal-box {
  width: min(860px, 100%); max-height: 90vh; overflow-y: auto;
  background: white; border-radius: 20px; padding: 28px; position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,.15); animation: slideUp 0.22s ease;
}

@keyframes fadeIn  { from{opacity:0;} to{opacity:1;} }
@keyframes slideUp { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:none;} }

.modal-close-btn {
  position: absolute; top: 14px; right: 14px;
  border: none; background: #f1f5f9; width: 34px; height: 34px;
  border-radius: 10px; cursor: pointer; font-size: 15px;
}

.modal-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }

.detail-section { margin-top: 18px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
.detail-section h3 { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }

.detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
.detail-item { background: #f8fafc; padding: 12px 14px; border-radius: 10px; }
.detail-item label { display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 4px; }
.detail-item span  { font-size: 14px; font-weight: 600; color: #0f172a; word-break: break-word; }

.text-box { background: #f8fafc; padding: 14px; border-radius: 10px; line-height: 1.7; font-size: 13px; color: #374151; white-space: pre-line; margin-top: 8px; }
.employer-note-modal { background: #fff7ed; border-left: 4px solid #f59e0b; }

.modal-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f0f0; justify-content: flex-end; }

/* ════════════════════════════════════
   RESPONSIVE
════════════════════════════════════ */
@media (max-width: 768px) {
  .container    { padding: 20px 16px; }
  .page-header  { flex-direction: column; }
  .app-head     { flex-direction: column; }
  .head-badges  { align-items: flex-start; }
  .stats-grid   { grid-template-columns: repeat(2, 1fr); }
}
</style>