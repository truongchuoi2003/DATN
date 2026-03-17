<template>
  <!-- ============================================================
       TRANG: Tìm việc làm (Student)
       CHỨC NĂNG:
         - Tìm kiếm + lọc job (thành phố, loại hình, cấp bậc)
         - Lưu/bỏ lưu job
         - Xem job trên bản đồ
         - Lọc theo bán kính từ vị trí của sinh viên
         - Hiển thị job gợi ý cá nhân hóa (với điểm phù hợp)
  ============================================================ -->
  <div class="page">
    <Header />

    <div class="container">

      <!-- ── TIÊU ĐỀ ── -->
      <div class="page-header">
        <h1>🔍 Tìm việc làm</h1>
        <p class="page-sub">Khám phá hàng ngàn cơ hội việc làm phù hợp với bạn</p>
      </div>

      <!-- ── THANH TÌM KIẾM + BỘ LỌC ── -->
      <div class="search-box">
        <div class="search-bar">
          <input
            v-model="filters.search"
            @input="debounceSearch"
            type="text"
            placeholder="🔍 Tìm kiếm theo vị trí, công ty..."
            class="search-input"
          />
          <button class="btn-search" @click="handleSearch">Tìm kiếm</button>
        </div>

        <div class="filter-row">
          <select v-model="filters.city"    @change="handleSearch">
            <option value="">📍 Tất cả thành phố</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Hải Phòng">Hải Phòng</option>
            <option value="Cần Thơ">Cần Thơ</option>
          </select>
          <select v-model="filters.jobType" @change="handleSearch">
            <option value="">💼 Loại hình</option>
            <option value="full-time">Toàn thời gian</option>
            <option value="part-time">Bán thời gian</option>
            <option value="internship">Thực tập</option>
            <option value="contract">Hợp đồng</option>
            <option value="freelance">Freelance</option>
          </select>
          <select v-model="filters.level"   @change="handleSearch">
            <option value="">⭐ Cấp bậc</option>
            <option value="intern">Thực tập sinh</option>
            <option value="fresher">Fresher</option>
            <option value="junior">Junior</option>
            <option value="middle">Middle</option>
            <option value="senior">Senior</option>
          </select>
          <button class="btn-reset" @click="resetFilters">🔄 Đặt lại</button>
        </div>
      </div>

      <!-- ── THANH THỐNG KÊ + CÁC NÚT CÔNG CỤ ── -->
      <div class="stats-bar">
        <p>
          Tìm thấy <strong>{{ total }}</strong> công việc
          <span v-if="filterWithinRadius && effectiveUserLatLng" class="radius-count">
            • Trong {{ radiusKm }}km: <strong>{{ total }}</strong>
          </span>
        </p>

        <div class="toolbar">
          <!-- Bật/tắt bản đồ -->
          <button class="tool-btn" @click="showMap = !showMap">
            {{ showMap ? '🗺️ Ẩn bản đồ' : '🗺️ Hiện bản đồ' }}
          </button>

          <!-- Lọc chỉ job đã lưu -->
          <button class="tool-btn" @click="onlySaved = !onlySaved">
            {{ onlySaved ? '❤️ Đang lọc job đã lưu' : '🤍 Chỉ job đã lưu' }}
          </button>

          <!-- Nhóm nút vị trí -->
          <div class="location-toolbar">
            <label class="checkbox-label">
              <input type="checkbox" v-model="showMyLocation" :disabled="!effectiveUserLatLng" />
              <span>Vị trí của tôi</span>
            </label>
            <select class="radius-select" v-model.number="radiusKm" :disabled="!effectiveUserLatLng || !showMyLocation">
              <option :value="5">5km</option>
              <option :value="10">10km</option>
              <option :value="20">20km</option>
            </select>
            <button class="tool-btn" @click="sortByDistance = !sortByDistance" :disabled="!effectiveUserLatLng">
              {{ sortByDistance ? '📌 Đang ưu tiên gần' : '📍 Ưu tiên gần tôi' }}
            </button>
            <button class="tool-btn" @click="toggleRadiusFilter" :disabled="!effectiveUserLatLng">
              {{ filterWithinRadius ? '🎯 Đang lọc bán kính' : '🎯 Chỉ trong bán kính' }}
            </button>
            <button v-if="!studentLatLng" class="tool-btn" @click="useCurrentLocation">
              📡 Dùng vị trí hiện tại
            </button>
          </div>
        </div>
      </div>

      <!-- Cảnh báo chưa có tọa độ -->
      <div v-if="!effectiveUserLatLng" class="hint-box hint-warning">
        ⚠️ Bạn chưa có tọa độ. Bấm <b>Dùng vị trí hiện tại</b> hoặc cập nhật trong <b>Hồ sơ</b>.
      </div>

      <!-- Đang lọc theo bán kính -->
      <div v-if="filterWithinRadius && effectiveUserLatLng" class="hint-box hint-info">
        ✅ Đang lọc theo bán kính: chỉ job trong <b>{{ radiusKm }}km</b> được hiển thị.
      </div>

      <!-- ══════════════════════════════════
           SECTION: JOB GỢI Ý CÁ NHÂN HÓA
      ══════════════════════════════════ -->
      <div class="recommend-section">
        <div class="recommend-head">
          <div>
            <h2>🎯 Việc làm phù hợp cho bạn</h2>
            <p>Được cá nhân hóa dựa trên hồ sơ, kỹ năng và lịch sử quan tâm</p>
          </div>
          <button class="btn-refresh" @click="fetchRecommendedJobs" :disabled="recommendLoading">
            {{ recommendLoading ? 'Đang tải...' : '🔄 Làm mới gợi ý' }}
          </button>
        </div>

        <div v-if="recommendLoading" class="recommend-loading">
          <div class="spinner-sm"></div>
          <span>Đang tải gợi ý...</span>
        </div>

        <div v-else-if="recommendError" class="recommend-error">{{ recommendError }}</div>

        <div v-else-if="recommendedJobs.length" class="recommend-grid">
          <div
            v-for="job in recommendedJobs"
            :key="`rec-${job._id}`"
            class="recommend-card"
          >
            <div class="rc-head">
              <div class="rc-left">
                <div class="rc-logo">{{ getInitials(job.employer?.companyName) }}</div>
                <div>
                  <span class="rc-ribbon">Gợi ý cho bạn</span>
                  <h3>{{ job.title }}</h3>
                  <p>{{ job.employer?.companyName }}</p>
                </div>
              </div>
              <!-- Badge điểm phù hợp -->
              <div v-if="hasRecommendation(job)" class="score-badge" :class="getTier(job).className">
                {{ getTier(job).icon }} {{ getScore(job) }}
              </div>
            </div>

            <div class="rc-meta">
              <span>📍 {{ job.location?.city || 'N/A' }}</span>
              <span>💼 {{ getJobTypeLabel(job.jobType) }}</span>
              <span>⭐ {{ getLevelLabel(job.level) }}</span>
              <span v-if="job.distanceKm != null">🧭 ~{{ formatDistance(job.distanceKm) }}</span>
            </div>

            <!-- Signal badges: kỹ năng, ngành, loại hình... -->
            <div v-if="getSignalBadges(job).length" class="signal-list">
              <span v-for="(b, i) in getSignalBadges(job)" :key="i" class="signal-chip" :class="b.className">
                {{ b.icon }} {{ b.label }}
              </span>
            </div>

            <!-- Lý do gợi ý -->
            <div v-if="getReasons(job).length" class="reason-list">
              <span v-for="(r, i) in getReasons(job)" :key="i" class="reason-chip">{{ r }}</span>
            </div>

            <div class="rc-actions">
              <button class="btn" :class="isSaved(job._id) ? 'btn-saved' : 'btn-outline'" @click.stop="toggleSave(job._id)">
                {{ isSaved(job._id) ? '❤️ Đã lưu' : '🤍 Lưu' }}
              </button>
              <button class="btn btn-primary" @click.stop="goToDetail(job._id)">Xem chi tiết →</button>
            </div>
          </div>
        </div>

        <div v-else class="recommend-empty">
          Chưa có gợi ý. Hãy hoàn thiện hồ sơ để hệ thống đề xuất tốt hơn.
        </div>
      </div>

      <!-- ── ĐANG TẢI ── -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải công việc...</p>
      </div>

      <!-- ══════════════════════════════════
           MAIN CONTENT: Danh sách job + Bản đồ
           Dùng CSS Grid 2 cột, bản đồ tắt thì về 1 cột
      ══════════════════════════════════ -->
      <div v-else class="main-split" :class="{ 'no-map': !showMap }">

        <!-- Cột trái: danh sách job -->
        <div class="jobs-col">
          <div v-if="displayJobs.length === 0" class="empty-state">
            <p class="empty-icon">📭</p>
            <p>Không tìm thấy công việc phù hợp</p>
            <button class="btn btn-primary" @click="resetFilters">Xem tất cả</button>
          </div>

          <div v-else class="jobs-grid">
            <div
              v-for="job in displayJobs"
              :key="job._id"
              :id="`job-${job._id}`"
              class="job-card"
              :class="{ selected: String(job._id) === String(selectedJobId) }"
              @click="selectedJobId = job._id"
            >
              <!-- Header: logo + tên + công ty -->
              <div class="jc-head">
                <div class="jc-logo">{{ getInitials(job.employer?.companyName) }}</div>
                <div>
                  <h3>{{ job.title }}</h3>
                  <p class="jc-company">{{ job.employer?.companyName }}</p>
                </div>
              </div>

              <!-- Badge điểm phù hợp nếu có -->
              <div v-if="hasRecommendation(job)" class="jc-recommend-box">
                <div class="jc-tier-row">
                  <span class="tier-badge" :class="getTier(job).className">
                    {{ getTier(job).icon }} {{ getTier(job).label }}
                  </span>
                  <span class="score-mini" :class="getTier(job).className">
                    Match <strong>{{ getScore(job) }}</strong>
                  </span>
                </div>
                <div v-if="getSignalBadges(job).length" class="signal-list">
                  <span v-for="(b, i) in getSignalBadges(job)" :key="i" class="signal-chip" :class="b.className">
                    {{ b.icon }} {{ b.label }}
                  </span>
                </div>
                <div v-if="getReasons(job).length" class="reason-list">
                  <span v-for="(r, i) in getReasons(job)" :key="i" class="reason-chip">{{ r }}</span>
                </div>
              </div>

              <!-- Chi tiết: địa điểm, lương, loại hình, cấp bậc, khoảng cách -->
              <div class="jc-details">
                <div class="detail-row">📍 <span>{{ job.location?.city || 'N/A' }}</span></div>
                <div class="detail-row">💰 <span>{{ formatSalary(job.salary) }}</span></div>
                <div class="detail-row">💼 <span>{{ getJobTypeLabel(job.jobType) }}</span></div>
                <div class="detail-row">⭐ <span>{{ getLevelLabel(job.level) }}</span></div>
                <div v-if="job.distanceKm != null" class="detail-row detail-distance">
                  🧭 <span>~{{ formatDistance(job.distanceKm) }}</span>
                </div>
                <div v-else class="detail-row detail-distance muted">
                  🧭 <span>Chưa có tọa độ</span>
                </div>
              </div>

              <!-- Kỹ năng (tối đa 4 + badge số dư) -->
              <div v-if="job.skills?.length" class="skill-list">
                <span v-for="skill in job.skills.slice(0, 4)" :key="skill" class="skill-chip">{{ skill }}</span>
                <span v-if="job.skills.length > 4" class="skill-more">+{{ job.skills.length - 4 }}</span>
              </div>

              <!-- Footer: lượt xem + nút lưu + xem chi tiết -->
              <div class="jc-footer">
                <div class="jc-meta">
                  <span>👁️ {{ job.views || 0 }}</span>
                  <span>👥 {{ job.applicationsCount || 0 }}</span>
                </div>
                <div class="jc-foot-actions">
                  <button class="btn" :class="isSaved(job._id) ? 'btn-saved' : 'btn-outline'" @click.stop="toggleSave(job._id)">
                    {{ isSaved(job._id) ? '❤️ Đã lưu' : '🤍 Lưu' }}
                  </button>
                  <button class="btn btn-primary" @click.stop="goToDetail(job._id)">Xem chi tiết →</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Phân trang -->
          <div v-if="totalPages > 1" class="pagination">
            <button class="btn-page" :disabled="page === 1" @click="changePage(page - 1)">← Trước</button>
            <span>Trang {{ page }} / {{ totalPages }}</span>
            <button class="btn-page" :disabled="page === totalPages" @click="changePage(page + 1)">Sau →</button>
          </div>
        </div>

        <!-- Cột phải: bản đồ (ẩn khi showMap = false) -->
        <aside v-if="showMap" class="map-col">
          <div class="map-card">
            <h2>🗺️ Bản đồ việc làm</h2>
            <p class="map-hint-text">Marker 📍 là vị trí của bạn • Click marker để chọn job</p>
            <div class="map-body">
              <JobsMap
                :jobs="mapJobs"
                :selected-job-id="selectedJobId"
                :center="mapCenter"
                :user-lat-lng="showMyLocation ? effectiveUserLatLng : null"
                :radius-km="showMyLocation ? radiusKm : null"
                @marker-click="onMarkerClick"
              />
            </div>
          </div>
        </aside>

      </div><!-- /main-split -->

    </div><!-- /container -->
  </div>
