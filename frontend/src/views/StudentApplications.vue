<template>
  <div class="student-applications-page">
    <Header />

    <main class="page-wrap">
      <div class="container">
        <div class="page-header">
          <div>
            <h1>📄 Đơn ứng tuyển của tôi</h1>
            <p class="page-subtitle">
              Theo dõi trạng thái ứng tuyển và tiến trình xử lý hồ sơ
            </p>
          </div>

          <button class="btn btn-secondary" @click="router.back()">
            ← Quay lại
          </button>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon all">📌</div>
            <div>
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">Tổng đơn hiệu lực</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon pending">⏳</div>
            <div>
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">Chờ xử lý</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon reviewing">👀</div>
            <div>
              <div class="stat-value">{{ stats.reviewing }}</div>
              <div class="stat-label">Đang xem xét</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon accepted">✅</div>
            <div>
              <div class="stat-value">{{ stats.accepted }}</div>
              <div class="stat-label">Đã chấp nhận</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon rejected">❌</div>
            <div>
              <div class="stat-value">{{ stats.rejected }}</div>
              <div class="stat-label">Đã từ chối</div>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <button
            class="filter-btn"
            :class="{ active: filter === 'all' }"
            @click="changeFilter('all')"
          >
            Tất cả
          </button>
          <button
            class="filter-btn"
            :class="{ active: filter === 'pending' }"
            @click="changeFilter('pending')"
          >
            Chờ xử lý
          </button>
          <button
            class="filter-btn"
            :class="{ active: filter === 'reviewing' }"
            @click="changeFilter('reviewing')"
          >
            Đang xem xét
          </button>
          <button
            class="filter-btn"
            :class="{ active: filter === 'accepted' }"
            @click="changeFilter('accepted')"
          >
            Đã chấp nhận
          </button>
          <button
            class="filter-btn"
            :class="{ active: filter === 'rejected' }"
            @click="changeFilter('rejected')"
          >
            Đã từ chối
          </button>
        </div>

        <div v-if="loading" class="state-box">
          <div class="loading-spinner"></div>
          <p>Đang tải đơn ứng tuyển...</p>
        </div>

        <div v-else-if="applications.length === 0" class="state-box">
          <div class="empty-icon">📭</div>
          <p>Bạn chưa có đơn ứng tuyển nào.</p>
          <router-link to="/student/jobs" class="btn btn-primary">
            Tìm việc ngay
          </router-link>
        </div>

        <div v-else class="applications-list">
          <div
            v-for="app in applications"
            :key="app._id"
            class="application-card"
          >
            <div class="application-top">
              <div>
                <h3>{{ app.job?.title || 'Không xác định' }}</h3>
                <p class="company-line">
                  {{ app.job?.employer?.companyName || 'Nhà tuyển dụng' }}
                </p>
                <p class="meta-line">
                  {{ app.job?.location?.city || 'Không rõ địa điểm' }} •
                  {{ getJobTypeLabel(app.job?.jobType) }}
                </p>
              </div>

              <span class="status-badge" :class="'status-' + app.status">
                {{ getStatusLabel(app.status) }}
              </span>
            </div>

            <div class="application-grid">
              <div class="info-item">
                <span class="label">Ngày ứng tuyển:</span>
                <span class="value">{{ formatDateTime(app.appliedAt || app.createdAt) }}</span>
              </div>

              <div class="info-item">
                <span class="label">Mức lương kỳ vọng:</span>
                <span class="value">
                  {{ app.expectedSalary ? formatCurrency(app.expectedSalary) : 'Không có' }}
                </span>
              </div>

              <div class="info-item">
                <span class="label">Hạn tin:</span>
                <span class="value">{{ formatDate(app.job?.deadline) }}</span>
              </div>

              <div class="info-item">
                <span class="label">Cập nhật gần nhất:</span>
                <span class="value">
                  {{ formatDateTime(app.reviewedAt || app.updatedAt) }}
                </span>
              </div>
            </div>

            <div v-if="app.employerNote" class="note-box">
              <strong>Ghi chú từ nhà tuyển dụng:</strong>
              <p>{{ app.employerNote }}</p>
            </div>

            <div class="card-actions">
              <button class="btn btn-outline" @click="openDetail(app)">
                Xem chi tiết
              </button>

              <button
                v-if="canWithdraw(app)"
                class="btn btn-danger"
                @click="withdraw(app)"
              >
                Rút đơn
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="selectedApplication" class="modal" @click="closeDetail">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeDetail">✕</button>

        <h2>📋 Chi tiết đơn ứng tuyển</h2>

        <div class="detail-section">
          <h3>Thông tin công việc</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Vị trí:</span>
              <span class="value">{{ selectedApplication.job?.title }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Công ty:</span>
              <span class="value">
                {{ selectedApplication.job?.employer?.companyName || 'Nhà tuyển dụng' }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">Địa điểm:</span>
              <span class="value">
                {{ selectedApplication.job?.location?.city || 'Không rõ' }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">Trạng thái:</span>
              <span class="value">
                {{ getStatusLabel(selectedApplication.status) }}
              </span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Thông tin đơn</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Ngày ứng tuyển:</span>
              <span class="value">
                {{ formatDateTime(selectedApplication.appliedAt || selectedApplication.createdAt) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">Ngày sẵn sàng đi làm:</span>
              <span class="value">
                {{ formatDate(selectedApplication.availableFrom) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">Mức lương kỳ vọng:</span>
              <span class="value">
                {{
                  selectedApplication.expectedSalary
                    ? formatCurrency(selectedApplication.expectedSalary)
                    : 'Không có'
                }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">CV:</span>
              <span class="value">
                <a
                  v-if="selectedApplication.resumeUrl"
                  :href="getFullUrl(selectedApplication.resumeUrl)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link"
                >
                  Xem CV
                </a>
                <span v-else>Không có</span>
              </span>
            </div>
          </div>
        </div>

        <div v-if="selectedApplication.coverLetter" class="detail-section">
          <h3>Thư xin việc</h3>
          <div class="text-box">{{ selectedApplication.coverLetter }}</div>
        </div>

        <div v-if="selectedApplication.additionalInfo" class="detail-section">
          <h3>Thông tin bổ sung</h3>
          <div class="text-box">{{ selectedApplication.additionalInfo }}</div>
        </div>

        <div v-if="selectedApplication.employerNote" class="detail-section">
          <h3>Phản hồi từ nhà tuyển dụng</h3>
          <div class="text-box note-box-modal">
            {{ selectedApplication.employerNote }}
          </div>
        </div>

        <div class="modal-actions">
          <button
            v-if="canWithdraw(selectedApplication)"
            class="btn btn-danger"
            @click="withdraw(selectedApplication)"
          >
            Rút đơn
          </button>

          <button class="btn btn-secondary" @click="closeDetail">
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import api from '../services/api';

const router = useRouter();

const loading = ref(false);
const filter = ref('all');
const applications = ref([]);
const selectedApplication = ref(null);

const stats = reactive({
  total: 0,
  pending: 0,
  reviewing: 0,
  accepted: 0,
  rejected: 0,
  withdrawn: 0,
});

const fetchStats = async () => {
  try {
    const res = await api.get('/applications/my-stats');
    const s = res.data.stats || {};

    stats.total = s.total || 0;
    stats.pending = s.pending || 0;
    stats.reviewing = s.reviewing || 0;
    stats.accepted = s.accepted || 0;
    stats.rejected = s.rejected || 0;
    stats.withdrawn = s.withdrawn || 0;
  } catch (error) {
    console.error('Error fetching application stats:', error);
  }
};

const fetchApplications = async () => {
  try {
    loading.value = true;

    const params = { sort: '-appliedAt' };
    if (filter.value !== 'all') {
      params.status = filter.value;
    }

    const res = await api.get('/applications/my-applications', { params });
    applications.value = res.data.applications || [];
  } catch (error) {
    console.error('Error fetching my applications:', error);
    alert(error.response?.data?.message || 'Không thể tải đơn ứng tuyển');
  } finally {
    loading.value = false;
  }
};

const fetchAll = async () => {
  await Promise.all([fetchStats(), fetchApplications()]);
};

const changeFilter = async (value) => {
  filter.value = value;
  await fetchApplications();
};

const openDetail = async (app) => {
  try {
    const res = await api.get(`/applications/${app._id}`);
    selectedApplication.value = res.data.application || app;
  } catch (error) {
    console.error('Error fetching application detail:', error);
    selectedApplication.value = app;
  }
};

const closeDetail = () => {
  selectedApplication.value = null;
};

const canWithdraw = (app) => {
  return ['pending', 'reviewing'].includes(app?.status);
};

const withdraw = async (app) => {
  if (!canWithdraw(app)) {
    alert('Chỉ có thể rút đơn khi đang chờ xử lý hoặc đang xem xét');
    return;
  }

  if (!window.confirm('Bạn có chắc muốn rút đơn ứng tuyển này?')) {
    return;
  }

  try {
    await api.put(`/applications/${app._id}/withdraw`);
    alert('✅ Đã rút đơn thành công');

    if (selectedApplication.value?._id === app._id) {
      closeDetail();
    }

    await fetchAll();
  } catch (error) {
    console.error('Error withdrawing application:', error);
    alert(error.response?.data?.message || 'Không thể rút đơn');
  }
};

const getStatusLabel = (status) => {
  const labels = {
    pending: '⏳ Chờ xử lý',
    reviewing: '👀 Đang xem xét',
    accepted: '✅ Đã chấp nhận',
    rejected: '❌ Đã từ chối',
    withdrawn: '↩️ Đã rút',
  };
  return labels[status] || status;
};

const getJobTypeLabel = (type) => {
  const types = {
    'full-time': 'Toàn thời gian',
    'part-time': 'Bán thời gian',
    internship: 'Thực tập',
    contract: 'Hợp đồng',
    freelance: 'Freelance',
  };
  return types[type] || 'Không xác định';
};

const formatDate = (date) => {
  if (!date) return 'Chưa cập nhật';
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatDateTime = (date) => {
  if (!date) return 'Chưa cập nhật';
  return new Date(date).toLocaleString('vi-VN');
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;

  const apiBase = api.defaults.baseURL || '';
  const origin = apiBase.replace(/\/api\/?$/, '');

  return `${origin}${url}`;
};

onMounted(() => {
  fetchAll();
});
</script>

<style scoped>
.page-wrap {
  padding: 32px 0 48px;
  min-height: calc(100vh - 70px);
  background: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 32px;
}

.page-subtitle {
  margin: 0;
  color: #64748b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 22px;
  color: #fff;
}

.stat-icon.all { background: #6366f1; }
.stat-icon.pending { background: #f59e0b; }
.stat-icon.reviewing { background: #0ea5e9; }
.stat-icon.accepted { background: #22c55e; }
.stat-icon.rejected { background: #ef4444; }

.stat-value {
  font-size: 26px;
  font-weight: 700;
}

.stat-label {
  color: #64748b;
  font-size: 14px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.filter-btn {
  border: none;
  background: #e2e8f0;
  color: #0f172a;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
}

.filter-btn.active {
  background: #2563eb;
  color: #fff;
}

.state-box {
  background: #fff;
  border-radius: 18px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.loading-spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  margin: 0 auto 14px;
  animation: spin 1s linear infinite;
}

.empty-icon {
  font-size: 44px;
  margin-bottom: 12px;
}

.applications-list {
  display: grid;
  gap: 16px;
}

.application-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.application-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.application-top h3 {
  margin: 0 0 6px;
}

.company-line,
.meta-line {
  margin: 0;
  color: #64748b;
}

.application-grid,
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.info-item,
.detail-item {
  background: #f8fafc;
  padding: 12px 14px;
  border-radius: 12px;
}

.label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.value {
  font-weight: 600;
  color: #0f172a;
  word-break: break-word;
}

.note-box,
.text-box {
  margin-top: 16px;
  background: #fff7ed;
  border-left: 4px solid #f59e0b;
  padding: 14px;
  border-radius: 12px;
}

.note-box p {
  margin: 8px 0 0;
}

.card-actions,
.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.status-badge {
  white-space: nowrap;
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-reviewing {
  background: #e0f2fe;
  color: #075985;
}

.status-accepted {
  background: #dcfce7;
  color: #166534;
}

.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-withdrawn {
  background: #e2e8f0;
  color: #334155;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  padding: 10px 16px;
  font-weight: 700;
  text-decoration: none;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-secondary {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-outline {
  background: #fff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.btn-danger {
  background: #ef4444;
  color: #fff;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 16px;
}

.modal-content {
  width: min(860px, 100%);
  max-height: 90vh;
  overflow: auto;
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  border: none;
  background: #f1f5f9;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
}

.detail-section {
  margin-top: 18px;
}

.detail-section h3 {
  margin-bottom: 12px;
}

.link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 700;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .page-header,
  .application-top {
    flex-direction: column;
  }
}
</style>