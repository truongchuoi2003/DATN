<template>
  <!-- ============================================================
       TRANG: Dashboard Nhà tuyển dụng
       CHỨC NĂNG: Xem thống kê, tin đang tuyển, ứng viên mới,
                  xem chi tiết ứng viên, chấp nhận/từ chối
  ============================================================ -->
  <div class="page">
    <Header />

    <!-- ── HERO: chào mừng + nút đăng tin ── -->
    <section class="hero">
      <div class="hero-inner">
        <div>
          <h1>Chào mừng, {{ user?.companyName || user?.fullName }}! 💼</h1>
          <p>Quản lý tuyển dụng và tìm kiếm ứng viên tài năng</p>
        </div>
        <router-link to="/employer/jobs/create" class="btn-hero">
          ➕ Đăng tin tuyển dụng mới
        </router-link>
      </div>
    </section>

    <div class="container">

      <!-- Đang tải -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <div v-else>

        <!-- ── STATS: 4 thẻ số liệu ── -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)">📢</div>
            <div class="stat-info">
              <h3>{{ stats.totalJobs }}</h3>
              <p>Tin tuyển dụng</p>
              <span class="stat-sub">{{ stats.activeJobs }} đang hoạt động</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c)">👥</div>
            <div class="stat-info">
              <h3>{{ stats.totalApplications }}</h3>
              <p>Ứng viên</p>
              <span class="stat-sub positive">{{ stats.pendingApplications }} chờ xử lý</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe)">👁️</div>
            <div class="stat-info">
              <h3>{{ stats.totalViews }}</h3>
              <p>Lượt xem</p>
              <span class="stat-sub">Tất cả tin</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b, #38f9d7)">✅</div>
            <div class="stat-info">
              <h3>{{ stats.hiredApplications }}</h3>
              <p>Đã tuyển</p>
              <span class="stat-sub">Tổng cộng</span>
            </div>
          </div>
        </div>

        <!-- ── MAIN GRID: cột trái + cột phải ── -->
        <div class="dashboard-grid">

          <!-- ════ CỘT TRÁI ════ -->
          <div class="left-col">

            <!-- Card: tin tuyển dụng đang hoạt động -->
            <div class="card">
              <div class="card-head">
                <h2>Tin tuyển dụng đang hoạt động</h2>
                <router-link to="/employer/jobs" class="card-link">Quản lý tất cả →</router-link>
              </div>
              <div class="card-body">
                <div v-if="loadingJobs" class="mini-loading">
                  <div class="spinner-sm"></div><p>Đang tải...</p>
                </div>
                <div v-else-if="activeJobs.length === 0" class="mini-empty">
                  <p>📭 Chưa có tin tuyển dụng nào</p>
                  <router-link to="/employer/jobs/create" class="btn btn-sm btn-primary">Đăng tin ngay</router-link>
                </div>
                <div v-else class="job-list">
                  <div v-for="job in activeJobs" :key="job._id" class="job-item">
                    <div class="job-item-top">
                      <div>
                        <h4>{{ job.title }}</h4>
                        <p class="job-meta">{{ formatDate(job.createdAt) }} • {{ job.location?.city }}</p>
                      </div>
                      <span class="badge-active">Active</span>
                    </div>
                    <!-- Mini thống kê từng tin -->
                    <div class="job-mini-stats">
                      <div class="mini-stat"><span class="mini-num">{{ job.applicationsCount || 0 }}</span><span class="mini-lbl">Ứng viên</span></div>
                      <div class="mini-stat"><span class="mini-num">{{ job.views || 0 }}</span><span class="mini-lbl">Lượt xem</span></div>
                      <div class="mini-stat"><span class="mini-num">{{ job.pendingCount || 0 }}</span><span class="mini-lbl">Chờ duyệt</span></div>
                    </div>
                    <div class="job-item-actions">
                      <router-link :to="`/employer/applications/${job._id}`" class="btn btn-sm btn-outline">Xem ứng viên</router-link>
                      <router-link :to="`/employer/jobs/${job._id}/edit`"    class="btn btn-sm btn-secondary">Chỉnh sửa</router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card: hành động nhanh -->
            <div class="card">
              <div class="card-head"><h2>Hành động nhanh</h2></div>
              <div class="card-body">
                <!--
                  Dùng v-for thay vì lặp HTML 4 lần
                  quickActions là mảng cấu hình khai báo trong script
                -->
                <div class="quick-actions">
                  <router-link
                    v-for="action in quickActions"
                    :key="action.to"
                    :to="action.to"
                    class="action-btn"
                  >
                    <span class="action-icon">{{ action.icon }}</span>
                    <span>{{ action.label }}</span>
                  </router-link>
                </div>
              </div>
            </div>

          </div>

          <!-- ════ CỘT PHẢI: ứng viên mới ════ -->
          <div class="right-col">
            <div class="card">
              <div class="card-head">
                <h2>Ứng viên mới</h2>
                <router-link to="/employer/applications" class="card-link">Xem tất cả →</router-link>
              </div>
              <div class="card-body">
                <div v-if="loadingApps" class="mini-loading">
                  <div class="spinner-sm"></div><p>Đang tải...</p>
                </div>
                <div v-else-if="recentApplications.length === 0" class="mini-empty">
                  <p>📭 Chưa có ứng viên nào</p>
                </div>
                <div v-else class="applicant-list">
                  <div v-for="app in recentApplications" :key="app._id" class="applicant-item">
                    <!-- Avatar chữ -->
                    <div class="applicant-avatar">{{ getInitials(app.student?.fullName) }}</div>
                    <div class="applicant-info">
                      <h4>{{ app.student?.fullName }}</h4>
                      <p class="app-position">{{ app.job?.title }}</p>
                      <p class="app-meta">{{ app.student?.university }} • {{ formatDate(app.createdAt) }}</p>
                      <span class="status-badge" :class="'status-' + app.status">
                        {{ getStatusLabel(app.status) }}
                      </span>
                    </div>
                    <!-- Nút hành động -->
                    <div class="app-actions">
                      <button class="btn-icon" @click="openDetailModal(app)" title="Xem hồ sơ">👁️</button>
                      <button v-if="app.status === 'pending'" class="btn-icon btn-accept" @click="acceptApplication(app._id)" title="Chuyển sang đang xem xét">✓</button>
                      <button v-if="app.status === 'pending'" class="btn-icon btn-reject" @click="rejectApplication(app._id)" title="Từ chối">✕</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ============================================================
         MODAL: Chi tiết ứng viên
    ============================================================ -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-box" @click.stop>
        <button class="modal-close-btn" @click="closeDetailModal">✕</button>
        <h2 class="modal-title">Chi tiết ứng viên</h2>

        <div v-if="selectedApplication">
          <!-- Thông tin sinh viên -->
          <div class="detail-section">
            <h3>👤 Thông tin ứng viên</h3>
            <div class="detail-grid">
              <div class="detail-item"><span class="di-label">Họ tên</span><span class="di-value">{{ selectedApplication.student?.fullName }}</span></div>
              <div class="detail-item"><span class="di-label">Email</span><span class="di-value">{{ selectedApplication.student?.email }}</span></div>
              <div class="detail-item"><span class="di-label">Điện thoại</span><span class="di-value">{{ selectedApplication.student?.phone || 'Chưa cập nhật' }}</span></div>
              <div class="detail-item"><span class="di-label">Trường</span><span class="di-value">{{ selectedApplication.student?.university || 'Chưa cập nhật' }}</span></div>
            </div>
          </div>

          <!-- Thư xin việc -->
          <div class="detail-section">
            <h3>✍️ Thư xin việc</h3>
            <div class="cover-letter-box">{{ selectedApplication.coverLetter || 'Không có thư xin việc.' }}</div>
          </div>

          <!-- CV -->
          <div class="detail-section">
            <h3>📄 CV</h3>
            <a v-if="selectedApplication.resumeUrl" :href="getFullUrl(selectedApplication.resumeUrl)" target="_blank" class="btn btn-primary">
              📥 Xem CV
            </a>
            <p v-else class="text-muted">Không có CV</p>
          </div>

          <!-- Nút hành động modal -->
          <div class="modal-actions">
            <button v-if="selectedApplication.status === 'pending'" class="btn btn-success" @click="acceptApplication(selectedApplication._id)">👀 Đang xem xét</button>
            <button v-if="selectedApplication.status === 'pending'" class="btn btn-danger"  @click="rejectApplication(selectedApplication._id)">❌ Từ chối</button>
            <button class="btn btn-secondary" @click="closeDetailModal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
