<template>
  <!-- ============================================================
       TRANG: Việc làm công khai
       LAYOUT: Full-width header + sidebar lọc trái + danh sách phải
       (chuẩn layout web tuyển dụng như TopCV, VietnamWorks)
  ============================================================ -->
  <div class="page">
    <Header />

    <!-- ── HERO: thanh tìm kiếm to nổi bật ── -->
    <section class="hero">
      <h1>Tìm việc làm phù hợp với bạn</h1>
      <p class="hero-sub">Khám phá hàng trăm cơ hội việc làm từ các công ty uy tín</p>

      <!-- Thanh tìm kiếm -->
      <div class="search-bar">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Tìm theo vị trí, công ty, kỹ năng..."
          @keyup.enter="fetchJobs(1)"
        />
        <button class="btn-search" @click="fetchJobs(1)">
          🔍 Tìm kiếm
        </button>
      </div>
    </section>

    <!-- ── MAIN: sidebar lọc + danh sách job ── -->
    <div class="main-layout">

      <!-- ════ SIDEBAR LỌC BÊN TRÁI ════ -->
      <aside class="sidebar">

        <div class="filter-box">
          <h3 class="filter-title">Bộ lọc</h3>

          <!-- Lọc theo thành phố -->
          <div class="filter-group">
            <label>📍 Thành phố</label>
            <select v-model="filters.city" @change="fetchJobs(1)">
              <option value="">Tất cả thành phố</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Hải Phòng">Hải Phòng</option>
              <option value="Cần Thơ">Cần Thơ</option>
            </select>
          </div>

          <!-- Lọc theo loại hình -->
          <div class="filter-group">
            <label>💼 Loại hình</label>
            <select v-model="filters.jobType" @change="fetchJobs(1)">
              <option value="">Tất cả loại hình</option>
              <option value="full-time">Toàn thời gian</option>
              <option value="part-time">Bán thời gian</option>
              <option value="internship">Thực tập</option>
              <option value="contract">Hợp đồng</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          <!-- Lọc theo cấp bậc -->
          <div class="filter-group">
            <label>⭐ Cấp bậc</label>
            <select v-model="filters.level" @change="fetchJobs(1)">
              <option value="">Tất cả cấp bậc</option>
              <option value="intern">Thực tập sinh</option>
              <option value="fresher">Fresher</option>
              <option value="junior">Junior</option>
              <option value="middle">Middle</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <!-- Nút đặt lại -->
          <button class="btn-reset" @click="resetFilters">
            🔄 Đặt lại bộ lọc
          </button>
        </div>

        <!-- Gợi ý đăng nhập -->
        <div class="login-prompt">
          <p>🎯 Đăng nhập để nhận <strong>gợi ý việc làm</strong> phù hợp với hồ sơ của bạn</p>
          <router-link to="/login" class="btn-login-prompt">Đăng nhập ngay</router-link>
        </div>

      </aside>

      <!-- ════ NỘI DUNG: kết quả tìm kiếm ════ -->
      <section class="results">

        <!-- Thanh thống kê + sắp xếp -->
        <div class="results-header">
          <p class="results-count">
            Tìm thấy <strong>{{ total }}</strong> công việc
          </p>
        </div>

        <!-- Trạng thái đang tải -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải công việc...</p>
        </div>

        <!-- Không có kết quả -->
        <div v-else-if="jobs.length === 0" class="empty-state">
          <p class="empty-icon">📭</p>
          <p>Không tìm thấy công việc phù hợp</p>
          <button class="btn-primary" @click="resetFilters">Xem tất cả công việc</button>
        </div>

        <!-- Danh sách job -->
        <div v-else class="jobs-list">
          <div
            v-for="job in jobs"
            :key="job._id"
            class="job-card"
          >
            <!-- Phần trên: logo + tên job + công ty -->
            <div class="job-top">
              <div class="company-logo">
                {{ getInitials(job.employer?.companyName) }}
              </div>
              <div class="job-main-info">
                <h3 class="job-title">{{ job.title }}</h3>
                <p class="company-name">{{ job.employer?.companyName || 'N/A' }}</p>
              </div>
              <div class="job-salary">
                💰 {{ formatSalary(job.salary) }}
              </div>
            </div>

            <!-- Tags: địa điểm, loại hình, cấp bậc -->
            <div class="job-tags">
              <span class="tag">📍 {{ job.location?.city || 'Chưa cập nhật' }}</span>
              <span class="tag">💼 {{ getJobTypeLabel(job.jobType) }}</span>
              <span class="tag">⭐ {{ getLevelLabel(job.level) }}</span>
            </div>

            <!-- Mô tả ngắn -->
            <p class="job-description">
              {{ truncate(job.description, 120) }}
            </p>

            <!-- Nút hành động -->
            <div class="job-actions">
              <router-link :to="`/jobs/public/${job._id}`" class="btn-primary">
                Xem chi tiết
              </router-link>
              <router-link to="/login" class="btn-secondary">
                Đăng nhập để ứng tuyển
              </router-link>
            </div>
          </div>
        </div>

        <!-- Phân trang -->
        <div v-if="totalPages > 1" class="pagination">
          <button :disabled="page <= 1" @click="fetchJobs(page - 1)" class="page-btn">
            ← Trang trước
          </button>
          <span class="page-info">Trang {{ page }} / {{ totalPages }}</span>
          <button :disabled="page >= totalPages" @click="fetchJobs(page + 1)" class="page-btn">
            Trang sau →
          </button>
        </div>

      </section>
    </div><!-- /main-layout -->

  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../services/api'
