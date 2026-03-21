<template>
  <!-- ============================================================
       TRANG: Quản lý ứng viên (Employer)
       CHỨC NĂNG: Xem ứng viên theo job hoặc tất cả, lọc theo
                  trạng thái, xem chi tiết, cập nhật trạng thái,
                  lên lịch phỏng vấn, từ chối, report ứng viên
       ROUTE: /employer/applications          → tất cả ứng viên
              /employer/applications/:jobId   → ứng viên của 1 job
  ============================================================ -->
  <div class="page">
    <Header />

    <div class="container">

      <!-- ── TIÊU ĐỀ ── -->
      <div class="page-header">
        <div>
          <h1>{{ pageTitle }}</h1>
          <p class="page-sub">{{ pageSubtitle }}</p>
        </div>
        <button class="btn btn-secondary" @click="$router.go(-1)">← Quay lại</button>
      </div>

      <!-- Card thông tin job (chỉ hiển thị khi xem ứng viên của 1 job cụ thể) -->
      <div v-if="job" class="job-banner">
        <div class="job-banner-left">
          <h2>{{ job.title }}</h2>
          <p>{{ job?.location?.city || '—' }} • {{ getJobTypeLabel(job.jobType) }}</p>
        </div>
        <div class="job-banner-stats">
          <span>👁️ {{ job.views || 0 }} lượt xem</span>
          <span>👥 {{ job.applicationsCount || 0 }} ứng viên</span>
        </div>
      </div>

      <!-- ── THỐNG KÊ ── -->
      <div class="stats-grid">
        <div v-for="stat in statCards" :key="stat.label" class="stat-card">
          <div class="stat-icon" :class="stat.gradient">{{ stat.icon }}</div>
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
          @click="changeFilter(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- ── ĐANG TẢI ── -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- ── DANH SÁCH ỨNG VIÊN ── -->
      <div v-else>
        <div v-if="filteredApplications.length === 0" class="empty-state">
          <p class="empty-icon">📭</p>
          <p>{{ getEmptyMessage() }}</p>
        </div>

        <div v-else class="app-list">
          <div v-for="app in filteredApplications" :key="app._id" class="app-card">

            <!-- Header card: avatar + tên + email + badge trạng thái -->
            <div class="app-card-head">
              <div class="candidate-row">
                <div class="avatar">{{ getInitials(app.student?.fullName) }}</div>
                <div class="candidate-info">
                  <h3>{{ app.student?.fullName || 'Ứng viên' }}</h3>
                  <p>📧 {{ app.student?.email || '—' }}</p>
                  <p v-if="app.student?.phone">📱 {{ app.student.phone }}</p>
                </div>
              </div>
              <div class="head-badges">
                <span class="status-badge" :class="'status-' + app.status">
                  {{ getStatusLabel(app.status) }}
                </span>
                <!-- Badge lịch phỏng vấn nếu có -->
                <span
                  v-if="app.interview?.status && app.interview.status !== 'none'"
                  class="interview-chip"
                  :class="'iv-' + app.interview.status"
                >
                  {{ getInterviewStatusLabel(app.interview.status) }}
                </span>
              </div>
            </div>

            <!-- Thông tin học vấn / ứng tuyển -->
            <div class="app-info-grid">
              <div class="info-item">
                <span class="info-label">📅 Ngày ứng tuyển</span>
                <span>{{ formatDate(app.createdAt) }}</span>
              </div>
              <div v-if="app.expectedSalary" class="info-item">
                <span class="info-label">💵 Lương mong muốn</span>
                <span>{{ formatNumber(app.expectedSalary) }} VND</span>
              </div>
              <div v-if="app.student?.university" class="info-item">
                <span class="info-label">🏫 Trường</span>
                <span>{{ app.student.university }}</span>
              </div>
              <div v-if="app.student?.gpa" class="info-item">
                <span class="info-label">📊 GPA</span>
                <span>{{ app.student.gpa }}</span>
              </div>
            </div>

            <!-- Thư xin việc tóm tắt -->
            <div v-if="app.coverLetter" class="cover-letter-preview">
              <strong>✍️ Thư xin việc:</strong>
              <p>{{ truncateText(app.coverLetter, 200) }}</p>
            </div>

            <!-- Ghi chú của employer -->
            <div v-if="app.employerNote" class="employer-note-box">
              <strong>💬 Ghi chú của bạn:</strong>
              <p>{{ app.employerNote }}</p>
            </div>

            <!-- Lịch phỏng vấn nếu có -->
            <div v-if="app.interview?.status && app.interview.status !== 'none'" class="interview-box">
              <strong>📅 Lịch phỏng vấn:</strong>
              <p><b>Trạng thái:</b> {{ getInterviewStatusLabel(app.interview.status) }}</p>
              <p><b>Thời gian:</b> {{ formatDateTime(app.interview.scheduledAt) }}</p>
              <p><b>Hình thức:</b> {{ app.interview.mode === 'online' ? 'Online' : 'Offline' }}</p>
              <p v-if="app.interview.location"><b>Địa điểm:</b> {{ app.interview.location }}</p>
              <p v-if="app.interview.meetingLink">
                <b>Link:</b>
                <a :href="app.interview.meetingLink" target="_blank">{{ app.interview.meetingLink }}</a>
              </p>
            </div>

            <!-- Các nút hành động -->
            <div class="app-actions">
              <button class="btn-action btn-primary" @click="openDetailModal(app)">👁️ Xem chi tiết</button>

              <a v-if="getResumeUrl(app)" :href="getFullUrl(getResumeUrl(app))" target="_blank" class="btn-action">📥 Tải CV</a>

              <button v-if="app.status === 'pending'"     class="btn-action" @click="updateStatus(app._id, 'reviewing')">👀 Đang xem</button>
              <button v-if="app.status === 'reviewing'"   class="btn-action btn-info" @click="updateStatus(app._id, 'shortlisted')">📌 Shortlist</button>
              <button v-if="canScheduleInterview(app)"    class="btn-action btn-info" @click="openInterviewModal(app)">📅 Lên lịch PV</button>
              <button v-if="canSendOffer(app)"            class="btn-action btn-success" @click="updateStatus(app._id, 'offered')">🎁 Gửi offer</button>
              <button v-if="app.status === 'offered'"     class="btn-action btn-success" @click="updateStatus(app._id, 'hired')">✅ Tuyển chính thức</button>
              <button v-if="canCancelInterview(app)"      class="btn-action btn-dark" @click="cancelInterview(app)">🗑️ Hủy lịch PV</button>
              <button v-if="canReject(app)"               class="btn-action btn-danger" @click="openRejectModal(app)">❌ Từ chối</button>
              <button                                      class="btn-action btn-warning" @click="openReportModal(app)">🚨 Report</button>
            </div>

          </div>
        </div>
      </div>

    </div><!-- /container -->


    <!-- ============================================================
         MODAL 1: XEM CHI TIẾT ỨNG VIÊN
    ============================================================ -->
    <div v-if="selectedApplication" class="modal-overlay" @click="closeModal">
      <div class="modal-box modal-lg" @click.stop>
        <button class="modal-close-btn" @click="closeModal">✕</button>
        <h2 class="modal-title">👤 Chi tiết ứng viên</h2>

        <!-- Thông tin sinh viên -->
        <div class="modal-section">
          <h3>🧑 Thông tin ứng viên</h3>
          <div class="detail-grid">
            <div class="detail-item"><label>Họ tên</label><span>{{ selectedApplication.student?.fullName }}</span></div>
            <div class="detail-item"><label>Email</label><span>{{ selectedApplication.student?.email }}</span></div>
            <div v-if="selectedApplication.student?.phone" class="detail-item"><label>Điện thoại</label><span>{{ selectedApplication.student.phone }}</span></div>
            <div v-if="selectedApplication.student?.university" class="detail-item"><label>Trường</label><span>{{ selectedApplication.student.university }}</span></div>
            <div v-if="selectedApplication.student?.major" class="detail-item"><label>Ngành học</label><span>{{ selectedApplication.student.major }}</span></div>
            <div v-if="selectedApplication.student?.gpa" class="detail-item"><label>GPA</label><span>{{ selectedApplication.student.gpa }}</span></div>
          </div>
        </div>

        <!-- Thông tin ứng tuyển -->
        <div class="modal-section">
          <h3>📋 Thông tin ứng tuyển</h3>
          <div class="detail-grid">
            <div class="detail-item"><label>Ngày ứng tuyển</label><span>{{ formatDateTime(selectedApplication.createdAt) }}</span></div>
            <div v-if="selectedApplication.expectedSalary" class="detail-item"><label>Mức lương mong muốn</label><span>{{ formatNumber(selectedApplication.expectedSalary) }} VND</span></div>
            <div v-if="selectedApplication.availableFrom" class="detail-item"><label>Có thể bắt đầu từ</label><span>{{ formatDate(selectedApplication.availableFrom) }}</span></div>
            <div class="detail-item">
              <label>Trạng thái</label>
              <span class="status-badge" :class="'status-' + selectedApplication.status">{{ getStatusLabel(selectedApplication.status) }}</span>
            </div>
          </div>
        </div>

        <!-- CV -->
        <div v-if="getResumeUrl(selectedApplication)" class="modal-section">
          <h3>📄 CV</h3>
          <a :href="getFullUrl(getResumeUrl(selectedApplication))" target="_blank" class="cv-link">📥 Tải xuống CV</a>
        </div>

        <!-- Thư xin việc -->
        <div v-if="selectedApplication.coverLetter" class="modal-section">
          <h3>✍️ Thư xin việc</h3>
          <p class="text-box">{{ selectedApplication.coverLetter }}</p>
        </div>

        <!-- Lịch phỏng vấn -->
        <div v-if="selectedApplication.interview?.status && selectedApplication.interview.status !== 'none'" class="modal-section">
          <h3>📅 Lịch phỏng vấn</h3>
          <div class="detail-grid">
            <div class="detail-item"><label>Trạng thái</label><span>{{ getInterviewStatusLabel(selectedApplication.interview.status) }}</span></div>
            <div class="detail-item"><label>Thời gian</label><span>{{ formatDateTime(selectedApplication.interview.scheduledAt) }}</span></div>
            <div class="detail-item"><label>Hình thức</label><span>{{ selectedApplication.interview.mode === 'online' ? 'Online' : 'Offline' }}</span></div>
            <div v-if="selectedApplication.interview.location" class="detail-item"><label>Địa điểm</label><span>{{ selectedApplication.interview.location }}</span></div>
          </div>
        </div>

        <!-- Ghi chú của employer -->
        <div class="modal-section">
          <h3>📝 Ghi chú của bạn</h3>
          <textarea
            v-model="modalNote"
            rows="4"
            placeholder="Thêm ghi chú về ứng viên này..."
            class="form-textarea"
          ></textarea>
        </div>

        <!-- Actions modal -->
        <div class="modal-actions">
          <button v-if="selectedApplication.status === 'pending'"   class="btn btn-secondary" @click="updateStatusWithNote(selectedApplication._id, 'reviewing')">👀 Đang xem xét</button>
          <button v-if="selectedApplication.status === 'reviewing'" class="btn btn-info" @click="updateStatusWithNote(selectedApplication._id, 'shortlisted')">📌 Shortlist</button>
          <button v-if="canScheduleInterview(selectedApplication)"  class="btn btn-info" @click="openInterviewModal(selectedApplication)">📅 Lên lịch PV</button>
          <button v-if="canSendOffer(selectedApplication)"          class="btn btn-success" @click="updateStatusWithNote(selectedApplication._id, 'offered')">🎁 Gửi offer</button>
          <button v-if="selectedApplication.status === 'offered'"   class="btn btn-success" @click="updateStatusWithNote(selectedApplication._id, 'hired')">✅ Tuyển chính thức</button>
          <button v-if="canCancelInterview(selectedApplication)"    class="btn btn-dark" @click="cancelInterview(selectedApplication)">🗑️ Hủy lịch PV</button>
          <button v-if="canReject(selectedApplication)"             class="btn btn-danger" @click="openRejectModal(selectedApplication)">❌ Từ chối</button>
          <button                                                    class="btn btn-warning" @click="openReportModal(selectedApplication)">🚨 Report</button>
          <button class="btn btn-primary" @click="saveNote(selectedApplication._id)">💾 Lưu ghi chú</button>
        </div>
      </div>
    </div>


    <!-- ============================================================
         MODAL 2: TỪ CHỐI ỨNG VIÊN
    ============================================================ -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-box" @click.stop>
        <button class="modal-close-btn" @click="closeRejectModal">✕</button>
        <h2 class="modal-title">❌ Từ chối ứng viên</h2>

        <div class="form-group">
          <label class="form-label">Lý do từ chối (không bắt buộc)</label>
          <textarea
            v-model="rejectNote"
            rows="5"
            maxlength="500"
            placeholder="VD: Kinh nghiệm chưa phù hợp với yêu cầu..."
            class="form-textarea"
          ></textarea>
          <small class="form-hint">{{ rejectNote.length }}/500 ký tự</small>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeRejectModal">Hủy</button>
          <button class="btn btn-danger" @click="confirmReject">❌ Xác nhận từ chối</button>
        </div>
      </div>
    </div>


    <!-- ============================================================
         MODAL 3: LÊN LỊCH PHỎNG VẤN
    ============================================================ -->
    <div v-if="showInterviewModal" class="modal-overlay" @click="closeInterviewModal">
      <div class="modal-box" @click.stop>
        <button class="modal-close-btn" @click="closeInterviewModal">✕</button>
        <h2 class="modal-title">📅 Lên lịch phỏng vấn</h2>

        <div class="form-group">
          <label class="form-label">Ứng viên</label>
          <input class="form-input" :value="interviewForm.candidateName" disabled />
        </div>
        <div class="form-group">
          <label class="form-label">Ngày giờ phỏng vấn</label>
          <input class="form-input" v-model="interviewForm.scheduledAt" type="datetime-local" />
        </div>
        <div class="form-group">
          <label class="form-label">Hình thức</label>
          <select class="form-input" v-model="interviewForm.mode">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div v-if="interviewForm.mode === 'offline'" class="form-group">
          <label class="form-label">Địa điểm</label>
          <input class="form-input" v-model="interviewForm.location" type="text" placeholder="Nhập địa điểm phỏng vấn" />
        </div>
        <div v-if="interviewForm.mode === 'online'" class="form-group">
          <label class="form-label">Link meeting</label>
          <input class="form-input" v-model="interviewForm.meetingLink" type="text" placeholder="Google Meet / Zoom link" />
        </div>
        <div class="form-group">
          <label class="form-label">Ghi chú</label>
          <textarea class="form-textarea" v-model="interviewForm.note" rows="4" placeholder="Ghi chú thêm..."></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeInterviewModal">Hủy</button>
          <button class="btn btn-primary" @click="scheduleInterview">Lưu lịch phỏng vấn</button>
        </div>
      </div>
    </div>


    <!-- ============================================================
         MODAL 4: REPORT ỨNG VIÊN
    ============================================================ -->
    <div v-if="showReportModal" class="modal-overlay" @click="closeReportModal">
      <div class="modal-box" @click.stop>
        <button class="modal-close-btn" @click="closeReportModal">✕</button>
        <h2 class="modal-title">🚨 Report ứng viên</h2>

        <!-- Tên ứng viên bị report -->
        <div v-if="reportingApp" class="report-target-box">
          <strong>{{ reportingApp.student?.fullName || 'Ứng viên' }}</strong>
          <p>{{ reportingApp.student?.email }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">Lý do report</label>
          <select class="form-input" v-model="reportForm.reason">
            <option value="">-- Chọn lý do --</option>
            <option value="spam">Spam</option>
            <option value="fake_information">Thông tin giả</option>
            <option value="fraud">Lừa đảo</option>
            <option value="harassment">Quấy rối</option>
            <option value="unprofessional_behavior">Hành vi thiếu chuyên nghiệp</option>
            <option value="inappropriate_content">Nội dung không phù hợp</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Mô tả chi tiết</label>
          <textarea class="form-textarea" v-model="reportForm.description" rows="5" maxlength="1000" placeholder="Mô tả rõ lý do report..."></textarea>
          <small class="form-hint">{{ reportForm.description.length }}/1000 ký tự</small>
        </div>
        <div class="form-group">
          <label class="form-label">Link bằng chứng (mỗi dòng 1 link, không bắt buộc)</label>
          <textarea class="form-textarea" v-model="reportEvidenceText" rows="3" placeholder="https://..."></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeReportModal">Hủy</button>
          <button class="btn btn-warning" @click="submitReport">🚨 Gửi report</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
// ── Import ──
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from '../components/Header.vue'
import api from '../services/api'

const route = useRoute()

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════

const loading      = ref(false)
const job          = ref(null)          // Thông tin job (nếu xem theo job)
const applications = ref([])            // Danh sách ứng viên
const filter       = ref('all')         // Bộ lọc trạng thái

// Modal 1: Chi tiết ứng viên
const selectedApplication = ref(null)
const modalNote            = ref('')

// Modal 2: Từ chối
const showRejectModal  = ref(false)
const rejectNote       = ref('')
const rejectingAppId   = ref(null)

// Modal 3: Lên lịch phỏng vấn
const showInterviewModal = ref(false)
const interviewForm = ref({
  applicationId: '',
  candidateName: '',
  scheduledAt:   '',
  mode:          'online',
  location:      '',
  meetingLink:   '',
  note:          '',
})

// Modal 4: Report ứng viên
const showReportModal    = ref(false)
const reportingApp       = ref(null)
const reportEvidenceText = ref('')
const reportForm = ref({ reason: '', description: '' })

// ════════════════════════════════════════
// COMPUTED
// ════════════════════════════════════════

// Có jobId trong URL không?
const hasJobId = computed(() => !!route.params.jobId)

// Tiêu đề trang thay đổi theo route
const pageTitle    = computed(() => hasJobId.value ? 'Quản lý ứng viên' : 'Tất cả ứng viên')
const pageSubtitle = computed(() => hasJobId.value ? 'Xem và xử lý đơn ứng tuyển cho tin này' : 'Tổng hợp tất cả ứng viên từ các tin của bạn')

// Đếm theo từng trạng thái
const pendingCount           = computed(() => applications.value.filter(a => a.status === 'pending').length)
const reviewingCount         = computed(() => applications.value.filter(a => a.status === 'reviewing').length)
const shortlistedCount       = computed(() => applications.value.filter(a => a.status === 'shortlisted').length)
const interviewingCount      = computed(() => applications.value.filter(a => a.status === 'interviewing').length)
const offeredCount           = computed(() => applications.value.filter(a => a.status === 'offered').length)
const hiredCount             = computed(() => applications.value.filter(a => a.status === 'hired').length)
const scheduledInterviewCount = computed(() => applications.value.filter(a => a.interview?.status === 'scheduled').length)

// Danh sách sau khi lọc
const filteredApplications = computed(() => {
  if (filter.value === 'all') return applications.value
  return applications.value.filter(a => a.status === filter.value)
})

// Cấu hình 8 thẻ thống kê – dùng v-for
const statCards = computed(() => [
  { icon: '📋', label: 'Tổng ứng viên',   value: applications.value.length, gradient: 'grad-purple' },
  { icon: '⏳', label: 'Chờ xử lý',        value: pendingCount.value,         gradient: 'grad-pink' },
  { icon: '👀', label: 'Đang xem xét',     value: reviewingCount.value,       gradient: 'grad-blue' },
  { icon: '📌', label: 'Shortlist',         value: shortlistedCount.value,     gradient: 'grad-indigo' },
  { icon: '🎤', label: 'Phỏng vấn',        value: interviewingCount.value,    gradient: 'grad-cyan' },
  { icon: '🎁', label: 'Đã gửi offer',     value: offeredCount.value,         gradient: 'grad-orange' },
  { icon: '✅', label: 'Đã tuyển',          value: hiredCount.value,           gradient: 'grad-green' },
  { icon: '📅', label: 'Đã lên lịch PV',  value: scheduledInterviewCount.value, gradient: 'grad-yellow' },
])

// Cấu hình tabs lọc
const filterTabs = [
  { value: 'all',         label: 'Tất cả' },
  { value: 'pending',     label: '⏳ Chờ xử lý' },
  { value: 'reviewing',   label: '👀 Đang xem xét' },
  { value: 'shortlisted', label: '📌 Shortlist' },
  { value: 'interviewing',label: '🎤 Phỏng vấn' },
  { value: 'offered',     label: '🎁 Offer' },
  { value: 'hired',       label: '✅ Đã tuyển' },
  { value: 'rejected',    label: '❌ Từ chối' },
]

// ════════════════════════════════════════
// HÀM KIỂM TRA ĐIỀU KIỆN HIỂN THỊ NÚT
// ════════════════════════════════════════
// Tách ra hàm riêng để template gọn hơn và dễ giải thích

function canScheduleInterview(app) {
  const allowedStatuses = ['pending', 'reviewing', 'shortlisted', 'interviewing']
  return allowedStatuses.includes(app.status)
}

function canSendOffer(app) {
  return app.status === 'shortlisted' || app.status === 'interviewing'
}

function canCancelInterview(app) {
  return app.interview?.status && app.interview.status !== 'none' && app.interview.status !== 'cancelled'
}

function canReject(app) {
  return app.status !== 'rejected' && app.status !== 'hired'
}

// ════════════════════════════════════════
// HÀM TIỆN ÍCH
// ════════════════════════════════════════

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase()
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}

function formatDateTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('vi-VN')
}

function formatNumber(num) {
  return num ? new Intl.NumberFormat('vi-VN').format(num) : '0'
}

function truncateText(text, max = 200) {
  if (!text) return ''
  return text.length <= max ? text : text.slice(0, max) + '...'
}

function getStatusLabel(status) {
  const labels = {
    pending:     '⏳ Chờ xử lý',
    reviewing:   '👀 Đang xem xét',
    shortlisted: '📌 Shortlist',
    interviewing:'🎤 Phỏng vấn',
    offered:     '🎁 Đã gửi offer',
    hired:       '✅ Đã tuyển',
    rejected:    '❌ Đã từ chối',
    withdrawn:   '↩️ Đã rút đơn',
  }
  return labels[status] || status
}

function getInterviewStatusLabel(status) {
  const map = {
    none:      'Chưa có lịch',
    scheduled: 'Đã lên lịch',
    accepted:  'Ứng viên đã xác nhận',
    declined:  'Ứng viên từ chối',
    cancelled: 'Đã hủy',
    completed: 'Đã hoàn thành',
  }
  return map[status] || status
}

function getEmptyMessage() {
  const messages = {
    all:         'Chưa có ứng viên nào',
    pending:     'Không có ứng viên chờ xử lý',
    reviewing:   'Không có ứng viên đang xem xét',
    shortlisted: 'Không có ứng viên shortlisted',
    interviewing:'Không có ứng viên đang phỏng vấn',
    offered:     'Chưa gửi offer cho ai',
    hired:       'Chưa tuyển ứng viên nào',
    rejected:    'Chưa từ chối ai',
  }
  return messages[filter.value] || 'Không có dữ liệu'
}