</template>

<script setup>
// ── Import ──
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header  from '../components/Header.vue'
import JobsMap from '../components/JobsMap.vue'
import { useAuth } from '../composables/useAuth'
import api from '../services/api'

const { user } = useAuth()
const router   = useRouter()

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const loading = ref(false)
const jobs    = ref([])
const total   = ref(0)
const page    = ref(1)
const totalPages = ref(1)

// Job gợi ý
const recommendedJobs  = ref([])
const recommendLoading = ref(false)
const recommendError   = ref('')

// Job đã lưu
const savedJobIds = ref([])
const onlySaved   = ref(false)

// Bản đồ
const showMap      = ref(true)
const selectedJobId = ref(null)

// Vị trí
const showMyLocation    = ref(true)
const radiusKm          = ref(10)
const sortByDistance    = ref(false)
const filterWithinRadius = ref(false)
const currentLatLng     = ref(null)  // Lấy từ trình duyệt

// Bộ lọc tìm kiếm
const filters = reactive({ search: '', city: '', jobType: '', level: '' })

// Debounce timeout ref
let searchTimeout = null

// Center mặc định các thành phố
const CITY_CENTER = {
  'Hà Nội':          [21.02776, 105.83416],
  'TP. Hồ Chí Minh': [10.77689, 106.70098],
  'Đà Nẵng':         [16.05441, 108.20217],
  'Hải Phòng':       [20.84491, 106.68808],
  'Cần Thơ':         [10.04516, 105.78309],
}

