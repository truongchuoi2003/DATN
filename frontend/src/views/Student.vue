<template>
  <!-- ============================================================
       TRANG: Dashboard Sinh viên
       CHỨC NĂNG: Xem thống kê, % hoàn thiện hồ sơ, đơn ứng tuyển
                  gần đây, việc làm gợi ý (có bản đồ)
  ============================================================ -->
  <div class="page">
    <Header />

    <!-- ── HERO ── -->
    <section class="hero">
      <div class="hero-inner">
        <h1>Xin chào, {{ displayUser?.fullName || 'bạn' }}! 👋</h1>
        <p>Chào mừng đến với DATN Platform — Nơi bắt đầu sự nghiệp của bạn</p>
      </div>
    </section>

    <div class="container">
      <!-- Đang tải -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <div v-else>

        <!-- ── STATS: 4 thẻ ── -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background:linear-gradient(135deg,#667eea,#764ba2)">📝</div>
            <div class="stat-info">
              <h3>{{ stats.total || 0 }}</h3>
              <p>Đơn ứng tuyển</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:linear-gradient(135deg,#f093fb,#f5576c)">💼</div>
            <div class="stat-info">
              <h3>{{ stats.pending || 0 }}</h3>
              <p>Đang chờ phản hồi</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:linear-gradient(135deg,#4facfe,#00f2fe)">✅</div>
            <div class="stat-info">
              <h3>{{ stats.accepted || 0 }}</h3>
              <p>Được chấp nhận</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:linear-gradient(135deg,#43e97b,#38f9d7)">⭐</div>
            <div class="stat-info">
              <h3>{{ totalJobs }}</h3>
              <p>Công việc phù hợp</p>
            </div>
          </div>
        </div>

        <!-- ── MAIN GRID: 2 CỘT ── -->
        <div class="dashboard-grid">

          <!-- ════ CỘT TRÁI ════ -->
          <div class="left-col">

            <!-- Card: mức độ hoàn thiện hồ sơ -->
            <div class="card">
              <div class="card-head">
                <h2>Hồ sơ của bạn</h2>
                <!-- Badge màu thay đổi theo % hoàn thành -->
                <span
                  class="badge"
                  :class="profileCompletion < 50 ? 'badge-danger' : profileCompletion < 80 ? 'badge-warning' : 'badge-success'"
                >
                  {{ profileCompletion }}% hoàn thành
                </span>
              </div>
              <div class="card-body">
                <!-- Thanh progress -->
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: profileCompletion + '%' }"></div>
                </div>
                <p class="progress-hint">Hoàn thiện hồ sơ để tăng cơ hội tìm việc phù hợp</p>

                <!-- Danh sách trường còn thiếu -->
                <div v-if="missingFields.length > 0" class="missing-box">
                  <p class="missing-title">⚠️ Thông tin còn thiếu:</p>
                  <ul class="missing-list">
                    <li v-for="field in missingFields" :key="field">{{ field }}</li>
                  </ul>
                </div>

                <router-link to="/student/profile" class="btn btn-primary">
                  Cập nhật hồ sơ
                </router-link>
              </div>
            </div>

            <!-- Card: đơn ứng tuyển gần đây -->
            <div class="card">
              <div class="card-head">
                <h2>Đơn ứng tuyển gần đây</h2>
                <router-link to="/student/applications" class="card-link">Xem tất cả →</router-link>
              </div>
              <div class="card-body">
                <div v-if="loadingApps" class="mini-loading">
                  <div class="spinner-sm"></div><p>Đang tải...</p>
                </div>
                <div v-else-if="recentApplications.length === 0" class="mini-empty">
                  <p>📭 Chưa có đơn ứng tuyển nào</p>
                  <router-link to="/student/jobs" class="btn btn-sm btn-outline">Tìm việc ngay</router-link>
                </div>
                <div v-else class="app-list">
                  <div v-for="app in recentApplications" :key="app._id" class="app-item">
                    <div class="app-logo">{{ getInitials(app.job?.employer?.companyName) }}</div>
                    <div class="app-info">
                      <h4>{{ app.job?.title }}</h4>
                      <p>{{ app.job?.employer?.companyName }}</p>
                      <span class="status-badge" :class="'status-' + app.status">
                        {{ getStatusLabel(app.status) }}
                      </span>
                    </div>
                    <span class="app-date">{{ formatDate(app.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- ════ CỘT PHẢI ════ -->
          <div class="right-col">

            <!-- Card: việc làm gợi ý -->
            <div class="card">
              <div class="card-head">
                <h2>Việc làm phù hợp</h2>
                <div class="head-actions">
                  <!-- Nút bật/tắt bản đồ -->
                  <button
                    v-if="recommendedJobs.length > 0"
                    class="btn btn-sm btn-outline"
                    @click="showMap = !showMap"
                  >
                    {{ showMap ? '🗺️ Ẩn bản đồ' : '🗺️ Xem bản đồ' }}
                  </button>
                  <router-link to="/student/jobs" class="card-link">Xem thêm →</router-link>
                </div>
              </div>
              <div class="card-body">
                <div v-if="loadingJobs" class="mini-loading">
                  <div class="spinner-sm"></div><p>Đang tải...</p>
                </div>
                <div v-else-if="recommendedJobs.length === 0" class="mini-empty">
                  <p>📭 Chưa có công việc phù hợp</p>
                </div>
                <div v-else class="job-list">
                  <!-- Mỗi item có id để scroll to khi click marker bản đồ -->
                  <div
                    v-for="job in recommendedJobs"
                    :key="job._id"
                    :id="`rec-job-${job._id}`"
                    class="job-item"
                    :class="{ selected: String(job._id) === String(selectedJobId) }"
                    @click="selectedJobId = job._id"
                  >
                    <div class="job-row">
                      <div class="job-avatar" :style="{ background: getRandomGradient() }">
                        {{ getInitials(job.employer?.companyName) }}
                      </div>
                      <div>
                        <h4>{{ job.title }}</h4>
                        <p>{{ job.employer?.companyName || 'Nhà tuyển dụng' }}</p>
                      </div>
                    </div>
                    <div class="job-tags">
                      <span v-if="job.location?.city" class="tag">📍 {{ job.location.city }}</span>
                      <span v-if="job.jobType" class="tag">{{ job.jobType }}</span>
                      <span v-if="job.level" class="tag">{{ job.level }}</span>
                    </div>
                    <div class="job-foot">
                      <span class="salary-text">{{ formatSalary(job.salary) }}</span>
                      <router-link :to="`/student/jobs/${job._id}`" class="btn btn-sm btn-outline">Xem chi tiết</router-link>
                    </div>
                  </div>
                </div>

                <!-- Bản đồ vị trí các job gợi ý -->
                <div v-if="showMap && mapJobs.length > 0" class="map-section">
                  <p class="map-title">🗺️ Xem nhanh trên bản đồ</p>
                  <div class="map-wrap">
                    <JobsMap
                      :jobs="mapJobs"
                      :selected-job-id="selectedJobId"
                      :center="mapCenter"
                      :zoom="12"
                      @marker-click="onMarkerClick"
                    />
                  </div>
                  <p class="map-hint">Click vào marker để chọn job</p>
                </div>
              </div>
            </div>

            <!-- Card: hành động nhanh -->
            <div class="card">
              <div class="card-head"><h2>Hành động nhanh</h2></div>
              <div class="card-body">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ── Import ──
import { ref, reactive, computed, onMounted } from 'vue'
import Header  from '../components/Header.vue'
import JobsMap from '../components/JobsMap.vue'
import { useAuth } from '../composables/useAuth'
import axios from 'axios'

const { user, refreshUser, updateUser } = useAuth()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const loading     = ref(true)
const loadingApps = ref(false)
const loadingJobs = ref(false)
const profileData = ref(null)      // Dữ liệu profile đầy đủ từ API

const stats = reactive({ total: 0, pending: 0, accepted: 0, rejected: 0 })

const recentApplications = ref([])  // 3 đơn gần nhất
const recommendedJobs    = ref([])  // Job được gợi ý
const totalJobs          = ref(0)

const showMap     = ref(true)      // Hiện/ẩn bản đồ
const selectedJobId = ref(null)    // Job đang được chọn trên bản đồ

// ════════════════════════════════════════
// DỮ LIỆU TĨNH
// ════════════════════════════════════════

// Center của các thành phố lớn – dùng khi không có tọa độ chính xác
const CITY_CENTER = {
  'Hà Nội':          [21.02776, 105.83416],
  'TP. Hồ Chí Minh': [10.77689, 106.70098],
  'Đà Nẵng':         [16.05441, 108.20217],
  'Hải Phòng':       [20.84491, 106.68808],
  'Cần Thơ':         [10.04516, 105.78309],
}

// Hành động nhanh – dùng v-for
const quickActions = [
  { to: '/student/profile',      icon: '📄', label: 'CV của tôi' },
  { to: '/student/jobs',         icon: '🔍', label: 'Tìm việc làm' },
  { to: '/student/applications', icon: '📋', label: 'Đơn ứng tuyển' },
  { to: '/student/profile',      icon: '⚙️', label: 'Cài đặt' },
]

// ════════════════════════════════════════
// COMPUTED
// ════════════════════════════════════════

// Ưu tiên dữ liệu từ API, fallback về user từ localStorage
const displayUser = computed(() => profileData.value || user.value || {})

// Chuyển job thành định dạng có tọa độ latlng cho bản đồ
const mapJobs = computed(() => {
  return recommendedJobs.value
    .map(job => {
      const latlng = getLatLng(job)
      return latlng ? { ...job, latlng } : null
    })
    .filter(Boolean)
})

// Center bản đồ: ưu tiên vị trí user, rồi đến job đầu tiên
const mapCenter = computed(() => {
  const ucoords = displayUser.value?.location?.coordinates
  if (Array.isArray(ucoords) && ucoords.length === 2) {
    return [ucoords[1], ucoords[0]]  // API trả về [lng, lat], leaflet cần [lat, lng]
  }
  if (mapJobs.value.length > 0) return mapJobs.value[0].latlng
  return CITY_CENTER['TP. Hồ Chí Minh']
})

// ── Tính % hoàn thiện hồ sơ ──

// Danh sách các trường cần có và trạng thái có/thiếu
const profileRequirements = computed(() => {
  const u = displayUser.value || {}
  return [
    { label: 'Họ và tên',                   ok: hasValue(u.fullName) },
    { label: 'Số điện thoại',               ok: hasValue(u.phone) },
    { label: 'Ngày sinh',                   ok: hasValue(u.birthday) },
    { label: 'Địa chỉ',                     ok: hasValue(u.address) },
    { label: 'Trường đại học',              ok: hasValue(u.university) },
    { label: 'Chuyên ngành',                ok: hasValue(u.major) },
    { label: 'Kỹ năng',                     ok: hasValue(u.skills) },
    { label: 'Loại hình công việc mong muốn', ok: hasValue(u.preferredJobTypes) },
    { label: 'Nhóm nghề quan tâm',          ok: hasValue(u.preferredCategories) },
    { label: 'Vị trí mong muốn',            ok: hasValue(u.desiredJobTitles) },
    { label: 'Khu vực mong muốn',           ok: hasValue(u.preferredLocations) },
    { label: 'CV chưa được tải lên',        ok: hasValue(u.resumeUrl) },
  ]
})

// % tính dựa trên số trường đã có / tổng
const profileCompletion = computed(() => {
  const total = profileRequirements.value.length
  const done  = profileRequirements.value.filter(r => r.ok).length
  return Math.round((done / total) * 100)
})

// Danh sách trường còn thiếu để hiển thị gợi ý
const missingFields = computed(() =>
  profileRequirements.value.filter(r => !r.ok).map(r => r.label)
)

// ════════════════════════════════════════
// HÀM TIỆN ÍCH
// ════════════════════════════════════════

function hasValue(val) {
  if (Array.isArray(val)) return val.length > 0
  return val !== null && val !== undefined && String(val).trim() !== ''
}

// Lấy tọa độ [lat, lng] từ job
function getLatLng(job) {
  const coords = job?.location?.coordinates
  if (Array.isArray(coords) && coords.length === 2) {
    const [lng, lat] = coords
    if (typeof lng === 'number' && typeof lat === 'number') return [lat, lng]
  }
  const city = job?.location?.city
  return city && CITY_CENTER[city] ? CITY_CENTER[city] : null
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ').filter(Boolean)
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase()
}

function getStatusLabel(status) {
  const labels = { pending: 'Đang chờ', accepted: 'Chấp nhận', rejected: 'Từ chối', withdrawn: 'Đã rút' }
  return labels[status] || status
}

// Hiển thị thời gian tương đối: "Hôm nay", "2 ngày trước", v.v.
function formatDate(date) {
  if (!date) return ''
  const diffDays = Math.floor((Date.now() - new Date(date)) / 86400000)
  if (diffDays === 0) return 'Hôm nay'
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7)  return `${diffDays} ngày trước`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
  return new Date(date).toLocaleDateString('vi-VN')
}

function formatSalary(salary) {
  if (!salary || salary.negotiable || salary.min == null) return 'Thỏa thuận'
  const min = (salary.min / 1000000).toFixed(0)
  const max = (salary.max / 1000000).toFixed(0)
  return `${min}–${max} triệu`
}

// Màu ngẫu nhiên cho logo công ty
const GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#30cfd0,#330867)',
]

function getRandomGradient() {
  return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]
}

// Khi click marker trên bản đồ → scroll đến job đó trong danh sách
function onMarkerClick(job) {
  selectedJobId.value = job._id
  const el = document.getElementById(`rec-job-${job._id}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// ════════════════════════════════════════
// HÀM GỌI API
// ════════════════════════════════════════

function getAuthHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

async function fetchProfileData() {
  try {
    const res = await axios.get(`${API_URL}/profile`, { headers: getAuthHeader() })
    profileData.value = res.data.profile || null
    if (profileData.value) updateUser(profileData.value)
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
}

async function fetchStats() {
  try {
    const res = await axios.get(`${API_URL}/applications/my-stats`, { headers: getAuthHeader() })
    Object.assign(stats, res.data.stats || res.data.statistics || {})
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

async function fetchRecentApplications() {
  try {
    loadingApps.value = true
    const res = await axios.get(`${API_URL}/applications/my-applications?limit=3&sort=-createdAt`, { headers: getAuthHeader() })
    recentApplications.value = res.data.applications || []
  } catch (error) {
    console.error('Error fetching applications:', error)
  } finally {
    loadingApps.value = false
  }
}

async function fetchRecommendedJobs() {
  try {
    loadingJobs.value = true
    const res = await axios.get(`${API_URL}/recommendations/jobs?limit=3`, { headers: getAuthHeader() })
    recommendedJobs.value = res.data.jobs || []
    totalJobs.value       = res.data.count || recommendedJobs.value.length
  } catch (error) {
    // Nếu API gợi ý lỗi, fallback về danh sách job công khai
    try {
      const fallback = await axios.get(`${API_URL}/jobs/public?limit=3`)
      recommendedJobs.value = fallback.data.jobs || []
      totalJobs.value       = fallback.data.total || recommendedJobs.value.length
    } catch (e) {
      recommendedJobs.value = []
    }
  } finally {
    loadingJobs.value = false
  }
}

// Gọi tất cả API cùng lúc bằng Promise.all
async function fetchAllData() {
  loading.value = true
  await Promise.all([fetchProfileData(), fetchStats(), fetchRecentApplications(), fetchRecommendedJobs()])
  loading.value = false
}

onMounted(() => {
  refreshUser()
  fetchAllData()
})
</script>

<style scoped>
* { box-sizing: border-box; }

/* ════════════════════════════════════
   LAYOUT
════════════════════════════════════ */
.page { min-height: 100vh; background: #f5f7fa; }

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; padding: 36px 40px;
}

.hero-inner { max-width: 1400px; margin: 0 auto; }
.hero h1 { font-size: 28px; font-weight: 700; margin-bottom: 6px; }
.hero p  { font-size: 15px; opacity: 0.9; }

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 40px 48px;
}

/* ── Loading ── */
.loading-state { text-align: center; padding: 60px; color: #999; }

.spinner {
  width: 40px; height: 40px;
  border: 4px solid #e0e0e0; border-top-color: #667eea;
  border-radius: 50%; margin: 0 auto 16px;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Stats ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white; border-radius: 12px; padding: 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05); transition: transform 0.2s;
}

.stat-card:hover { transform: translateY(-3px); }

.stat-icon {
  width: 52px; height: 52px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
}

.stat-info h3 { font-size: 28px; font-weight: 700; color: #2c3e50; margin-bottom: 3px; }
.stat-info p  { font-size: 13px; color: #888; }

/* ── Dashboard grid ── */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* ── Card chung ── */
.card {
  background: white; border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05); overflow: hidden; margin-bottom: 16px;
}

.card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #f0f0f0;
}

.card-head h2 { font-size: 16px; font-weight: 700; color: #2c3e50; }
.card-link { color: #667eea; text-decoration: none; font-size: 13px; font-weight: 500; }
.card-link:hover { text-decoration: underline; }
.head-actions { display: flex; align-items: center; gap: 10px; }
.card-body { padding: 20px; }

/* Mini loading/empty */
.mini-loading {
  text-align: center; padding: 24px; color: #999;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}

.spinner-sm {
  width: 24px; height: 24px;
  border: 3px solid #e0e0e0; border-top-color: #667eea;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}

.mini-empty { text-align: center; padding: 24px; color: #bbb; font-size: 14px; }

/* ── Hồ sơ: progress bar ── */
.badge {
  padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
}

.badge-warning { background: #fff3cd; color: #856404; }
.badge-success { background: #d4edda; color: #155724; }
.badge-danger  { background: #f8d7da; color: #721c24; }

.progress-bar {
  width: 100%; height: 8px; background: #f0f0f0; border-radius: 10px; overflow: hidden; margin-bottom: 12px;
}

.progress-fill {
  height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); transition: width 0.4s;
}

.progress-hint { font-size: 13px; color: #888; margin-bottom: 12px; }

.missing-box { background: #fff3cd; padding: 12px 14px; border-radius: 8px; margin-bottom: 14px; }
.missing-title { font-size: 13px; font-weight: 600; color: #856404; margin-bottom: 6px; }
.missing-list { list-style: none; padding: 0; margin: 0; }
.missing-list li { font-size: 12px; color: #856404; padding: 3px 0 3px 16px; position: relative; }
.missing-list li::before { content: '•'; position: absolute; left: 6px; }

/* ── Đơn ứng tuyển ── */
.app-list { display: flex; flex-direction: column; gap: 10px; }

.app-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border: 1.5px solid #f0f0f0; border-radius: 8px; transition: all 0.15s;
}

.app-item:hover { border-color: #667eea; }

.app-logo {
  width: 44px; height: 44px; border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 16px; flex-shrink: 0;
}

.app-info { flex: 1; }
.app-info h4 { font-size: 14px; font-weight: 600; color: #2c3e50; margin-bottom: 3px; }
.app-info p  { font-size: 12px; color: #888; margin-bottom: 4px; }
.app-date    { font-size: 12px; color: #bbb; white-space: nowrap; }

.status-badge { display: inline-block; padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
.status-pending   { background: #fff3cd; color: #856404; }
.status-accepted  { background: #d4edda; color: #155724; }
.status-rejected  { background: #f8d7da; color: #721c24; }
.status-withdrawn { background: #f0f0f0; color: #888; }

/* ── Việc làm gợi ý ── */
.job-list { display: flex; flex-direction: column; gap: 10px; }

.job-item {
  border: 1.5px solid #f0f0f0; border-radius: 10px; padding: 12px; cursor: pointer; transition: all 0.15s;
}

.job-item:hover         { border-color: #667eea; box-shadow: 0 2px 10px rgba(102,126,234,.1); }
.job-item.selected      { border-color: #667eea; background: rgba(102,126,234,.04); }

.job-row { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; }

.job-avatar {
  width: 40px; height: 40px; border-radius: 8px; color: white;
  display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0;
}

.job-row h4 { font-size: 14px; font-weight: 600; color: #2c3e50; margin-bottom: 2px; }
.job-row p  { font-size: 12px; color: #888; }

.job-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.tag { font-size: 11px; background: #f0f0f0; padding: 4px 10px; border-radius: 99px; color: #555; }

.job-foot { display: flex; align-items: center; justify-content: space-between; }
.salary-text { font-size: 13px; font-weight: 700; color: #2c3e50; }

/* Bản đồ */
.map-section { margin-top: 16px; padding-top: 14px; border-top: 1px dashed #e0e0e0; }
.map-title   { font-size: 13px; font-weight: 700; color: #2c3e50; margin-bottom: 10px; }
.map-wrap    { height: 320px; }
.map-wrap :deep(.jobs-map) { height: 320px !important; min-height: 320px !important; }
.map-hint { font-size: 12px; color: #aaa; margin-top: 6px; }

/* ── Quick actions ── */
.quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.action-btn {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 14px 10px; border: 1.5px solid #e0e0e0; border-radius: 8px;
  text-decoration: none; transition: all 0.15s;
}

.action-btn:hover { border-color: #667eea; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,.1); }
.action-icon { font-size: 22px; }
.action-btn span:last-child { font-size: 13px; color: #555; font-weight: 500; }

/* ── Buttons ── */
.btn {
  padding: 9px 18px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.15s; font-family: inherit;
}

.btn-sm      { padding: 6px 12px; font-size: 12px; }
.btn-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,.4); }
.btn-outline { background: white; border: 1.5px solid #667eea; color: #667eea; }
.btn-outline:hover { background: #667eea; color: white; }

/* ════════════════════════════════════
   RESPONSIVE
════════════════════════════════════ */
@media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

@media (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .hero           { padding: 28px 20px; }
}

@media (max-width: 768px) {
  .container  { padding: 20px 16px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
</style>