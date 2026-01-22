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
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              📢
            </div>
            <div class="stat-info">
              <h3>8</h3>
              <p>Tin tuyển dụng</p>
              <span class="stat-change positive">+2 tin mới</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              👥
            </div>
            <div class="stat-info">
              <h3>124</h3>
              <p>Ứng viên</p>
              <span class="stat-change positive">+18 tuần này</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              👁️
            </div>
            <div class="stat-info">
              <h3>2,456</h3>
              <p>Lượt xem</p>
              <span class="stat-change positive">+12%</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              ✅
            </div>
            <div class="stat-info">
              <h3>15</h3>
              <p>Đã tuyển</p>
              <span class="stat-change">Tháng này</span>
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
                <a href="#" class="link">Quản lý tất cả</a>
              </div>
              <div class="card-body">
                <div class="job-posts-list">
                  <div class="job-post-item">
                    <div class="job-post-header">
                      <div>
                        <h4>Full Stack Developer</h4>
                        <p class="job-meta">Đăng 3 ngày trước • Hà Nội</p>
                      </div>
                      <span class="badge badge-success">Active</span>
                    </div>
                    <div class="job-post-stats">
                      <div class="stat-item">
                        <span class="stat-number">45</span>
                        <span class="stat-label">Ứng viên</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-number">320</span>
                        <span class="stat-label">Lượt xem</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-number">12</span>
                        <span class="stat-label">Phù hợp</span>
                      </div>
                    </div>
                    <div class="job-post-actions">
                      <button class="btn btn-sm btn-outline">Xem chi tiết</button>
                      <button class="btn btn-sm btn-primary">Xem ứng viên</button>
                    </div>
                  </div>

                  <div class="job-post-item">
                    <div class="job-post-header">
                      <div>
                        <h4>UI/UX Designer</h4>
                        <p class="job-meta">Đăng 1 tuần trước • TP.HCM</p>
                      </div>
                      <span class="badge badge-success">Active</span>
                    </div>
                    <div class="job-post-stats">
                      <div class="stat-item">
                        <span class="stat-number">28</span>
                        <span class="stat-label">Ứng viên</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-number">198</span>
                        <span class="stat-label">Lượt xem</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-number">8</span>
                        <span class="stat-label">Phù hợp</span>
                      </div>
                    </div>
                    <div class="job-post-actions">
                      <button class="btn btn-sm btn-outline">Xem chi tiết</button>
                      <button class="btn btn-sm btn-primary">Xem ứng viên</button>
                    </div>
                  </div>

                  <div class="job-post-item">
                    <div class="job-post-header">
                      <div>
                        <h4>Backend Developer</h4>
                        <p class="job-meta">Đăng 2 tuần trước • Đà Nẵng</p>
                      </div>
                      <span class="badge badge-warning">Expiring soon</span>
                    </div>
                    <div class="job-post-stats">
                      <div class="stat-item">
                        <span class="stat-number">31</span>
                        <span class="stat-label">Ứng viên</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-number">245</span>
                        <span class="stat-label">Lượt xem</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-number">10</span>
                        <span class="stat-label">Phù hợp</span>
                      </div>
                    </div>
                    <div class="job-post-actions">
                      <button class="btn btn-sm btn-outline">Gia hạn</button>
                      <button class="btn btn-sm btn-primary">Xem ứng viên</button>
                    </div>
                  </div>
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
                <a href="#" class="link">Xem tất cả</a>
              </div>
              <div class="card-body">
                <div class="applicants-list">
                  <div class="applicant-item">
                    <div class="applicant-avatar">NVA</div>
                    <div class="applicant-info">
                      <h4>Nguyễn Văn A</h4>
                      <p>Full Stack Developer</p>
                      <div class="applicant-tags">
                        <span class="tag">React</span>
                        <span class="tag">Node.js</span>
                      </div>
                    </div>
                    <div class="applicant-actions">
                      <button class="btn-icon" title="Xem hồ sơ">👁️</button>
                      <button class="btn-icon" title="Chấp nhận">✓</button>
                      <button class="btn-icon" title="Từ chối">✕</button>
                    </div>
                  </div>

                  <div class="applicant-item">
                    <div class="applicant-avatar" style="background: #f093fb;">TTB</div>
                    <div class="applicant-info">
                      <h4>Trần Thị B</h4>
                      <p>UI/UX Designer</p>
                      <div class="applicant-tags">
                        <span class="tag">Figma</span>
                        <span class="tag">Adobe XD</span>
                      </div>
                    </div>
                    <div class="applicant-actions">
                      <button class="btn-icon" title="Xem hồ sơ">👁️</button>
                      <button class="btn-icon" title="Chấp nhận">✓</button>
                      <button class="btn-icon" title="Từ chối">✕</button>
                    </div>
                  </div>

                  <div class="applicant-item">
                    <div class="applicant-avatar" style="background: #4facfe;">LVC</div>
                    <div class="applicant-info">
                      <h4>Lê Văn C</h4>
                      <p>Backend Developer</p>
                      <div class="applicant-tags">
                        <span class="tag">Java</span>
                        <span class="tag">Spring Boot</span>
                      </div>
                    </div>
                    <div class="applicant-actions">
                      <button class="btn-icon" title="Xem hồ sơ">👁️</button>
                      <button class="btn-icon" title="Chấp nhận">✓</button>
                      <button class="btn-icon" title="Từ chối">✕</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Analytics Chart Placeholder -->
            <div class="card">
              <div class="card-header">
                <h2>Thống kê tuần này</h2>
              </div>
              <div class="card-body">
                <div class="chart-placeholder">
                  <div class="chart-bar" style="height: 60%;">
                    <span class="chart-value">24</span>
                  </div>
                  <div class="chart-bar" style="height: 80%;">
                    <span class="chart-value">32</span>
                  </div>
                  <div class="chart-bar" style="height: 45%;">
                    <span class="chart-value">18</span>
                  </div>
                  <div class="chart-bar" style="height: 90%;">
                    <span class="chart-value">36</span>
                  </div>
                  <div class="chart-bar" style="height: 70%;">
                    <span class="chart-value">28</span>
                  </div>
                </div>
                <div class="chart-labels">
                  <span>T2</span>
                  <span>T3</span>
                  <span>T4</span>
                  <span>T5</span>
                  <span>T6</span>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="card">
              <div class="card-header">
                <h2>Thao tác nhanh</h2>
              </div>
              <div class="card-body">
                <div class="quick-actions">
                <router-link to="/employer/jobs/create" class="action-btn">
                  <span class="action-icon">📢</span>
                  <span>Đăng tin mới</span>
                </router-link>
                <router-link to="/employer/jobs" class="action-btn">
                  <span class="action-icon">📋</span>
                  <span>Quản lý Jobs</span>
                </router-link>
                <button class="action-btn">
                  <span class="action-icon">🔍</span>
                  <span>Tìm ứng viên</span>
                </button>
                <router-link to="/employer/profile" class="action-btn">
                  <span class="action-icon">⚙️</span>
                  <span>Cài đặt</span>
                </router-link>
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
import Header from '../components/Header.vue';
import { useAuth } from '../composables/useAuth';