// ── Import ──
import { ref, reactive, onMounted } from 'vue'
import Header from '../components/Header.vue'
import { useAuth } from '../composables/useAuth'
import api from '../services/api'

const { user } = useAuth()

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const loading     = ref(true)
const loadingJobs = ref(false)
const loadingApps = ref(false)

// Thống kê tổng quan
const stats = reactive({
  totalJobs:            0,
  activeJobs:           0,
  totalApplications:    0,
  pendingApplications:  0,
  hiredApplications: 0,
  totalViews:           0,
})

const activeJobs           = ref([])  // Tin đang hoạt động (tối đa 3)
const recentApplications   = ref([])  // Ứng viên mới nhất (tối đa 5)

const showDetailModal      = ref(false)
const selectedApplication  = ref(null)

// ════════════════════════════════════════
// DỮ LIỆU TĨNH
// ════════════════════════════════════════

// Menu hành động nhanh – dùng v-for thay vì lặp HTML
const quickActions = [
  { to: '/employer/jobs/create',  icon: '➕', label: 'Đăng tin mới' },
  { to: '/employer/jobs',         icon: '📋', label: 'Quản lý tin' },
  { to: '/employer/applications', icon: '👥', label: 'Xem ứng viên' },
  { to: '/employer/profile',      icon: '⚙️', label: 'Cài đặt' },
]