function getJobTypeLabel(type) {
  const map = { 'full-time':'Toàn thời gian','part-time':'Bán thời gian',internship:'Thực tập',contract:'Hợp đồng',freelance:'Freelance' }
  return map[type] || type || '—'
}

function getResumeUrl(app) {
  return app?.resumeUrl || app?.student?.resumeUrl || app?.cv?.url || ''
}

function getFullUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const origin = (api.defaults.baseURL || '').replace(/\/api\/?$/, '')
  return `${origin}${url}`
}

// ════════════════════════════════════════
// HÀM GỌI API – LOAD DỮ LIỆU
// ════════════════════════════════════════

async function fetchPageData() {
  try {
    loading.value = true
    if (hasJobId.value) {
      // Xem ứng viên của 1 job cụ thể
      await Promise.all([fetchJobDetails(), fetchApplicationsByJob()])
    } else {
      // Xem tất cả ứng viên
      job.value = null
      await fetchAllApplications()
    }
  } catch (error) {
    console.error('Error fetching page:', error)
    alert(error.response?.data?.message || 'Không thể tải danh sách ứng viên')
  } finally {
    loading.value = false
  }
}

async function fetchJobDetails() {
  try {
    const res = await api.get(`/jobs/${route.params.jobId}`)
    job.value = res.data?.job || null
  } catch (error) {
    job.value = null
  }
}

