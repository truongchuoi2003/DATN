<template>
  <div class="dashboard">
    <Header />
    
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1>Admin Dashboard ⚙️</h1>
          <p>Quản trị hệ thống DATN Platform</p>
        </div>
        <div class="hero-stats">
          <div class="hero-stat-item">
            <span class="hero-stat-value">{{ statistics.totalUsers || 0 }}</span>
            <span class="hero-stat-label">Người dùng</span>
          </div>
          <div class="hero-stat-item">
            <span class="hero-stat-value">{{ statistics.pendingEmployers || 0 }}</span>
            <span class="hero-stat-label">Chờ duyệt</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Overview Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              👥
            </div>
            <div class="stat-info">
              <h3>{{ statistics.totalUsers || 0 }}</h3>
              <p>Tổng người dùng</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              🎓
            </div>
            <div class="stat-info">
              <h3>{{ statistics.totalStudents || 0 }}</h3>
              <p>Sinh viên</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              💼
            </div>
            <div class="stat-info">
              <h3>{{ statistics.totalEmployers || 0 }}</h3>
              <p>Nhà tuyển dụng</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              ⏳
            </div>
            <div class="stat-info">
              <h3>{{ statistics.pendingEmployers || 0 }}</h3>
              <p>Chờ duyệt</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions Grid -->
        <div class="quick-actions-section">
          <h2>🚀 Quản lý nhanh</h2>
          <div class="quick-actions-main">
            <router-link to="/admin/employers" class="action-card">
              <div class="action-icon" style="background: #4ecdc4;">🏢</div>
              <div class="action-content">
                <h3>Duyệt nhà tuyển dụng</h3>
                <p>{{ statistics.pendingEmployers || 0 }} đang chờ</p>
              </div>
            </router-link>

            <button class="action-card" @click="navigateTo('/admin/users')">
              <div class="action-icon" style="background: #667eea;">👥</div>
              <div class="action-content">
                <h3>Quản lý người dùng</h3>
                <p>{{ statistics.totalUsers || 0 }} người dùng</p>
              </div>
            </button>

            <button class="action-card" @click="navigateTo('/admin/jobs')">
              <div class="action-icon" style="background: #f093fb;">📢</div>
              <div class="action-content">
                <h3>Tin tuyển dụng</h3>
                <p>Quản lý tin đăng</p>
              </div>
            </button>

            <button class="action-card" @click="navigateTo('/admin/reports')">
              <div class="action-icon" style="background: #43e97b;">📊</div>
              <div class="action-content">
                <h3>Báo cáo</h3>
                <p>Thống kê hệ thống</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Main Grid -->
        <div class="dashboard-grid">
          <!-- Left Column -->
          <div class="left-column">
            <!-- Pending Employers -->
            <div class="card">
              <div class="card-header">
                <h2>Nhà tuyển dụng chờ duyệt</h2>
                <router-link to="/admin/employers" class="link">Xem tất cả</router-link>
              </div>
              <div class="card-body">
                <div v-if="pendingEmployers.length === 0" class="empty-state">
                  <p>✅ Không có yêu cầu nào đang chờ</p>
                </div>
                <div v-else class="approval-list">
                  <div v-for="employer in pendingEmployers.slice(0, 3)" :key="employer._id" class="approval-item">
                    <div class="approval-icon">🏢</div>
                    <div class="approval-info">
                      <h4>{{ employer.companyName }}</h4>
                      <p>{{ employer.email }}</p>
                      <span class="approval-time">{{ formatDate(employer.createdAt) }}</span>
                    </div>
                    <div class="approval-actions">
                      <button class="btn btn-sm btn-success" @click="handleVerify(employer._id)">
                        Duyệt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Users -->
            <div class="card">
              <div class="card-header">
                <h2>Người dùng mới</h2>
              </div>
              <div class="card-body">
                <div v-if="recentUsers.length === 0" class="empty-state">
                  <p>📭 Chưa có người dùng mới</p>
                </div>
                <div v-else class="users-list">
                  <div v-for="user in recentUsers.slice(0, 5)" :key="user._id" class="user-item">
                    <div class="avatar">{{ getInitials(user.fullName || user.companyName) }}</div>
                    <div class="user-info">
                      <strong>{{ user.fullName || user.companyName }}</strong>
                      <p>{{ user.email }}</p>
                    </div>
                    <span class="role-badge" :class="user.role">
                      {{ getRoleName(user.role) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="right-column">
            <!-- System Status -->
            <div class="card">
              <div class="card-header">
                <h2>Trạng thái hệ thống</h2>
                <span class="status-indicator online"></span>
              </div>
              <div class="card-body">
                <div class="system-metrics">
                  <div class="metric-item">
                    <div class="metric-label">CPU Usage</div>
                    <div class="metric-bar">
                      <div class="metric-fill" style="width: 45%; background: #43e97b;"></div>
                    </div>
                    <div class="metric-value">45%</div>
                  </div>

                  <div class="metric-item">
                    <div class="metric-label">Memory</div>
                    <div class="metric-bar">
                      <div class="metric-fill" style="width: 62%; background: #4facfe;"></div>
                    </div>
                    <div class="metric-value">62%</div>
                  </div>

                  <div class="metric-item">
                    <div class="metric-label">Storage</div>
                    <div class="metric-bar">
                      <div class="metric-fill" style="width: 78%; background: #f093fb;"></div>
                    </div>
                    <div class="metric-value">78%</div>
                  </div>
                </div>

                <div class="server-info">
                  <div class="info-row">
                    <span class="info-label">Server:</span>
                    <span class="info-value">Production</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value" style="color: #43e97b;">Online</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Version:</span>
                    <span class="info-value">v1.0.0</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="card">
              <div class="card-header">
                <h2>Liên kết nhanh</h2>
              </div>
              <div class="card-body">
                <div class="quick-links">
                  <router-link to="/admin/employers" class="quick-link-item">
                    🏢 Quản lý nhà tuyển dụng
                  </router-link>
                  <router-link to="/admin/profile" class="quick-link-item">
                    👤 Hồ sơ của tôi
                  </router-link>
                  <button class="quick-link-item" @click="handleLogout">
                    🚪 Đăng xuất
                  </button>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import { useAuth } from '../composables/useAuth';
import api from '../services/api';

const { user, logout } = useAuth();
const router = useRouter();

const statistics = ref({
  totalUsers: 0,
  totalStudents: 0,
  totalEmployers: 0,
  verifiedEmployers: 0,
  pendingEmployers: 0,
});

const pendingEmployers = ref([]);
const recentUsers = ref([]);

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0];
  }
  return name.substring(0, 2).toUpperCase();
};

