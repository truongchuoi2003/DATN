<template>
  <div class="employer-applications">
    <Header />

    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>👥 {{ pageTitle }}</h1>
          <p class="subtitle">{{ pageSubtitle }}</p>
        </div>

        <button @click="router.back()" class="btn btn-secondary">
          ← Quay lại
        </button>
      </div>

      <!-- Job Info (chỉ hiện khi xem theo 1 job) -->
      <div v-if="job && hasJobId" class="job-info-card">
        <div class="job-header">
          <div>
            <h2>{{ job.title }}</h2>
            <p>
              {{ job.location?.city || 'Không rõ địa điểm' }} •
              {{ getJobTypeLabel(job.jobType) }}
            </p>
          </div>

          <div class="job-stats-inline">
            <span><strong>{{ applications.length }}</strong> ứng viên</span>
            <span><strong>{{ pendingCount }}</strong> chờ xử lý</span>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon pending">⏳</div>
          <div>
            <div class="stat-value">{{ pendingCount }}</div>
            <div class="stat-label">Chờ xử lý</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon reviewing">👀</div>
          <div>
            <div class="stat-value">{{ reviewingCount }}</div>
            <div class="stat-label">Đang xem xét</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon accepted">✅</div>
          <div>
            <div class="stat-value">{{ acceptedCount }}</div>
            <div class="stat-label">Đã chấp nhận</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon rejected">❌</div>
          <div>
            <div class="stat-value">{{ rejectedCount }}</div>
            <div class="stat-label">Đã từ chối</div>
          </div>
        </div>
      </div>

      <!-- Filter -->
      <div class="filter-bar">
        <button
          class="filter-btn"
          :class="{ active: filter === 'all' }"
          @click="changeFilter('all')"
        >
          Tất cả ({{ applications.length }})
        </button>
        <button
          class="filter-btn"
          :class="{ active: filter === 'pending' }"
          @click="changeFilter('pending')"
        >
          Chờ xử lý ({{ pendingCount }})
        </button>
        <button
          class="filter-btn"
          :class="{ active: filter === 'reviewing' }"
          @click="changeFilter('reviewing')"
        >
          Đang xem xét ({{ reviewingCount }})
        </button>
        <button
          class="filter-btn"
          :class="{ active: filter === 'accepted' }"
          @click="changeFilter('accepted')"
        >
          Đã chấp nhận ({{ acceptedCount }})
        </button>
        <button
          class="filter-btn"
          :class="{ active: filter === 'rejected' }"
          @click="changeFilter('rejected')"
        >
          Đã từ chối ({{ rejectedCount }})
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="state-box">
        <div class="loading-spinner"></div>
        <p>Đang tải danh sách ứng viên...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredApplications.length === 0" class="state-box">
        <div class="empty-icon">📭</div>
        <p>{{ getEmptyMessage() }}</p>
      </div>

      <!-- List -->
      <div v-else class="applications-list">
        <div
          v-for="app in filteredApplications"
          :key="app._id"
          class="application-card"
        >
          <div class="card-header">
            <div class="candidate-main">
              <div class="avatar">
                <img
                  v-if="app.student?.avatar"
                  :src="getFullUrl(app.student.avatar)"
                  alt="avatar"
                />
                <span v-else>{{ getInitials(app.student?.fullName) }}</span>
              </div>

              <div>
                <h3>{{ app.student?.fullName || 'Không rõ tên' }}</h3>
                <p>{{ app.student?.email || 'Không có email' }}</p>
              </div>
            </div>

            <span class="status-badge" :class="app.status">
              {{ getStatusLabel(app.status) }}
            </span>
          </div>

          <div class="card-body">
            <div v-if="!hasJobId && app.job" class="job-ref">
              💼 {{ app.job.title }} - {{ app.job.location?.city || 'Không rõ địa điểm' }}
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="label">🏫 Trường:</span>
                <span class="value">{{ app.student?.university || 'Chưa cập nhật' }}</span>
              </div>

              <div class="info-item">
                <span class="label">🎓 Ngành:</span>
                <span class="value">{{ app.student?.major || 'Chưa cập nhật' }}</span>
              </div>

              <div class="info-item">
                <span class="label">📊 GPA:</span>
                <span class="value">
                  {{ app.student?.gpa != null ? app.student.gpa : 'Chưa cập nhật' }}
                </span>
              </div>

              <div class="info-item">
                <span class="label">📅 Ứng tuyển:</span>
                <span class="value">{{ formatDate(app.createdAt || app.appliedAt) }}</span>
              </div>

              <div class="info-item" v-if="app.expectedSalary">
                <span class="label">💰 Lương mong muốn:</span>
                <span class="value">{{ formatNumber(app.expectedSalary) }} VNĐ</span>
              </div>

              <div class="info-item" v-if="app.availableFrom">
                <span class="label">🗓️ Có thể đi làm:</span>
                <span class="value">{{ formatDate(app.availableFrom) }}</span>
              </div>
            </div>

            <div v-if="app.student?.skills?.length" class="skills-section">
              <div class="skills-label">Kỹ năng:</div>
              <div class="skills-list">
                <span
                  v-for="(skill, index) in app.student.skills.slice(0, 8)"
                  :key="index"
                  class="skill-tag"
                >
                  {{ skill }}
                </span>
              </div>
            </div>

            <div v-if="app.coverLetter" class="cover-preview">
              <strong>Thư xin việc:</strong>
              {{ truncateText(app.coverLetter, 160) }}
            </div>
          </div>

          <div class="card-actions">
            <button @click="viewApplication(app)" class="btn btn-primary">
              👁️ Xem chi tiết
            </button>

            <a
              v-if="getResumeUrl(app)"
              :href="getFullUrl(getResumeUrl(app))"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-secondary"
            >
              📥 Tải CV
            </a>

            <button
              v-if="app.status !== 'accepted'"
              @click="updateStatus(app._id, 'accepted', app.employerNote || '')"
              class="btn btn-success"
            >
              ✅ Chấp nhận
            </button>

            <button
              v-if="app.status !== 'rejected'"
              @click="openRejectModal(app)"
              class="btn btn-danger"
            >
              ❌ Từ chối
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedApplication" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="btn-close" @click="closeModal">✕</button>

        <h2>Chi tiết ứng viên</h2>

        <div class="modal-section">
          <h3>👤 Thông tin cá nhân</h3>
          <div class="detail-grid">
            <div><strong>Họ tên:</strong> {{ selectedApplication.student?.fullName || 'Chưa cập nhật' }}</div>
            <div><strong>Email:</strong> {{ selectedApplication.student?.email || 'Chưa cập nhật' }}</div>
            <div><strong>SĐT:</strong> {{ selectedApplication.student?.phone || 'Chưa cập nhật' }}</div>
            <div><strong>Trường:</strong> {{ selectedApplication.student?.university || 'Chưa cập nhật' }}</div>
            <div><strong>Ngành:</strong> {{ selectedApplication.student?.major || 'Chưa cập nhật' }}</div>
            <div><strong>GPA:</strong> {{ selectedApplication.student?.gpa != null ? selectedApplication.student.gpa : 'Chưa cập nhật' }}</div>
            <div><strong>Trạng thái:</strong> {{ getStatusLabel(selectedApplication.status) }}</div>
            <div><strong>Ngày ứng tuyển:</strong> {{ formatDateTime(selectedApplication.createdAt || selectedApplication.appliedAt) }}</div>
          </div>
        </div>

        <div v-if="!hasJobId && selectedApplication.job" class="modal-section">
          <h3>💼 Tin tuyển dụng</h3>
          <div class="detail-grid">
            <div><strong>Vị trí:</strong> {{ selectedApplication.job.title }}</div>
            <div><strong>Địa điểm:</strong> {{ selectedApplication.job.location?.city || 'Chưa cập nhật' }}</div>
            <div><strong>Loại hình:</strong> {{ getJobTypeLabel(selectedApplication.job.jobType) }}</div>
            <div><strong>Cấp độ:</strong> {{ selectedApplication.job.level || 'Chưa cập nhật' }}</div>
          </div>
        </div>

        <div v-if="selectedApplication.student?.skills?.length" class="modal-section">
          <h3>🛠️ Kỹ năng</h3>
          <div class="skills-list">
            <span
              v-for="(skill, index) in selectedApplication.student.skills"
              :key="index"
              class="skill-tag"
            >
              {{ skill }}
            </span>
          </div>
        </div>

        <div v-if="getResumeUrl(selectedApplication)" class="modal-section">
          <h3>📄 CV</h3>
          <a
            :href="getFullUrl(getResumeUrl(selectedApplication))"
            target="_blank"
            rel="noopener noreferrer"
            class="cv-link"
          >
            📥 Tải xuống CV
          </a>
        </div>

        <div class="modal-section">
          <h3>✍️ Thư xin việc</h3>
          <p class="text-content">{{ selectedApplication.coverLetter || 'Không có thư xin việc' }}</p>
        </div>

        <div v-if="selectedApplication.additionalInfo" class="modal-section">
          <h3>💬 Thông tin bổ sung</h3>
          <p class="text-content">{{ selectedApplication.additionalInfo }}</p>
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
            v-if="selectedApplication.status !== 'accepted'"
            @click="updateStatusWithNote(selectedApplication._id, 'accepted')"
            class="btn btn-success"
          >
            ✅ Chấp nhận
          </button>

          <button
            v-if="selectedApplication.status !== 'rejected'"
            @click="openRejectModal(selectedApplication)"
            class="btn btn-danger"
          >
            ❌ Từ chối
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

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content small" @click.stop>
        <button class="btn-close" @click="closeRejectModal">✕</button>

        <h2>❌ Từ chối ứng viên</h2>

        <div class="modal-section">
          <label class="block-label">Lý do từ chối (không bắt buộc)</label>
          <textarea
            v-model="rejectNote"
            placeholder="Ví dụ: Kinh nghiệm chưa phù hợp với yêu cầu công việc..."
            rows="5"
            maxlength="500"
            class="note-textarea"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import api from '../services/api';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const job = ref(null);
