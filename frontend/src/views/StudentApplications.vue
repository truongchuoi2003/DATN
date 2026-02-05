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
            <h3>{{ stats.total }}</h3>
            <p>Tổng đơn (đang hiển thị)</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            ⏳
          </div>
          <div class="stat-info">
            <h3>{{ stats.pending }}</h3>
            <p>Đang chờ</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            👀
          </div>
          <div class="stat-info">
            <h3>{{ stats.reviewing }}</h3>
            <p>Đang xem</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            ✅
          </div>
          <div class="stat-info">
            <h3>{{ stats.accepted }}</h3>
            <p>Được nhận</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
            ❌
          </div>
          <div class="stat-info">
            <h3>{{ stats.rejected }}</h3>
            <p>Từ chối</p>
          </div>
        </div>

        <!-- ✅ Withdrawn -->
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #adb5bd 0%, #6c757d 100%);">
            🚫
          </div>
          <div class="stat-info">
            <h3>{{ stats.withdrawn }}</h3>
            <p>Đã rút</p>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          class="filter-btn"
          :class="{ active: filter === 'all' }"
          @click="changeFilter('all')"
        >
          Tất cả ({{ stats.total }})
        </button>

        <button
          class="filter-btn"
          :class="{ active: filter === 'pending' }"
          @click="changeFilter('pending')"
        >
          ⏳ Chờ xử lý ({{ stats.pending }})
        </button>

        <button
          class="filter-btn"
          :class="{ active: filter === 'reviewing' }"
          @click="changeFilter('reviewing')"
        >
          👀 Đang xem ({{ stats.reviewing }})
        </button>

        <button
          class="filter-btn"
          :class="{ active: filter === 'accepted' }"
          @click="changeFilter('accepted')"
        >
          ✅ Được nhận ({{ stats.accepted }})
        </button>

        <button
          class="filter-btn"
          :class="{ active: filter === 'rejected' }"
          @click="changeFilter('rejected')"
        >
          ❌ Từ chối ({{ stats.rejected }})
        </button>

        <!-- ✅ Tab Đã rút -->
        <button
          class="filter-btn"
          :class="{ active: filter === 'withdrawn' }"
          @click="changeFilter('withdrawn')"
        >
          🚫 Đã rút ({{ stats.withdrawn }})
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loadingAny" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Applications List -->
      <div v-else class="applications-grid">
        <div v-if="displayApplications.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>{{ getEmptyMessage() }}</h3>
          <p v-if="filter !== 'withdrawn'">Hãy khám phá các tin tuyển dụng để ứng tuyển</p>
          <button v-if="filter !== 'withdrawn'" @click="router.push('/student/jobs')" class="btn-primary">
            🔍 Tìm việc ngay
          </button>
        </div>

        <div
          v-for="app in displayApplications"
          :key="app._id"
          class="application-card"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="company-info">
              <div class="company-logo">
                {{ getInitials(app.job?.employer?.companyName) }}
              </div>
              <div>
                <h3>{{ app.job?.title }}</h3>
                <p class="company-name">{{ app.job?.employer?.companyName }}</p>
              </div>
            </div>

            <div class="status-badge" :class="normalizeStatus(app.status)">
              {{ getStatusLabel(app.status) }}
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="icon">📍</span>
                <div>
                  <p class="label">Địa điểm</p>
                  <p class="value">{{ app.job?.location?.address }}, {{ app.job?.location?.city }}</p>
                </div>
              </div>

              <div class="info-item">
                <span class="icon">💰</span>
                <div>
                  <p class="label">Mức lương</p>
                  <p class="value">{{ formatSalary(app.job?.salary) }}</p>
                </div>
              </div>

              <div class="info-item">
                <span class="icon">📅</span>
                <div>
                  <p class="label">Ngày ứng tuyển</p>
                  <p class="value">{{ formatDateTime(app.createdAt) }}</p>
                </div>
              </div>

              <div class="info-item" v-if="app.reviewedAt">
                <span class="icon">👁️</span>
                <div>
                  <p class="label">Ngày xem xét</p>
                  <p class="value">{{ formatDateTime(app.reviewedAt) }}</p>
                </div>
              </div>
            </div>

            <div v-if="app.employerNote" class="employer-note-preview" :class="normalizeStatus(app.status)">
              <p><strong>💬 Phản hồi:</strong> {{ app.employerNote }}</p>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <div class="card-actions">
              <button @click="viewApplication(app)" class="btn-action view">
                👁️ Xem chi tiết
              </button>

              <router-link
                :to="`/student/jobs/${app.job?._id}`"
                class="btn-action view"
              >
                📋 Xem tin tuyển dụng
              </router-link>

              <!-- ✅ Chỉ hiện rút đơn nếu pending/reviewing -->
              <button
                v-if="canWithdraw(app.status)"
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
              <span class="status-badge" :class="normalizeStatus(selectedApplication.status)">
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
        <div class="modal-section" v-if="selectedApplication.resumeUrl || selectedApplication.cvUrl">
          <h3>📄 CV đã nộp</h3>
          <a
            :href="selectedApplication.resumeUrl || selectedApplication.cvUrl"
            target="_blank"
            rel="noopener noreferrer"
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
        <div
          class="modal-section employer-feedback"
          v-if="selectedApplication.employerNote"
          :class="normalizeStatus(selectedApplication.status)"
        >
          <h3>💬 Phản hồi từ nhà tuyển dụng</h3>
          <p class="text-content">{{ selectedApplication.employerNote }}</p>
        </div>

        <!-- Actions -->
        <div class="modal-section modal-actions">
          <button
            v-if="canWithdraw(selectedApplication.status)"
            class="btn-action danger"
            @click="withdrawFromModal"
          >
            🚫 Rút đơn
          </button>
          <button class="btn-action view" @click="closeModal">Đóng</button>
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

