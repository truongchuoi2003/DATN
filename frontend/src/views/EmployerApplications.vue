<template>
  <div class="employer-applications">
    <Header />

    <div class="container">
      <div class="page-header">
        <div>
          <h1>{{ pageTitle }}</h1>
          <p class="subtitle">{{ pageSubtitle }}</p>
        </div>
        <button @click="$router.go(-1)" class="btn btn-secondary">
          ← Quay lại
        </button>
      </div>

      <div v-if="job" class="job-info-card">
        <div class="job-header">
          <div>
            <h2>{{ job.title }}</h2>
            <p>
              {{ job?.location?.city || job?.location || 'Chưa cập nhật địa điểm' }}
              • {{ getJobTypeLabel(job.jobType) }}
            </p>
          </div>
          <div class="job-stats-inline">
            <span>👁️ {{ job.views || 0 }} lượt xem</span>
            <span>👥 {{ job.applicationsCount || 0 }} ứng viên</span>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon gradient-purple">📋</div>
          <div class="stat-info">
            <h3>{{ applications.length }}</h3>
            <p>Tổng ứng viên</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon gradient-pink">⏳</div>
          <div class="stat-info">
            <h3>{{ pendingCount }}</h3>
            <p>Chờ xử lý</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon gradient-blue">👀</div>
          <div class="stat-info">
            <h3>{{ reviewingCount }}</h3>
            <p>Đang xem xét</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon gradient-indigo">📌</div>
          <div class="stat-info">
            <h3>{{ shortlistedCount }}</h3>
            <p>Shortlist</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon gradient-cyan">🎤</div>
          <div class="stat-info">
            <h3>{{ interviewingCount }}</h3>
            <p>Phỏng vấn</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon gradient-orange">🎁</div>
          <div class="stat-info">
            <h3>{{ offeredCount }}</h3>
            <p>Đã gửi offer</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon gradient-green">✅</div>
          <div class="stat-info">
            <h3>{{ hiredCount }}</h3>
            <p>Đã tuyển</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon gradient-yellow">📅</div>
          <div class="stat-info">
            <h3>{{ scheduledInterviewCount }}</h3>
            <p>Đã lên lịch PV</p>
          </div>
        </div>
      </div>

      <div class="filter-tabs">
        <button :class="{ active: filter === 'all' }" @click="changeFilter('all')">
          📋 Tất cả
        </button>
        <button :class="{ active: filter === 'pending' }" @click="changeFilter('pending')">
          ⏳ Chờ xử lý
        </button>
        <button :class="{ active: filter === 'reviewing' }" @click="changeFilter('reviewing')">
          👀 Đang xem xét
        </button>
        <button :class="{ active: filter === 'shortlisted' }" @click="changeFilter('shortlisted')">
          📌 Shortlist
        </button>
        <button :class="{ active: filter === 'interviewing' }" @click="changeFilter('interviewing')">
          🎤 Phỏng vấn
        </button>
        <button :class="{ active: filter === 'offered' }" @click="changeFilter('offered')">
          🎁 Offer
        </button>
        <button :class="{ active: filter === 'hired' }" @click="changeFilter('hired')">
          ✅ Đã tuyển
        </button>
        <button :class="{ active: filter === 'rejected' }" @click="changeFilter('rejected')">
          ❌ Đã từ chối
        </button>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <div v-else class="applications-list">
        <div v-if="filteredApplications.length === 0" class="empty-state">
          <p>📭 {{ getEmptyMessage() }}</p>
        </div>

        <div v-else class="application-cards">
          <div
            v-for="app in filteredApplications"
            :key="app._id"
            class="application-card"
          >
            <div class="card-header">
              <div class="candidate-info">
                <div class="avatar">
                  {{ getInitials(app.student?.fullName) }}
                </div>
                <div class="candidate-details">
                  <h3>{{ app.student?.fullName || 'Ứng viên' }}</h3>
                  <p class="contact">📧 {{ app.student?.email || 'Chưa có email' }}</p>
                  <p class="contact" v-if="app.student?.phone">
                    📱 {{ app.student.phone }}
                  </p>
                </div>
              </div>

              <div class="header-right">
                <div class="status-badge" :class="app.status">
                  {{ getStatusLabel(app.status) }}
                </div>

                <div
                  v-if="app.interview && app.interview.status && app.interview.status !== 'none'"
                  class="interview-status-chip"
                  :class="app.interview.status"
                >
                  {{ getInterviewStatusLabel(app.interview.status) }}
                </div>
              </div>
            </div>

            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">📅 Ngày ứng tuyển:</span>
                  <span class="value">{{ formatDate(app.createdAt || app.appliedAt) }}</span>
                </div>

                <div class="info-item" v-if="app.expectedSalary">
                  <span class="label">💵 Lương mong muốn:</span>
                  <span class="value">{{ formatNumber(app.expectedSalary) }} VND</span>
                </div>

                <div class="info-item" v-if="app.availableFrom">
                  <span class="label">🗓️ Có thể bắt đầu:</span>
                  <span class="value">{{ formatDate(app.availableFrom) }}</span>
                </div>

                <div class="info-item" v-if="app.student?.university">
                  <span class="label">🏫 Trường:</span>
                  <span class="value">{{ app.student.university }}</span>
                </div>

                <div class="info-item" v-if="app.student?.major">
                  <span class="label">📚 Ngành:</span>
                  <span class="value">{{ app.student.major }}</span>
                </div>

                <div class="info-item" v-if="app.student?.gpa">
                  <span class="label">📊 GPA:</span>
                  <span class="value">{{ app.student.gpa }}</span>
                </div>
              </div>

              <div class="cover-letter" v-if="app.coverLetter">
                <strong>✍️ Thư xin việc:</strong>
                <p>{{ truncateText(app.coverLetter, 200) }}</p>
              </div>

              <div class="employer-note" v-if="app.employerNote">
                <strong>💬 Ghi chú của bạn:</strong>
                <p>{{ app.employerNote }}</p>
              </div>

              <div
                v-if="app.interview && app.interview.status && app.interview.status !== 'none'"
                class="interview-box"
              >
                <strong>📅 Lịch phỏng vấn:</strong>
                <p><b>Trạng thái:</b> {{ getInterviewStatusLabel(app.interview.status) }}</p>
                <p><b>Thời gian:</b> {{ formatDateTime(app.interview.scheduledAt) }}</p>
                <p>
                  <b>Hình thức:</b>
                  {{ app.interview.mode === 'online' ? 'Online' : 'Offline' }}
                </p>
                <p v-if="app.interview.location"><b>Địa điểm:</b> {{ app.interview.location }}</p>
                <p v-if="app.interview.meetingLink">
                  <b>Link:</b>
                  <a :href="app.interview.meetingLink" target="_blank">
                    {{ app.interview.meetingLink }}
                  </a>
                </p>
                <p v-if="app.interview.note"><b>Ghi chú:</b> {{ app.interview.note }}</p>
              </div>
            </div>

            <div class="card-footer">
              <button @click="viewApplication(app)" class="btn-action primary">
                👁️ Xem chi tiết
              </button>

              <a
                v-if="getResumeUrl(app)"
                :href="getFullUrl(getResumeUrl(app))"
                target="_blank"
                class="btn-action"
              >
                📥 Tải CV
              </a>

              <button
                v-if="app.status === 'pending'"
                @click="updateStatus(app._id, 'reviewing')"
                class="btn-action"
              >
                👀 Đánh dấu đang xem
              </button>

              <button
                v-if="app.status === 'reviewing'"
                @click="updateStatus(app._id, 'shortlisted')"
                class="btn-action info"
              >
                📌 Shortlist
              </button>

              <button
                v-if="app.status !== 'rejected' && app.status !== 'withdrawn' && app.status !== 'hired'"
                @click="openInterviewModal(app)"
                class="btn-action info"
              >
                📅 Lên lịch PV
              </button>

              <button
                v-if="app.status === 'shortlisted' || app.status === 'interviewing'"
                @click="updateStatus(app._id, 'offered')"
                class="btn-action success"
              >
                🎁 Gửi offer
              </button>

              <button
                v-if="app.status === 'offered'"
                @click="updateStatus(app._id, 'hired')"
                class="btn-action success"
              >
                ✅ Tuyển chính thức
              </button>

              <button
                v-if="app.interview && app.interview.status !== 'none' && app.interview.status !== 'cancelled'"
                @click="cancelInterview(app)"
                class="btn-action dark"
              >
                🗑️ Hủy lịch PV
              </button>

              <button
                v-if="app.status !== 'rejected' && app.status !== 'hired'"
                @click="openRejectModal(app)"
                class="btn-action danger"
              >
                ❌ Từ chối
              </button>

              <button
                @click="openReportModal(app)"
                class="btn-action warning"
              >
                🚨 Report ứng viên
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedApplication" class="modal" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <button class="btn-close" @click="closeModal">✕</button>

        <h2>👤 Chi tiết ứng viên</h2>

        <div class="modal-section">
          <h3>🧑 Thông tin ứng viên</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Họ tên:</span>
              <span class="value">{{ selectedApplication.student?.fullName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Email:</span>
              <span class="value">{{ selectedApplication.student?.email }}</span>
            </div>
            <div class="detail-item" v-if="selectedApplication.student?.phone">
              <span class="label">Số điện thoại:</span>
              <span class="value">{{ selectedApplication.student.phone }}</span>
            </div>
            <div class="detail-item" v-if="selectedApplication.student?.university">
              <span class="label">Trường:</span>
              <span class="value">{{ selectedApplication.student.university }}</span>
            </div>
            <div class="detail-item" v-if="selectedApplication.student?.major">
              <span class="label">Ngành học:</span>
              <span class="value">{{ selectedApplication.student.major }}</span>
            </div>
            <div class="detail-item" v-if="selectedApplication.student?.gpa">
              <span class="label">GPA:</span>
              <span class="value">{{ selectedApplication.student.gpa }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Trạng thái:</span>
              <span class="status-badge" :class="selectedApplication.status">
                {{ getStatusLabel(selectedApplication.status) }}
              </span>
            </div>
          </div>
        </div>

        <div class="modal-section">
          <h3>📋 Thông tin ứng tuyển</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Ngày ứng tuyển:</span>
              <span class="value">{{ formatDateTime(selectedApplication.createdAt || selectedApplication.appliedAt) }}</span>
            </div>
            <div class="detail-item" v-if="selectedApplication.expectedSalary">
              <span class="label">Mức lương mong muốn:</span>
              <span class="value">{{ formatNumber(selectedApplication.expectedSalary) }} VND/tháng</span>
            </div>
            <div class="detail-item" v-if="selectedApplication.availableFrom">
              <span class="label">Có thể bắt đầu từ:</span>
              <span class="value">{{ formatDate(selectedApplication.availableFrom) }}</span>
            </div>
            <div class="detail-item" v-if="selectedApplication.reviewedAt">
              <span class="label">Ngày xem xét:</span>
              <span class="value">{{ formatDateTime(selectedApplication.reviewedAt) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-section" v-if="getResumeUrl(selectedApplication)">
          <h3>📄 CV</h3>
          <a
            :href="getFullUrl(getResumeUrl(selectedApplication))"
            target="_blank"
            class="cv-link"
          >
            📥 Tải xuống CV
          </a>
        </div>

        <div class="modal-section" v-if="selectedApplication.coverLetter">
          <h3>✍️ Thư xin việc</h3>
          <p class="text-content">{{ selectedApplication.coverLetter }}</p>
        </div>

        <div class="modal-section" v-if="selectedApplication.additionalInfo">
          <h3>💬 Thông tin bổ sung</h3>
          <p class="text-content">{{ selectedApplication.additionalInfo }}</p>
        </div>

        <div
          class="modal-section"
          v-if="selectedApplication.interview && selectedApplication.interview.status && selectedApplication.interview.status !== 'none'"
        >
          <h3>📅 Lịch phỏng vấn</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Trạng thái:</span>
              <span class="value">{{ getInterviewStatusLabel(selectedApplication.interview.status) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Thời gian:</span>
              <span class="value">{{ formatDateTime(selectedApplication.interview.scheduledAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Hình thức:</span>
              <span class="value">
                {{ selectedApplication.interview.mode === 'online' ? 'Online' : 'Offline' }}
              </span>
            </div>
            <div class="detail-item" v-if="selectedApplication.interview.location">
              <span class="label">Địa điểm:</span>
              <span class="value">{{ selectedApplication.interview.location }}</span>
            </div>
            <div class="detail-item" v-if="selectedApplication.interview.meetingLink">
              <span class="label">Link meeting:</span>
              <span class="value">
                <a :href="selectedApplication.interview.meetingLink" target="_blank">
                  {{ selectedApplication.interview.meetingLink }}
                </a>
              </span>
            </div>
          </div>
          <p v-if="selectedApplication.interview.note" class="text-content">
            {{ selectedApplication.interview.note }}
          </p>
        </div>

        <div class="modal-section">
          <h3>📝 Ghi chú của bạn</h3>
          <textarea
            v-model="modalEmployerNote"
            placeholder="Thêm ghi chú về ứng viên này..."
            rows="4"
            class="note-textarea"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button
            v-if="selectedApplication.status === 'pending'"
            @click="updateStatusWithNote(selectedApplication._id, 'reviewing')"
            class="btn btn-secondary"
          >
            👀 Đang xem xét
          </button>

          <button
            v-if="selectedApplication.status === 'reviewing'"
            @click="updateStatusWithNote(selectedApplication._id, 'shortlisted')"
            class="btn btn-info"
          >
            📌 Shortlist
          </button>

          <button
            @click="openInterviewModal(selectedApplication)"
            class="btn btn-info"
            v-if="selectedApplication.status !== 'rejected' && selectedApplication.status !== 'withdrawn' && selectedApplication.status !== 'hired'"
          >
            📅 Lên lịch PV
          </button>

          <button
            v-if="selectedApplication.status === 'shortlisted' || selectedApplication.status === 'interviewing'"
            @click="updateStatusWithNote(selectedApplication._id, 'offered')"
            class="btn btn-success"
          >
            🎁 Gửi offer
          </button>

          <button
            v-if="selectedApplication.status === 'offered'"
            @click="updateStatusWithNote(selectedApplication._id, 'hired')"
            class="btn btn-success"
          >
            ✅ Tuyển chính thức
          </button>

          <button
            v-if="selectedApplication.interview && selectedApplication.interview.status !== 'none' && selectedApplication.interview.status !== 'cancelled'"
            @click="cancelInterview(selectedApplication)"
            class="btn btn-dark"
          >
            🗑️ Hủy lịch PV
          </button>

          <button
            v-if="selectedApplication.status !== 'rejected' && selectedApplication.status !== 'hired'"
            @click="openRejectModal(selectedApplication)"
            class="btn btn-danger"
          >
            ❌ Từ chối
          </button>

          <button
            @click="openReportModal(selectedApplication)"
            class="btn btn-warning"
          >
            🚨 Report ứng viên
          </button>

          <button
            @click="saveNote(selectedApplication._id)"
            class="btn btn-primary"
          >
            💾 Lưu ghi chú
          </button>
        </div>
      </div>
    </div>

    <div v-if="showRejectModal" class="modal" @click="closeRejectModal">
      <div class="modal-content" @click.stop>
        <button class="btn-close" @click="closeRejectModal">✕</button>

        <h2>❌ Từ chối ứng viên</h2>

        <div class="form-group">
          <label>Lý do từ chối (không bắt buộc):</label>
          <textarea
            v-model="rejectNote"
            placeholder="Ví dụ: Kinh nghiệm chưa phù hợp với yêu cầu công việc..."
            rows="5"
            maxlength="500"
          ></textarea>
          <small class="help-text">{{ rejectNote.length }}/500 ký tự</small>
        </div>

        <div class="modal-actions">
          <button @click="closeRejectModal" class="btn btn-secondary">
            Hủy
          </button>
          <button @click="confirmReject" class="btn btn-danger">
            ❌ Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>

    <div v-if="showInterviewModal" class="modal" @click="closeInterviewModal">
      <div class="modal-content" @click.stop>
        <button class="btn-close" @click="closeInterviewModal">✕</button>
        <h2>📅 Lên lịch phỏng vấn</h2>

        <div class="form-group">
          <label>Ứng viên</label>
          <input :value="interviewForm.candidateName" disabled />
        </div>

        <div class="form-group">
          <label>Ngày giờ phỏng vấn</label>
          <input v-model="interviewForm.scheduledAt" type="datetime-local" />
        </div>

        <div class="form-group">
          <label>Hình thức</label>
          <select v-model="interviewForm.mode">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <div class="form-group" v-if="interviewForm.mode === 'offline'">
          <label>Địa điểm</label>
          <input
            v-model="interviewForm.location"
            type="text"
            placeholder="Nhập địa điểm phỏng vấn"
          />
        </div>

        <div class="form-group" v-if="interviewForm.mode === 'online'">
          <label>Link meeting</label>
          <input
            v-model="interviewForm.meetingLink"
            type="text"
            placeholder="Nhập link Google Meet / Zoom"
          />
        </div>

        <div class="form-group">
          <label>Ghi chú</label>
          <textarea
            v-model="interviewForm.note"
            rows="4"
            placeholder="Nhập ghi chú thêm"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeInterviewModal">Hủy</button>
          <button class="btn btn-primary" @click="scheduleInterview">Lưu lịch phỏng vấn</button>
        </div>
      </div>
    </div>

    <div v-if="showReportModal" class="modal" @click="closeReportModal">
      <div class="modal-content" @click.stop>
        <button class="btn-close" @click="closeReportModal">✕</button>

        <h2>🚨 Report ứng viên</h2>

        <div class="form-group" v-if="reportingApplication">
          <label>Ứng viên bị report:</label>
          <div class="report-target-box">
            <strong>{{ reportingApplication.student?.fullName || 'Ứng viên' }}</strong>
            <p>{{ reportingApplication.student?.email || '' }}</p>
          </div>
        </div>

        <div class="form-group">
          <label>Lý do report:</label>
          <select v-model="reportForm.reason">
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
          <label>Mô tả chi tiết:</label>
          <textarea
            v-model="reportForm.description"
            rows="5"
            maxlength="1000"
            placeholder="Mô tả rõ lý do bạn report ứng viên này..."
          ></textarea>
          <small class="help-text">{{ reportForm.description.length }}/1000 ký tự</small>
        </div>

        <div class="form-group">
          <label>Link bằng chứng (không bắt buộc, mỗi dòng 1 link):</label>
          <textarea
            v-model="reportEvidenceText"
            rows="4"
            placeholder="https://example.com/evidence-1&#10;https://example.com/evidence-2"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button @click="closeReportModal" class="btn btn-secondary">
            Hủy
          </button>
          <button @click="submitEmployerReport" class="btn btn-warning">
            🚨 Gửi report
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Header from '../components/Header.vue';
import api from '../services/api';

const route = useRoute();

const loading = ref(false);
const job = ref(null);
const applications = ref([]);
const filter = ref('all');

const selectedApplication = ref(null);
const modalEmployerNote = ref('');

const showRejectModal = ref(false);
const rejectNote = ref('');
const rejectingAppId = ref(null);

const showReportModal = ref(false);
const reportingApplication = ref(null);
const reportEvidenceText = ref('');
const reportForm = ref({
  reason: '',
  description: '',
});

const showInterviewModal = ref(false);
const interviewForm = ref({
  applicationId: '',
  candidateName: '',
  scheduledAt: '',
  mode: 'online',
  location: '',
  meetingLink: '',
  note: '',
});

const hasJobId = computed(() => !!route.params.jobId);

const pageTitle = computed(() =>
  hasJobId.value ? '👥 Quản lý ứng viên' : '👥 Tất cả ứng viên'
);

const pageSubtitle = computed(() =>
  hasJobId.value
    ? 'Xem và xử lý các đơn ứng tuyển cho tin này'
    : 'Tổng hợp tất cả ứng viên từ các tin tuyển dụng của bạn'
);

const pendingCount = computed(() =>
  applications.value.filter((a) => a.status === 'pending').length
);

const reviewingCount = computed(() =>
  applications.value.filter((a) => a.status === 'reviewing').length
);

const shortlistedCount = computed(() =>
  applications.value.filter((a) => a.status === 'shortlisted').length
);

const interviewingCount = computed(() =>
  applications.value.filter((a) => a.status === 'interviewing').length
);

const offeredCount = computed(() =>
  applications.value.filter((a) => a.status === 'offered').length
);

const hiredCount = computed(() =>
  applications.value.filter((a) => a.status === 'hired').length
);

const rejectedCount = computed(() =>
  applications.value.filter((a) => a.status === 'rejected').length
);

const scheduledInterviewCount = computed(() =>
  applications.value.filter((a) => a.interview?.status === 'scheduled').length
);

const filteredApplications = computed(() => {
  if (filter.value === 'all') return applications.value;
  return applications.value.filter((a) => a.status === filter.value);
});

const fetchJobDetails = async () => {
  if (!hasJobId.value) {
    job.value = null;
    return;
  }

  try {
    const res = await api.get(`/jobs/${route.params.jobId}`);
    job.value = res.data?.job || null;
  } catch (error) {
    console.error('Error fetching job:', error);
    job.value = null;
  }
};

const fetchApplicationsByJob = async () => {
  const params = {};
  if (filter.value !== 'all') params.status = filter.value;

  const res = await api.get(`/applications/job/${route.params.jobId}`, { params });
  applications.value = res.data?.applications || [];
};

const fetchAllEmployerApplications = async () => {
  const params = { sort: '-createdAt' };
  if (filter.value !== 'all') params.status = filter.value;

  const res = await api.get('/applications/employer', { params });
  applications.value = res.data?.applications || [];
};

const fetchPageData = async () => {
  try {
    loading.value = true;

    if (hasJobId.value) {
      await Promise.all([fetchJobDetails(), fetchApplicationsByJob()]);
    } else {
      job.value = null;
      await fetchAllEmployerApplications();
    }
  } catch (error) {
    console.error('Error fetching applications page:', error);
    alert(error.response?.data?.message || 'Không thể tải danh sách ứng viên');
  } finally {
    loading.value = false;
  }
};

const changeFilter = async (newFilter) => {
  filter.value = newFilter;
  await fetchPageData();
};

const viewApplication = async (app) => {
  try {
    const res = await api.get(`/applications/${app._id}`);
    selectedApplication.value = res.data?.application || app;
    modalEmployerNote.value = selectedApplication.value?.employerNote || '';
  } catch (error) {
    console.error('Error fetching application detail:', error);
    selectedApplication.value = app;
    modalEmployerNote.value = app.employerNote || '';
  }
};

const closeModal = () => {
  selectedApplication.value = null;
  modalEmployerNote.value = '';
};

const refreshSelectedApplication = async (appId) => {
  try {
    const res = await api.get(`/applications/${appId}`);
    selectedApplication.value = res.data?.application || null;
    modalEmployerNote.value = selectedApplication.value?.employerNote || '';
  } catch (error) {
    console.error('Error refreshing application detail:', error);
  }
};

const openRejectModal = (app) => {
  rejectingAppId.value = app._id;
  rejectNote.value =
    selectedApplication.value && selectedApplication.value._id === app._id
      ? modalEmployerNote.value
      : app.employerNote || '';
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
  rejectNote.value = '';
  rejectingAppId.value = null;
};

const confirmReject = async () => {
  if (!rejectingAppId.value) return;
  await updateStatus(rejectingAppId.value, 'rejected', rejectNote.value);
  closeRejectModal();
};

const updateStatus = async (appId, status, note = undefined) => {
  const actionTextMap = {
    reviewing: 'đánh dấu đang xem xét',
    shortlisted: 'shortlist ứng viên',
    interviewing: 'chuyển sang vòng phỏng vấn',
    offered: 'gửi offer',
    hired: 'tuyển chính thức',
    rejected: 'từ chối ứng viên',
  };

  if (!window.confirm(`Xác nhận ${actionTextMap[status] || 'cập nhật trạng thái'}?`)) return;

  try {
    const payload = { status };
    if (typeof note === 'string') payload.employerNote = note;

    await api.put(`/applications/${appId}/status`, payload);

    alert('✅ Cập nhật trạng thái thành công!');
    await fetchPageData();

    if (selectedApplication.value?._id === appId) {
      await refreshSelectedApplication(appId);
    }
  } catch (error) {
    console.error('Error updating status:', error);
    alert(error.response?.data?.message || 'Không thể cập nhật trạng thái');
  }
};

const updateStatusWithNote = async (appId, status) => {
  await updateStatus(appId, status, modalEmployerNote.value);
};

const saveNote = async (appId) => {
  try {
    await api.put(`/applications/${appId}/note`, {
      employerNote: modalEmployerNote.value,
    });

    alert('✅ Đã lưu ghi chú!');
    await fetchPageData();

    if (selectedApplication.value?._id === appId) {
      await refreshSelectedApplication(appId);
    }
  } catch (error) {
    console.error('Error saving note:', error);
    alert(error.response?.data?.message || 'Không thể lưu ghi chú');
  }
};

const openInterviewModal = (app) => {
  interviewForm.value = {
    applicationId: app._id,
    candidateName: app.student?.fullName || '',
    scheduledAt: '',
    mode: app.interview?.mode || 'online',
    location: app.interview?.location || '',
    meetingLink: app.interview?.meetingLink || '',
    note: app.interview?.note || '',
  };
  showInterviewModal.value = true;
};

const closeInterviewModal = () => {
  showInterviewModal.value = false;
  interviewForm.value = {
    applicationId: '',
    candidateName: '',
    scheduledAt: '',
    mode: 'online',
    location: '',
    meetingLink: '',
    note: '',
  };
};

const scheduleInterview = async () => {
  try {
    const payload = {
      scheduledAt: interviewForm.value.scheduledAt,
      mode: interviewForm.value.mode,
      location: interviewForm.value.location,
      meetingLink: interviewForm.value.meetingLink,
      note: interviewForm.value.note,
    };

    const res = await api.put(
      `/applications/${interviewForm.value.applicationId}/interview/schedule`,
      payload
    );

    alert(res.data?.message || 'Đã lên lịch phỏng vấn');
    const currentId = interviewForm.value.applicationId;
    closeInterviewModal();
    await fetchPageData();

    if (selectedApplication.value?._id === currentId) {
      await refreshSelectedApplication(currentId);
    }
  } catch (error) {
    console.error('Error scheduling interview:', error);
    alert(error.response?.data?.message || 'Không thể lên lịch phỏng vấn');
  }
};

const cancelInterview = async (app) => {
  const ok = confirm('Bạn có chắc muốn hủy lịch phỏng vấn này không?');
  if (!ok) return;

  try {
    const res = await api.put(`/applications/${app._id}/interview/cancel`);
    alert(res.data?.message || 'Đã hủy lịch phỏng vấn');
    await fetchPageData();

    if (selectedApplication.value?._id === app._id) {
      await refreshSelectedApplication(app._id);
    }
  } catch (error) {
    console.error('Error cancelling interview:', error);
    alert(error.response?.data?.message || 'Không thể hủy lịch phỏng vấn');
  }
};

const openReportModal = (app) => {
  reportingApplication.value = app;
  reportForm.value = {
    reason: '',
    description: '',
  };
  reportEvidenceText.value = '';
  showReportModal.value = true;
};

const closeReportModal = () => {
  showReportModal.value = false;
  reportingApplication.value = null;
  reportForm.value = {
    reason: '',
    description: '',
  };
  reportEvidenceText.value = '';
};

const submitEmployerReport = async () => {
  if (!reportingApplication.value?._id) {
    alert('Không tìm thấy application để report');
    return;
  }

  if (!reportForm.value.reason) {
    alert('Vui lòng chọn lý do report');
    return;
  }

  if (!reportForm.value.description.trim()) {
    alert('Vui lòng nhập mô tả chi tiết');
    return;
  }

  try {
    const evidenceUrls = reportEvidenceText.value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    await api.post('/reports/employer/candidate', {
      applicationId: reportingApplication.value._id,
      reason: reportForm.value.reason,
      description: reportForm.value.description.trim(),
      evidenceUrls,
    });

    alert('✅ Đã gửi report ứng viên thành công!');
    closeReportModal();
  } catch (error) {
    console.error('Error reporting candidate:', error);
    alert(error.response?.data?.message || 'Không thể gửi report');
  }
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatNumber = (num) => {
  if (num == null) return '0';
  return new Intl.NumberFormat('vi-VN').format(num);
};

const formatDate = (date) => {
  if (!date) return 'Chưa cập nhật';
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatDateTime = (date) => {
  if (!date) return 'Chưa cập nhật';
  return new Date(date).toLocaleString('vi-VN');
};

const truncateText = (text, length = 120) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
};

const getStatusLabel = (status) => {
  const labels = {
    pending: '⏳ Chờ xử lý',
    reviewing: '👀 Đang xem xét',
    shortlisted: '📌 Shortlist',
    interviewing: '🎤 Phỏng vấn',
    offered: '🎁 Đã gửi offer',
    hired: '✅ Đã tuyển',
    rejected: '❌ Đã từ chối',
    withdrawn: '↩️ Đã rút đơn',
  };
  return labels[status] || status;
};

const getInterviewStatusLabel = (status) => {
  const map = {
    none: 'Chưa có lịch',
    scheduled: 'Đã lên lịch',
    accepted: 'Ứng viên đã xác nhận',
    declined: 'Ứng viên đã từ chối',
    cancelled: 'Đã hủy',
    completed: 'Đã hoàn thành',
  };
  return map[status] || status;
};

const getEmptyMessage = () => {
  const messages = {
    all: 'Chưa có ứng viên nào ứng tuyển',
    pending: 'Không có ứng viên chờ xử lý',
    reviewing: 'Không có ứng viên đang xem xét',
    shortlisted: 'Không có ứng viên shortlisted',
    interviewing: 'Không có ứng viên đang phỏng vấn',
    offered: 'Chưa gửi offer cho ứng viên nào',
    hired: 'Chưa tuyển ứng viên nào',
    rejected: 'Chưa từ chối ứng viên nào',
  };
  return messages[filter.value] || 'Không có dữ liệu';
};

const getJobTypeLabel = (type) => {
  const types = {
    'full-time': 'Toàn thời gian',
    'part-time': 'Bán thời gian',
    internship: 'Thực tập',
    contract: 'Hợp đồng',
    freelance: 'Freelance',
  };
  return types[type] || type || 'Không xác định';
};

const getResumeUrl = (app) => {
  return app?.resumeUrl || app?.student?.resumeUrl || app?.cv?.url || '';
};

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;

  const apiBase = api.defaults.baseURL || '';
  const origin = apiBase.replace(/\/api\/?$/, '');

  return `${origin}${url}`;
};

onMounted(() => {
  fetchPageData();
});

watch(
  () => route.params.jobId,
  () => {
    fetchPageData();
  }
);
</script>

<style scoped>
.employer-applications {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 20px;
}

.page-header h1 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.subtitle {
  color: #666;
  font-size: 16px;
}

.job-info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.job-header h2 {
  font-size: 24px;
  margin-bottom: 5px;
}

.job-header p {
  opacity: 0.9;
}

.job-stats-inline {
  display: flex;
  gap: 20px;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: white;
}

.gradient-purple {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.gradient-pink {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
.gradient-blue {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
.gradient-indigo {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}
.gradient-cyan {
  background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);
}
.gradient-orange {
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
}
.gradient-green {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}
.gradient-yellow {
  background: linear-gradient(135deg, #f59e0b 0%, #facc15 100%);
}

.stat-info h3 {
  margin: 0;
  font-size: 28px;
  color: #1f2937;
}

.stat-info p {
  margin: 4px 0 0;
  color: #6b7280;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.filter-tabs button {
  border: none;
  background: white;
  color: #334155;
  padding: 10px 16px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
  font-weight: 600;
}

.filter-tabs button.active {
  background: #2563eb;
  color: white;
}

.loading,
.empty-state {
  background: white;
  border-radius: 16px;
  padding: 50px 20px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.spinner {
  width: 38px;
  height: 38px;
  border: 4px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

.application-cards {
  display: grid;
  gap: 20px;
}

.application-card {
  background: white;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.candidate-info {
  display: flex;
  gap: 14px;
  align-items: center;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}

.candidate-details h3 {
  margin: 0 0 6px;
  color: #1f2937;
}

.contact {
  margin: 2px 0;
  color: #6b7280;
  font-size: 14px;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.status-badge,
.interview-status-chip {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge.pending {
  background: #fff7ed;
  color: #c2410c;
}
.status-badge.reviewing {
  background: #eff6ff;
  color: #1d4ed8;
}
.status-badge.shortlisted {
  background: #ede9fe;
  color: #6d28d9;
}
.status-badge.interviewing {
  background: #e0f2fe;
  color: #075985;
}
.status-badge.offered {
  background: #fff7ed;
  color: #c2410c;
}
.status-badge.hired {
  background: #ecfdf5;
  color: #047857;
}
.status-badge.rejected {
  background: #fef2f2;
  color: #b91c1c;
}
.status-badge.withdrawn {
  background: #f3f4f6;
  color: #4b5563;
}

.interview-status-chip.scheduled {
  background: #ede9fe;
  color: #6d28d9;
}
.interview-status-chip.accepted {
  background: #ecfdf5;
  color: #047857;
}
.interview-status-chip.declined {
  background: #fff7ed;
  color: #c2410c;
}
.interview-status-chip.cancelled {
  background: #f3f4f6;
  color: #4b5563;
}
.interview-status-chip.completed {
  background: #e0f2fe;
  color: #0369a1;
}

.info-grid,
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.info-item,
.detail-item {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 14px;
}

.label {
  display: block;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 4px;
}

.value {
  color: #111827;
  font-weight: 600;
}

.cover-letter,
.employer-note,
.interview-box {
  margin-top: 12px;
  padding: 14px;
  border-radius: 12px;
}

.cover-letter {
  background: #f8fafc;
}

.employer-note {
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.interview-box {
  background: #eef6ff;
  border: 1px solid #cfe3ff;
}

.cover-letter p,
.employer-note p,
.interview-box p {
  margin: 8px 0 0;
  color: #374151;
  line-height: 1.55;
}

.card-footer,
.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.btn-action,
.btn {
  border: none;
  cursor: pointer;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
}

.btn-action:hover,
.btn:hover {
  transform: translateY(-1px);
}

.btn-action {
  background: #e5e7eb;
  color: #1f2937;
}

.btn-action.primary,
.btn.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-action.success,
.btn.btn-success {
  background: #10b981;
  color: white;
}

.btn-action.danger,
.btn.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-action.warning,
.btn.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-action.info,
.btn.btn-info {
  background: #3b82f6;
  color: white;
}

.btn-action.dark,
.btn.btn-dark {
  background: #374151;
  color: white;
}

.btn.btn-secondary {
  background: #e5e7eb;
  color: #111827;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 2000;
}

.modal-content {
  width: 100%;
  max-width: 620px;
  background: white;
  border-radius: 18px;
  padding: 24px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 980px;
}

.btn-close {
  position: absolute;
  top: 14px;
  right: 14px;
  border: none;
  background: #f3f4f6;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
}

.modal-section {
  margin-top: 18px;
}

.modal-section h3 {
  margin: 0 0 12px;
  color: #1f2937;
}

.text-content {
  background: #f8fafc;
  padding: 14px;
  border-radius: 12px;
  line-height: 1.6;
  color: #374151;
}

.note-textarea,
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 700;
  color: #374151;
}

.help-text {
  display: block;
  margin-top: 6px;
  color: #6b7280;
  font-size: 12px;
}

.cv-link {
  display: inline-block;
  padding: 12px 16px;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
}

.report-target-box {
  background: #f8fafc;
  padding: 12px 14px;
  border-radius: 12px;
}

.report-target-box p {
  margin: 4px 0 0;
  color: #6b7280;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .page-header,
  .job-header,
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-right {
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 20px 14px;
  }

  .page-header h1 {
    font-size: 26px;
  }

  .application-card,
  .modal-content {
    padding: 18px;
  }
}
</style>