<template>
  <div>
    <Header />
    
    <main class="main-content">
      <div class="container">
        <h2>⚙️ Admin Dashboard</h2>
        
        <div class="welcome-card">
          <h3>Chào mừng, {{ user?.fullName }}!</h3>
          <p>Email: {{ user?.email }}</p>
          <p>Role: Quản trị viên</p>
        </div>

        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">150</div>
            <div class="stat-label">Người dùng</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">45</div>
            <div class="stat-label">Nhà tuyển dụng</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">320</div>
            <div class="stat-label">Tin tuyển dụng</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">1,234</div>
            <div class="stat-label">Ứng tuyển</div>
          </div>
        </div>

        <div class="features">
          <div class="feature-card">
            <h4>👥 Quản lý người dùng</h4>
            <p>Xem, thêm, sửa, xóa người dùng</p>
          </div>

          <div class="feature-card">
            <h4>🏢 Quản lý công ty</h4>
            <p>Duyệt và quản lý hồ sơ công ty</p>
          </div>

          <div class="feature-card">
            <h4>📝 Quản lý tin tuyển dụng</h4>
            <p>Kiểm duyệt và quản lý tin đăng</p>
          </div>

          <div class="feature-card">
            <h4>📊 Báo cáo & Thống kê</h4>
            <p>Xem báo cáo tổng quan hệ thống</p>
          </div>

          <div class="feature-card">
            <h4>⚙️ Cài đặt hệ thống</h4>
            <p>Cấu hình và tùy chỉnh hệ thống</p>
          </div>

          <div class="feature-card">
            <h4>🔔 Thông báo</h4>
            <p>Gửi thông báo cho người dùng</p>
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
.main-content {
  padding: 40px 20px;
  min-height: calc(100vh - 80px);
  background: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 32px;
}

.welcome-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.welcome-card h3 {
  color: #ff6b6b;
  margin-bottom: 15px;
}

.welcome-card p {
  color: #666;
  margin: 5px 0;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.feature-card h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 18px;
}

.feature-card p {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}
</style>