const filter = ref('all');
const selectedApplication = ref(null);

const loadingActive = ref(false);
const loadingWithdrawn = ref(false);
const loadingStats = ref(false);

const activeApplications = ref([]);     // mặc định: không có withdrawn
const withdrawnApplications = ref([]);  // chỉ load khi chọn tab withdrawn
const withdrawnLoaded = ref(false);

const stats = ref({
  total: 0,
  pending: 0,
  reviewing: 0,
  accepted: 0,
  rejected: 0,
  withdrawn: 0,
});

// Helpers
const normalizeStatus = (status) => (status || '').toString().toLowerCase().trim();
const canWithdraw = (status) => ['pending', 'reviewing'].includes(normalizeStatus(status));

const loadingAny = computed(() => loadingActive.value || loadingWithdrawn.value || loadingStats.value);

// ✅ list hiển thị theo tab
const displayApplications = computed(() => {
  if (filter.value === 'withdrawn') return withdrawnApplications.value;
  if (filter.value === 'all') return activeApplications.value;
  return activeApplications.value.filter(a => normalizeStatus(a.status) === filter.value);
});

// Fetch active apps (ẩn withdrawn theo backend)
const fetchActiveApplications = async () => {
  try {
    loadingActive.value = true;
    const res = await api.get('/applications/my-applications');
    activeApplications.value = res.data.applications || [];
  } catch (e) {
    console.error('Error fetching applications:', e);
    alert('Không thể tải danh sách đơn ứng tuyển');
  } finally {
    loadingActive.value = false;
  }
};

// Fetch withdrawn apps (chỉ khi chọn tab)
const fetchWithdrawnApplications = async () => {
  try {
    loadingWithdrawn.value = true;
    const res = await api.get('/applications/my-applications', { params: { status: 'withdrawn' } });
    withdrawnApplications.value = res.data.applications || [];
    withdrawnLoaded.value = true;
  } catch (e) {
    console.error('Error fetching withdrawn applications:', e);
    alert('Không thể tải danh sách đơn đã rút');
  } finally {
    loadingWithdrawn.value = false;
  }
};

// Fetch stats
const fetchStats = async () => {
  try {
    loadingStats.value = true;
    const res = await api.get('/applications/my-stats');
    const s = res.data?.stats || res.data?.statistics || {};
    stats.value = {
      total: s.total || 0,
      pending: s.pending || 0,
      reviewing: s.reviewing || 0,
      accepted: s.accepted || 0,
      rejected: s.rejected || 0,
      withdrawn: s.withdrawn || 0,
    };
  } catch (e) {
    console.error('Error fetching stats:', e);
    // không alert để khỏi spam, vì stats không critical
  } finally {
    loadingStats.value = false;
  }
};

const changeFilter = async (newFilter) => {
  filter.value = newFilter;

  // ✅ Nếu vào tab withdrawn, load data nếu chưa có
  if (newFilter === 'withdrawn' && !withdrawnLoaded.value) {
    await fetchWithdrawnApplications();
  }
};

const viewApplication = (app) => {
  selectedApplication.value = app;
};

const closeModal = () => {
  selectedApplication.value = null;
};

// Withdraw application (giữ record, set withdrawn, và ẩn khỏi list active)
const withdrawApplication = async (appId) => {
  if (!confirm('Bạn có chắc muốn rút đơn ứng tuyển này?')) return;

  try {
    const res = await api.put(`/applications/${appId}/withdraw`);
    const updated = res.data?.application;

    alert('✅ Đã rút đơn ứng tuyển');

    // ✅ remove khỏi list active ngay lập tức
    activeApplications.value = activeApplications.value.filter(a => a._id !== appId);

    // ✅ nếu đã load withdrawn list thì add vào (đỡ phải reload)
    if (withdrawnLoaded.value && updated) {
      const exists = withdrawnApplications.value.some(a => a._id === updated._id);
      if (!exists) {
        withdrawnApplications.value = [updated, ...withdrawnApplications.value];
      }
    }

    // refresh stats (để update số đếm)
    fetchStats();

    // nếu đang mở modal thì đóng
    if (selectedApplication.value?._id === appId) selectedApplication.value = null;
  } catch (error) {
    console.error('Error withdrawing application:', error);
    alert(error.response?.data?.message || 'Không thể rút đơn ứng tuyển');
  }
};

