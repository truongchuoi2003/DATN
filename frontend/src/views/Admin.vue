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
            <span class="hero-stat-value">1,234</span>
            <span class="hero-stat-label">Người dùng</span>
          </div>
          <div class="hero-stat-item">
            <span class="hero-stat-value">89%</span>
            <span class="hero-stat-label">Hoạt động</span>
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
              <h3>1,234</h3>
              <p>Tổng người dùng</p>
              <span class="stat-change positive">+48 tuần này</span>
            </div>
            <div class="stat-chart">
              <div class="mini-chart">
                <div class="bar" style="height: 40%"></div>
                <div class="bar" style="height: 65%"></div>
                <div class="bar" style="height: 55%"></div>
                <div class="bar" style="height: 80%"></div>
                <div class="bar" style="height: 70%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              🎓
            </div>
            <div class="stat-info">
              <h3>856</h3>
              <p>Sinh viên</p>
              <span class="stat-change positive">+32 tuần này</span>
            </div>
            <div class="stat-chart">
              <div class="mini-chart">
                <div class="bar" style="height: 50%"></div>
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 45%"></div>
                <div class="bar" style="height: 75%"></div>
                <div class="bar" style="height: 85%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              💼
            </div>
            <div class="stat-info">
              <h3>378</h3>
              <p>Nhà tuyển dụng</p>
              <span class="stat-change positive">+16 tuần này</span>
            </div>
            <div class="stat-chart">
              <div class="mini-chart">
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 50%"></div>
                <div class="bar" style="height: 70%"></div>
                <div class="bar" style="height: 55%"></div>
                <div class="bar" style="height: 80%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              📢
            </div>
            <div class="stat-info">
              <h3>542</h3>
              <p>Tin tuyển dụng</p>
              <span class="stat-change positive">+24 tuần này</span>
            </div>
            <div class="stat-chart">
              <div class="mini-chart">
                <div class="bar" style="height: 55%"></div>
                <div class="bar" style="height: 70%"></div>
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 80%"></div>
                <div class="bar" style="height: 90%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Grid -->
        <div class="dashboard-grid">
          <!-- Left Column -->
          <div class="left-column">
            <!-- Recent Users -->
            <div class="card">
              <div class="card-header">
                <h2>Người dùng mới</h2>
                <select class="filter-select">
                  <option>Tất cả</option>
                  <option>Sinh viên</option>
                  <option>Nhà tuyển dụng</option>
                </select>
              </div>
              <div class="card-body">
                <div class="table-container">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Ngày đăng ký</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div class="user-cell">
                            <div class="avatar">NVA</div>
                            <span>Nguyễn Văn A</span>
                          </div>
                        </td>
                        <td>nva@student.com</td>
                        <td><span class="role-badge student">Sinh viên</span></td>
                        <td>15/01/2026</td>
                        <td><span class="status-badge active">Active</span></td>
                        <td>
                          <div class="action-buttons">
                            <button class="btn-action" title="Xem chi tiết">👁️</button>
                            <button class="btn-action" title="Chỉnh sửa">✏️</button>
                            <button class="btn-action danger" title="Xóa">🗑️</button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="user-cell">
                            <div class="avatar" style="background: #f093fb;">TTB</div>
                            <span>Trần Thị B</span>
                          </div>
                        </td>
                        <td>ttb@company.com</td>
                        <td><span class="role-badge employer">Nhà tuyển dụng</span></td>
                        <td>14/01/2026</td>
                        <td><span class="status-badge pending">Pending</span></td>
                        <td>
                          <div class="action-buttons">
                            <button class="btn-action" title="Xem chi tiết">👁️</button>
                            <button class="btn-action" title="Chỉnh sửa">✏️</button>
                            <button class="btn-action danger" title="Xóa">🗑️</button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="user-cell">
                            <div class="avatar" style="background: #4facfe;">LVC</div>
                            <span>Lê Văn C</span>
                          </div>
                        </td>
                        <td>lvc@student.com</td>
                        <td><span class="role-badge student">Sinh viên</span></td>
                        <td>13/01/2026</td>
                        <td><span class="status-badge active">Active</span></td>
                        <td>
                          <div class="action-buttons">
                            <button class="btn-action" title="Xem chi tiết">👁️</button>
                            <button class="btn-action" title="Chỉnh sửa">✏️</button>
                            <button class="btn-action danger" title="Xóa">🗑️</button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="user-cell">
                            <div class="avatar" style="background: #43e97b;">PHD</div>
                            <span>Phạm Hữu D</span>
                          </div>
                        </td>
                        <td>phd@company.com</td>
                        <td><span class="role-badge employer">Nhà tuyển dụng</span></td>
                        <td>12/01/2026</td>
                        <td><span class="status-badge active">Active</span></td>
                        <td>
                          <div class="action-buttons">
                            <button class="btn-action" title="Xem chi tiết">👁️</button>
                            <button class="btn-action" title="Chỉnh sửa">✏️</button>
                            <button class="btn-action danger" title="Xóa">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Pending Approvals -->
            <div class="card">
              <div class="card-header">
                <h2>Chờ duyệt</h2>
                <span class="badge badge-warning">8 yêu cầu</span>
              </div>
              <div class="card-body">
                <div class="approval-list">
                  <div class="approval-item">
                    <div class="approval-icon">🏢</div>
                    <div class="approval-info">
                      <h4>FPT Software</h4>
                      <p>Yêu cầu xác thực công ty</p>
                      <span class="approval-time">2 giờ trước</span>
                    </div>
                    <div class="approval-actions">
                      <button class="btn btn-sm btn-success">Chấp nhận</button>
                      <button class="btn btn-sm btn-outline">Từ chối</button>
                    </div>
                  </div>

                  <div class="approval-item">
                    <div class="approval-icon">📢</div>
                    <div class="approval-info">
                      <h4>Senior Developer</h4>
                      <p>Tin tuyển dụng mới từ Viettel</p>
                      <span class="approval-time">5 giờ trước</span>
                    </div>
                    <div class="approval-actions">
                      <button class="btn btn-sm btn-success">Chấp nhận</button>
                      <button class="btn btn-sm btn-outline">Từ chối</button>
                    </div>
                  </div>

                  <div class="approval-item">
                    <div class="approval-icon">🏢</div>
                    <div class="approval-info">
                      <h4>VNG Corporation</h4>
                      <p>Cập nhật thông tin công ty</p>
                      <span class="approval-time">1 ngày trước</span>
                    </div>
                    <div class="approval-actions">
                      <button class="btn btn-sm btn-success">Chấp nhận</button>
                      <button class="btn btn-sm btn-outline">Từ chối</button>
                    </div>
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

                  <div class="metric-item">
                    <div class="metric-label">Database</div>
                    <div class="metric-bar">
                      <div class="metric-fill" style="width: 35%; background: #667eea;"></div>
                    </div>
                    <div class="metric-value">35%</div>
                  </div>
                </div>

                <div class="server-info">
                  <div class="info-row">
                    <span class="info-label">Server:</span>
                    <span class="info-value">Production (AWS)</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Uptime:</span>
                    <span class="info-value">24 days 14h</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Version:</span>
                    <span class="info-value">v1.2.4</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Activities -->
            <div class="card">
              <div class="card-header">
                <h2>Hoạt động gần đây</h2>
              </div>
              <div class="card-body">
                <div class="activity-timeline">
                  <div class="timeline-item">
                    <div class="timeline-icon" style="background: #667eea;">👤</div>
                    <div class="timeline-content">
                      <p><strong>Nguyễn Văn A</strong> đã đăng ký tài khoản</p>
                      <span class="timeline-time">5 phút trước</span>
                    </div>
                  </div>

                  <div class="timeline-item">
                    <div class="timeline-icon" style="background: #f093fb;">📢</div>
                    <div class="timeline-content">
                      <p><strong>FPT Software</strong> đăng tin tuyển dụng mới</p>
                      <span class="timeline-time">15 phút trước</span>
                    </div>
                  </div>

                  <div class="timeline-item">
                    <div class="timeline-icon" style="background: #4facfe;">✅</div>
                    <div class="timeline-content">
                      <p>Admin đã phê duyệt <strong>Viettel Solutions</strong></p>
                      <span class="timeline-time">1 giờ trước</span>
                    </div>
                  </div>

                  <div class="timeline-item">
                    <div class="timeline-icon" style="background: #43e97b;">💼</div>
                    <div class="timeline-content">
                      <p><strong>Trần Thị B</strong> đã ứng tuyển 1 công việc</p>
                      <span class="timeline-time">2 giờ trước</span>
                    </div>
                  </div>

                  <div class="timeline-item">
                    <div class="timeline-icon" style="background: #667eea;">⚙️</div>
                    <div class="timeline-content">
                      <p>Hệ thống backup tự động hoàn thành</p>
                      <span class="timeline-time">3 giờ trước</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="card">
              <div class="card-header">
                <h2>Quản lý nhanh</h2>
              </div>
              <div class="card-body">
                <div class="quick-actions-grid">
                  <button class="action-card">
                    <div class="action-icon" style="background: #667eea;">👥</div>
                    <span>Người dùng</span>
                  </button>
                  <button class="action-card">
                    <div class="action-icon" style="background: #f093fb;">🏢</div>
                    <span>Công ty</span>
                  </button>
                  <button class="action-card">
                    <div class="action-icon" style="background: #4facfe;">📢</div>
                    <span>Tin tuyển dụng</span>
                  </button>
                  <button class="action-card">
                    <div class="action-icon" style="background: #43e97b;">📊</div>
                    <span>Báo cáo</span>
                  </button>
                  <button class="action-card">
                    <div class="action-icon" style="background: #667eea;">🔔</div>
                    <span>Thông báo</span>
                  </button>
                  <button class="action-card">
                    <div class="action-icon" style="background: #f093fb;">⚙️</div>
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  overflow: hidden;
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
  margin-bottom: 5px;
}

.stat-change {
  font-size: 12px;
  color: #999;
}

.stat-change.positive {
  color: #43e97b;
}

.stat-chart {
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 0.1;
}

.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 50px;
  padding: 10px;
}

.mini-chart .bar {
  width: 8px;
  background: #2c3e50;
  border-radius: 2px 2px 0 0;
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

/* Filter Select */
.filter-select {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background: white;
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

/* Table */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f8f9fa;
}

.data-table th {
  padding: 12px 15px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.role-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.student {
  background: #e3f2fd;
  color: #1976d2;
}

.role-badge.employer {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.btn-action {
  width: 30px;
  height: 30px;
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

.btn-action:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.btn-action.danger:hover {
  border-color: #dc3545;
  color: #dc3545;
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
  margin-bottom: 5px;
}

.approval-info p {
  font-size: 13px;
  color: #666;
  margin-bottom: 5px;
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

.btn-outline {
  background: white;
  border: 1px solid #e0e0e0;
  color: #666;
}

.btn-outline:hover {
  border-color: #dc3545;
  color: #dc3545;
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
</style>