// ════════════════════════════════════════
// COMPUTED
// ════════════════════════════════════════

// Tọa độ sinh viên từ hồ sơ (API trả về [lng, lat])
const studentLatLng = computed(() => {
  const coords = user.value?.location?.coordinates
  if (Array.isArray(coords) && coords.length === 2) return [coords[1], coords[0]]
  return null
})

// Ưu tiên tọa độ hồ sơ, fallback về tọa độ trình duyệt
const effectiveUserLatLng = computed(() => studentLatLng.value || currentLatLng.value || null)

// Gắn tọa độ latlng + khoảng cách cho từng job
const jobsDecorated = computed(() => jobs.value.map(job => attachDistance(job)))

// Lọc theo bán kính (chỉ giữ job có tọa độ thật và nằm trong bán kính)
const radiusFilteredJobs = computed(() => {
  if (!filterWithinRadius.value || !effectiveUserLatLng.value) return jobsDecorated.value
  const r = Number(radiusKm.value)
  return jobsDecorated.value.filter(j => j.distanceKm != null && j.distanceKm <= r)
})

// Áp dụng lọc "chỉ job đã lưu" và sắp xếp theo khoảng cách
const displayJobs = computed(() => {
  let arr = [...radiusFilteredJobs.value]
  if (onlySaved.value) arr = arr.filter(j => savedJobIds.value.includes(String(j._id)))
  if (sortByDistance.value && effectiveUserLatLng.value) {
    arr.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
  }
  return arr
})