import Header from '../components/Header.vue'

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const loading    = ref(false)
const jobs       = ref([])
const total      = ref(0)
const page       = ref(1)
const totalPages = ref(1)

const filters = reactive({
  search:  '',
  city:    '',
  jobType: '',
  level:   '',
})

// ════════════════════════════════════════
// GỌI API
// ════════════════════════════════════════

async function fetchJobs(targetPage = 1) {
  try {
    loading.value = true

    // Tạo object params – chỉ đưa vào những filter có giá trị
    const params = { page: targetPage, limit: 10 }
    if (filters.search)  params.search  = filters.search
    if (filters.city)    params.city    = filters.city
    if (filters.jobType) params.jobType = filters.jobType
    if (filters.level)   params.level   = filters.level

    const res = await api.get('/jobs/public', { params })

    jobs.value       = res.data?.jobs       || []
    total.value      = res.data?.total      || 0
    page.value       = res.data?.page       || 1
    totalPages.value = res.data?.totalPages || 1
  } catch (error) {
    console.error('Lỗi tải public jobs:', error)
    jobs.value = []
  } finally {
    loading.value = false
  }
}

// Đặt lại toàn bộ bộ lọc và tải lại
function resetFilters() {
  filters.search  = ''
  filters.city    = ''
  filters.jobType = ''
  filters.level   = ''
  fetchJobs(1)
}

// ════════════════════════════════════════
// HÀM TIỆN ÍCH – format dữ liệu
// ════════════════════════════════════════

// Cắt ngắn mô tả dài
function truncate(text, max = 120) {
  if (!text) return 'Chưa có mô tả.'
  return text.length > max ? text.slice(0, max) + '...' : text
}

// Format lương
function formatSalary(salary) {
  if (!salary) return 'Thỏa thuận'
  const min = salary.min ? Number(salary.min).toLocaleString('vi-VN') : null
  const max = salary.max ? Number(salary.max).toLocaleString('vi-VN') : null
  if (min && max) return `${min} – ${max} VNĐ`
  if (min) return `Từ ${min} VNĐ`
  return 'Thỏa thuận'
}

// Lấy 2 chữ cái đầu làm logo công ty
function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'CT'
}

// Nhãn loại hình
function getJobTypeLabel(type) {
  const map = {
    'full-time':  'Toàn thời gian',
    'part-time':  'Bán thời gian',
    'internship': 'Thực tập',
    'contract':   'Hợp đồng',
    'freelance':  'Freelance',
  }
  return map[type] || type || 'Chưa cập nhật'
}

// Nhãn cấp bậc
function getLevelLabel(level) {
  const map = {
    intern:  'Thực tập sinh',
    fresher: 'Fresher',
    junior:  'Junior',
    middle:  'Middle',
    senior:  'Senior',
  }
  return map[level] || level || 'Chưa cập nhật'
}

// Gọi API ngay khi trang được mở
onMounted(() => {
  fetchJobs(1)
})
</script>

<style scoped>
/* ════════════════════════════════════
   LAYOUT TỔNG THỂ
════════════════════════════════════ */
.page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* ════════════════════════════════════
   HERO – thanh tìm kiếm to, full-width
════════════════════════════════════ */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 48px 40px;
  text-align: center;
}

.hero h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
}

.hero-sub {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 28px;
}

/* Thanh tìm kiếm nằm trong hero */
.search-bar {
  display: flex;
  max-width: 700px;
  margin: 0 auto;
  gap: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  overflow: hidden;
}

.search-bar input {
  flex: 1;
  padding: 16px 20px;
  border: none;
  font-size: 15px;
  outline: none;
  color: #2c3e50;
}