const getRoleName = (role) => {
  const roles = {
    student: 'Sinh viên',
    employer: 'Nhà tuyển dụng',
    admin: 'Admin',
  };
  return roles[role] || role;
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  return 'Vừa xong';
};

const fetchStatistics = async () => {
  try {
    const res = await api.get('/admin/statistics');
    statistics.value = res.data.statistics;
    statistics.value.totalUsers = 
      statistics.value.totalStudents + 
      statistics.value.totalEmployers;
  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
};

const fetchPendingEmployers = async () => {
  try {
    const res = await api.get('/admin/employers/pending');
    pendingEmployers.value = res.data.employers;
  } catch (error) {
    console.error('Error fetching pending employers:', error);
  }
};

const fetchRecentUsers = async () => {
  try {
    const res = await api.get('/admin/users');
    // Sort by createdAt and get latest 5
    recentUsers.value = res.data.users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching recent users:', error);
  }
};

const handleVerify = async (employerId) => {
  if (!confirm('Xác nhận duyệt nhà tuyển dụng này?')) return;

  try {
    await api.put(`/admin/employers/${employerId}/verify`);
    alert('Duyệt thành công!');
    fetchPendingEmployers();
    fetchStatistics();
  } catch (error) {
    alert('Có lỗi xảy ra: ' + (error.response?.data?.message || 'Vui lòng thử lại'));
  }
};

const navigateTo = (path) => {
  alert(`Tính năng "${path}" đang phát triển`);
};

const handleLogout = () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    logout();
  }
};

onMounted(() => {
  fetchStatistics();
  fetchPendingEmployers();
  fetchRecentUsers();
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
  max-width: 1600px;
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

.hero-stats {
  display: flex;
  gap: 40px;
}

.hero-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-stat-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 5px;
}

.hero-stat-label {
  font-size: 14px;
  opacity: 0.9;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  align-items: center;
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
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
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

/* Quick Actions Section */
.quick-actions-section {
  margin-bottom: 40px;
}

.quick-actions-section h2 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.quick-actions-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 20px;
  text-decoration: none;
  color: inherit;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  flex-shrink: 0;
}

.action-content h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.action-content p {
  font-size: 14px;
  color: #999;
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

/* Approval List */
.approval-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.approval-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s;
}

.approval-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.approval-icon {
  font-size: 32px;
  width: 50px;
  text-align: center;
}

.approval-info {
  flex: 1;
}

.approval-info h4 {
  font-size: 15px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.approval-info p {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.approval-time {
  font-size: 12px;
  color: #999;
}

.approval-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-success {
  background: #43e97b;
  color: white;
}

.btn-success:hover {
  background: #38d66e;
  transform: translateY(-2px);
}

/* Users List */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s;
}

.user-item:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-info strong {
  display: block;
  color: #2c3e50;
  font-size: 14px;
  margin-bottom: 4px;
}

.user-info p {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.role-badge {
  padding: 5px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.role-badge.student {
  background: #e3f2fd;
  color: #1976d2;
}

.role-badge.employer {
  background: #f3e5f5;
  color: #7b1fa2;
}

.role-badge.admin {
  background: #ffebee;
  color: #c62828;
}

/* Status Indicator */
.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-indicator.online {
  background: #43e97b;
  box-shadow: 0 0 0 0 rgba(67, 233, 123, 0.7);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(67, 233, 123, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(67, 233, 123, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(67, 233, 123, 0);
  }
}

/* System Metrics */
.system-metrics {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 25px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.metric-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s;
}

.metric-value {
  font-size: 12px;
  color: #999;
  text-align: right;
}

.server-info {
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.info-label {
  color: #999;
}

.info-value {
  color: #2c3e50;
  font-weight: 500;
}

/* Quick Links */
.quick-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-link-item {
  padding: 12px 15px;
  background: #f8f9fa;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  color: #2c3e50;
  font-size: 14px;
  transition: all 0.3s;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.quick-link-item:hover {
  background: #667eea;
  color: white;
  transform: translateX(5px);
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
</style>