// Chỉ job có tọa độ mới hiển thị trên bản đồ
const mapJobs = computed(() => displayJobs.value.filter(j => Array.isArray(j.latlng) && j.latlng.length === 2))

// Center bản đồ: thành phố đang lọc > vị trí user > job đầu tiên > TP.HCM
const mapCenter = computed(() => {
  if (filters.city && CITY_CENTER[filters.city]) return CITY_CENTER[filters.city]
  if (effectiveUserLatLng.value && showMyLocation.value) return effectiveUserLatLng.value
  if (mapJobs.value.length > 0) return mapJobs.value[0].latlng
  return CITY_CENTER['TP. Hồ Chí Minh']
})

// Lấy [lat, lng] từ job, fallback về city center
function toLatLng(job) {
  const coords = job?.location?.coordinates
  if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number') {
    return [coords[1], coords[0]]  // API: [lng, lat] → Leaflet: [lat, lng]
  }
  const city = job?.location?.city
  return city && CITY_CENTER[city] ? CITY_CENTER[city] : null
}

// Tọa độ thật (không fallback city) – dùng tính khoảng cách
function getRealLatLng(job) {
  const coords = job?.location?.coordinates
  if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number') {
    return [coords[1], coords[0]]
  }
  return null
}

// Công thức Haversine tính khoảng cách 2 điểm (km)
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Gắn thêm latlng và distanceKm vào job
function attachDistance(job) {
  const latlng = toLatLng(job)
  let distanceKm = null
  const s = effectiveUserLatLng.value
  const real = getRealLatLng(job)
  if (s && real) distanceKm = haversineKm(s[0], s[1], real[0], real[1])
  return { ...job, latlng, distanceKm }
}