.btn-search {
  padding: 16px 28px;
  background: #2c3e50;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-search:hover {
  background: #1a252f;
}

/* ════════════════════════════════════
   MAIN LAYOUT: sidebar + results
   Đây là phần quan trọng nhất –
   dùng CSS Grid 2 cột như web tuyển dụng thật
════════════════════════════════════ */
.main-layout {
  display: grid;
  grid-template-columns: 280px 1fr;  /* sidebar cố định 280px, còn lại cho content */
  gap: 24px;
  max-width: 1400px;                 /* full-width hơn, không bị hẹp */
  margin: 0 auto;
  padding: 28px 40px;
}

/* ════════════════════════════════════
   SIDEBAR BỘ LỌC
════════════════════════════════════ */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Card chứa các bộ lọc */
.filter-box {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;       /* Dính lại khi scroll */
  top: 20px;
}

.filter-title {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

/* Mỗi nhóm bộ lọc */
.filter-group {
  margin-bottom: 16px;
}

.filter-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 7px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e1e8ed;
  border-radius: 8px;
  font-size: 14px;
  color: #2c3e50;
  background: white;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.filter-group select:focus {
  border-color: #667eea;
}

.btn-reset {
  width: 100%;
  padding: 10px;
  background: #f8f9fa;
  border: 1.5px solid #e1e8ed;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;
}

.btn-reset:hover {
  background: #e9ecef;
  border-color: #999;
}

/* Card gợi ý đăng nhập trong sidebar */
.login-prompt {
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  border: 1.5px solid #667eea30;
  border-radius: 12px;
  padding: 18px;
  text-align: center;
}

.login-prompt p {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 12px;
}

.btn-login-prompt {
  display: inline-block;
  padding: 9px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn-login-prompt:hover {
  opacity: 0.9;
}

/* ════════════════════════════════════
   KHU VỰC KẾT QUẢ
════════════════════════════════════ */
.results {
  min-width: 0; /* Quan trọng: ngăn grid item bị tràn */
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.results-count {
  font-size: 15px;
  color: #666;
}

.results-count strong {
  color: #2c3e50;
  font-weight: 700;
}

/* ── Loading / Empty ── */
.loading-state {
  text-align: center;
  padding: 60px;
  color: #999;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e1e8ed;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 12px;
  color: #999;
}

.empty-icon { font-size: 40px; margin-bottom: 12px; }

/* ════════════════════════════════════
   JOB CARD – mỗi tin tuyển dụng
════════════════════════════════════ */
.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;  /* List dọc thay vì grid – chuẩn hơn với web */
}

.job-card {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1.5px solid transparent;
  transition: all 0.2s;
}

.job-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.12);
  transform: translateY(-1px);
}

/* Phần trên card: logo + tên + lương */
.job-top {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 12px;
}

/* Logo chữ của công ty */
.company-logo {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  background: #eef2ff;
  color: #4338ca;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  flex-shrink: 0;
}

.job-main-info {
  flex: 1;
  min-width: 0;
}

.job-title {
  font-size: 17px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
  /* Không để text tràn */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company-name {
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
}

.job-salary {
  font-size: 14px;
  font-weight: 700;
  color: #27ae60;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Tags loại hình, địa điểm, cấp bậc */
.job-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.tag {
  background: #f0f4ff;
  color: #555;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
}

/* Mô tả ngắn */
.job-description {
  font-size: 14px;
  color: #777;
  line-height: 1.6;
  margin-bottom: 16px;
}

/* Nút hành động */
.job-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-primary {
  display: inline-block;
  padding: 9px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover { opacity: 0.9; }

.btn-secondary {
  display: inline-block;
  padding: 9px 20px;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: 1.5px solid #667eea;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f0f4ff;
}

/* ════════════════════════════════════
   PHÂN TRANG
════════════════════════════════════ */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.page-btn {
  padding: 9px 20px;
  border: 1.5px solid #dee2e6;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: #555;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #999;
}

/* ════════════════════════════════════
   RESPONSIVE – màn hình nhỏ hơn 1024px
════════════════════════════════════ */
@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 240px 1fr;
    padding: 20px 24px;
  }
}

/* Tablet và mobile: ẩn sidebar, chỉ còn content */
@media (max-width: 768px) {
  .main-layout {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .sidebar {
    display: none; /* Ẩn sidebar trên mobile */
  }

  .hero {
    padding: 32px 20px;
  }

  .hero h1 {
    font-size: 26px;
  }

  .search-bar {
    flex-direction: column;
    border-radius: 10px;
  }

  .job-top {
    flex-wrap: wrap;
  }

  .job-salary {
    width: 100%;
  }
}
</style>