<template>
  <div class="dashboard">
    <Header />

    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1>Xin chào, {{ displayUser?.fullName }}! 👋</h1>
          <p>Chào mừng bạn đến với DATN Platform - Nơi bắt đầu sự nghiệp của bạn</p>
        </div>
      </div>
    </section>

    <main class="main-content">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>

        <div v-else>
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

          <div class="dashboard-grid">
            <div class="left-column">
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

              <div class="card">
                <div class="card-header">
                  <h2>Đơn ứng tuyển gần đây</h2>
                  <router-link to="/student/applications" class="link">
                    Xem tất cả
                  </router-link>
                </div>
                <div class="card-body">
                  <div v-if="loadingApps" class="loading-mini">
                    <div class="spinner-mini"></div>
                    <p>Đang tải...</p>
                  </div>

                  <div v-else-if="recentApplications.length === 0" class="empty-state-mini">
                    <p>📭 Chưa có đơn ứng tuyển nào</p>
                    <router-link to="/student/jobs" class="btn btn-sm btn-outline">
                      Tìm việc ngay
                    </router-link>
                  </div>

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

            <div class="right-column">
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
                  <div v-if="loadingJobs" class="loading-mini">
                    <div class="spinner-mini"></div>
                    <p>Đang tải...</p>
                  </div>

                  <div v-else-if="recommendedJobs.length === 0" class="empty-state-mini">
                    <p>📭 Chưa có công việc phù hợp</p>
                  </div>

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
                          <p>{{ getCompanyName(job) }}</p>
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

              <div class="card">
                <div class="card-header">
                  <h2>Hành động nhanh</h2>
                </div>
                <div class="card-body">
                  <div class="quick-actions">
                    <router-link to="/student/profile" class="action-btn">
                      <span class="action-icon">📄</span>
                      <span>{{ displayUser?.resumeUrl ? 'Cập nhật CV' : 'Tải CV lên' }}</span>
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
import Header from '../components/Header.vue';
import JobsMap from '../components/JobsMap.vue';
import { useAuth } from '../composables/useAuth';
import axios from 'axios';

const { user, refreshUser, updateUser } = useAuth();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const loading = ref(true);
const loadingApps = ref(false);
const loadingJobs = ref(false);
const profileData = ref(null);

const stats = reactive({
  total: 0,
  pending: 0,
  accepted: 0,
  rejected: 0
});

const recentApplications = ref([]);
const recommendedJobs = ref([]);
const totalJobs = ref(0);

const showRecommendMap = ref(true);
const selectedRecommendJobId = ref(null);

const CITY_CENTER = {
  'Hà Nội': [21.02776, 105.83416],
  'TP. Hồ Chí Minh': [10.77689, 106.70098],
  'Đà Nẵng': [16.05441, 108.20217],
  'Hải Phòng': [20.84491, 106.68808],
  'Cần Thơ': [10.04516, 105.78309],
};

const displayUser = computed(() => profileData.value || user.value || {});

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

const recommendMapCenter = computed(() => {
  const ucoords = displayUser.value?.location?.coordinates;
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

const hasValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && String(value).trim() !== '';
};

const profileRequirements = computed(() => {
  const currentUser = displayUser.value || {};

  return [
    { label: 'Họ và tên', ok: hasValue(currentUser.fullName) },
    { label: 'Số điện thoại', ok: hasValue(currentUser.phone) },
    { label: 'Ngày sinh', ok: hasValue(currentUser.birthday) },
    { label: 'Địa chỉ', ok: hasValue(currentUser.address) },
    { label: 'Trường đại học', ok: hasValue(currentUser.university) },
    { label: 'Chuyên ngành', ok: hasValue(currentUser.major) },
    { label: 'Kỹ năng', ok: hasValue(currentUser.skills) },
    { label: 'Loại hình công việc mong muốn', ok: hasValue(currentUser.preferredJobTypes) },
    { label: 'Nhóm nghề quan tâm', ok: hasValue(currentUser.preferredCategories) },
    { label: 'Vị trí mong muốn', ok: hasValue(currentUser.desiredJobTitles) },
    { label: 'Khu vực mong muốn làm việc', ok: hasValue(currentUser.preferredLocations) },
    { label: 'CV', ok: hasValue(currentUser.resumeUrl) },
  ];
});

const profileCompletion = computed(() => {
  const requirements = profileRequirements.value;
  if (!requirements.length) return 0;
  const completedCount = requirements.filter((item) => item.ok).length;
  return Math.round((completedCount / requirements.length) * 100);
});

const missingFields = computed(() => {
  return profileRequirements.value
    .filter((item) => !item.ok)
    .map((item) => item.label === 'CV' ? 'CV chưa được tải lên' : item.label);
});

const fetchProfileData = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    profileData.value = res.data.profile || null;

    if (profileData.value) {
      updateUser(profileData.value);
      refreshUser();
    }
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
  }
};

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/applications/my-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    Object.assign(stats, res.data.stats || res.data.statistics || {});
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
  }
};

const fetchRecentApplications = async () => {
  try {
    loadingApps.value = true;
    const token = localStorage.getItem('token');
    const res = await axios.get(
      `${API_URL}/applications/my-applications?limit=3&sort=-createdAt`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    recentApplications.value = res.data.applications || [];
  } catch (error) {
    console.error('❌ Error fetching applications:', error);
  } finally {
    loadingApps.value = false;
  }
};

const fetchRecommendedJobs = async () => {
  try {
    loadingJobs.value = true;
    const token = localStorage.getItem('token');

    const res = await axios.get(`${API_URL}/recommendations/jobs?limit=3`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    recommendedJobs.value = res.data.jobs || [];
    totalJobs.value = res.data.count || (res.data.jobs?.length || 0);

    if (selectedRecommendJobId.value) {
      const stillExists = recommendedJobs.value.some((j) => String(j._id) === String(selectedRecommendJobId.value));
      if (!stillExists) selectedRecommendJobId.value = null;
    }
  } catch (error) {
    console.error('❌ Error fetching recommend jobs:', error);

    try {
      const fallback = await axios.get(`${API_URL}/jobs/public?limit=3`);
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

const fetchAllData = async () => {
  loading.value = true;

  await Promise.all([
    fetchProfileData(),
    fetchStats(),
    fetchRecentApplications(),
    fetchRecommendedJobs()
  ]);

  loading.value = false;
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0];
  }
  return name.substring(0, 2).toUpperCase();
};

const getCompanyName = (job) => {
  return (
    job?.displayCompanyName ||
    job?.employer?.companyName ||
    'Nhà tuyển dụng'
  );
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Đang chờ',
    accepted: 'Chấp nhận',
    rejected: 'Từ chối',
    withdrawn: 'Đã rút'
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

onMounted(() => {
  refreshUser();
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

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

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

.badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge-warning { background: #fff3cd; color: #856404; }
.badge-success { background: #d4edda; color: #155724; }
.badge-danger  { background: #f8d7da; color: #721c24; }

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

.recommend-map-wrap :deep(.jobs-map) {
  height: 320px !important;
  min-height: 320px !important;
}

.recommend-map-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #777;
}

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