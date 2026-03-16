<template>
  <!-- ============================================================
       TRANG: Quản lý Reports (Báo cáo vi phạm)
       CHỨC NĂNG: Xem danh sách report, lọc theo trạng thái
                  và loại đối tượng, xem chi tiết, cập nhật xử lý
  ============================================================ -->
  <div class="page">
    <Header />

    <div class="container">

      <!-- ── TIÊU ĐỀ + FILTER TABS ── -->
      <div class="page-header">
        <h1>Quản lý Reports</h1>

        <!-- Lọc theo trạng thái report – dùng v-for -->
        <div class="filter-bar">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            class="filter-btn"
            :class="{ active: statusFilter === tab.value }"
            @click="statusFilter = tab.value"
          >
            {{ tab.label }}
            <span class="filter-count">{{ tab.count }}</span>
          </button>
        </div>
      </div>

      <!-- Lọc thêm theo loại đối tượng bị report -->
      <div class="secondary-filter">
        <label>Lọc theo đối tượng:</label>
        <select v-model="targetTypeFilter">
          <option value="all">Tất cả</option>
          <option value="student">Ứng viên</option>
          <option value="employer">Nhà tuyển dụng</option>
          <option value="job">Bài đăng</option>
        </select>
      </div>

      <!-- Thông báo -->
      <div v-if="message" class="alert" :class="isSuccess ? 'success' : 'error'">
        {{ message }}
      </div>

      <!-- Đang tải -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải reports...</p>
      </div>

      <!-- Bảng danh sách reports -->
      <div v-else class="table-card">
        <table class="table">
          <thead>
            <tr>
              <th>Người report</th>
              <th>Đối tượng bị report</th>
              <th>Lý do</th>
              <th>Liên quan</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in filteredReports" :key="report._id">

              <!-- Người report -->
              <td>
                <p class="text-bold">{{ getReporterName(report) }}</p>
                <p class="text-muted">{{ getReporterEmail(report) }}</p>
                <span class="role-tag">{{ getReporterRoleLabel(report.reporterRole) }}</span>
              </td>

              <!-- Đối tượng bị report -->
              <td>
                <p class="text-bold">{{ getTargetLabel(report) }}</p>
                <p class="text-muted">{{ getTargetName(report) }}</p>
              </td>

              <!-- Lý do -->
              <td>
                <p class="text-bold">{{ getReasonLabel(report.reason) }}</p>
                <p class="text-muted">{{ truncateText(report.description, 80) }}</p>
              </td>

              <!-- Liên quan -->
              <td>
                <p v-if="report.relatedJob">
                  <strong>Job:</strong> {{ report.relatedJob.title }}
                </p>
                <p v-if="report.relatedApplication">
                  <strong>Application:</strong> {{ report.relatedApplication.status }}
                </p>
                <p v-if="!report.relatedJob && !report.relatedApplication" class="text-muted">—</p>
              </td>

              <td class="text-muted">{{ formatDate(report.createdAt) }}</td>

              <!-- Badge trạng thái -->
              <td>
                <span class="status-badge" :class="'status-' + report.status">
                  {{ getStatusLabel(report.status) }}
                </span>
              </td>

              <!-- Nút xem chi tiết -->
              <td>
                <button class="btn btn-outline btn-sm" @click="openDetail(report._id)">
                  Xem
                </button>
              </td>
            </tr>

            <tr v-if="filteredReports.length === 0">
              <td colspan="7">
                <div class="empty-state">
                  <p class="empty-icon">📭</p>
                  <p>Không có report nào</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div><!-- /container -->

    <!-- ============================================================
         MODAL CHI TIẾT + CẬP NHẬT REPORT
    ============================================================ -->
    <div v-if="selectedReport" class="modal-overlay" @click="closeModal">
      <div class="modal-box modal-lg" @click.stop>
        <button class="modal-close-btn" @click="closeModal">✕</button>

        <h2 class="modal-title">Chi tiết Report</h2>

        <!-- Thông tin chi tiết dạng grid -->
        <div class="detail-grid">
          <div class="detail-item">
            <label>Người report</label>
            <span>{{ getReporterName(selectedReport) }}</span>
          </div>
          <div class="detail-item">
            <label>Vai trò</label>
            <span>{{ getReporterRoleLabel(selectedReport.reporterRole) }}</span>
          </div>
          <div class="detail-item">
            <label>Đối tượng bị report</label>
            <span>{{ getTargetLabel(selectedReport) }}</span>
          </div>
          <div class="detail-item">
            <label>Tên đối tượng</label>
            <span>{{ getTargetName(selectedReport) }}</span>
          </div>
          <div class="detail-item">
            <label>Lý do</label>
            <span>{{ getReasonLabel(selectedReport.reason) }}</span>
          </div>
          <div class="detail-item">
            <label>Ngày tạo</label>
            <span>{{ formatDateTime(selectedReport.createdAt) }}</span>
          </div>
          <div class="detail-item full">
            <label>Mô tả chi tiết</label>
            <p class="multiline-text">{{ selectedReport.description }}</p>
          </div>
          <div v-if="selectedReport.relatedJob" class="detail-item full">
            <label>Job liên quan</label>
            <p>{{ selectedReport.relatedJob.title }}</p>
          </div>
          <div v-if="selectedReport.adminNote" class="detail-item full">
            <label>Ghi chú Admin</label>
            <p class="multiline-text">{{ selectedReport.adminNote }}</p>
          </div>
        </div>

        <!-- Section cập nhật trạng thái xử lý -->
        <div class="update-section">
          <h3>Cập nhật xử lý</h3>

          <div class="form-group">
            <label>Trạng thái</label>
            <select v-model="updateForm.status">
              <option value="open">🆕 Mới</option>
              <option value="in_review">👀 Đang xử lý</option>
              <option value="resolved">✅ Đã xử lý</option>
              <option value="dismissed">❌ Bỏ qua</option>
            </select>
          </div>

          <div class="form-group">
            <label>Ghi chú Admin</label>
            <textarea
              v-model="updateForm.adminNote"
              rows="4"
              placeholder="Nhập ghi chú xử lý..."
            ></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-primary" @click="updateReportStatus">
            💾 Lưu cập nhật
          </button>
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

