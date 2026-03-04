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
                  <span
                    class="badge"
                    :class="profileCompletion < 50 ? 'badge-danger' : profileCompletion < 80 ? 'badge-warning' : 'badge-success'"
                  >
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
                        <span class="status" :class="'status-' + app.status">
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

                  <div class="header-actions">
                    <button
                      v-if="recommendedJobs.length > 0"
                      class="btn btn-sm btn-outline"
                      @click="showRecommendMap = !showRecommendMap"
                      type="button"
                    >
                      {{ showRecommendMap ? '🗺️ Ẩn bản đồ' : '🗺️ Xem bản đồ' }}
                    </button>

                    <router-link to="/student/jobs" class="link">
                      Xem thêm
                    </router-link>
                  </div>
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
                      :id="`rec-job-${job._id}`"
                      :class="['job-item', { selected: String(job._id) === String(selectedRecommendJobId) }]"
                      @click="selectedRecommendJobId = job._id"
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

                  <!-- ✅ Mini Map cho Recommended Jobs -->
                  <div
                    v-if="showRecommendMap && mapRecommendedJobs.length > 0"
                    class="recommend-map-section"
                  >
                    <div class="recommend-map-title">
                      🗺️ Xem nhanh việc làm trên bản đồ
                    </div>

                    <div class="recommend-map-wrap">
                      <JobsMap
                        :jobs="mapRecommendedJobs"
                        :selected-job-id="selectedRecommendJobId"
                        :center="recommendMapCenter"
                        :zoom="12"
                        @marker-click="handleRecommendMarkerClick"
                      />
                    </div>

                    <div class="recommend-map-hint">
                      Tip: Click marker để chọn job (map sẽ tự focus và mở popup).
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
import JobsMap from '../components/JobsMap.vue';
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

// ✅ Map state (dashboard)
const showRecommendMap = ref(true);
const selectedRecommendJobId = ref(null);

// Map helpers
const CITY_CENTER = {
  'Hà Nội': [21.02776, 105.83416],
  'TP. Hồ Chí Minh': [10.77689, 106.70098],
  'Đà Nẵng': [16.05441, 108.20217],
  'Hải Phòng': [20.84491, 106.68808],
  'Cần Thơ': [10.04516, 105.78309],
};

// Leaflet cần [lat, lng], DB thường [lng, lat]
function toLatLng(job) {
  const coords = job?.location?.coordinates;
  if (Array.isArray(coords) && coords.length === 2) {
    const [lng, lat] = coords;
    if (typeof lng === 'number' && typeof lat === 'number') return [lat, lng];
  }
  const city = job?.location?.city;
  if (city && CITY_CENTER[city]) return CITY_CENTER[city];
  return null;
}

const mapRecommendedJobs = computed(() => {
  return (recommendedJobs.value || [])
    .map((job) => {
      const latlng = toLatLng(job);
      return latlng ? { ...job, latlng } : null;
    })
    .filter(Boolean);
});

// Center ưu tiên vị trí student (nếu có), không có thì theo job đầu tiên, fallback HCM
const recommendMapCenter = computed(() => {
  const ucoords = user.value?.location?.coordinates;
  if (Array.isArray(ucoords) && ucoords.length === 2) {
    const [lng, lat] = ucoords;
    if (typeof lng === 'number' && typeof lat === 'number') return [lat, lng];
  }
  if (mapRecommendedJobs.value.length > 0) return mapRecommendedJobs.value[0].latlng;
  return CITY_CENTER['TP. Hồ Chí Minh'];
});

function handleRecommendMarkerClick(job) {
  selectedRecommendJobId.value = job._id;

  const el = document.getElementById(`rec-job-${job._id}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

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
    Object.assign(stats, res.data.stats || res.data.statistics || {});
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
    recentApplications.value = res.data.applications || [];
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
    const token = localStorage.getItem('token');

    const res = await axios.get(`${API_URL}/recommendations/jobs?limit=3`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Recommended jobs fetched:', res.data);
    recommendedJobs.value = res.data.jobs || [];
    totalJobs.value = res.data.count || (res.data.jobs?.length || 0);

    // reset selection nếu cần
    if (selectedRecommendJobId.value) {
      const stillExists = recommendedJobs.value.some((j) => String(j._id) === String(selectedRecommendJobId.value));
      if (!stillExists) selectedRecommendJobId.value = null;
    }
  } catch (error) {
    console.error('❌ Error fetching recommend jobs:', error);

    // Fallback về public jobs để dashboard không bị trống
    try {
      const fallback = await axios.get(`${API_URL}/jobs/public?limit=3`);
      console.log('✅ Fallback public jobs fetched:', fallback.data);
      recommendedJobs.value = fallback.data.jobs || [];
      totalJobs.value = fallback.data.total || (fallback.data.jobs?.length || 0);
    } catch (fallbackError) {
      console.error('❌ Error fetching fallback jobs:', fallbackError);
      recommendedJobs.value = [];
      totalJobs.value = 0;
    }
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
  if (salary.negotiable) return 'Thỏa thuận';
  if (salary.min == null || salary.max == null) return 'Thỏa thuận';

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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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

.badge-warning { background: #fff3cd; color: #856404; }
.badge-success { background: #d4edda; color: #155724; }
.badge-danger  { background: #f8d7da; color: #721c24; }

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

/* Job list */
.job-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.job-item {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 14px;
  transition: all 0.25s;
  cursor: pointer;
}

.job-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.12);
}

.job-item.selected {
  outline: 3px solid rgba(102, 126, 234, 0.18);
  border-color: rgba(102, 126, 234, 0.35);
}

.job-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.company-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.job-title-area h4 {
  margin: 0 0 4px;
  font-size: 14px;
  color: #2c3e50;
}

.job-title-area p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.job-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  font-size: 12px;
  background: #f0f0f0;
  padding: 5px 10px;
  border-radius: 999px;
  color: #555;
}

.job-footer {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.salary {
  font-weight: 700;
  color: #2c3e50;
}

/* ✅ Mini map section */
.recommend-map-section {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed #e9e9e9;
}

.recommend-map-title {
  font-weight: 700;
  font-size: 13px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.recommend-map-wrap {
  height: 320px;
}

/* Override chiều cao trong JobsMap.vue */
.recommend-map-wrap :deep(.jobs-map) {
  height: 320px !important;
  min-height: 320px !important;
}

.recommend-map-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #777;
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>