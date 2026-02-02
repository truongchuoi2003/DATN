<template>
  <div class="student-applications">
    <Header />
    
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>📝 Đơn ứng tuyển của tôi</h1>
          <p class="subtitle">Theo dõi và quản lý các đơn ứng tuyển của bạn</p>
        </div>
      </div>

      <!-- Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            📋
          </div>
          <div class="stat-info">
            <h3>{{ statistics.total || 0 }}</h3>
            <p>Tổng đơn</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            ⏳
          </div>
          <div class="stat-info">
            <h3>{{ statistics.pending || 0 }}</h3>
            <p>Đang chờ</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            ✅
          </div>
          <div class="stat-info">
            <h3>{{ statistics.accepted || 0 }}</h3>
            <p>Được chấp nhận</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);">
            ❌
          </div>
          <div class="stat-info">
            <h3>{{ statistics.rejected || 0 }}</h3>
            <p>Bị từ chối</p>
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
          ⏳ Đang chờ ({{ pendingCount }})
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
          ✅ Được chấp nhận ({{ acceptedCount }})
        </button>
        <button 
          :class="{ active: filter === 'rejected' }" 
          @click="changeFilter('rejected')"
        >
          ❌ Bị từ chối ({{ rejectedCount }})
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
          <router-link to="/student/jobs" class="btn btn-primary">
            Tìm việc làm
          </router-link>
        </div>

        <div v-else class="application-cards">
          <div 
            v-for="app in filteredApplications" 
            :key="app._id" 
            class="application-card"
          >
            <!-- Card Header -->
            <div class="card-header">
              <div class="job-info">
                <div class="company-logo">
                  {{ getInitials(app.job?.employer?.companyName) }}
                </div>
                <div class="job-details">
                  <h3>{{ app.job?.title }}</h3>
                  <p class="company-name">{{ app.job?.employer?.companyName }}</p>
                  <div class="job-meta">
                    <span>📍 {{ app.job?.location?.city }}</span>
                    <span>💰 {{ formatSalary(app.job?.salary) }}</span>
                  </div>
                </div>
              </div>
              <div class="status-badge" :class="app.status">
                {{ getStatusLabel(app.status) }}
              </div>
            </div>

            <!-- Card Body -->
            <div class="card-body">
              <!-- Application Info -->
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
                <div class="info-item" v-if="app.reviewedAt">
                  <span class="label">👀 Ngày xem xét:</span>
                  <span class="value">{{ formatDate(app.reviewedAt) }}</span>
                </div>
              </div>

              <!-- Cover Letter Preview -->
              <div class="cover-letter-preview">
                <strong>✍️ Thư xin việc:</strong>
                <p>{{ truncateText(app.coverLetter, 150) }}</p>
              </div>

              <!-- Employer Feedback -->
              <div v-if="app.employerNote" class="employer-note" :class="app.status">
                <strong>💬 Phản hồi từ nhà tuyển dụng:</strong>
                <p>{{ app.employerNote }}</p>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="card-footer">
              <button 
                @click="viewApplication(app)" 
                class="btn-action view"
              >
                👁️ Xem chi tiết
              </button>
              <router-link 
                :to="`/student/jobs/${app.job?._id}`"
                class="btn-action"
              >
                📋 Xem tin tuyển dụng
              </router-link>
              <button 
                v-if="app.status === 'pending' || app.status === 'reviewing'"
                @click="withdrawApplication(app._id)" 
                class="btn-action danger"
              >
                🚫 Rút đơn
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
        
        <h2>📝 Chi tiết đơn ứng tuyển</h2>

        <!-- Job Info -->
        <div class="modal-section">
          <h3>💼 Thông tin công việc</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Vị trí:</span>
              <span class="value">{{ selectedApplication.job?.title }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Công ty:</span>
              <span class="value">{{ selectedApplication.job?.employer?.companyName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Địa điểm:</span>
              <span class="value">{{ selectedApplication.job?.location?.address }}, {{ selectedApplication.job?.location?.city }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Mức lương:</span>
              <span class="value">{{ formatSalary(selectedApplication.job?.salary) }}</span>
            </div>
          </div>
        </div>

        <!-- Application Info -->
        <div class="modal-section">
          <h3>📋 Thông tin ứng tuyển</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Trạng thái:</span>
              <span class="status-badge" :class="selectedApplication.status">
                {{ getStatusLabel(selectedApplication.status) }}
              </span>
            </div>
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
        <div class="modal-section" v-if="selectedApplication.cvUrl">
          <h3>📄 CV đã nộp</h3>
          <a 
            :href="selectedApplication.cvUrl" 
            target="_blank"
            class="cv-link"
          >
            📥 Tải xuống CV
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
        <div class="modal-section employer-feedback" v-if="selectedApplication.employerNote" :class="selectedApplication.status">
          <h3>💬 Phản hồi từ nhà tuyển dụng</h3>
          <p class="text-content">{{ selectedApplication.employerNote }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import api from '../services/api';

const router = useRouter();

const loading = ref(false);
const applications = ref([]);
const statistics = ref({});
const filter = ref('all');
const selectedApplication = ref(null);

// Computed counts
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

// Filtered applications
const filteredApplications = computed(() => {
  if (filter.value === 'all') return applications.value;
  return applications.value.filter(a => a.status === filter.value);
});

// Fetch applications
const fetchApplications = async () => {
  try {
    loading.value = true;
    const res = await api.get('/applications/my-applications');
    applications.value = res.data.applications;
    calculateStatistics();
  } catch (error) {
    console.error('Error fetching applications:', error);
    alert('Không thể tải danh sách đơn ứng tuyển');
  } finally {
    loading.value = false;
  }
};

// Calculate statistics
const calculateStatistics = () => {
  statistics.value = {
    total: applications.value.length,
    pending: pendingCount.value,
    reviewing: reviewingCount.value,
    accepted: acceptedCount.value,
    rejected: rejectedCount.value,
  };
};

// Change filter
const changeFilter = (newFilter) => {
  filter.value = newFilter;
};

// View application detail
const viewApplication = (app) => {
  selectedApplication.value = app;
};

// Close modal
const closeModal = () => {
  selectedApplication.value = null;
};

// Withdraw application
const withdrawApplication = async (appId) => {
  if (!confirm('Bạn có chắc muốn rút đơn ứng tuyển này?')) {
    return;
  }

  try {
    await api.delete(`/applications/${appId}`);
    alert('✅ Đã rút đơn ứng tuyển thành công');
    fetchApplications();
  } catch (error) {
    console.error('Error withdrawing application:', error);
    alert(error.response?.data?.message || 'Không thể rút đơn ứng tuyển');
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

const formatSalary = (salary) => {
  if (!salary) return 'Thỏa thuận';
  const min = (salary.min / 1000000).toFixed(0);
  const max = (salary.max / 1000000).toFixed(0);
  return `${min} - ${max} triệu ${salary.currency}`;
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
    'pending': '⏳ Đang chờ xử lý',
    'reviewing': '👀 Đang xem xét',
    'accepted': '✅ Được chấp nhận',
    'rejected': '❌ Bị từ chối',
  };
  return labels[status] || status;
};

const getEmptyMessage = () => {
  const messages = {
    'all': 'Bạn chưa có đơn ứng tuyển nào',
    'pending': 'Không có đơn nào đang chờ xử lý',
    'reviewing': 'Không có đơn nào đang được xem xét',
    'accepted': 'Không có đơn nào được chấp nhận',
    'rejected': 'Không có đơn nào bị từ chối',
  };
  return messages[filter.value] || 'Không có dữ liệu';
};

onMounted(() => {
  fetchApplications();
});
</script>

<style scoped>
.student-applications {
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
  margin-bottom: 30px;
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

/* Statistics */
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
  margin-bottom: 20px;
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

/* Card Header */
.card-header {
  padding: 25px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.job-info {
  display: flex;
  gap: 15px;
  flex: 1;
}

.company-logo {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  flex-shrink: 0;
}

.job-details h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.company-name {
  font-size: 14px;
  color: #667eea;
  margin-bottom: 8px;
}

.job-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #666;
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

/* Card Body */
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

.cover-letter-preview {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.cover-letter-preview strong {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
}

.cover-letter-preview p {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  margin: 0;
}

.employer-note {
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.employer-note.accepted {
  background: #d4edda;
  border-left-color: #28a745;
}

.employer-note.rejected {
  background: #f8d7da;
  border-left-color: #dc3545;
}

.employer-note strong {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
}

.employer-note p {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

/* Card Footer */
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

.btn-action.view:hover {
  border-color: #667eea;
  color: #667eea;
}

.btn-action.danger:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

/* Button */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Modal */
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
  max-width: 800px;
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
  padding: 10px 20px;
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

.employer-feedback {
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.employer-feedback.accepted {
  background: #d4edda;
  border-left-color: #28a745;
}

.employer-feedback.rejected {
  background: #f8d7da;
  border-left-color: #dc3545;
}

/* Responsive */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    flex-direction: column;
  }
}
</style>