const loading        = ref(false)
const reports        = ref([])        // Danh sách tất cả reports
const selectedReport = ref(null)      // Report đang xem trong modal
const message        = ref('')
const isSuccess      = ref(false)

const statusFilter     = ref('all')   // Lọc theo trạng thái
const targetTypeFilter = ref('all')   // Lọc theo loại đối tượng

// Form cập nhật trạng thái xử lý
const updateForm = ref({
  status:    'open',
  adminNote: '',
})

// ════════════════════════════════════════
// COMPUTED
// ════════════════════════════════════════

// Đếm số report theo từng trạng thái
const openCount      = computed(() => reports.value.filter(r => r.status === 'open').length)
const inReviewCount  = computed(() => reports.value.filter(r => r.status === 'in_review').length)
const resolvedCount  = computed(() => reports.value.filter(r => r.status === 'resolved').length)
const dismissedCount = computed(() => reports.value.filter(r => r.status === 'dismissed').length)

// Cấu hình tabs lọc – dùng v-for
const statusTabs = computed(() => [
  { value: 'all',       label: 'Tất cả',       count: reports.value.length },
  { value: 'open',      label: 'Mới',           count: openCount.value },
  { value: 'in_review', label: 'Đang xử lý',   count: inReviewCount.value },
  { value: 'resolved',  label: 'Đã xử lý',     count: resolvedCount.value },
  { value: 'dismissed', label: 'Bỏ qua',        count: dismissedCount.value },
])

// Lọc reports theo cả 2 bộ lọc (status + targetType)
const filteredReports = computed(() => {
  return reports.value.filter(report => {
    const matchStatus = statusFilter.value === 'all' || report.status === statusFilter.value
    const matchTarget = targetTypeFilter.value === 'all' || report.targetType === targetTypeFilter.value
    return matchStatus && matchTarget
  })
})

