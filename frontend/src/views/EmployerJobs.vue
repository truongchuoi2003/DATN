<template>
  <div class="employer-jobs">
    <Header />
    
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>📢 Quản lý tin tuyển dụng</h1>
          <p class="subtitle">Quản lý và theo dõi các tin tuyển dụng của bạn</p>
        </div>
        <router-link to="/employer/jobs/create" class="btn btn-primary">
          ➕ Đăng tin mới
        </router-link>
      </div>

      <!-- Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            📋
          </div>
          <div class="stat-info">
            <h3>{{ statistics.totalJobs || 0 }}</h3>
            <p>Tổng số tin</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            ✅
          </div>
          <div class="stat-info">
            <h3>{{ statistics.activeJobs || 0 }}</h3>
            <p>Đang tuyển</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            👁️
          </div>
          <div class="stat-info">
            <h3>{{ statistics.totalViews || 0 }}</h3>
            <p>Lượt xem</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            👥
          </div>
          <div class="stat-info">
            <h3>{{ statistics.totalApplications || 0 }}</h3>
            <p>Ứng viên</p>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          :class="{ active: filter === 'all' }" 
          @click="filter = 'all'"
        >
          📋 Tất cả ({{ jobs.length }})
        </button>
        <button 
          :class="{ active: filter === 'active' }" 
          @click="filter = 'active'"
        >
          ✅ Đang tuyển ({{ activeCount }})
        </button>
        <button 
          :class="{ active: filter === 'closed' }" 
          @click="filter = 'closed'"
        >
          🔒 Đã đóng ({{ closedCount }})
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Jobs List -->
      <div v-else class="jobs-list">
        <div v-if="filteredJobs.length === 0" class="empty-state">
          <p>📭 Chưa có tin tuyển dụng nào</p>
          <router-link to="/employer/jobs/create" class="btn btn-primary">
            Đăng tin đầu tiên
          </router-link>
        </div>

        <div v-else class="job-cards">
          <div v-for="job in filteredJobs" :key="job._id" class="job-card">
            <!-- Job Header -->
            <div class="job-header">
              <div class="job-title-area">
                <h3>{{ job.title }}</h3>
                <div class="job-meta">
                  <span>📍 {{ job.location.city }}</span>
                  <span>💼 {{ getJobTypeLabel(job.jobType) }}</span>
                  <span>⭐ {{ getLevelLabel(job.level) }}</span>
                </div>
              </div>
              <span class="status-badge" :class="job.status">
                {{ job.status === 'active' ? '✅ Đang tuyển' : '🔒 Đã đóng' }}
              </span>
            </div>

            <!-- Job Info -->
            <div class="job-info">
              <div class="info-row">
                <span class="label">💰 Mức lương:</span>
                <span class="value">{{ formatSalary(job.salary) }}</span>
              </div>
              <div class="info-row">
                <span class="label">⏰ Hạn nộp:</span>
                <span class="value" :class="{ expired: isExpired(job.deadline) }">
                  {{ formatDate(job.deadline) }}
                  {{ isExpired(job.deadline) ? '(Hết hạn)' : '' }}
                </span>
              </div>
              <div class="info-row">
                <span class="label">🎯 Số lượng:</span>
                <span class="value">{{ job.slots }} vị trí</span>
              </div>
            </div>

            <!-- Job Stats -->
            <div class="job-stats">
              <div class="stat-item">
                <span class="stat-number">{{ job.views || 0 }}</span>
                <span class="stat-label">Lượt xem</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ job.applicationsCount || 0 }}</span>
                <span class="stat-label">Ứng viên</span>
              </div>
              <div class="stat-item">
                  <span class="stat-number">{{ formatDate(job.createdAt) }}</span>
                  <span class="stat-label">Ngày đăng</span>
              </div>
            </div>

            <!-- Job Actions -->
            <div class="job-actions">
              <button 
                @click="viewJob(job._id)" 
                class="btn-action view"
                title="Xem chi tiết"
              >
                👁️ Xem
              </button>
              <router-link 
                :to="`/employer/jobs/${job._id}/edit`"
                class="btn-action edit"
                title="Chỉnh sửa"
              >
                ✏️ Sửa
              </router-link>
              <button 
                @click="toggleStatus(job)" 
                class="btn-action toggle"
                :title="job.status === 'active' ? 'Đóng tin' : 'Mở lại'"
              >
                {{ job.status === 'active' ? '🔒 Đóng' : '🔓 Mở' }}
              </button>
              <button 
                @click="deleteJob(job._id)" 
                class="btn-action delete"
                title="Xóa"
              >
                🗑️ Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Job Modal -->
    <div v-if="selectedJob" class="modal" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <button class="btn-close" @click="closeModal">✕</button>
        
        <h2>{{ selectedJob.title }}</h2>
        
        <div class="job-detail-grid">
          <div class="detail-section">
            <h3>📋 Thông tin cơ bản</h3>
            <div class="detail-list">
              <div class="detail-item">
                <span class="label">Vị trí:</span>
                <span>{{ selectedJob.title }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Loại hình:</span>
                <span>{{ getJobTypeLabel(selectedJob.jobType) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Cấp bậc:</span>
                <span>{{ getLevelLabel(selectedJob.level) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Kinh nghiệm:</span>
                <span>{{ getExperienceLabel(selectedJob.experience) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Số lượng:</span>
                <span>{{ selectedJob.slots }} người</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>💰 Lương & Địa điểm</h3>
            <div class="detail-list">
              <div class="detail-item">
                <span class="label">Mức lương:</span>
                <span>{{ formatSalary(selectedJob.salary) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Địa chỉ:</span>
                <span>{{ selectedJob.location.address }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Thành phố:</span>
                <span>{{ selectedJob.location.city }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Hạn nộp:</span>
                <span>{{ formatDate(selectedJob.deadline) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section full-width">
            <h3>📝 Mô tả công việc</h3>
            <p class="description">{{ selectedJob.description }}</p>
          </div>

          <div class="detail-section full-width">
            <h3>✅ Yêu cầu</h3>
            <p class="description">{{ selectedJob.requirements }}</p>
          </div>

          <div class="detail-section full-width" v-if="selectedJob.benefits">
            <h3>🎁 Quyền lợi</h3>
            <p class="description">{{ selectedJob.benefits }}</p>
          </div>

          <div class="detail-section full-width" v-if="selectedJob.skills && selectedJob.skills.length > 0">
            <h3>🔧 Kỹ năng yêu cầu</h3>
            <div class="skills-tags">
              <span v-for="skill in selectedJob.skills" :key="skill" class="skill-tag">
                {{ skill }}
              </span>
            </div>
          </div>
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
const jobs = ref([]);
const statistics = ref({});
const filter = ref('all');
const selectedJob = ref(null);

const activeCount = computed(() => jobs.value.filter(j => j.status === 'active').length);
const closedCount = computed(() => jobs.value.filter(j => j.status === 'closed').length);

const filteredJobs = computed(() => {
  if (filter.value === 'all') return jobs.value;
  return jobs.value.filter(j => j.status === filter.value);
});

// Fetch data
const fetchJobs = async () => {
  try {
    loading.value = true;
    const res = await api.get('/jobs/my-jobs');
    jobs.value = res.data.jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    alert('Không thể tải danh sách tin tuyển dụng');
  } finally {
    loading.value = false;
  }
};

const fetchStatistics = async () => {
  try {
    const res = await api.get('/jobs/statistics');
    statistics.value = res.data.statistics;
  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
};

// View job detail
const viewJob = async (jobId) => {
  try {
    const res = await api.get(`/jobs/${jobId}`);
    selectedJob.value = res.data.job;
  } catch (error) {
    console.error('Error fetching job:', error);
    alert('Không thể tải thông tin tin tuyển dụng');
  }
};

const closeModal = () => {
  selectedJob.value = null;
};

// Toggle status
const toggleStatus = async (job) => {
  const action = job.status === 'active' ? 'đóng' : 'mở lại';
  if (!confirm(`Bạn có chắc muốn ${action} tin này?`)) return;

  try {
    await api.patch(`/jobs/${job._id}/toggle-status`);
    alert(`Đã ${action} tin tuyển dụng thành công!`);
    fetchJobs();
    fetchStatistics();
  } catch (error) {
    console.error('Error toggling status:', error);
    alert('Có lỗi xảy ra');
  }
};

// Delete job
const deleteJob = async (jobId) => {
  if (!confirm('Bạn có chắc muốn xóa tin này? Hành động này không thể hoàn tác!')) return;

  try {
    await api.delete(`/jobs/${jobId}`);
    alert('Đã xóa tin tuyển dụng thành công!');
    fetchJobs();
    fetchStatistics();
  } catch (error) {
    console.error('Error deleting job:', error);
    alert('Có lỗi xảy ra');
  }
};

// Formatters
const formatSalary = (salary) => {
  if (!salary) return 'Thỏa thuận';
  const min = (salary.min / 1000000).toFixed(0);
  const max = (salary.max / 1000000).toFixed(0);
  return `${min} - ${max} triệu ${salary.currency}${salary.negotiable ? ' (TT)' : ''}`;
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

const isExpired = (deadline) => {
  return new Date(deadline) < new Date();
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

const getLevelLabel = (level) => {
  const levels = {
    'intern': 'Thực tập sinh',
    'fresher': 'Fresher',
    'junior': 'Junior',
    'middle': 'Middle',
    'senior': 'Senior',
    'leader': 'Leader',
    'manager': 'Manager',
  };
  return levels[level] || level;
};

const getExperienceLabel = (exp) => {
  const exps = {
    'no-experience': 'Không yêu cầu',
    '0-1-year': '0-1 năm',
    '1-3-years': '1-3 năm',
    '3-5-years': '3-5 năm',
    '5+-years': 'Trên 5 năm',
  };
  return exps[exp] || exp;
};

onMounted(() => {
  fetchJobs();
  fetchStatistics();
});
</script>

<style scoped>
.employer-jobs {
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
  align-items: center;
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
  margin-bottom: 30px;
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
  border-color: #4ecdc4;
}

.filter-tabs button.active {
  border-color: #4ecdc4;
  background: #4ecdc4;
  color: white;
}

/* Loading */
.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #4ecdc4;
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
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.empty-state p {
  font-size: 18px;
  color: #999;
  margin-bottom: 20px;
}

/* Job Cards */
.job-cards {
  display: grid;
  gap: 20px;
}

.job-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.job-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.job-title-area h3 {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.job-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.job-meta span {
  font-size: 13px;
  color: #666;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.closed {
  background: #f8d7da;
  color: #721c24;
}

/* Job Info */
.job-info {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.info-row .label {
  color: #666;
}

.info-row .value {
  font-weight: 500;
  color: #2c3e50;
}

.info-row .value.expired {
  color: #dc3545;
}

/* Job Stats */
.job-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 20px;
  font-weight: 600;
  color: #4ecdc4;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

/* Job Actions */
.job-actions {
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
  border-color: #4ecdc4;
  color: #4ecdc4;
}

.btn-action.edit:hover {
  border-color: #667eea;
  color: #667eea;
}

.btn-action.toggle:hover {
  border-color: #f093fb;
  color: #f093fb;
}

.btn-action.delete:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
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
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.4);
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
  max-width: 1000px;
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

/* Job Detail */
.job-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

.detail-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.detail-section h3 {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-item .label {
  color: #666;
  font-weight: 500;
}

.description {
  font-size: 14px;
  line-height: 1.6;
  color: #2c3e50;
  white-space: pre-line;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  padding: 6px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 13px;
  color: #2c3e50;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .filter-tabs {
    flex-direction: column;
  }

  .job-stats {
    flex-wrap: wrap;
  }

  .job-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>