const applications = ref([]);
const filter = ref('all');

const selectedApplication = ref(null);
const modalEmployerNote = ref('');

const showRejectModal = ref(false);
const rejectNote = ref('');
const rejectingAppId = ref(null);

const hasJobId = computed(() => !!route.params.jobId);

const pageTitle = computed(() =>
  hasJobId.value ? 'Quản lý ứng viên' : 'Tất cả ứng viên'
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

const acceptedCount = computed(() =>
  applications.value.filter((a) => a.status === 'accepted').length
);

const rejectedCount = computed(() =>
  applications.value.filter((a) => a.status === 'rejected').length
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
    job.value = res.data.job || null;
  } catch (error) {
    console.error('Error fetching job:', error);
    job.value = null;
  }
};

const fetchApplicationsByJob = async () => {
  const res = await api.get(`/applications/job/${route.params.jobId}`);
  applications.value = res.data.applications || [];
};

const fetchAllEmployerApplications = async () => {
  const res = await api.get('/applications/employer');
  applications.value = res.data.applications || [];
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

const changeFilter = (newFilter) => {
  filter.value = newFilter;
};

const viewApplication = (app) => {
  selectedApplication.value = app;
  modalEmployerNote.value = app.employerNote || '';
};

const closeModal = () => {
  selectedApplication.value = null;
  modalEmployerNote.value = '';
};

const openRejectModal = (app) => {
  rejectingAppId.value = app._id;
  rejectNote.value = selectedApplication.value
    ? modalEmployerNote.value
    : (app.employerNote || '');
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

const updateStatus = async (appId, status, note = '') => {
  const actionText =
    status === 'accepted'
      ? 'chấp nhận'
      : status === 'rejected'
        ? 'từ chối'
        : 'cập nhật';

  if (!window.confirm(`Xác nhận ${actionText} ứng viên này?`)) {
    return;
  }

  try {
    await api.put(`/applications/${appId}/status`, {
      status,
      employerNote: note,
    });

    alert('✅ Cập nhật thành công!');
    await fetchPageData();

    if (selectedApplication.value && selectedApplication.value._id === appId) {
      const updated = applications.value.find((a) => a._id === appId);
      if (updated) {
        selectedApplication.value = updated;
        modalEmployerNote.value = updated.employerNote || '';
      } else {
        closeModal();
      }
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
    const currentApp = applications.value.find((a) => a._id === appId);

    if (!currentApp) {
      alert('Không tìm thấy đơn ứng tuyển');
      return;
    }

    const nextStatus =
      currentApp.status === 'pending' ? 'reviewing' : currentApp.status;

    await api.put(`/applications/${appId}/status`, {
      status: nextStatus,
      employerNote: modalEmployerNote.value,
    });

    alert(
      nextStatus === 'reviewing'
        ? '✅ Đã lưu ghi chú và chuyển sang trạng thái đang xem xét!'
        : '✅ Đã lưu ghi chú!'
    );

    await fetchPageData();

    const updated = applications.value.find((a) => a._id === appId);
    if (updated) {
      selectedApplication.value = updated;
      modalEmployerNote.value = updated.employerNote || '';
    } else {
      closeModal();
    }
  } catch (error) {
    console.error('Error saving note:', error);
    alert(error.response?.data?.message || 'Không thể lưu ghi chú');
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
    accepted: '✅ Đã chấp nhận',
    rejected: '❌ Đã từ chối',
  };
  return labels[status] || status;
};

const getEmptyMessage = () => {
  const messages = {
    all: 'Chưa có ứng viên nào ứng tuyển',
    pending: 'Không có ứng viên chờ xử lý',
    reviewing: 'Không có ứng viên đang xem xét',
    accepted: 'Chưa chấp nhận ứng viên nào',
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
  return app?.resumeUrl || app?.student?.resumeUrl || '';
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
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 6px;
  font-size: 32px;
  color: #1f2937;
}

.subtitle {
  margin: 0;
  color: #6b7280;
}

.job-info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 10px 24px rgba(102, 126, 234, 0.24);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.job-header h2 {
  margin: 0 0 6px;
  font-size: 24px;
}

.job-header p {
  margin: 0;
  opacity: 0.95;
}

.job-stats-inline {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.pending { background: #fff7ed; }
.stat-icon.reviewing { background: #eff6ff; }
.stat-icon.accepted { background: #ecfdf5; }
.stat-icon.rejected { background: #fef2f2; }

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  color: #6b7280;
  font-size: 14px;
}

.filter-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.filter-btn {
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 600;
}

.filter-btn.active {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}

.state-box {
  background: #fff;
  border-radius: 16px;
  padding: 50px 20px;
  text-align: center;
  color: #6b7280;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: spin 0.8s linear infinite;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.application-card {
  background: #fff;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.candidate-main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.candidate-main h3 {
  margin: 0 0 4px;
  color: #111827;
}

.candidate-main p {
  margin: 0;
  color: #6b7280;
  word-break: break-word;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  background: #eef2ff;
  color: #4338ca;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.status-badge.pending {
  background: #fff7ed;
  color: #c2410c;
}

.status-badge.reviewing {
  background: #eff6ff;
  color: #1d4ed8;
}

.status-badge.accepted {
  background: #ecfdf5;
  color: #047857;
}

.status-badge.rejected {
  background: #fef2f2;
  color: #b91c1c;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.job-ref {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  padding: 10px 12px;
  border-radius: 12px;
  color: #374151;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 18px;
}

.info-item {
  color: #374151;
}

.label {
  font-weight: 700;
  margin-right: 6px;
  color: #111827;
}

.value {
  color: #4b5563;
}

.skills-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skills-label {
  font-weight: 700;
  color: #111827;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  background: #eef2ff;
  color: #4338ca;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 600;
}

.cover-preview {
  background: #fafafa;
  border-left: 4px solid #6366f1;
  padding: 12px 14px;
  border-radius: 10px;
  color: #374151;
  line-height: 1.6;
}

.card-actions {
  margin-top: 18px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #4f46e5;
  color: #fff;
}

.btn-secondary {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-success {
  background: #10b981;
  color: #fff;
}

.btn-danger {
  background: #ef4444;
  color: #fff;
}

.btn-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: #f3f4f6;
  cursor: pointer;
  font-weight: 700;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 999;
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 18px;
  padding: 24px;
}

.modal-content.small {
  max-width: 520px;
}

.modal-content h2 {
  margin: 0 0 18px;
  color: #111827;
}

.modal-section {
  margin-bottom: 18px;
}

.modal-section h3 {
  margin: 0 0 10px;
  color: #1f2937;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
  color: #374151;
}

.text-content {
  margin: 0;
  line-height: 1.7;
  color: #374151;
  background: #fafafa;
  padding: 12px;
  border-radius: 10px;
}

.cv-link {
  display: inline-flex;
  text-decoration: none;
  font-weight: 700;
  color: #4338ca;
}

.note-textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 12px;
  resize: vertical;
  font: inherit;
  box-sizing: border-box;
}

.block-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
  color: #111827;
}

.help-text {
  color: #6b7280;
}

.modal-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .job-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .page-header,
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-grid,
  .detail-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .container {
    padding: 20px 14px;
  }

  .modal-content {
    padding: 18px;
  }
}
</style>