function formatDistance(km) {
  if (km < 1)  return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

function getInitials(name) {
  if (!name) return '?'
  const p = name.trim().split(' ').filter(Boolean)
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase()
}

function formatSalary(salary) {
  if (!salary) return 'Thỏa thuận'
  const min = typeof salary.min === 'number' ? salary.min : null
  const max = typeof salary.max === 'number' ? salary.max : null
  if (min == null || max == null) return 'Thỏa thuận'
  return `${(min / 1000000).toFixed(0)}–${(max / 1000000).toFixed(0)} triệu ${salary.currency || 'VND'}`
}

function getJobTypeLabel(type) {
  const map = { 'full-time':'Toàn thời gian','part-time':'Bán thời gian',internship:'Thực tập',contract:'Hợp đồng',freelance:'Freelance' }
  return map[type] || type || 'N/A'
}

function getLevelLabel(level) {
  const map = { intern:'Thực tập sinh',fresher:'Fresher',junior:'Junior',middle:'Middle',senior:'Senior',leader:'Leader',manager:'Manager' }
  return map[level] || level || 'N/A'
}

function isSaved(jobId) { return savedJobIds.value.includes(String(jobId)) }

// ── Các hàm xử lý điểm gợi ý ──

function getScore(job) {
  return Math.round(Number(job?.recommendation?.score || 0)) || 0
}

function getTier(job) {
  const s = getScore(job)
  if (s >= 80) return { label: 'Phù hợp cao',     className: 'tier-high',    icon: '🔥' }
  if (s >= 60) return { label: 'Khá phù hợp',     className: 'tier-medium',  icon: '✨' }
  if (s >= 40) return { label: 'Có thể cân nhắc', className: 'tier-low',     icon: '📌' }
  return             { label: 'Đề xuất thêm',     className: 'tier-neutral', icon: '📝' }
}

function hasRecommendation(job) { return !!job?.recommendation && getScore(job) > 0 }

function getReasons(job, limit = 3) {
  return (Array.isArray(job?.recommendation?.reasons) ? job.recommendation.reasons : []).filter(Boolean).slice(0, limit)
}

function getSignalBadges(job) {
  const bd = job?.recommendation?.scoreBreakdown
  if (!bd) return []
  const badges = []
  const p = bd.profile || {}
  const c = bd.context || {}
  if ((p.requiredSkillFit || 0) >= 0.35)  badges.push({ label: 'Khớp kỹ năng',      icon: '🧠', className: 'signal-skill' })
  if ((p.majorFit || 0) >= 1)             badges.push({ label: 'Đúng ngành',         icon: '🎓', className: 'signal-major' })
  if ((p.titleFit || 0) >= 0.7)           badges.push({ label: 'Đúng vị trí mong muốn', icon: '🎯', className: 'signal-title' })
  if ((c.jobTypeFit || 0) >= 1)           badges.push({ label: 'Đúng loại việc',     icon: '💼', className: 'signal-type' })
  if (Number.isFinite(c.distanceKm) && c.distanceKm <= 12) badges.push({ label: 'Gần bạn', icon: '📍', className: 'signal-location' })
  return badges.slice(0, 4)
}

// ════════════════════════════════════════
// HÀM GỌI API
// ════════════════════════════════════════

async function fetchJobs() {
  try {
    loading.value = true
    const params = new URLSearchParams()
    if (filters.search)  params.append('search',  filters.search)
    if (filters.city)    params.append('city',    filters.city)
    if (filters.jobType) params.append('jobType', filters.jobType)
    if (filters.level)   params.append('level',   filters.level)
    // Gửi tọa độ nếu đang lọc theo bán kính
    if (filterWithinRadius.value && effectiveUserLatLng.value) {
      const [lat, lng] = effectiveUserLatLng.value
      params.append('lat', String(lat))
      params.append('lng', String(lng))
      params.append('radiusKm', String(radiusKm.value))
    }
    params.append('page',  page.value)
    params.append('limit', 12)

    const res = await api.get(`/jobs/public?${params.toString()}`)
    jobs.value       = res.data.jobs       || []
    total.value      = res.data.total      || 0
    totalPages.value = res.data.totalPages || 1
  } catch (error) {
    console.error('Error fetching jobs:', error)
    alert('Không thể tải danh sách công việc')
  } finally {
    loading.value = false
  }
}

async function fetchSavedJobs() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return
    const res = await api.get('/jobs/saved/my')
    savedJobIds.value = (res.data.jobs || []).map(j => String(j._id))
  } catch (error) {
    savedJobIds.value = []
  }
}