async function fetchApplicationsByJob() {
  const params = {}
  if (filter.value !== 'all') params.status = filter.value
  const res = await api.get(`/applications/job/${route.params.jobId}`, { params })
  applications.value = res.data?.applications || []
}

async function fetchAllApplications() {
  const params = { sort: '-createdAt' }
  if (filter.value !== 'all') params.status = filter.value
  const res = await api.get('/applications/employer', { params })
  applications.value = res.data?.applications || []
}

async function changeFilter(newFilter) {
  filter.value = newFilter
  await fetchPageData()
}

// ════════════════════════════════════════
// HÀM QUẢN LÝ MODAL & HÀNH ĐỘNG
// ════════════════════════════════════════

async function openDetailModal(app) {
  try {
    const res = await api.get(`/applications/${app._id}`)
    selectedApplication.value = res.data?.application || app
  } catch {
    selectedApplication.value = app
  }
  modalNote.value = selectedApplication.value?.employerNote || ''
}

function closeModal() {
  selectedApplication.value = null
  modalNote.value = ''
}

async function refreshSelected(appId) {
  try {
    const res = await api.get(`/applications/${appId}`)
    selectedApplication.value = res.data?.application || null
    modalNote.value = selectedApplication.value?.employerNote || ''
  } catch (e) { }
}

