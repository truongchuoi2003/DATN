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
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              📝
            </div>
            <div class="stat-info">
              <h3>12</h3>
              <p>Đơn ứng tuyển</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              💼
            </div>
            <div class="stat-info">
              <h3>3</h3>
              <p>Đang chờ phản hồi</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              ✅
            </div>
            <div class="stat-info">
              <h3>2</h3>
              <p>Được chấp nhận</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              ⭐
            </div>
            <div class="stat-info">
              <h3>156</h3>
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
                <span class="badge badge-warning">75% hoàn thành</span>
              </div>
              <div class="card-body">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 75%"></div>
                </div>
                <p class="progress-text">Hoàn thiện hồ sơ để tăng cơ hội tìm được việc làm phù hợp</p>
                <button class="btn btn-primary">Cập nhật hồ sơ</button>
              </div>
            </div>

            <!-- Recent Applications -->
            <div class="card">
              <div class="card-header">
                <h2>Đơn ứng tuyển gần đây</h2>
                <a href="#" class="link">Xem tất cả</a>
              </div>
              <div class="card-body">
                <div class="application-list">
                  <div class="application-item">
                    <div class="company-logo">FPT</div>
                    <div class="application-info">
                      <h4>Frontend Developer</h4>
                      <p>FPT Software</p>
                      <span class="status status-pending">Đang chờ</span>
                    </div>
                    <div class="application-date">2 ngày trước</div>
                  </div>

                  <div class="application-item">
                    <div class="company-logo">VNG</div>
                    <div class="application-info">
                      <h4>Backend Developer</h4>
                      <p>VNG Corporation</p>
                      <span class="status status-accepted">Chấp nhận</span>
                    </div>
                    <div class="application-date">5 ngày trước</div>
                  </div>

                  <div class="application-item">
                    <div class="company-logo">MB</div>
                    <div class="application-info">
                      <h4>Data Analyst</h4>
                      <p>MoMo</p>
                      <span class="status status-rejected">Từ chối</span>
                    </div>
                    <div class="application-date">1 tuần trước</div>
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
                <a href="#" class="link">Xem thêm</a>
              </div>
              <div class="card-body">
                <div class="job-list">
                  <div class="job-item">
                    <div class="job-header">
                      <div class="company-avatar">F</div>
                      <div class="job-title-area">
                        <h4>Full Stack Developer</h4>
                        <p>FPT Software</p>
                      </div>
                    </div>
                    <div class="job-tags">
                      <span class="tag">React</span>
                      <span class="tag">Node.js</span>
                      <span class="tag">MongoDB</span>
                    </div>
                    <div class="job-footer">
                      <span class="salary">15-25 triệu</span>
                      <button class="btn btn-sm btn-outline">Ứng tuyển</button>
                    </div>
                  </div>

                  <div class="job-item">
                    <div class="job-header">
                      <div class="company-avatar" style="background: #ff6b6b;">V</div>
                      <div class="job-title-area">
                        <h4>Mobile Developer</h4>
                        <p>Viettel Solutions</p>
                      </div>
                    </div>
                    <div class="job-tags">
                      <span class="tag">Flutter</span>
                      <span class="tag">Firebase</span>
                    </div>
                    <div class="job-footer">
                      <span class="salary">12-20 triệu</span>
                      <button class="btn btn-sm btn-outline">Ứng tuyển</button>
                    </div>
                  </div>

                  <div class="job-item">
                    <div class="job-header">
                      <div class="company-avatar" style="background: #4ecdc4;">G</div>
                      <div class="job-title-area">
                        <h4>UI/UX Designer</h4>
                        <p>Gameloft Vietnam</p>
                      </div>
                    </div>
                    <div class="job-tags">
                      <span class="tag">Figma</span>
                      <span class="tag">Sketch</span>
                    </div>
                    <div class="job-footer">
                      <span class="salary">10-18 triệu</span>
                      <button class="btn btn-sm btn-outline">Ứng tuyển</button>
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
                  <button class="action-btn">
                    <span class="action-icon">📄</span>
                    <span>Tải CV lên</span>
                  </button>
                  <router-link to="/student/jobs" class="action-btn">
                    <span class="action-icon">🔍</span>
                    <span>Tìm việc làm</span>
                  </router-link>
                  <button class="action-btn">
                    <span class="action-icon">💬</span>
                    <span>Tin nhắn</span>
                  </button>
                  <button class="action-btn">
                    <span class="action-icon">⚙️</span>
                    <span>Cài đặt</span>
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