async function fetchRecommendedJobs() {
  try {
    recommendLoading.value = true
    recommendError.value   = ''
    const token = localStorage.getItem('token')
    if (!token) return
    const res = await api.get('/recommendations/jobs?limit=6')
    recommendedJobs.value = (res.data?.jobs || []).map(j => attachDistance(j))
  } catch (error) {
    recommendError.value = error.response?.data?.message || 'Không thể tải gợi ý'
    recommendedJobs.value = []
  } finally {
    recommendLoading.value = false
  }
}

// Lưu / bỏ lưu job
async function toggleSave(jobId) {
  const token = localStorage.getItem('token')
  if (!token) { alert('Vui lòng đăng nhập để lưu việc làm'); router.push('/login'); return }
  const id = String(jobId)
  try {
    if (isSaved(id)) {
      await api.delete(`/jobs/${id}/save`)
      savedJobIds.value = savedJobIds.value.filter(x => x !== id)
    } else {
      await api.post(`/jobs/${id}/save`)
      savedJobIds.value.push(id)
    }
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể cập nhật trạng thái lưu')
  }
}

// Ghi nhận click + chuyển trang chi tiết
async function goToDetail(jobId) {
  try {
    const token = localStorage.getItem('token')
    if (token) await api.post(`/jobs/${jobId}/interactions/click` )
  } catch { }
  router.push(`/student/jobs/${jobId}`)
}

