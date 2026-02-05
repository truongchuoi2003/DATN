<template>
  <div class="dashboard">
    <Header />
    
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1>Xin chào, {{ user?.fullName }}! 👋</h1>
          <p>Chào mừng bạn đến với DATN Platform - Nơi bắt đầu sự nghiệp của bạn</p>
        </div>
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
                📝
              </div>
              <div class="stat-info">
                <h3>{{ stats.total || 0 }}</h3>
                <p>Đơn ứng tuyển</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                💼
              </div>
              <div class="stat-info">
                <h3>{{ stats.pending || 0 }}</h3>
                <p>Đang chờ phản hồi</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                ✅
              </div>
              <div class="stat-info">
                <h3>{{ stats.accepted || 0 }}</h3>
                <p>Được chấp nhận</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                ⭐
              </div>
              <div class="stat-info">
                <h3>{{ totalJobs }}</h3>
                <p>Công việc phù hợp</p>
              </div>
            </div>
          </div>

          <!-- Main Grid -->
          <div class="dashboard-grid">
            <!-- Left Column -->
            <div class="left-column">
              <!-- Profile Completion -->
              <div class="card">
                <div class="card-header">
                  <h2>Hồ sơ của bạn</h2>
                  <span class="badge" :class="profileCompletion < 50 ? 'badge-danger' : profileCompletion < 80 ? 'badge-warning' : 'badge-success'">
                    {{ profileCompletion }}% hoàn thành
                  </span>
                </div>
                <div class="card-body">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: profileCompletion + '%' }"></div>
                  </div>
                  <p class="progress-text">Hoàn thiện hồ sơ để tăng cơ hội tìm được việc làm phù hợp</p>
                  
                  <!-- Missing Info -->
                  <div v-if="missingFields.length > 0" class="missing-info">
                    <p class="missing-title">⚠️ Thiếu thông tin:</p>
                    <ul class="missing-list">
                      <li v-for="field in missingFields" :key="field">{{ field }}</li>
                    </ul>
                  </div>
                  
                  <router-link to="/student/profile" class="btn btn-primary">
                    Cập nhật hồ sơ
                  </router-link>
                </div>
              </div>

              <!-- Recent Applications -->
              <div class="card">
                <div class="card-header">
                  <h2>Đơn ứng tuyển gần đây</h2>
                  <router-link to="/student/applications" class="link">
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
                    <p>📭 Chưa có đơn ứng tuyển nào</p>
                    <router-link to="/student/jobs" class="btn btn-sm btn-outline">
                      Tìm việc ngay
                    </router-link>
                  </div>

                  <!-- Applications List -->
                  <div v-else class="application-list">
                    <div 
                      v-for="app in recentApplications" 
                      :key="app._id" 
                      class="application-item"
                    >
                      <div class="company-logo">
                        {{ getInitials(app.job?.employer?.companyName) }}
                      </div>
                      <div class="application-info">
                        <h4>{{ app.job?.title }}</h4>
                        <p>{{ app.job?.employer?.companyName }}</p>
                        <span 
                          class="status" 
                          :class="'status-' + app.status"
                        >
                          {{ getStatusLabel(app.status) }}
                        </span>
                      </div>
                      <div class="application-date">
                        {{ formatDate(app.createdAt) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="right-column">
              <!-- Recommended Jobs -->
              <div class="card">
                <div class="card-header">
                  <h2>Việc làm phù hợp</h2>
                  <router-link to="/student/jobs" class="link">
                    Xem thêm
                  </router-link>
                </div>
                <div class="card-body">
                  <!-- Loading Jobs -->
                  <div v-if="loadingJobs" class="loading-mini">
                    <div class="spinner-mini"></div>
                    <p>Đang tải...</p>
                  </div>

                  <!-- Empty State -->
                  <div v-else-if="recommendedJobs.length === 0" class="empty-state-mini">
                    <p>📭 Chưa có công việc phù hợp</p>
                  </div>

                  <!-- Jobs List -->
                  <div v-else class="job-list">
                    <div 
                      v-for="job in recommendedJobs" 
                      :key="job._id" 
                      class="job-item"
                    >
                      <div class="job-header">
                        <div class="company-avatar" :style="{ background: getRandomGradient() }">
                          {{ getInitials(job.employer?.companyName) }}
                        </div>
                        <div class="job-title-area">
                          <h4>{{ job.title }}</h4>
                          <p>{{ job.employer?.companyName }}</p>
                        </div>
                      </div>
                      <div class="job-tags">
                        <span v-if="job.location?.city" class="tag">
                          📍 {{ job.location.city }}
                        </span>
                        <span v-if="job.jobType" class="tag">
                          {{ job.jobType }}
                        </span>
                        <span v-if="job.level" class="tag">
                          {{ job.level }}
                        </span>
                      </div>
                      <div class="job-footer">
                        <span class="salary">{{ formatSalary(job.salary) }}</span>
                        <router-link 
                          :to="`/student/jobs/${job._id}`" 
                          class="btn btn-sm btn-outline"
                        >
                          Xem chi tiết
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
                    <router-link to="/student/profile" class="action-btn">
                      <span class="action-icon">📄</span>
                      <span>{{ user?.resumeUrl ? 'Cập nhật CV' : 'Tải CV lên' }}</span>
                    </router-link>
                    <router-link to="/student/jobs" class="action-btn">
                      <span class="action-icon">🔍</span>
                      <span>Tìm việc làm</span>
                    </router-link>
                    <router-link to="/student/applications" class="action-btn">
                      <span class="action-icon">📋</span>
                      <span>Đơn ứng tuyển</span>
                    </router-link>
                    <router-link to="/student/profile" class="action-btn">
                      <span class="action-icon">⚙️</span>
                      <span>Cài đặt</span>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import { useAuth } from '../composables/useAuth';
import axios from 'axios';

const router = useRouter();
const { user } = useAuth();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// State
const loading = ref(true);
const loadingApps = ref(false);
const loadingJobs = ref(false);

const stats = reactive({
  total: 0,
  pending: 0,
  accepted: 0,
  rejected: 0
});

const recentApplications = ref([]);
const recommendedJobs = ref([]);
const totalJobs = ref(0);

// Calculate profile completion
const profileCompletion = computed(() => {
  if (!user.value) return 0;
  
  let score = 0;
  const fields = [
    { field: user.value.fullName, weight: 10 },
    { field: user.value.phone, weight: 10 },
    { field: user.value.email, weight: 10 },
    { field: user.value.birthday, weight: 10 },
    { field: user.value.address, weight: 10 },
    { field: user.value.university, weight: 15 },
    { field: user.value.major, weight: 10 },
    { field: user.value.resumeUrl, weight: 25 }
  ];
  
  fields.forEach(({ field, weight }) => {
    if (field) score += weight;
  });
  
  return Math.min(100, Math.round(score));
});

// Calculate missing fields
const missingFields = computed(() => {
  if (!user.value) return [];
  
  const missing = [];
  if (!user.value.resumeUrl) missing.push('CV chưa được tải lên');
  if (!user.value.university) missing.push('Trường đại học');
  if (!user.value.major) missing.push('Chuyên ngành');
  if (!user.value.birthday) missing.push('Ngày sinh');
  if (!user.value.address) missing.push('Địa chỉ');
  if (!user.value.phone) missing.push('Số điện thoại');
  
  return missing;
});

// Fetch statistics
const fetchStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/applications/my-stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Stats fetched:', res.data);
    Object.assign(stats, res.data.stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
  }
};

// Fetch recent applications
const fetchRecentApplications = async () => {
  try {
    loadingApps.value = true;
    const token = localStorage.getItem('token');
    const res = await axios.get(
      `${API_URL}/applications/my-applications?limit=3&sort=-createdAt`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    console.log('✅ Recent applications fetched:', res.data);
    recentApplications.value = res.data.applications;
  } catch (error) {
    console.error('❌ Error fetching applications:', error);
  } finally {
    loadingApps.value = false;
  }
};

// Fetch recommended jobs
const fetchRecommendedJobs = async () => {
  try {
    loadingJobs.value = true;
    const res = await axios.get(`${API_URL}/jobs/public?limit=3`);
    
    console.log('✅ Recommended jobs fetched:', res.data);
    recommendedJobs.value = res.data.jobs;
    totalJobs.value = res.data.total || res.data.jobs.length;
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
  } finally {
    loadingJobs.value = false;
  }
};

// Fetch all data
const fetchAllData = async () => {
  loading.value = true;
  
  await Promise.all([
    fetchStats(),
    fetchRecentApplications(),
    fetchRecommendedJobs()
  ]);
  
  loading.value = false;
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

const getStatusLabel = (status) => {
  const labels = {
    'pending': 'Đang chờ',
    'accepted': 'Chấp nhận',
    'rejected': 'Từ chối',
    'withdrawn': 'Đã rút'
  };
  return labels[status] || status;
};

const formatDate = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const createdDate = new Date(date);
  const diffTime = Math.abs(now - createdDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return createdDate.toLocaleDateString('vi-VN');
};

const formatSalary = (salary) => {
  if (!salary) return 'Thỏa thuận';
  const min = (salary.min / 1000000).toFixed(0);
  const max = (salary.max / 1000000).toFixed(0);
  return `${min}-${max} triệu`;
};

const getRandomGradient = () => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

// Lifecycle
onMounted(() => {
  console.log('🚀 Student Dashboard mounted');
  console.log('👤 User:', user.value);
  fetchAllData();
});
</script>

<style scoped>
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

.hero-content h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.hero-content p {
  font-size: 16px;
  opacity: 0.9;
}

/* Loading State */
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
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.badge-warning {
  background: #fff3cd;
  color: #856404;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

.badge-danger {
  background: #f8d7da;
  color: #721c24;
}

/* Progress Bar */
.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.progress-text {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

/* Missing Info */
.missing-info {
  background: #fff3cd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.missing-title {
  font-weight: 600;
  color: #856404;
  margin-bottom: 8px;
}

.missing-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.missing-list li {
  color: #856404;
  font-size: 13px;
  padding: 4px 0;
  padding-left: 20px;
  position: relative;
}

.missing-list li:before {
  content: '•';
  position: absolute;
  left: 8px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

.btn-outline {
  background: white;
  border: 1px solid #667eea;
  color: #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

/* Application List */
.application-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.application-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s;
}

.application-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.company-logo {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  flex-shrink: 0;
}

.application-info {
  flex: 1;
}

.application-info h4 {
  font-size: 15px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.application-info p {
  font-size: 13px;
  color: #666;
  margin-bottom: 5px;
}

.status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-accepted {
  background: #d4edda;
  color: #155724;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.status-withdrawn {
  background: #e2e3e5;
  color: #383d41;
}

.application-date {
  font-size: 12px;
  color: #999;
}

/* Job List */
.job-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.job-item {
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s;
}

.job-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.job-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.company-avatar {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  flex-shrink: 0;
}

.job-title-area h4 {
  font-size: 15px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.job-title-area p {
  font-size: 13px;
  color: #666;
}

.job-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 10px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.salary {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
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

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
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