// Cập nhật trạng thái ứng viên
async function updateStatus(appId, status, note = undefined) {
  const actionMap = {
    reviewing:   'đánh dấu đang xem xét',
    shortlisted: 'shortlist ứng viên',
    offered:     'gửi offer',
    hired:       'tuyển chính thức',
    rejected:    'từ chối ứng viên',
  }
  if (!confirm(`Xác nhận ${actionMap[status] || 'cập nhật trạng thái'}?`)) return
  try {
    const payload = { status }
    if (typeof note === 'string') payload.employerNote = note
    await api.put(`/applications/${appId}/status`, payload)
    alert('✅ Cập nhật trạng thái thành công!')
    await fetchPageData()
    if (selectedApplication.value?._id === appId) await refreshSelected(appId)
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể cập nhật trạng thái')
  }
}

// Cập nhật trạng thái kèm ghi chú từ modal
async function updateStatusWithNote(appId, status) {
  await updateStatus(appId, status, modalNote.value)
}

// Lưu ghi chú employer
async function saveNote(appId) {
  try {
    await api.put(`/applications/${appId}/note`, { employerNote: modalNote.value })
    alert('✅ Đã lưu ghi chú!')
    await fetchPageData()
    if (selectedApplication.value?._id === appId) await refreshSelected(appId)
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể lưu ghi chú')
  }
}