// Lấy vị trí hiện tại từ trình duyệt
function useCurrentLocation() {
  if (!navigator.geolocation) { alert('Trình duyệt không hỗ trợ định vị'); return }
  navigator.geolocation.getCurrentPosition(
    pos => {
      currentLatLng.value = [pos.coords.latitude, pos.coords.longitude]
      showMyLocation.value = true
      if (filterWithinRadius.value) { page.value = 1; fetchJobs() }
      if (recommendedJobs.value.length) recommendedJobs.value = recommendedJobs.value.map(j => attachDistance(j))
    },
    err => alert('Không lấy được vị trí: ' + err.message),
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

function toggleRadiusFilter() {
  if (!effectiveUserLatLng.value) { alert('Cần có tọa độ để lọc bán kính'); return }
  filterWithinRadius.value = !filterWithinRadius.value
  if (filterWithinRadius.value) sortByDistance.value = true
  page.value = 1; fetchJobs()
}

// Tìm kiếm
function handleSearch() { page.value = 1; fetchJobs() }
function debounceSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(handleSearch, 500) }
function resetFilters() {
  Object.assign(filters, { search: '', city: '', jobType: '', level: '' })
  page.value = 1; sortByDistance.value = false; filterWithinRadius.value = false
  fetchJobs()
}

function changePage(newPage) {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage; fetchJobs()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Click marker bản đồ → scroll đến job tương ứng
function onMarkerClick(job) {
  selectedJobId.value = job._id
  const el = document.getElementById(`job-${job._id}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// Cập nhật khoảng cách khi bán kính hoặc vị trí thay đổi
watch(radiusKm, () => {
  if (filterWithinRadius.value && effectiveUserLatLng.value) { page.value = 1; fetchJobs() }
  if (recommendedJobs.value.length) recommendedJobs.value = recommendedJobs.value.map(j => attachDistance(j))
})

watch(effectiveUserLatLng, () => {
  if (recommendedJobs.value.length) recommendedJobs.value = recommendedJobs.value.map(j => attachDistance(j))
})

onMounted(async () => {
  await Promise.allSettled([fetchJobs(), fetchSavedJobs(), fetchRecommendedJobs()])
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

.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 26px; font-weight: 700; color: #2c3e50; margin-bottom: 4px; }
.page-sub { font-size: 14px; color: #888; }

/* ── Tìm kiếm + bộ lọc ── */
.search-box {
  background: white;
  border-radius: 12px;
  padding: 22px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
  margin-bottom: 16px;
}

.search-bar { display: flex; gap: 12px; margin-bottom: 16px; }

.search-input {
  flex: 1; padding: 11px 18px;
  border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px;
  transition: border-color 0.2s; outline: none;
}

.search-input:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.1); }

.btn-search {
  padding: 11px 28px;
  background: linear-gradient(135deg,#667eea,#764ba2);
  color: white; border: none; border-radius: 8px;
  font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit;
}

.btn-search:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,.4); }

.filter-row { display: flex; gap: 12px; flex-wrap: wrap; }

.filter-row select, .btn-reset {
  padding: 9px 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px; cursor: pointer;
}

.btn-reset { background: white; color: #666; transition: border-color 0.2s; font-family: inherit; }
.btn-reset:hover { border-color: #667eea; color: #667eea; }

/* Thanh công cụ */
.stats-bar {
  background: white; border-radius: 8px; padding: 12px 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,.05); margin-bottom: 12px;
  display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px;
}

.stats-bar strong { color: #667eea; }
.radius-count { font-size: 13px; margin-left: 6px; }
.toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.location-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }

.tool-btn {
  padding: 8px 14px; background: white; border: 2px solid #e0e0e0;
  border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;
  white-space: nowrap; transition: all 0.2s; font-family: inherit;
}

.tool-btn:hover:not(:disabled) { border-color: #667eea; color: #667eea; }
.tool-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; }
.radius-select { padding: 8px 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 12px; }

/* Hint boxes */
.hint-box { padding: 10px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 12px; }
.hint-warning { background: #fff7ed; border: 1px solid #fed7aa; color: #7c2d12; }
.hint-info    { background: #ecfeff; border: 1px solid #a5f3fc; color: #155e75; }

/* ── Section job gợi ý ── */
.recommend-section {
  background: white; border-radius: 12px; padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05); margin-bottom: 16px;
}

.recommend-head {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px;
}

.recommend-head h2 { font-size: 20px; color: #1f2937; margin-bottom: 4px; }
.recommend-head p  { font-size: 13px; color: #6b7280; }

.btn-refresh {
  padding: 9px 14px; border-radius: 8px; border: 2px solid #dbeafe;
  background: #eff6ff; color: #1d4ed8; font-weight: 700; cursor: pointer; white-space: nowrap;
  transition: all 0.2s; font-family: inherit;
}

.btn-refresh:hover:not(:disabled) { background: #dbeafe; }
.btn-refresh:disabled { opacity: 0.6; cursor: not-allowed; }

.recommend-loading { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #6b7280; }
.spinner-sm {
  width: 18px; height: 18px; border: 3px solid #e0e0e0; border-top-color: #667eea;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}

.recommend-error { padding: 12px; border-radius: 8px; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; font-size: 14px; }
.recommend-empty { padding: 14px; border-radius: 8px; background: #f9fafb; border: 1px dashed #d1d5db; color: #6b7280; font-size: 14px; }

.recommend-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }

.recommend-card {
  border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%); transition: all 0.2s;
}

.recommend-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,.06); }

.rc-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
.rc-left { display: flex; gap: 12px; min-width: 0; }

.rc-logo {
  width: 46px; height: 46px; border-radius: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 15px; flex-shrink: 0;
}

.rc-ribbon {
  display: inline-block; padding: 3px 10px; border-radius: 99px;
  background: #2563eb; color: white; font-size: 11px; font-weight: 800; margin-bottom: 4px;
}

.rc-left h3 { font-size: 15px; color: #111827; margin-bottom: 2px; }
.rc-left p  { font-size: 12px; color: #6b7280; }

.rc-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: #555; margin-bottom: 10px; }

.score-badge {
  display: inline-flex; align-items: center; gap: 5px;
  border-radius: 99px; padding: 5px 10px; font-size: 12px; font-weight: 800;
  white-space: nowrap; color: white;
}

.tier-high    { background: #166534; color: white; }
.tier-medium  { background: #1d4ed8; color: white; }
.tier-low     { background: #92400e; color: white; }
.tier-neutral { background: #374151; color: white; }

.signal-list  { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
.signal-chip  { display: inline-flex; align-items: center; gap: 4px; padding: 4px 9px; border-radius: 99px; font-size: 11px; font-weight: 700; }
.signal-skill    { background: #ede9fe; color: #5b21b6; }
.signal-major    { background: #dcfce7; color: #166534; }
.signal-title    { background: #dbeafe; color: #1d4ed8; }
.signal-type     { background: #fef3c7; color: #92400e; }
.signal-location { background: #fee2e2; color: #b91c1c; }

.reason-list { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
.reason-chip { display: inline-flex; padding: 4px 9px; border-radius: 99px; background: white; border: 1px solid #dbeafe; color: #1e3a8a; font-size: 11px; font-weight: 600; }

.rc-actions { display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end; }

/* ── Loading / Empty ── */
.loading-state { text-align: center; padding: 60px; color: #999; }

.spinner {
  width: 36px; height: 36px; border: 4px solid #e0e0e0; border-top-color: #667eea;
  border-radius: 50%; margin: 0 auto 16px; animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; grid-column: 1/-1; }
.empty-icon  { font-size: 36px; margin-bottom: 10px; }

/* ── Main split: danh sách + bản đồ ── */
.main-split {
  display: grid;
  grid-template-columns: minmax(0,1fr) 400px;
  gap: 20px;
  align-items: flex-start;
}

.main-split.no-map { grid-template-columns: 1fr; }
.jobs-col { min-width: 0; }

/* ── Job card ── */
.jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }

.job-card {
  background: white; border-radius: 12px; padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05); cursor: pointer;
  display: flex; flex-direction: column; transition: all 0.2s;
  border: 1.5px solid transparent;
}

.job-card:hover  { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,.08); }
.job-card.selected { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.15); }

.jc-head { display: flex; gap: 12px; margin-bottom: 14px; }

.jc-logo {
  width: 52px; height: 52px; border-radius: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 18px; flex-shrink: 0;
}

.jc-head h3 { font-size: 16px; font-weight: 700; color: #2c3e50; margin-bottom: 3px; }
.jc-company { font-size: 13px; color: #888; }

/* Mini recommendation box trong job card */
.jc-recommend-box {
  margin-bottom: 14px; padding: 12px; border-radius: 10px;
  border: 1px solid #e5e7eb; background: linear-gradient(135deg,#f8fafc,#f1f5f9);
}

.jc-tier-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }

.tier-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 10px; border-radius: 99px; font-size: 12px; font-weight: 600;
}

.score-mini {
  display: inline-flex; align-items: baseline; gap: 4px;
  padding: 4px 10px; border-radius: 8px; font-size: 12px; color: white;
}

.score-mini strong { font-size: 16px; font-weight: 800; }

/* Details grid */
.jc-details {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0;
}

.detail-row { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #666; }
.detail-distance { grid-column: 1/-1; background: #f7f7ff; padding: 7px 10px; border-radius: 8px; border: 1px solid rgba(102,126,234,.15); }
.detail-distance.muted { background: #fafafa; border-color: #eee; color: #bbb; }

/* Skills */
.skill-list  { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.skill-chip  { padding: 4px 10px; background: #f0f0f0; border-radius: 12px; font-size: 11px; color: #666; }
.skill-more  { padding: 4px 10px; background: #667eea; color: white; border-radius: 12px; font-size: 11px; }

/* Footer */
.jc-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: auto; padding-top: 12px; border-top: 1px solid #f0f0f0; gap: 10px;
}

.jc-meta { display: flex; gap: 12px; font-size: 12px; color: #bbb; }
.jc-foot-actions { display: flex; gap: 8px; }

/* Buttons */
.btn {
  padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.15s; font-family: inherit;
}

.btn-primary { background: linear-gradient(135deg,#667eea,#764ba2); color: white; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,.4); }
.btn-outline { background: white; border: 1.5px solid #dee2e6; color: #555; }
.btn-saved   { background: #ffe8e8; color: #d63384; border: 1px solid #f5c2c7; }

/* Phân trang */
.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; }

.btn-page {
  padding: 9px 18px; background: white; border: 2px solid #e0e0e0;
  border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s; font-family: inherit;
}

.btn-page:hover:not(:disabled) { border-color: #667eea; color: #667eea; }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }

/* Bản đồ */
.map-col { position: sticky; top: 20px; }

.map-card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.05); padding: 16px; }
.map-card h2 { font-size: 16px; color: #2c3e50; margin-bottom: 6px; }
.map-hint-text { font-size: 12px; color: #888; margin-bottom: 10px; }
.map-body { height: 520px; }
.map-body :deep(.jobs-map) { height: 520px !important; min-height: 420px !important; }

/* ════════════════════════════════════
   RESPONSIVE
════════════════════════════════════ */
@media (max-width: 1024px) {
  .main-split { grid-template-columns: 1fr; }
  .map-col    { position: static; }
}

@media (max-width: 768px) {
  .container     { padding: 16px; }
  .search-bar    { flex-direction: column; }
  .filter-row    { flex-direction: column; }
  .jobs-grid     { grid-template-columns: 1fr; }
  .recommend-grid{ grid-template-columns: 1fr; }
  .jc-details    { grid-template-columns: 1fr; }
  .stats-bar     { flex-direction: column; align-items: flex-start; }
}
</style>