<template>
  <div class="dashboard">
    <Header />
    
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1>Chào mừng, {{ user?.companyName || user?.fullName }}! 💼</h1>
          <p>Quản lý tuyển dụng và tìm kiếm ứng viên tài năng</p>
        </div>
        <router-link to="/employer/jobs/create" class="btn-hero">
          <span>➕</span> Đăng tin tuyển dụng mới
        </router-link>
      </div>
    </section>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>

        <!-- Main Content -->
        <div v-else>
          <!-- Stats Cards -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                📢
              </div>
              <div class="stat-info">
                <h3>{{ stats.totalJobs || 0 }}</h3>
                <p>Tin tuyển dụng</p>
                <span class="stat-change">{{ stats.activeJobs || 0 }} đang hoạt động</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                👥
              </div>
              <div class="stat-info">
                <h3>{{ stats.totalApplications || 0 }}</h3>
                <p>Ứng viên</p>
                <span class="stat-change positive">{{ stats.pendingApplications || 0 }} chờ xử lý</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                👁️
              </div>
              <div class="stat-info">
                <h3>{{ stats.totalViews || 0 }}</h3>
                <p>Lượt xem</p>
                <span class="stat-change">Tất cả tin</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                ✅
              </div>
              <div class="stat-info">
                <h3>{{ stats.acceptedApplications || 0 }}</h3>
                <p>Đã tuyển</p>
                <span class="stat-change">Tổng cộng</span>
              </div>
            </div>
          </div>

          <!-- Main Grid -->
          <div class="dashboard-grid">
            <!-- Left Column -->
            <div class="left-column">
              <!-- Active Job Posts -->
              <div class="card">
                <div class="card-header">
                  <h2>Tin tuyển dụng đang hoạt động</h2>
                  <router-link to="/employer/jobs" class="link">
                    Quản lý tất cả
                  </router-link>
                </div>
                <div class="card-body">
                  <!-- Loading Jobs -->
                  <div v-if="loadingJobs" class="loading-mini">
                    <div class="spinner-mini"></div>
                    <p>Đang tải...</p>
                  </div>

                  <!-- Empty State -->
                  <div v-else-if="activeJobs.length === 0" class="empty-state-mini">
                    <p>📭 Chưa có tin tuyển dụng nào</p>
                    <router-link to="/employer/jobs/create" class="btn btn-sm btn-primary">
                      Đăng tin ngay
                    </router-link>
                  </div>

                  <!-- Jobs List -->
                  <div v-else class="job-posts-list">
                    <div 
                      v-for="job in activeJobs" 
                      :key="job._id" 
                      class="job-post-item"
                    >
                      <div class="job-post-header">
                        <div>
                          <h4>{{ job.title }}</h4>
                          <p class="job-meta">
                            {{ formatDate(job.createdAt) }} • {{ job.location?.city }}
                          </p>
                        </div>
                        <span class="badge badge-success">Active</span>
                      </div>
                      <div class="job-post-stats">
                        <div class="stat-item">
                          <span class="stat-number">{{ job.applicationsCount || 0 }}</span>
                          <span class="stat-label">Ứng viên</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">{{ job.views || 0 }}</span>
                          <span class="stat-label">Lượt xem</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">{{ job.pendingCount || 0 }}</span>
                          <span class="stat-label">Chờ duyệt</span>
                        </div>
                      </div>
                      <div class="job-post-actions">
                        <router-link 
                          :to="`/employer/applications/${job._id}`" 
                          class="btn btn-sm btn-outline"
                        >
                          Xem ứng viên
                        </router-link>
                        <router-link 
                          :to="`/employer/jobs/${job._id}/edit`" 
                          class="btn btn-sm btn-secondary"
                        >
                          Chỉnh sửa
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="card">
                <div class="card-header">
                  <h2>Hành động nhanh</h2>
                </div>
                <div class="card-body">
                  <div class="quick-actions">
                    <router-link to="/employer/jobs/create" class="action-btn">
                      <span class="action-icon">➕</span>
                      <span>Đăng tin mới</span>
                    </router-link>
                    <router-link to="/employer/jobs" class="action-btn">
                      <span class="action-icon">📋</span>
                      <span>Quản lý tin</span>
                    </router-link>
                    <router-link to="/employer/applications" class="action-btn">
                      <span class="action-icon">👥</span>
                      <span>Xem ứng viên</span>
                    </router-link>
                    <router-link to="/employer/profile" class="action-btn">
                      <span class="action-icon">⚙️</span>
                      <span>Cài đặt</span>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="right-column">
              <!-- Recent Applicants -->
              <div class="card">
                <div class="card-header">
                  <h2>Ứng viên mới</h2>
                  <router-link to="/employer/applications" class="link">
                    Xem tất cả
                  </router-link>
                </div>
                <div class="card-body">
                  <!-- Loading Applications -->
                  <div v-if="loadingApps" class="loading-mini">
                    <div class="spinner-mini"></div>
                    <p>Đang tải...</p>
                  </div>

                  <!-- Empty State -->
                  <div v-else-if="recentApplications.length === 0" class="empty-state-mini">
                    <p>📭 Chưa có ứng viên nào</p>
                  </div>

                  <!-- Applicants List -->
                  <div v-else class="applicants-list">
                    <div 
                      v-for="app in recentApplications" 
                      :key="app._id" 
                      class="applicant-item"
                    >
                      <div class="applicant-avatar">
                        {{ getInitials(app.student?.fullName) }}
                      </div>
                      <div class="applicant-info">
                        <h4>{{ app.student?.fullName }}</h4>
                        <p class="applicant-position">{{ app.job?.title }}</p>
                        <div class="applicant-meta">
                          <span>{{ app.student?.university }}</span>
                          <span>{{ formatDate(app.createdAt) }}</span>
                        </div>
                        <span 
                          class="status-badge" 
                          :class="'status-' + app.status"
                        >
                          {{ getStatusLabel(app.status) }}
                        </span>
                      </div>
                      <div class="applicant-actions">
                        <button 
                          @click="viewApplication(app)" 
                          class="btn-icon" 
                          title="Xem hồ sơ"
                        >
                          👁️
                        </button>
                        <button 
                          v-if="app.status === 'pending'"
                          @click="acceptApplication(app._id)" 
                          class="btn-icon btn-accept" 
                          title="Chấp nhận"
                        >
                          ✓
                        </button>
                        <button 
                          v-if="app.status === 'pending'"
                          @click="rejectApplication(app._id)" 
                          class="btn-icon btn-reject" 
                          title="Từ chối"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Application Detail Modal -->
    <div v-if="showDetailModal" class="modal" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <button class="btn-close" @click="closeDetailModal">✕</button>
        
        <h2>📋 Chi tiết ứng viên</h2>

        <div v-if="selectedApplication" class="detail-content">
          <!-- Student Info -->
          <div class="detail-section">
            <h3>👤 Thông tin ứng viên</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Họ tên:</span>
                <span class="value">{{ selectedApplication.student?.fullName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Email:</span>
                <span class="value">{{ selectedApplication.student?.email }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Điện thoại:</span>
                <span class="value">{{ selectedApplication.student?.phone || 'Chưa cập nhật' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Trường:</span>
                <span class="value">{{ selectedApplication.student?.university || 'Chưa cập nhật' }}</span>
              </div>
            </div>
          </div>

          <!-- Cover Letter -->
          <div class="detail-section">
            <h3>✍️ Thư xin việc</h3>
            <div class="cover-letter-full">
              {{ selectedApplication.coverLetter }}
            </div>
          </div>

          <!-- CV -->
          <div class="detail-section">
            <h3>📄 CV</h3>
            <a 
              v-if="selectedApplication.resumeUrl" 
              :href="getFullUrl(selectedApplication.resumeUrl)" 
              target="_blank" 
              class="btn btn-primary"
            >
              📥 Xem CV
            </a>
            <p v-else class="text-muted">Không có CV</p>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button 
              v-if="selectedApplication.status === 'pending'"
              @click="acceptApplication(selectedApplication._id)" 
              class="btn btn-success"
            >
              ✅ Chấp nhận
            </button>
            <button 
              v-if="selectedApplication.status === 'pending'"
              @click="rejectApplication(selectedApplication._id)" 
              class="btn btn-danger"
            >
              ❌ Từ chối
            </button>
            <button @click="closeDetailModal" class="btn btn-secondary">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import Header from '../components/Header.vue';
import { useAuth } from '../composables/useAuth';
import api from '../services/api';

const { user } = useAuth();

const loading = ref(true);
const loadingJobs = ref(false);
const loadingApps = ref(false);

const stats = reactive({
  totalJobs: 0,
  activeJobs: 0,
  totalApplications: 0,
  pendingApplications: 0,
  acceptedApplications: 0,
  totalViews: 0,
});

const activeJobs = ref([]);
const recentApplications = ref([]);

const showDetailModal = ref(false);
const selectedApplication = ref(null);

const fetchStats = async () => {
  try {
    const [jobStatsRes, appStatsRes] = await Promise.all([
      api.get('/jobs/statistics'),
      api.get('/applications/employer/stats'),
    ]);

    const jobStats = jobStatsRes.data.statistics || {};
    const appStats = appStatsRes.data.stats || {};

    stats.totalJobs = jobStats.totalJobs || 0;
    stats.activeJobs = jobStats.activeJobs || 0;
    stats.totalViews = jobStats.totalViews || 0;
    stats.totalApplications = appStats.total || 0;
    stats.pendingApplications = appStats.pending || 0;
    stats.acceptedApplications = appStats.accepted || 0;
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
  }
};

const fetchActiveJobs = async () => {
  try {
    loadingJobs.value = true;

    const res = await api.get('/jobs/my-jobs', { params: { status: 'active' } });
    activeJobs.value = (res.data.jobs || []).slice(0, 3);

    await Promise.all(
      activeJobs.value.map(async (job) => {
        try {
          const r = await api.get(`/applications/job/${job._id}`, {
            params: { status: 'pending' },
          });
          job.pendingCount = r.data?.applications?.length || 0;
        } catch {
          job.pendingCount = 0;
        }
      })
    );
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
  } finally {
    loadingJobs.value = false;
  }
};

const fetchRecentApplications = async () => {
  try {
    loadingApps.value = true;
    const res = await api.get('/applications/employer', {
      params: { limit: 5, sort: '-createdAt' },
    });
    recentApplications.value = res.data.applications || [];
  } catch (error) {
    console.error('❌ Error fetching applications:', error);
  } finally {
    loadingApps.value = false;
  }
};

const fetchAllData = async () => {
  loading.value = true;
  await Promise.all([fetchStats(), fetchActiveJobs(), fetchRecentApplications()]);
  loading.value = false;
};

const viewApplication = async (app) => {
  try {
    const res = await api.get(`/applications/${app._id}`);
    selectedApplication.value = res.data.application || app;
  } catch (error) {
    console.error('❌ Error fetching application detail:', error);
    selectedApplication.value = app;
  }
  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedApplication.value = null;
};

const acceptApplication = async (appId) => {
  if (!confirm('Bạn có chắc muốn chấp nhận ứng viên này?')) return;

  try {
    await api.put(`/applications/${appId}/status`, { status: 'accepted' });
    alert('✅ Đã chấp nhận ứng viên');
    closeDetailModal();
    await fetchAllData();
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể chấp nhận ứng viên');
  }
};

const rejectApplication = async (appId) => {
  if (!confirm('Bạn có chắc muốn từ chối ứng viên này?')) return;

  try {
    await api.put(`/applications/${appId}/status`, { status: 'rejected' });
    alert('✅ Đã từ chối ứng viên');
    closeDetailModal();
    await fetchAllData();
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể từ chối ứng viên');
  }
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ xử lý',
    reviewing: 'Đang xem xét',
    accepted: 'Đã chấp nhận',
    rejected: 'Đã từ chối',
  };
  return labels[status] || status;
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;

  const apiBase = api.defaults.baseURL || '';
  const origin = apiBase.replace(/\/api\/?$/, '');

  return `${origin}${url}`;
};

onMounted(() => {
  fetchAllData();
});
</script>

<style scoped>
/* Copy all styles from original Employer.vue */
* {
  box-sizing: border-box;
}

.dashboard {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
  margin-bottom: 30px;
}

.hero-section .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-content h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.hero-content p {
  font-size: 16px;
  opacity: 0.9;
}

.btn-hero {
  padding: 12px 24px;
  background: white;
  color: #667eea;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-hero:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Loading States */
.loading-state {
  text-align: center;
  padding: 80px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-mini {
  text-align: center;
  padding: 30px 20px;
}

.spinner-mini {
  width: 30px;
  height: 30px;
  border: 3px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 15px;
}

.empty-state-mini {
  text-align: center;
  padding: 30px 20px;
  color: #999;
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
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
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
  margin-bottom: 5px;
}

.stat-change {
  font-size: 12px;
  color: #999;
}

.stat-change.positive {
  color: #43e97b;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

/* Card */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;
}

.card-header {
  padding: 20px 25px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 18px;
  color: #2c3e50;
  font-weight: 600;
}

.card-body {
  padding: 25px;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

/* Badge */
.badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

/* Job Posts List */
.job-posts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.job-post-item {
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s;
}

.job-post-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.job-post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.job-post-header h4 {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.job-meta {
  font-size: 13px;
  color: #999;
}

.job-post-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.job-post-actions {
  display: flex;
  gap: 10px;
}

/* Applicants List */
.applicants-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.applicant-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s;
}

.applicant-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.applicant-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  flex-shrink: 0;
}

.applicant-info {
  flex: 1;
}

.applicant-info h4 {
  font-size: 15px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.applicant-position {
  font-size: 13px;
  color: #667eea;
  margin-bottom: 6px;
}

.applicant-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.status-accepted {
  background: #d4edda;
  color: #155724;
}

.status-badge.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.applicant-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 6px;
  background: #f0f0f0;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-icon:hover {
  background: #e0e0e0;
}

.btn-icon.btn-accept {
  background: #d4edda;
  color: #155724;
}

.btn-icon.btn-accept:hover {
  background: #c3e6cb;
}

.btn-icon.btn-reject {
  background: #f8d7da;
  color: #721c24;
}

.btn-icon.btn-reject:hover {
  background: #f5c6cb;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.action-btn {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.action-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.action-icon {
  font-size: 24px;
}

.action-btn span:last-child {
  font-size: 13px;
  color: #666;
  font-weight: 500;
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

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline {
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
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

.detail-section {
  margin-bottom: 25px;
  padding-bottom: 25px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  font-size: 15px;
  font-weight: 500;
  color: #2c3e50;
}

.cover-letter-full {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  white-space: pre-line;
  line-height: 1.8;
  color: #2c3e50;
}

.text-muted {
  color: #999;
  font-style: italic;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-section .container {
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>