const { user } = useAuth();
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
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
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
  color: #4ecdc4;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-hero:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
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
  color: #4ecdc4;
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

.badge-warning {
  background: #fff3cd;
  color: #856404;
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
}

.btn-primary {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.4);
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

.btn-outline {
  background: white;
  border: 1px solid #e0e0e0;
  color: #666;
}

.btn-outline:hover {
  border-color: #4ecdc4;
  color: #4ecdc4;
}

/* Job Posts List */
.job-posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.job-post-item {
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s;
}

.job-post-item:hover {
  border-color: #4ecdc4;
  box-shadow: 0 2px 8px rgba(78, 205, 196, 0.1);
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
  padding: 15px 0;
  border-top: 1px solid #f5f5f5;
  border-bottom: 1px solid #f5f5f5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
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
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s;
}

.applicant-item:hover {
  border-color: #4ecdc4;
  box-shadow: 0 2px 8px rgba(78, 205, 196, 0.1);
}

.applicant-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.applicant-info {
  flex: 1;
}

.applicant-info h4 {
  font-size: 15px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.applicant-info p {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.applicant-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  padding: 3px 8px;
  background: #f0f0f0;
  border-radius: 10px;
  font-size: 11px;
  color: #666;
}

.applicant-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.btn-icon:hover {
  border-color: #4ecdc4;
  transform: translateY(-2px);
}

/* Chart Placeholder */
.chart-placeholder {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  gap: 10px;
  margin-bottom: 15px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #4ecdc4 0%, #44a08d 100%);
  border-radius: 8px 8px 0 0;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10px;
  transition: all 0.3s;
}

.chart-bar:hover {
  opacity: 0.8;
  transform: scaleY(1.05);
}

.chart-value {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  color: #999;
  font-size: 13px;
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
}

.action-btn:hover {
  border-color: #4ecdc4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.1);
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

  .hero-section .container {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
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

  .job-post-stats {
    flex-wrap: wrap;
  }
}
</style>