// ════════════════════════════════════════
// HÀM TIỆN ÍCH
// ════════════════════════════════════════

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase()
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN')
}

function getStatusLabel(status) {
  const labels = {
    pending:      'Chờ xử lý',
    reviewing:    'Đang xem xét',
    shortlisted:  'Đã shortlist',
    interviewing: 'Đang phỏng vấn',
    offered:      'Đã gửi offer',
    hired:        'Đã tuyển',
    rejected:     'Đã từ chối',
  }
  return labels[status] || status
}

function getFullUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const origin = (api.defaults.baseURL || '').replace(/\/api\/?$/, '')
  return `${origin}${url}`
}

// ════════════════════════════════════════
// HÀM GỌI API
// ════════════════════════════════════════

async function fetchStats() {
  try {
    const [jobStatsRes, appStatsRes] = await Promise.all([
      api.get('/jobs/statistics'),
      api.get('/applications/employer/stats'),
    ])

    const jobStats = jobStatsRes.data.statistics || {}
    const appStats = appStatsRes.data.stats || {}

    stats.totalJobs           = jobStats.totalJobs || 0
    stats.activeJobs          = jobStats.activeJobs || 0
    stats.totalViews          = jobStats.totalViews || 0
    stats.totalApplications   = appStats.total || 0
    stats.pendingApplications = appStats.pending || 0
    stats.hiredApplications   = appStats.hired || 0
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

async function fetchActiveJobs() {
  try {
    loadingJobs.value = true
    const res = await api.get('/jobs/my-jobs', { params: { status: 'active' } })
    activeJobs.value = (res.data.jobs || []).slice(0, 3)  // Lấy tối đa 3 tin

    // Lấy thêm số lượng pending cho mỗi tin
    await Promise.all(
      activeJobs.value.map(async (job) => {
        try {
          const r = await api.get(`/applications/job/${job._id}`, { params: { status: 'pending' } })
          job.pendingCount = r.data?.applications?.length || 0
        } catch {
          job.pendingCount = 0
        }
      })
    )
  } catch (error) {
    console.error('Error fetching jobs:', error)
  } finally {
    loadingJobs.value = false
  }
}

async function fetchRecentApplications() {
  try {
    loadingApps.value = true
    const res = await api.get('/applications/employer', { params: { limit: 5, sort: '-createdAt' } })
    recentApplications.value = res.data.applications || []
  } catch (error) {
    console.error('Error fetching applications:', error)
  } finally {
    loadingApps.value = false
  }
}

// Gọi cả 3 API cùng lúc
async function fetchAllData() {
  loading.value = true
  await Promise.all([fetchStats(), fetchActiveJobs(), fetchRecentApplications()])
  loading.value = false
}

// Mở modal xem chi tiết ứng viên
async function openDetailModal(app) {
  try {
    const res = await api.get(`/applications/${app._id}`)
    selectedApplication.value = res.data.application || app
  } catch (error) {
    selectedApplication.value = app
  }
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value    = false
  selectedApplication.value = null
}

async function acceptApplication(appId) {
  if (!confirm('Bạn có chắc muốn chuyển ứng viên này sang trạng thái đang xem xét?')) return
  try {
    await api.put(`/applications/${appId}/status`, { status: 'reviewing' })
    alert('✅ Đã chuyển ứng viên sang trạng thái đang xem xét')
    closeDetailModal()
    await fetchAllData()
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể cập nhật trạng thái ứng viên')
  }
}

async function rejectApplication(appId) {
  if (!confirm('Bạn có chắc muốn từ chối ứng viên này?')) return
  try {
    await api.put(`/applications/${appId}/status`, { status: 'rejected' })
    alert('✅ Đã từ chối ứng viên')
    closeDetailModal()
    await fetchAllData()
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể từ chối ứng viên')
  }
}

onMounted(() => {
  fetchAllData()
})
</script>

<style scoped>
* { box-sizing: border-box; }

/* ════════════════════════════════════
   LAYOUT
════════════════════════════════════ */
.page { min-height: 100vh; background: #f5f7fa; }

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 40px 48px;
}

/* ── Hero ── */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 36px 40px;
}

.hero-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.hero h1 { font-size: 28px; font-weight: 700; margin-bottom: 6px; }
.hero p  { font-size: 15px; opacity: 0.9; }

.btn-hero {
  padding: 12px 22px;
  background: white;
  color: #667eea;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-hero:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.2); }

/* ── Loading ── */
.loading-state { text-align: center; padding: 60px; color: #999; }

.spinner {
  width: 40px; height: 40px;
  border: 4px solid #e0e0e0; border-top-color: #667eea;
  border-radius: 50%; margin: 0 auto 16px;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Stats grid ── */
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
  transition: all 0.2s;
}

.stat-card:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,.1); }

.stat-icon {
  width: 52px; height: 52px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
}

.stat-info h3  { font-size: 28px; font-weight: 700; color: #2c3e50; margin-bottom: 3px; }
.stat-info p   { font-size: 13px; color: #888; margin-bottom: 2px; }
.stat-sub      { font-size: 12px; color: #bbb; }
.stat-sub.positive { color: #43e97b; }

/* ── Dashboard 2 cột ── */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
}

/* ── Card chung ── */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
  overflow: hidden;
  margin-bottom: 16px;
}

.card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px; border-bottom: 1px solid #f0f0f0;
}

.card-head h2 { font-size: 16px; font-weight: 700; color: #2c3e50; }
.card-link { color: #667eea; text-decoration: none; font-size: 13px; font-weight: 500; }
.card-link:hover { text-decoration: underline; }
.card-body { padding: 20px 22px; }

/* Mini loading/empty */
.mini-loading { text-align: center; padding: 24px; color: #999; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.spinner-sm { width: 24px; height: 24px; border: 3px solid #e0e0e0; border-top-color: #667eea; border-radius: 50%; animation: spin 0.7s linear infinite; }
.mini-empty { text-align: center; padding: 24px; color: #bbb; font-size: 14px; }

/* ── Job list ── */
.job-list { display: flex; flex-direction: column; gap: 12px; }

.job-item {
  padding: 16px;
  border: 1.5px solid #f0f0f0;
  border-radius: 8px;
  transition: border-color 0.15s;
}

.job-item:hover { border-color: #667eea; }

.job-item-top {
  display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;
}

.job-item-top h4 { font-size: 15px; font-weight: 600; color: #2c3e50; margin-bottom: 3px; }
.job-meta { font-size: 12px; color: #bbb; }
.badge-active { display: inline-block; padding: 3px 10px; background: #d4edda; color: #155724; border-radius: 12px; font-size: 11px; font-weight: 600; }

.job-mini-stats { display: flex; gap: 24px; margin-bottom: 12px; }
.mini-stat { display: flex; flex-direction: column; }
.mini-num { font-size: 18px; font-weight: 700; color: #667eea; }
.mini-lbl { font-size: 11px; color: #bbb; }

.job-item-actions { display: flex; gap: 8px; }

/* ── Applicant list ── */
.applicant-list { display: flex; flex-direction: column; gap: 12px; }

.applicant-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px; border: 1.5px solid #f0f0f0; border-radius: 8px; transition: border-color 0.15s;
}

.applicant-item:hover { border-color: #667eea; }

.applicant-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15px; flex-shrink: 0;
}

.applicant-info { flex: 1; }
.applicant-info h4 { font-size: 14px; font-weight: 600; color: #2c3e50; margin-bottom: 3px; }
.app-position { font-size: 13px; color: #667eea; margin-bottom: 4px; }
.app-meta { font-size: 12px; color: #bbb; margin-bottom: 6px; }

.status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
.status-pending      { background: #fff3cd; color: #856404; }
.status-reviewing    { background: #cce5ff; color: #004085; }
.status-shortlisted  { background: #ede9fe; color: #6d28d9; }
.status-interviewing { background: #e0f2fe; color: #075985; }
.status-offered      { background: #fff7ed; color: #c2410c; }
.status-hired        { background: #dcfce7; color: #166534; }
.status-rejected     { background: #f8d7da; color: #721c24; }

.app-actions { display: flex; flex-direction: column; gap: 6px; }

.btn-icon { width: 32px; height: 32px; border: none; border-radius: 6px; background: #f0f0f0; cursor: pointer; font-size: 14px; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
.btn-icon:hover   { background: #e0e0e0; }
.btn-icon.btn-accept { background: #d4edda; color: #155724; }
.btn-icon.btn-accept:hover { background: #c3e6cb; }
.btn-icon.btn-reject { background: #f8d7da; color: #721c24; }
.btn-icon.btn-reject:hover { background: #f5c6cb; }

/* ── Quick actions ── */
.quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.action-btn {
  padding: 14px 10px; border: 1.5px solid #e0e0e0; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  text-decoration: none; transition: all 0.15s;
}

.action-btn:hover { border-color: #667eea; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,.1); }
.action-icon { font-size: 22px; }
.action-btn span:last-child { font-size: 13px; color: #555; font-weight: 500; }

/* ── Buttons ── */
.btn {
  padding: 9px 18px; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.15s; text-decoration: none; display: inline-block; font-family: inherit;
}

.btn-sm       { padding: 7px 14px; font-size: 12px; }
.btn-primary  { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
.btn-primary:hover  { transform: translateY(-1px); }
.btn-secondary { background: #6c757d; color: white; }
.btn-secondary:hover { background: #5a6268; }
.btn-outline  { background: white; border: 1.5px solid #667eea; color: #667eea; }
.btn-outline:hover  { background: #667eea; color: white; }
.btn-success  { background: #28a745; color: white; }
.btn-danger   { background: #dc3545; color: white; }

/* ════════════════════════════════════
   MODAL
════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center;
  padding: 20px; z-index: 100; backdrop-filter: blur(3px);
  animation: fadeIn 0.2s ease;
}

.modal-box {
  background: white; border-radius: 16px; padding: 28px;
  max-width: 760px; width: 100%; max-height: 88vh; overflow-y: auto;
  position: relative; box-shadow: 0 20px 60px rgba(0,0,0,.15);
  animation: slideUp 0.22s ease;
}

@keyframes fadeIn  { from{opacity:0;} to{opacity:1;} }
@keyframes slideUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:none;} }

.modal-close-btn {
  position: absolute; top: 16px; right: 16px;
  width: 30px; height: 30px; border-radius: 8px;
  background: #f0f0f0; border: none; cursor: pointer;
  font-size: 15px; display: flex; align-items: center; justify-content: center; color: #666;
}

.modal-close-btn:hover { background: #e0e0e0; }
.modal-title { font-size: 20px; font-weight: 700; color: #2c3e50; margin-bottom: 20px; }

.detail-section { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0; }
.detail-section:last-of-type { border-bottom: none; }
.detail-section h3 { font-size: 16px; color: #2c3e50; margin-bottom: 12px; }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-item { display: flex; flex-direction: column; gap: 3px; }
.di-label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .5px; }
.di-value { font-size: 14px; font-weight: 500; color: #2c3e50; }

.cover-letter-box {
  background: #f8f9fa; border-radius: 8px; padding: 16px;
  white-space: pre-line; line-height: 1.7; font-size: 14px; color: #555;
}

.text-muted { color: #bbb; font-style: italic; font-size: 14px; }

.modal-actions {
  display: flex; gap: 10px; justify-content: flex-end;
  margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f0f0;
}

/* ════════════════════════════════════
   RESPONSIVE
════════════════════════════════════ */
@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .hero-inner { flex-direction: column; gap: 16px; }
}

@media (max-width: 768px) {
  .container { padding: 20px 16px; }
  .hero { padding: 28px 16px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .detail-grid { grid-template-columns: 1fr; }
}
</style>