// Modal từ chối
function openRejectModal(app) {
  rejectingAppId.value = app._id
  rejectNote.value = (selectedApplication.value?._id === app._id ? modalNote.value : app.employerNote) || ''
  showRejectModal.value = true
}
function closeRejectModal() { showRejectModal.value = false; rejectNote.value = ''; rejectingAppId.value = null }
async function confirmReject() {
  if (!rejectingAppId.value) return
  await updateStatus(rejectingAppId.value, 'rejected', rejectNote.value)
  alert('Ứng viên đã bị từ chối. Nếu đã có lịch phỏng vấn, hệ thống đã tự động hủy lịch đó.')
  closeRejectModal()
}

// Modal lên lịch phỏng vấn
function openInterviewModal(app) {
  if (!canScheduleInterview(app)) {
    alert('Không thể lên lịch phỏng vấn cho ứng viên đã bị từ chối, đã rút đơn hoặc đã tuyển')
    return
  }

  interviewForm.value = {
    applicationId: app._id,
    candidateName: app.student?.fullName || '',
    scheduledAt: '',
    mode: app.interview?.mode || 'online',
    location: app.interview?.location || '',
    meetingLink: app.interview?.meetingLink || '',
    note: app.interview?.note || '',
  }

  showInterviewModal.value = true
}

function closeInterviewModal() {
  showInterviewModal.value = false
  interviewForm.value = { applicationId: '', candidateName: '', scheduledAt: '', mode: 'online', location: '', meetingLink: '', note: '' }
}

async function scheduleInterview() {
  try {
    const { applicationId, scheduledAt, mode, location, meetingLink, note } = interviewForm.value

    const currentApp =
      applications.value.find(app => app._id === applicationId) ||
      (selectedApplication.value?._id === applicationId ? selectedApplication.value : null)

    if (currentApp && !canScheduleInterview(currentApp)) {
      alert('Không thể lên lịch phỏng vấn cho ứng viên này')
      closeInterviewModal()
      return
    }

    await api.put(`/applications/${applicationId}/interview/schedule`, {
      scheduledAt,
      mode,
      location,
      meetingLink,
      note,
    })

    alert('✅ Đã lên lịch phỏng vấn!')
    const id = applicationId
    closeInterviewModal()
    await fetchPageData()
    if (selectedApplication.value?._id === id) await refreshSelected(id)
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể lên lịch phỏng vấn')
  }
}

async function cancelInterview(app) {
  if (!confirm('Bạn có chắc muốn hủy lịch phỏng vấn?')) return
  try {
    await api.put(`/applications/${app._id}/interview/cancel`)
    alert('✅ Đã hủy lịch phỏng vấn!')
    await fetchPageData()
    if (selectedApplication.value?._id === app._id) await refreshSelected(app._id)
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể hủy lịch')
  }
}

