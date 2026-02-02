<template>
  <div class="employer-applications">
    <Header />
    
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>👥 Quản lý ứng viên</h1>
          <p class="subtitle">Xem và đánh giá các ứng viên ứng tuyển</p>
        </div>
        <button @click="$router.go(-1)" class="btn btn-secondary">
          ← Quay lại
        </button>
      </div>

      <!-- Job Info -->
      <div v-if="job" class="job-info-card">
        <div class="job-header">
          <div>
            <h2>{{ job.title }}</h2>
            <p>{{ job.location.city }} • {{ getJobTypeLabel(job.jobType) }}</p>
          </div>
          <div class="job-stats-inline">
            <span>👁️ {{ job.views }} lượt xem</span>
            <span>👥 {{ job.applicationsCount }} ứng viên</span>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            📋
          </div>
          <div class="stat-info">
            <h3>{{ applications.length }}</h3>
            <p>Tổng ứng viên</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            ⏳
          </div>
          <div class="stat-info">
            <h3>{{ pendingCount }}</h3>
            <p>Chờ xử lý</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            👀
          </div>
          <div class="stat-info">
            <h3>{{ reviewingCount }}</h3>
            <p>Đang xem xét</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            ✅
          </div>
          <div class="stat-info">
            <h3>{{ acceptedCount }}</h3>
            <p>Đã chấp nhận</p>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          :class="{ active: filter === 'all' }" 
          @click="changeFilter('all')"
        >
          📋 Tất cả ({{ applications.length }})
        </button>
        <button 
          :class="{ active: filter === 'pending' }" 
          @click="changeFilter('pending')"
        >
          ⏳ Chờ xử lý ({{ pendingCount }})
        </button>
        <button 
          :class="{ active: filter === 'reviewing' }" 
          @click="changeFilter('reviewing')"
        >
          👀 Đang xem xét ({{ reviewingCount }})
        </button>
        <button 
          :class="{ active: filter === 'accepted' }" 
          @click="changeFilter('accepted')"
        >
          ✅ Đã chấp nhận ({{ acceptedCount }})
        </button>
        <button 
          :class="{ active: filter === 'rejected' }" 
          @click="changeFilter('rejected')"
        >
          ❌ Đã từ chối ({{ rejectedCount }})
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Applications List -->
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
            <!-- Candidate Info -->
            <div class="card-header">
              <div class="candidate-info">
                <div class="avatar">
                  {{ getInitials(app.student?.fullName) }}
                </div>
                <div class="candidate-details">
                  <h3>{{ app.student?.fullName }}</h3>
                  <p class="contact">📧 {{ app.student?.email }}</p>
                  <p class="contact" v-if="app.student?.phone">
                    📱 {{ app.student?.phone }}
                  </p>
                </div>
              </div>
              <div class="status-badge" :class="app.status">
                {{ getStatusLabel(app.status) }}
              </div>
            </div>

            <!-- Application Details -->
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">📅 Ngày ứng tuyển:</span>
                  <span class="value">{{ formatDate(app.createdAt) }}</span>
                </div>
                <div class="info-item" v-if="app.expectedSalary">
                  <span class="label">💵 Mức lương mong muốn:</span>
                  <span class="value">{{ formatNumber(app.expectedSalary) }} VND</span>
                </div>
                <div class="info-item" v-if="app.availableFrom">
                  <span class="label">🗓️ Có thể bắt đầu:</span>
                  <span class="value">{{ formatDate(app.availableFrom) }}</span>
                </div>
              </div>

              <!-- Cover Letter Preview -->
              <div class="cover-letter">
                <strong>✍️ Thư xin việc:</strong>
                <p>{{ truncateText(app.coverLetter, 200) }}</p>
              </div>

              <!-- Employer Note -->
              <div v-if="app.employerNote" class="employer-note">
                <strong>💬 Ghi chú của bạn:</strong>
                <p>{{ app.employerNote }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="card-footer">
              <button 
                @click="viewApplication(app)" 
                class="btn-action primary"
              >
                👁️ Xem chi tiết
              </button>
              <a 
                v-if="app.cv?.url"
                :href="getFullUrl(app.cv.url)" 
                target="_blank"
                class="btn-action"
              >
                📥 Tải CV
              </a>
              <button 
                v-if="app.status !== 'accepted'"
                @click="updateStatus(app._id, 'accepted')" 
                class="btn-action success"
              >
                ✅ Chấp nhận
              </button>
              <button 
                v-if="app.status !== 'rejected'"
                @click="openRejectModal(app)" 
                class="btn-action danger"
              >
                ❌ Từ chối
              </button>
              <button 
                v-if="app.status === 'pending'"
                @click="updateStatus(app._id, 'reviewing')" 
                class="btn-action"
              >
                👀 Đánh dấu đang xem
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Application Modal -->
    <div v-if="selectedApplication" class="modal" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <button class="btn-close" @click="closeModal">✕</button>
        
        <h2>👤 Chi tiết ứng viên</h2>

        <!-- Candidate Info -->
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
              <span class="value">{{ selectedApplication.student?.phone }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Trạng thái:</span>
              <span class="status-badge" :class="selectedApplication.status">
                {{ getStatusLabel(selectedApplication.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Application Details -->
        <div class="modal-section">
          <h3>📋 Thông tin ứng tuyển</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Ngày ứng tuyển:</span>
              <span class="value">{{ formatDateTime(selectedApplication.createdAt) }}</span>
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

        <!-- CV -->
        <div class="modal-section" v-if="selectedApplication.cv?.url">
          <h3>📄 CV</h3>
          <a 
            :href="getFullUrl(selectedApplication.cv.url)" 
            target="_blank"
            class="cv-link"
          >
            📥 Tải xuống CV - {{ selectedApplication.cv.filename }}
          </a>
        </div>

        <!-- Cover Letter -->
        <div class="modal-section">
          <h3>✍️ Thư xin việc</h3>
          <p class="text-content">{{ selectedApplication.coverLetter }}</p>
        </div>

        <!-- Additional Info -->
        <div class="modal-section" v-if="selectedApplication.additionalInfo">
          <h3>💬 Thông tin bổ sung</h3>
          <p class="text-content">{{ selectedApplication.additionalInfo }}</p>
        </div>

        <!-- Employer Note -->
        <div class="modal-section">
          <h3>📝 Ghi chú của bạn</h3>
          <textarea 
            v-model="modalEmployerNote"
            placeholder="Thêm ghi chú về ứng viên này..."
            rows="4"
            class="note-textarea"
          ></textarea>
        </div>

        <!-- Action Buttons -->
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
            @click="updateStatusWithNote(selectedApplication._id, 'rejected')" 
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

    <!-- Reject Reason Modal -->
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
          <button 
            @click="confirmReject" 
            class="btn btn-danger"
          >
            ❌ Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
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

// Computed
const pendingCount = computed(() => 
  applications.value.filter(a => a.status === 'pending').length
);
const reviewingCount = computed(() => 
  applications.value.filter(a => a.status === 'reviewing').length
);
const acceptedCount = computed(() => 
  applications.value.filter(a => a.status === 'accepted').length
);
const rejectedCount = computed(() => 
  applications.value.filter(a => a.status === 'rejected').length
);

const filteredApplications = computed(() => {
  if (filter.value === 'all') return applications.value;
  return applications.value.filter(a => a.status === filter.value);
});

// Fetch data
const fetchJobDetails = async () => {
  try {
    const res = await api.get(`/jobs/${route.params.jobId}`);
    job.value = res.data.job;
  } catch (error) {
    console.error('Error fetching job:', error);
  }
};

const fetchApplications = async () => {
  try {
    loading.value = true;
    const res = await api.get(`/applications/job/${route.params.jobId}`);
    applications.value = res.data.applications;
  } catch (error) {
    console.error('Error fetching applications:', error);
    alert('Không thể tải danh sách ứng viên');
  } finally {
    loading.value = false;
  }
};

// Actions
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
  rejectNote.value = app.employerNote || '';
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
  rejectNote.value = '';
  rejectingAppId.value = null;
};

const confirmReject = async () => {
  await updateStatus(rejectingAppId.value, 'rejected', rejectNote.value);
  closeRejectModal();
};

const updateStatus = async (appId, status, note = '') => {
  if (!confirm(`Xác nhận ${status === 'accepted' ? 'chấp nhận' : status === 'rejected' ? 'từ chối' : 'cập nhật'} ứng viên này?`)) {
    return;
  }

  try {
    await api.put(`/applications/${appId}/status`, {
      status,
      employerNote: note
    });

    alert('✅ Cập nhật thành công!');
    await fetchApplications();
    closeModal();
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
    const currentApp = applications.value.find(a => a._id === appId);
    await api.put(`/applications/${appId}/status`, {
      status: currentApp.status,
      employerNote: modalEmployerNote.value
    });

    alert('✅ Đã lưu ghi chú!');
    await fetchApplications();
    closeModal();
  } catch (error) {
    console.error('Error saving note:', error);
    alert('Không thể lưu ghi chú');
  }
};

// Utility functions
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0];
  }
  return name.substring(0, 2).toUpperCase();
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('vi-VN');
};

const truncateText = (text, length) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

const getStatusLabel = (status) => {
  const labels = {
    'pending': '⏳ Chờ xử lý',
    'reviewing': '👀 Đang xem xét',
    'accepted': '✅ Đã chấp nhận',
    'rejected': '❌ Đã từ chối',
  };
  return labels[status] || status;
};

const getEmptyMessage = () => {
  const messages = {
    'all': 'Chưa có ứng viên nào ứng tuyển',
    'pending': 'Không có ứng viên chờ xử lý',
    'reviewing': 'Không có ứng viên đang xem xét',
    'accepted': 'Chưa chấp nhận ứng viên nào',
    'rejected': 'Chưa từ chối ứng viên nào',
  };
  return messages[filter.value] || 'Không có dữ liệu';
};

const getJobTypeLabel = (type) => {
  const types = {
    'full-time': 'Toàn thời gian',
    'part-time': 'Bán thời gian',
    'internship': 'Thực tập',
    'contract': 'Hợp đồng',
    'freelance': 'Freelance',
  };
  return types[type] || type;
};

const getFullUrl = (url) => {
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

onMounted(() => {
  fetchJobDetails();
  fetchApplications();
});
</script>

<style scoped>
/* Copy tất cả styles từ StudentApplications.vue và customize theo nhu cầu */
/* Tôi sẽ giữ nguyên structure, chỉ thêm một số styles đặc biệt cho employer */

.employer-applications {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Page Header */
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

/* Job Info Card */
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-info h3 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-info p {
  color: #666;
  font-size: 14px;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-tabs button {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
}

.filter-tabs button:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-tabs button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

/* Loading */
.loading {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
}

.empty-state p {
  font-size: 18px;
  color: #999;
}

/* Application Cards */
.application-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.application-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s;
}

.application-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 25px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.candidate-info {
  display: flex;
  gap: 15px;
  flex: 1;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  flex-shrink: 0;
}

.candidate-details h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.contact {
  font-size: 13px;
  color: #666;
  margin: 3px 0;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.reviewing {
  background: #cfe2ff;
  color: #084298;
}

.status-badge.accepted {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.card-body {
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item .label {
  font-size: 13px;
  color: #999;
}

.info-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.cover-letter {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.cover-letter strong,
.employer-note strong {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
}

.cover-letter p,
.employer-note p {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  margin: 0;
}

.employer-note {
  padding: 15px;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.card-footer {
  padding: 20px 25px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-action {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  color: inherit;
  display: inline-block;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-action.primary:hover {
  border-color: #667eea;
  color: #667eea;
}

.btn-action.success:hover {
  border-color: #28a745;
  color: #28a745;
}

.btn-action.danger:hover {
  border-color: #dc3545;
  color: #dc3545;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: white;
  border: 2px solid #e0e0e0;
  color: #666;
}

.btn-secondary:hover {
  border-color: #999;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Modal - Same as StudentApplications.vue */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-content.large {
  max-width: 900px;
}

.btn-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 35px;
  height: 35px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #e0e0e0;
  transform: rotate(90deg);
}

.modal-content h2 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 25px;
}

.modal-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-section:last-child {
  border-bottom: none;
}

.modal-section h3 {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item .label {
  font-size: 13px;
  color: #999;
}

.detail-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.text-content {
  font-size: 14px;
  line-height: 1.8;
  color: #666;
  white-space: pre-line;
}

.cv-link {
  display: inline-block;
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.cv-link:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.note-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.note-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.help-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .job-header {
    flex-direction: column;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    flex-direction: column;
  }

  .card-header {
    flex-direction: column;
  }
}
</style>