// ════════════════════════════════════════
// HÀM TIỆN ÍCH
// ════════════════════════════════════════

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}

function formatDateTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('vi-VN')
}

function truncateText(text, max = 80) {
  if (!text) return '—'
  return text.length > max ? text.slice(0, max) + '...' : text
}

function getReporterName(report) {
  if (!report?.reporterId) return '—'
  return report.reporterId.companyName || report.reporterId.fullName || '—'
}

function getReporterEmail(report) {
  return report?.reporterId?.email || '—'
}

function getReporterRoleLabel(role) {
  return role === 'employer' ? 'Nhà tuyển dụng' : 'Sinh viên'
}

function getTargetLabel(report) {
  const map = { student: 'Ứng viên', employer: 'Nhà tuyển dụng', job: 'Bài đăng' }
  return map[report?.targetType] || '—'
}

function getTargetName(report) {
  const target = report?.targetId
  if (!target) return '—'
  if (report.targetType === 'student')  return target.fullName || target.email || '—'
  if (report.targetType === 'employer') return target.companyName || target.fullName || '—'
  if (report.targetType === 'job')      return target.title || '—'
  return '—'
}

function getReasonLabel(reason) {
  const map = {
    spam:                    'Spam',
    fake_information:        'Thông tin giả',
    inappropriate_content:   'Nội dung không phù hợp',
    fraud:                   'Lừa đảo',
    harassment:              'Quấy rối',
    unprofessional_behavior: 'Hành vi thiếu chuyên nghiệp',
    other:                   'Khác',
  }
  return map[reason] || reason || '—'
}

function getStatusLabel(status) {
  const map = {
    open:       'Mới',
    in_review:  'Đang xử lý',
    resolved:   'Đã xử lý',
    dismissed:  'Bỏ qua',
  }
  return map[status] || status || '—'
}

// ════════════════════════════════════════
// HÀM GỌI API
// ════════════════════════════════════════

async function fetchReports() {
  try {
    loading.value = true
    message.value = ''
    const res = await api.get('/admin/reports')
    reports.value = res.data.reports || []
  } catch (error) {
    message.value  = error.response?.data?.message || 'Không thể tải reports'
    isSuccess.value = false
  } finally {
    loading.value = false
  }
}

// Mở modal xem chi tiết 1 report
async function openDetail(reportId) {
  try {
    const res = await api.get(`/admin/reports/${reportId}`)
    selectedReport.value       = res.data.report
    updateForm.value.status    = res.data.report.status    || 'open'
    updateForm.value.adminNote = res.data.report.adminNote || ''
  } catch (error) {
    message.value  = error.response?.data?.message || 'Không thể tải chi tiết report'
    isSuccess.value = false
  }
}

function closeModal() {
  selectedReport.value = null
}

// Cập nhật trạng thái xử lý report
async function updateReportStatus() {
  if (!selectedReport.value) return

  try {
    const res = await api.patch(`/admin/reports/${selectedReport.value._id}/status`, {
      status:    updateForm.value.status,
      adminNote: updateForm.value.adminNote,
    })

    message.value  = res.data.message || 'Cập nhật thành công'
    isSuccess.value = true

    // Cập nhật trực tiếp trong danh sách – không cần reload
    const index = reports.value.findIndex(r => r._id === selectedReport.value._id)
    if (index !== -1) {
      reports.value[index].status    = updateForm.value.status
      reports.value[index].adminNote = updateForm.value.adminNote
    }

    // Cập nhật luôn trong modal
    selectedReport.value.status    = updateForm.value.status
    selectedReport.value.adminNote = updateForm.value.adminNote

  } catch (error) {
    message.value  = error.response?.data?.message || 'Không thể cập nhật report'
    isSuccess.value = false
  }
}

onMounted(() => {
  fetchReports()
})
</script>

<style scoped>
/* ════════════════════════════════════
   LAYOUT
════════════════════════════════════ */
.page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 40px 48px;
}