// Modal report ứng viên
function openReportModal(app) {
  reportingApp.value = app
  reportForm.value = { reason: '', description: '' }
  reportEvidenceText.value = ''
  showReportModal.value = true
}
function closeReportModal() { showReportModal.value = false; reportingApp.value = null }
async function submitReport() {
  if (!reportForm.value.reason)           { alert('Vui lòng chọn lý do report'); return }
  if (!reportForm.value.description.trim()) { alert('Vui lòng nhập mô tả'); return }
  try {
    const evidenceUrls = reportEvidenceText.value.split('\n').map(s => s.trim()).filter(Boolean)
    await api.post('/reports/employer/candidate', {
      applicationId: reportingApp.value._id,
      reason:        reportForm.value.reason,
      description:   reportForm.value.description.trim(),
      evidenceUrls,
    })
    alert('✅ Đã gửi report thành công!')
    closeReportModal()
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể gửi report')
  }
}

// ── Tải lại khi jobId trên URL thay đổi ──
onMounted(() => { fetchPageData() })
watch(() => route.params.jobId, () => { fetchPageData() })
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

.page-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 16px; margin-bottom: 20px;
}

.page-header h1 { font-size: 24px; font-weight: 700; color: #2c3e50; margin-bottom: 4px; }
.page-sub { font-size: 14px; color: #888; }

/* Job banner */
.job-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; padding: 22px 28px; border-radius: 12px; margin-bottom: 20px;
  display: flex; justify-content: space-between; align-items: center; gap: 16px;
}

.job-banner h2 { font-size: 20px; margin-bottom: 4px; }
.job-banner p  { opacity: 0.9; font-size: 14px; }
.job-banner-stats { display: flex; gap: 20px; font-size: 14px; white-space: nowrap; }

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: white; border-radius: 12px; padding: 16px;
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05); transition: transform 0.15s;
}

.stat-card:hover { transform: translateY(-2px); }

.stat-icon {
  width: 44px; height: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: white; flex-shrink: 0;
}

