<template>
  <!-- ============================================================
       TRANG: Chi tiết việc làm công khai
       LAYOUT: 2 cột – nội dung chính trái, sidebar thông tin phải
       CHỨC NĂNG: Xem chi tiết job, gợi ý đăng nhập để ứng tuyển
  ============================================================ -->
  <div class="page">
    <Header />

    <div class="container">

      <!-- Nút quay lại -->
      <div class="top-bar">
        <router-link to="/jobs/public" class="back-link">
          ← Quay lại danh sách việc làm
        </router-link>
      </div>

      <!-- ── Đang tải ── -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải chi tiết công việc...</p>
      </div>

      <!-- ── Không tìm thấy ── -->
      <div v-else-if="!job" class="empty-state">
        <p class="empty-icon">🔍</p>
        <p>Không tìm thấy công việc này</p>
        <router-link to="/jobs/public" class="btn-primary">Quay lại danh sách</router-link>
      </div>

      <!-- ── Nội dung chính ── -->
      <div v-else class="detail-layout">

        <!-- ════ CỘT TRÁI: thông tin chi tiết job ════ -->
        <main class="main-col">

          <!-- Card header: logo + tên job + tags -->
          <div class="card header-card">
            <div class="job-header">
              <div class="company-logo">
                {{ getInitials(job.employer?.companyName) }}
              </div>
              <div class="job-header-info">
                <h1 class="job-title">{{ job.title }}</h1>
                <p class="company-name">{{ job.employer?.companyName || 'N/A' }}</p>
              </div>
            </div>

            <!-- Tags thông tin nhanh -->
            <div class="job-tags">
              <span class="tag">📍 {{ job.location?.city || 'Chưa cập nhật' }}</span>
              <span class="tag">💼 {{ getJobTypeLabel(job.jobType) }}</span>
              <span class="tag">⭐ {{ getLevelLabel(job.level) }}</span>
              <span class="tag tag-salary">💰 {{ formatSalary(job.salary) }}</span>
            </div>
          </div>

          <!-- Card mô tả công việc -->
          <div class="card content-card">
            <h3 class="section-title">Mô tả công việc</h3>
            <p class="multiline-text">{{ job.description || 'Chưa có mô tả.' }}</p>
          </div>

          <!-- Card yêu cầu ứng viên -->
          <div v-if="job.requirements" class="card content-card">
            <h3 class="section-title">Yêu cầu ứng viên</h3>
            <p class="multiline-text">{{ job.requirements }}</p>
          </div>

          <!-- Card kỹ năng -->
          <div class="card content-card">
            <h3 class="section-title">Kỹ năng yêu cầu</h3>
            <div v-if="job.skills?.length" class="skill-list">
              <span v-for="skill in job.skills" :key="skill" class="skill-chip">
                {{ skill }}
              </span>
            </div>
            <p v-else class="text-muted">Chưa cập nhật kỹ năng.</p>
          </div>

          <!-- Card quyền lợi -->
          <div class="card content-card">
            <h3 class="section-title">Quyền lợi</h3>
            <p class="multiline-text">{{ job.benefits || 'Chưa cập nhật quyền lợi.' }}</p>
          </div>

        </main>

        <!-- ════ CỘT PHẢI: sidebar thông tin & CTA ════ -->
        <aside class="side-col">

          <!-- Card gợi ý ứng tuyển – đặt trên cùng để nổi bật -->
          <div class="card cta-card">
            <h3>Muốn ứng tuyển?</h3>
            <p class="text-muted">
              Đăng nhập bằng tài khoản sinh viên để nộp hồ sơ
              và theo dõi trạng thái ứng tuyển.
            </p>
            <div class="cta-actions">
              <router-link to="/login"    class="btn-primary btn-block">Đăng nhập để ứng tuyển</router-link>
              <router-link to="/register" class="btn-secondary btn-block">Tạo tài khoản miễn phí</router-link>
            </div>
          </div>

          <!-- Card thông tin nhà tuyển dụng -->
          <div class="card info-card">
            <h3 class="section-title">Thông tin nhà tuyển dụng</h3>

            <div class="info-rows">
              <div class="info-row">
                <span class="info-label">Công ty</span>
                <span class="info-value">{{ job.employer?.companyName || 'N/A' }}</span>
              </div>
              <div class="info-row" v-if="job.employer?.industry">
                <span class="info-label">Ngành</span>
                <span class="info-value">{{ job.employer.industry }}</span>
              </div>
              <div class="info-row" v-if="job.employer?.companySize">
                <span class="info-label">Quy mô</span>
                <span class="info-value">{{ job.employer.companySize }}</span>
              </div>
              <div class="info-row" v-if="job.employer?.website">
                <span class="info-label">Website</span>
                <a :href="job.employer.website" target="_blank" class="info-link">
                  {{ job.employer.website }}
                </a>
              </div>
            </div>
          </div>

          <!-- Card thông tin chung của job -->
          <div class="card info-card">
            <h3 class="section-title">Thông tin công việc</h3>

            <div class="info-rows">
              <div class="info-row">
                <span class="info-label">Loại hình</span>
                <span class="info-value">{{ getJobTypeLabel(job.jobType) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Cấp bậc</span>
                <span class="info-value">{{ getLevelLabel(job.level) }}</span>
              </div>
              <div class="info-row" v-if="job.experience">
                <span class="info-label">Kinh nghiệm</span>
                <span class="info-value">{{ getExperienceLabel(job.experience) }}</span>
              </div>
              <div class="info-row" v-if="job.workMode">
                <span class="info-label">Hình thức</span>
                <span class="info-value">{{ getWorkModeLabel(job.workMode) }}</span>
              </div>
              <div class="info-row" v-if="job.deadline">
                <span class="info-label">Hạn nộp</span>
                <span class="info-value">{{ formatDate(job.deadline) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Mức lương</span>
                <span class="info-value salary-value">{{ formatSalary(job.salary) }}</span>
              </div>
            </div>
          </div>

        </aside>
      </div>

    </div>
  </div>
</template>

<script setup>
// ── Import ──
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import Header from '../components/Header.vue'

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const route   = useRoute()
const loading = ref(false)
const job     = ref(null)   // Dữ liệu job từ API

// ════════════════════════════════════════
// GỌI API
// ════════════════════════════════════════

async function fetchJobDetail() {
  try {
    loading.value = true
    // Lấy jobId từ URL params (vd: /jobs/public/abc123)
    const res = await api.get(`/jobs/public/${route.params.jobId}`)
    job.value = res.data?.job || null
  } catch (error) {
    console.error('Lỗi tải chi tiết job:', error)
    job.value = null
  } finally {
    loading.value = false
  }
}

// ════════════════════════════════════════
// HÀM TIỆN ÍCH – format dữ liệu
// ════════════════════════════════════════

// Lấy 2 chữ cái đầu làm logo
function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'CT'
}

// Định dạng lương
function formatSalary(salary) {
  if (!salary) return 'Thỏa thuận'
  const min = salary.min ? Number(salary.min).toLocaleString('vi-VN') : null
  const max = salary.max ? Number(salary.max).toLocaleString('vi-VN') : null
  if (min && max) return `${min} – ${max} VNĐ`
  if (min) return `Từ ${min} VNĐ`
  return 'Thỏa thuận'
}

// Định dạng ngày
function formatDate(dateString) {
  if (!dateString) return 'Chưa cập nhật'
  return new Date(dateString).toLocaleDateString('vi-VN')
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

// Nhãn kinh nghiệm
function getExperienceLabel(exp) {
  const map = {
    'no-experience': 'Không yêu cầu',
    '0-1-year':      '0 – 1 năm',
    '1-3-years':     '1 – 3 năm',
    '3-5-years':     '3 – 5 năm',
    '5+-years':      'Trên 5 năm',
  }
  return map[exp] || exp || 'Chưa cập nhật'
}

// Nhãn hình thức làm việc
function getWorkModeLabel(mode) {
  const map = {
    onsite: 'Tại văn phòng',
    remote: 'Remote',
    hybrid: 'Hybrid',
  }
  return map[mode] || mode || 'Chưa cập nhật'
}

// ── Gọi API khi trang được mở ──
onMounted(() => {
  fetchJobDetail()
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

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 40px 60px;
}

/* Nút quay lại */
.top-bar {
  margin-bottom: 20px;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: opacity 0.2s;
}

.back-link:hover {
  opacity: 0.75;
}

/* ════════════════════════════════════
   LOADING / EMPTY
════════════════════════════════════ */
.loading-state,
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  color: #666;
}

.empty-icon { font-size: 40px; margin-bottom: 12px; }

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

/* ════════════════════════════════════
   LAYOUT 2 CỘT
   Cột trái chiếm 2/3, cột phải 1/3
════════════════════════════════════ */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: flex-start;
}

/* Cột trái: danh sách card nội dung */
.main-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Cột phải: sticky, dính lại khi scroll */
.side-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 20px;
}

/* ════════════════════════════════════
   CARD DÙNG CHUNG
════════════════════════════════════ */
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* ── Header card (logo + tên + tags) ── */
.job-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.company-logo {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #eef2ff;
  color: #4338ca;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 20px;
  flex-shrink: 0;
}

.job-title {
  font-size: 26px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 6px;
  line-height: 1.3;
}

.company-name {
  color: #667eea;
  font-weight: 600;
  font-size: 15px;
}

/* Tags thông tin nhanh */
.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #f0f4ff;
  color: #555;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
}

.tag-salary {
  background: #f0fff4;
  color: #27ae60;
  font-weight: 600;
}

/* ── Content card (mô tả, kỹ năng...) ── */
.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

/* Text dài – giữ nguyên xuống dòng */
.multiline-text {
  white-space: pre-wrap;
  line-height: 1.75;
  color: #555;
  font-size: 14px;
}

/* Danh sách kỹ năng */
.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-chip {
  background: #eef2ff;
  color: #4338ca;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.text-muted {
  color: #999;
  font-size: 14px;
}

/* ════════════════════════════════════
   SIDEBAR CARDS
════════════════════════════════════ */

/* Card CTA ứng tuyển */
.cta-card {
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  border: 1.5px solid #667eea30;
}

.cta-card h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.cta-card .text-muted {
  margin-bottom: 16px;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Nút full-width trong sidebar */
.btn-block {
  display: block;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: opacity 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover { opacity: 0.9; }

.btn-secondary {
  background: white;
  color: #667eea;
  border: 1.5px solid #667eea;
}

.btn-secondary:hover {
  background: #f0f4ff;
}

/* Card thông tin dạng hàng label – value */
.info-card h3 {
  font-size: 15px;
  color: #2c3e50;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.info-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
}

.info-label {
  color: #999;
  font-size: 13px;
  flex-shrink: 0;
}

.info-value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
}

.salary-value {
  color: #27ae60;
  font-weight: 700;
}

.info-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.info-link:hover { text-decoration: underline; }

/* ════════════════════════════════════
   RESPONSIVE
════════════════════════════════════ */
@media (max-width: 1024px) {
  .detail-layout {
    grid-template-columns: 1fr 300px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 20px 16px 40px;
  }

  /* Trên mobile: chuyển về 1 cột, sidebar lên trên */
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .side-col {
    position: static;
    /* Đổi thứ tự: sidebar lên đầu để CTA dễ thấy */
    order: -1;
  }

  .job-title {
    font-size: 22px;
  }
}
</style>