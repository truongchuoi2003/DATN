<template>
  <div class="admin-jobs">
    <Header />

    <div class="container">
      <div class="page-header">
        <h1>📢 Quản lý Tin tuyển dụng</h1>
        <div class="filter-tabs">
          <button :class="{ active: filter === 'all' }" @click="filter = 'all'">
            📋 Tất cả ({{ jobs.length }})
          </button>
          <button :class="{ active: filter === 'active' }" @click="filter = 'active'">
            ✅ Đang tuyển ({{ activeCount }})
          </button>
          <button :class="{ active: filter === 'closed' }" @click="filter = 'closed'">
            🔒 Đã đóng ({{ closedCount }})
          </button>
          <button :class="{ active: filter === 'expired' }" @click="filter = 'expired'">
            ⌛ Hết hạn ({{ expiredCount }})
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <div v-if="message" class="alert" :class="{ success: isSuccess, error: !isSuccess }">
        {{ message }}
      </div>

      <div v-if="!loading" class="employers-table">
        <table>
          <thead>
            <tr>
              <th>Tin tuyển dụng</th>
              <th>Công ty</th>
              <th>Địa điểm</th>
              <th>Loại job</th>
              <th>Ngày đăng</th>
              <th>Trạng thái</th>
              <th>Thống kê</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in filteredJobs" :key="job._id">
              <td>
                <div class="company-cell">
                  <div class="company-logo">
                    {{ getInitials(job.title) }}
                  </div>
                  <div>
                    <strong>{{ job.title }}</strong>
                    <p>{{ getLevelLabel(job.level) }} • {{ getJobTypeLabel(job.jobType) }}</p>
                  </div>
                </div>
              </td>

              <td>
                <strong>{{ job.employer?.companyName || 'Chưa có tên công ty' }}</strong>
                <p>{{ job.employer?.email || '-' }}</p>
              </td>

              <td>
                {{ job.location?.city || '-' }}
                <p>{{ job.location?.address || '-' }}</p>
              </td>

              <td>{{ getJobTypeLabel(job.jobType) }}</td>

              <td>{{ formatDate(job.createdAt) }}</td>

              <td>
                <span class="status-badge" :class="job.status">
                  {{ getStatusLabel(job.status) }}
                </span>
              </td>

              <td>
                <div class="stats-mini">
                  <span>👁️ {{ job.views || 0 }}</span>
                  <span>👥 {{ job.applicationsCount || 0 }}</span>
                </div>
              </td>

              <td>
                <div class="action-buttons">
                  <button
                    class="btn-action view"
                    @click="viewDetails(job._id)"
                    title="Xem chi tiết"
                  >
                    👁️
                  </button>
                  <button
                    class="btn-action approve"
                    @click="handleToggleStatus(job)"
                    :title="job.status === 'active' ? 'Đóng tin' : 'Mở lại tin'"
                  >
                    {{ job.status === 'active' ? '🔒' : '🔓' }}
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredJobs.length === 0">
              <td colspan="8" class="empty-state">
                <p>📭 Không có tin tuyển dụng nào</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="selectedJob" class="modal" @click="closeModal">
        <div class="modal-content large" @click.stop>
          <button class="btn-close" @click="closeModal">✕</button>

          <h2>{{ selectedJob.title }}</h2>

          <div class="detail-grid">
            <div class="detail-item">
              <label>Công ty:</label>
              <span>{{ selectedJob.employer?.companyName || '-' }}</span>
            </div>

            <div class="detail-item">
              <label>Email công ty:</label>
              <span>{{ selectedJob.employer?.email || '-' }}</span>
            </div>

            <div class="detail-item">
              <label>Loại công việc:</label>
              <span>{{ getJobTypeLabel(selectedJob.jobType) }}</span>
            </div>

            <div class="detail-item">
              <label>Cấp bậc:</label>
              <span>{{ getLevelLabel(selectedJob.level) }}</span>
            </div>

            <div class="detail-item">
              <label>Kinh nghiệm:</label>
              <span>{{ getExperienceLabel(selectedJob.experience) }}</span>
            </div>

            <div class="detail-item">
              <label>Hình thức làm việc:</label>
              <span>{{ getWorkModeLabel(selectedJob.workMode) }}</span>
            </div>

            <div class="detail-item">
              <label>Ngày đăng:</label>
              <span>{{ formatDate(selectedJob.createdAt) }}</span>
            </div>

            <div class="detail-item">
              <label>Hạn nộp:</label>
              <span>{{ formatDate(selectedJob.deadline) }}</span>
            </div>

            <div class="detail-item">
              <label>Trạng thái:</label>
              <span class="status-badge" :class="selectedJob.status">
                {{ getStatusLabel(selectedJob.status) }}
              </span>
            </div>

            <div class="detail-item">
              <label>Mức lương:</label>
              <span>{{ formatSalary(selectedJob.salary) }}</span>
            </div>

            <div class="detail-item full-width">
              <label>Địa điểm:</label>
              <p>
                {{ selectedJob.location?.address || '-' }}
                <span v-if="selectedJob.location?.city"> - {{ selectedJob.location.city }}</span>
              </p>
            </div>

            <div class="detail-item full-width">
              <label>Mô tả công việc:</label>
              <p class="multiline-text">{{ selectedJob.description || '-' }}</p>
            </div>

            <div class="detail-item full-width">
              <label>Yêu cầu:</label>
              <p class="multiline-text">{{ selectedJob.requirements || '-' }}</p>
            </div>

            <div class="detail-item full-width" v-if="selectedJob.benefits">
              <label>Quyền lợi:</label>
              <p class="multiline-text">{{ selectedJob.benefits }}</p>
            </div>

            <div
              class="detail-item full-width"
              v-if="selectedJob.skills && selectedJob.skills.length"
            >
              <label>Kỹ năng:</label>
              <div class="skills-tags">
                <span v-for="skill in selectedJob.skills" :key="skill" class="skill-tag">
                  {{ skill }}
                </span>
              </div>
            </div>

            <div
              class="detail-item full-width"
              v-if="selectedJob.categories && selectedJob.categories.length"
            >
              <label>Danh mục:</label>
              <div class="skills-tags">
                <span v-for="category in selectedJob.categories" :key="category" class="skill-tag">
                  {{ category }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button
              class="btn"
              :class="selectedJob.status === 'active' ? 'btn-danger' : 'btn-success'"
              @click="handleToggleStatus(selectedJob)"
            >
              {{ selectedJob.status === 'active' ? '🔒 Đóng tin tuyển dụng' : '🔓 Mở lại tin tuyển dụng' }}
            </button>

            <button class="btn btn-outline" @click="closeModal">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '../components/Header.vue';
import api from '../services/api';

const loading = ref(false);
const message = ref('');
const isSuccess = ref(false);
const jobs = ref([]);
const filter = ref('all');
const selectedJob = ref(null);

const activeCount = computed(() => jobs.value.filter((job) => job.status === 'active').length);
const closedCount = computed(() => jobs.value.filter((job) => job.status === 'closed').length);
const expiredCount = computed(() => jobs.value.filter((job) => job.status === 'expired').length);

const filteredJobs = computed(() => {
  if (filter.value === 'all') return jobs.value;
  return jobs.value.filter((job) => job.status === filter.value);
});

const getInitials = (name) => {
  if (!name) return '?';
  const words = name.trim().split(' ').filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

const getStatusLabel = (status) => {
  const map = {
    active: '✅ Đang tuyển',
    closed: '🔒 Đã đóng',
    expired: '⌛ Hết hạn',
  };
  return map[status] || status;
};

const getJobTypeLabel = (jobType) => {
  const map = {
    'full-time': 'Toàn thời gian',
    'part-time': 'Bán thời gian',
    internship: 'Thực tập',
    contract: 'Hợp đồng',
    freelance: 'Freelance',
  };
  return map[jobType] || jobType || '-';
};

const getLevelLabel = (level) => {
  const map = {
    intern: 'Intern',
    fresher: 'Fresher',
    junior: 'Junior',
    middle: 'Middle',
    senior: 'Senior',
    leader: 'Leader',
    manager: 'Manager',
  };
  return map[level] || level || '-';
};

const getExperienceLabel = (experience) => {
  const map = {
    'no-experience': 'Không yêu cầu kinh nghiệm',
    '0-1-year': '0 - 1 năm',
    '1-3-years': '1 - 3 năm',
    '3-5-years': '3 - 5 năm',
    '5+-years': 'Trên 5 năm',
  };
  return map[experience] || experience || '-';
};

const getWorkModeLabel = (workMode) => {
  const map = {
    onsite: 'Onsite',
    remote: 'Remote',
    hybrid: 'Hybrid',
  };
  return map[workMode] || workMode || '-';
};

const formatSalary = (salary) => {
  if (!salary) return 'Thỏa thuận';
  if (salary.negotiable) return 'Thỏa thuận';

  const min = salary.min ? salary.min.toLocaleString('vi-VN') : 0;
  const max = salary.max ? salary.max.toLocaleString('vi-VN') : 0;
  const currency = salary.currency || 'VND';

  return `${min} - ${max} ${currency}`;
};

const fetchJobs = async () => {
  try {
    loading.value = true;
    message.value = '';

    const res = await api.get('/admin/jobs');
    jobs.value = res.data.jobs || [];
  } catch (error) {
    console.error('Error fetching admin jobs:', error);
    message.value = error.response?.data?.message || 'Không thể tải danh sách tin tuyển dụng';
    isSuccess.value = false;
  } finally {
    loading.value = false;
  }
};

const viewDetails = async (jobId) => {
  try {
    const res = await api.get(`/admin/jobs/${jobId}`);
    selectedJob.value = res.data.job;
  } catch (error) {
    console.error('Error fetching job detail:', error);
    message.value = error.response?.data?.message || 'Không thể tải chi tiết job';
    isSuccess.value = false;
  }
};

const closeModal = () => {
  selectedJob.value = null;
};

const handleToggleStatus = async (job) => {
  try {
    const res = await api.patch(`/admin/jobs/${job._id}/toggle-status`);

    message.value = res.data.message || 'Cập nhật trạng thái thành công';
    isSuccess.value = true;

    const index = jobs.value.findIndex((item) => item._id === job._id);
    if (index !== -1) {
      jobs.value[index].status = res.data.job.status;
    }

    if (selectedJob.value && selectedJob.value._id === job._id) {
      selectedJob.value.status = res.data.job.status;
    }
  } catch (error) {
    console.error('Error toggling admin job status:', error);
    message.value = error.response?.data?.message || 'Không thể cập nhật trạng thái job';
    isSuccess.value = false;
  }
};

onMounted(fetchJobs);
</script>

<style scoped>
.admin-jobs {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 30px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.page-header h1 {
  font-size: 32px;
  color: #2c3e50;
  margin: 0;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-tabs button {
  padding: 10px 20px;
  border: 2px solid #e0e6ed;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.filter-tabs button:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.filter-tabs button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.loading {
  text-align: center;
  padding: 60px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e6ed;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

.alert {
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
}

.alert.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.employers-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9fa;
}

th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e6ed;
}

td {
  padding: 15px;
  border-bottom: 1px solid #e0e6ed;
  vertical-align: top;
}

tr:hover {
  background: #f8f9fa;
}

.company-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-logo {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  flex-shrink: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.closed {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.expired {
  background: #fff3cd;
  color: #856404;
}

.stats-mini {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #475569;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-action {
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-action:hover {
  transform: translateY(-1px);
}

.btn-action.view {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-action.approve {
  background: #fff3e0;
  color: #f57c00;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 28px;
}

.modal-content.large {
  max-width: 900px;
}

.btn-close {
  position: absolute;
  top: 14px;
  right: 14px;
  border: none;
  background: #f1f5f9;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 20px;
}

.detail-item {
  background: #f8fafc;
  border-radius: 10px;
  padding: 14px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  display: block;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
}

.detail-item span,
.detail-item p {
  margin: 0;
  color: #475569;
}

.multiline-text {
  white-space: pre-line;
  line-height: 1.6;
}

.skills-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.skill-tag {
  background: #eef2ff;
  color: #4338ca;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  flex-wrap: wrap;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-success {
  background: #16a34a;
  color: white;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-outline {
  background: white;
  border: 1px solid #cbd5e1;
  color: #334155;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 20px 12px;
  }

  .page-header {
    align-items: flex-start;
  }

  .page-header h1 {
    font-size: 26px;
  }

  .employers-table {
    overflow-x: auto;
  }

  table {
    min-width: 1100px;
  }

  .modal-content {
    padding: 20px;
  }
}
</style>