.grad-purple { background: linear-gradient(135deg,#667eea,#764ba2); }
.grad-pink   { background: linear-gradient(135deg,#f093fb,#f5576c); }
.grad-blue   { background: linear-gradient(135deg,#4facfe,#00f2fe); }
.grad-indigo { background: linear-gradient(135deg,#8b5cf6,#7c3aed); }
.grad-cyan   { background: linear-gradient(135deg,#06b6d4,#0284c7); }
.grad-orange { background: linear-gradient(135deg,#fb923c,#f97316); }
.grad-green  { background: linear-gradient(135deg,#43e97b,#38f9d7); }
.grad-yellow { background: linear-gradient(135deg,#f59e0b,#facc15); }

.stat-info h3 { font-size: 22px; font-weight: 700; color: #1f2937; margin-bottom: 2px; }
.stat-info p  { font-size: 11px; color: #888; }

/* Filter bar */
.filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }

.filter-btn {
  padding: 8px 16px; border: none; border-radius: 99px; background: white; color: #555;
  font-weight: 600; font-size: 13px; cursor: pointer; font-family: inherit;
  box-shadow: 0 2px 8px rgba(0,0,0,.06); transition: all 0.15s;
}

.filter-btn.active { background: #2563eb; color: white; }

/* Loading / Empty */
.loading-state { text-align: center; padding: 60px; color: #999; }

.spinner {
  width: 36px; height: 36px; border: 4px solid #e0e0e0; border-top-color: #667eea;
  border-radius: 50%; margin: 0 auto 16px; animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; color: #bbb; }
.empty-icon  { font-size: 36px; margin-bottom: 10px; }

/* Application card */
.app-list { display: flex; flex-direction: column; gap: 14px; }

.app-card {
  background: white; border-radius: 14px; padding: 22px 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,.06); border: 1.5px solid transparent;
  transition: all 0.15s;
}

.app-card:hover { border-color: #667eea; }

/* Header card */
.app-card-head {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px;
}

.candidate-row { display: flex; gap: 14px; align-items: center; }

.avatar {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 18px; flex-shrink: 0;
}

.candidate-info h3 { font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 3px; }
.candidate-info p  { font-size: 13px; color: #6b7280; margin-bottom: 2px; }

.head-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }

/* Status badges */
.status-badge, .interview-chip {
  display: inline-block; padding: 5px 12px; border-radius: 99px;
  font-size: 12px; font-weight: 700; white-space: nowrap;
}

.status-pending     { background: #fff7ed; color: #c2410c; }
.status-reviewing   { background: #eff6ff; color: #1d4ed8; }
.status-shortlisted { background: #ede9fe; color: #6d28d9; }
.status-interviewing{ background: #e0f2fe; color: #075985; }
.status-offered     { background: #fff7ed; color: #c2410c; }
.status-hired       { background: #ecfdf5; color: #047857; }
.status-rejected    { background: #fef2f2; color: #b91c1c; }
.status-withdrawn   { background: #f3f4f6; color: #4b5563; }

.iv-scheduled  { background: #ede9fe; color: #6d28d9; }
.iv-accepted   { background: #ecfdf5; color: #047857; }
.iv-declined   { background: #fff7ed; color: #c2410c; }
.iv-cancelled  { background: #f3f4f6; color: #4b5563; }
.iv-completed  { background: #e0f2fe; color: #0369a1; }

/* App info grid */
.app-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.info-item { background: #f8fafc; border-radius: 8px; padding: 10px 12px; font-size: 13px; }
.info-label { display: block; color: #888; font-size: 11px; margin-bottom: 3px; }

/* Thư xin việc, ghi chú, lịch PV */
.cover-letter-preview { background: #f8f9fa; border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; font-size: 13px; }
.cover-letter-preview strong { display: block; margin-bottom: 4px; }
.cover-letter-preview p { color: #555; line-height: 1.6; margin: 0; }

.employer-note-box { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; font-size: 13px; }
.employer-note-box p { color: #92400e; margin-top: 4px; }

.interview-box { background: #eef6ff; border: 1px solid #cfe3ff; border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; font-size: 13px; }
.interview-box p { color: #374151; margin: 4px 0; }
.interview-box a { color: #2563eb; }

/* Nút hành động trong card */
.app-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; padding-top: 14px; border-top: 1px solid #f0f0f0; }

.btn-action {
  padding: 8px 14px; border: none; border-radius: 8px;
  font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: none;
  display: inline-flex; align-items: center; font-family: inherit;
  background: #e5e7eb; color: #1f2937; transition: all 0.15s;
}

.btn-action:hover { transform: translateY(-1px); }
.btn-action.btn-primary { background: #2563eb; color: white; }
.btn-action.btn-success { background: #10b981; color: white; }
.btn-action.btn-danger  { background: #ef4444; color: white; }
.btn-action.btn-warning { background: #f59e0b; color: white; }
.btn-action.btn-info    { background: #3b82f6; color: white; }
.btn-action.btn-dark    { background: #374151; color: white; }

/* ════════════════════════════════════
   MODAL CHUNG
════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
  padding: 20px; z-index: 200; backdrop-filter: blur(3px);
  animation: fadeIn 0.2s ease;
}

.modal-box {
  background: white; border-radius: 16px; padding: 28px;
  max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;
  position: relative; box-shadow: 0 20px 60px rgba(0,0,0,.15); animation: slideUp 0.22s ease;
}

.modal-lg { max-width: 960px; }

@keyframes fadeIn  { from{opacity:0;} to{opacity:1;} }
@keyframes slideUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:none;} }

.modal-close-btn {
  position: absolute; top: 16px; right: 16px;
  width: 30px; height: 30px; border-radius: 8px; background: #f0f0f0;
  border: none; cursor: pointer; font-size: 15px; color: #666;
  display: flex; align-items: center; justify-content: center;
}

.modal-close-btn:hover { background: #e0e0e0; }
.modal-title { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 18px; }

.modal-section { margin-top: 18px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
.modal-section h3 { font-size: 15px; font-weight: 700; color: #1f2937; margin-bottom: 12px; }

/* Lưới thông tin 2 cột trong modal */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.detail-item { background: #f8fafc; border-radius: 8px; padding: 10px 12px; }
.detail-item label { display: block; font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
.detail-item span  { font-size: 14px; font-weight: 500; color: #1f2937; }

.text-box { background: #f8fafc; border-radius: 8px; padding: 14px; font-size: 13px; color: #374151; line-height: 1.7; white-space: pre-line; }

.cv-link { display: inline-block; padding: 10px 16px; background: #eff6ff; color: #1d4ed8; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px; }

/* Form elements trong modal */
.form-group { margin-bottom: 14px; }
.form-label { display: block; font-size: 13px; font-weight: 600; color: #555; margin-bottom: 6px; }
.form-hint  { font-size: 12px; color: #aaa; margin-top: 4px; display: block; }

.form-input, .form-textarea {
  width: 100%; padding: 10px 14px; border: 1.5px solid #e0e0e0; border-radius: 8px;
  font-size: 14px; font-family: inherit; outline: none; box-sizing: border-box; transition: border-color 0.15s;
}

.form-input:focus, .form-textarea:focus { border-color: #667eea; }
.form-textarea { resize: vertical; }

.report-target-box { background: #f8fafc; padding: 14px; border-radius: 8px; margin-bottom: 14px; }
.report-target-box strong { font-size: 15px; color: #1f2937; }
.report-target-box p { font-size: 13px; color: #888; margin-top: 4px; }

.modal-actions {
  display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end;
  margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f0f0;
}

/* Buttons trong modal */
.btn {
  padding: 9px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
  display: inline-flex; align-items: center; gap: 4px;
}

.btn:hover { transform: translateY(-1px); }
.btn-primary  { background: #2563eb; color: white; }
.btn-secondary{ background: #e5e7eb; color: #1f2937; }
.btn-success  { background: #10b981; color: white; }
.btn-danger   { background: #ef4444; color: white; }
.btn-warning  { background: #f59e0b; color: white; }
.btn-info     { background: #3b82f6; color: white; }
.btn-dark     { background: #374151; color: white; }

/* ════════════════════════════════════
   RESPONSIVE
════════════════════════════════════ */
@media (max-width: 1400px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 768px)  {
  .container { padding: 20px 16px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .page-header { flex-direction: column; }
  .job-banner  { flex-direction: column; }
  .app-card-head { flex-direction: column; }
  .head-badges { align-items: flex-start; }
}
</style>