/* ── Tiêu đề + filter tabs ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.filter-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 16px;
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
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(0,0,0,.08);
}

.filter-btn.active .filter-count { background: rgba(255,255,255,.25); }

/* Bộ lọc phụ */
.secondary-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.secondary-filter label {
  font-size: 14px;
  font-weight: 600;
  color: #555;
}

.secondary-filter select {
  padding: 8px 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  min-width: 200px;
  cursor: pointer;
  outline: none;
}

/* ── Alert ── */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.alert.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.alert.error   { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

/* ── Loading ── */
.loading-state {
  text-align: center;
  padding: 60px;
  color: #999;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ════════════════════════════════════
   BẢNG
════════════════════════════════════ */
.table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead { background: #f8f9fa; }

.table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #888;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
}

.table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: top;
  font-size: 14px;
}

.table tbody tr:last-child td { border-bottom: none; }
.table tbody tr:hover          { background: #fafafa; }

.text-bold  { font-weight: 600; color: #2c3e50; margin-bottom: 3px; }
.text-muted { font-size: 13px; color: #999; }

.role-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: #f0f4ff;
  color: #667eea;
  margin-top: 4px;
}

/* Badge trạng thái report */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
}

.status-open      { background: #dbeafe; color: #1d4ed8; }
.status-in_review { background: #fff7ed; color: #c2410c; }
.status-resolved  { background: #dcfce7; color: #166534; }
.status-dismissed { background: #f1f5f9; color: #64748b; }

/* Buttons */
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  font-family: inherit;
}

.btn-sm     { padding: 6px 12px; font-size: 12px; }
.btn-primary   { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.btn-primary:hover { transform: translateY(-1px); }
.btn-outline   { background: transparent; color: #667eea; border: 1.5px solid #667eea; }
.btn-outline:hover { background: #f0f4ff; }
.btn-secondary { background: white; color: #666; border: 1.5px solid #e0e0e0; }
.btn-secondary:hover { background: #f5f5f5; }

/* Empty state */
.empty-state { text-align: center; padding: 48px; color: #bbb; }
.empty-icon  { font-size: 36px; margin-bottom: 8px; }

/* ════════════════════════════════════
   MODAL
════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.2s ease;
}

.modal-box {
  background: white;
  border-radius: 16px;
  padding: 28px;
  max-width: 760px;
  width: 100%;
  max-height: 88vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.22s ease;
}

.modal-lg { max-width: 860px; }

@keyframes fadeIn  { from { opacity: 0; }               to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }

.modal-close-btn {
  position: absolute;
  top: 16px; right: 16px;
  width: 30px; height: 30px;
  border-radius: 8px;
  background: #f0f0f0;
  border: none; cursor: pointer; font-size: 15px;
  display: flex; align-items: center; justify-content: center;
  color: #666; transition: background 0.15s;
}

.modal-close-btn:hover { background: #e0e0e0; }

.modal-title { font-size: 20px; font-weight: 700; color: #2c3e50; margin-bottom: 20px; }

/* Grid thông tin chi tiết 2 cột */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.detail-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 14px;
}

.detail-item.full { grid-column: 1 / -1; }

.detail-item label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #aaa;
  margin-bottom: 5px;
}

.detail-item span { font-size: 14px; color: #2c3e50; font-weight: 500; }

.multiline-text {
  font-size: 13px;
  color: #555;
  line-height: 1.7;
  white-space: pre-wrap;
  margin: 0;
}

/* Section cập nhật trạng thái */
.update-section {
  border-top: 2px solid #f0f0f0;
  padding-top: 20px;
  margin-bottom: 8px;
}

.update-section h3 { font-size: 16px; color: #2c3e50; margin-bottom: 14px; }

.form-group { margin-bottom: 14px; }

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.form-group select:focus,
.form-group textarea:focus { border-color: #667eea; }

.form-group textarea { resize: vertical; }

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* ════════════════════════════════════
   RESPONSIVE
════════════════════════════════════ */
@media (max-width: 1024px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .detail-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .container { padding: 20px 16px; }
  .table-card { overflow-x: auto; }
  .table      { min-width: 1000px; }
}
</style>