const withdrawFromModal = async () => {
  if (!selectedApplication.value?._id) return;
  await withdrawApplication(selectedApplication.value._id);
};

// Utility functions
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const formatSalary = (salary) => {
  if (!salary) return 'Thương lượng';
  const { min, max } = salary;
  if (!min && !max) return 'Thương lượng';
  if (min && !max) return `Từ ${formatNumber(min)} VND`;
  if (!min && max) return `Đến ${formatNumber(max)} VND`;
  return `${formatNumber(min)} - ${formatNumber(max)} VND`;
};

const formatNumber = (num) => new Intl.NumberFormat('vi-VN').format(num);

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const getStatusLabel = (status) => {
  const labels = {
    pending: '⏳ Đang chờ xử lý',
    reviewing: '👀 Đang xem xét',
    accepted: '✅ Được chấp nhận',
    rejected: '❌ Bị từ chối',
    withdrawn: '🚫 Đã rút đơn',
  };
  const key = normalizeStatus(status);
  return labels[key] || status;
};

const getEmptyMessage = () => {
  const messages = {
    all: 'Bạn chưa có đơn ứng tuyển nào',
    pending: 'Không có đơn nào đang chờ xử lý',
    reviewing: 'Không có đơn nào đang được xem xét',
    accepted: 'Không có đơn nào được chấp nhận',
    rejected: 'Không có đơn nào bị từ chối',
    withdrawn: 'Bạn chưa rút đơn nào',
  };
  return messages[filter.value] || 'Không có dữ liệu';
};

onMounted(async () => {
  await Promise.all([fetchActiveApplications(), fetchStats()]);
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

.filter-btn {
  padding: 10px 20px;
  border: none;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  color: #495057;
}

.filter-btn:hover {
  background: #e9ecef;
}

.filter-btn.active {
  background: #667eea;
  color: white;
}

/* Loading */
.loading-state {
  background: white;
  padding: 50px 20px;
  text-align: center;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e9ecef;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Applications Grid */
.applications-grid {
  display: grid;
  gap: 20px;
}

.application-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.application-card:hover {
  transform: translateY(-2px);
}

/* Card Header */
.card-header {
  padding: 20px 25px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.company-info {
  display: flex;
  gap: 15px;
  flex: 1;
}

.company-logo {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.company-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #2c3e50;
}

.company-name {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.reviewing { background: #cfe2ff; color: #084298; }
.status-badge.accepted { background: #d4edda; color: #155724; }
.status-badge.rejected { background: #f8d7da; color: #721c24; }
.status-badge.withdrawn { background: #e2e3e5; color: #41464b; }

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
  gap: 20px;
}

.info-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.info-item .icon {
  font-size: 20px;
}

.info-item .label {
  font-size: 12px;
  color: #888;
  margin: 0 0 3px 0;
}

.info-item .value {
  font-size: 14px;
  color: #2c3e50;
  margin: 0;
  font-weight: 500;
}

.employer-note-preview {
  padding: 15px;
  border-radius: 8px;
  font-size: 14px;
}

.employer-note-preview.accepted { background: #d4edda; color: #155724; }
.employer-note-preview.rejected { background: #f8d7da; color: #721c24; }
.employer-note-preview.reviewing { background: #cfe2ff; color: #084298; }
.employer-note-preview.pending { background: #fff3cd; color: #856404; }
.employer-note-preview.withdrawn { background: #e2e3e5; color: #41464b; }

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

/* Empty State */
.empty-state {
  background: white;
  padding: 60px 20px;
  text-align: center;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 20px;
}

.empty-state p {
  color: #666;
  margin: 0 0 25px 0;
}

.btn-primary {
  padding: 12px 25px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
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
  background: #f8f9fa;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #e9ecef;
}

.modal-content h2 {
  margin: 0 0 30px 0;
  color: #2c3e50;
  font-size: 24px;
}

.modal-section {
  margin-bottom: 25px;
}

.modal-section h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 18px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detail-item {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-item .label {
  font-weight: 600;
  color: #555;
}

.detail-item .value {
  color: #2c3e50;
}

.cv-link {
  display: inline-block;
  padding: 10px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #667eea;
  font-weight: 500;
  transition: all 0.3s;
}

.cv-link:hover {
  background: #e9ecef;
}

.text-content {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.employer-feedback.accepted .text-content { background: #d4edda; }
.employer-feedback.rejected .text-content { background: #f8d7da; }
.employer-feedback.reviewing .text-content { background: #cfe2ff; }
.employer-feedback.pending .text-content { background: #fff3cd; }
.employer-feedback.withdrawn .text-content { background: #e2e3e5; }

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

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
</style>
