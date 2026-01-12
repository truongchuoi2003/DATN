<template>
  <div>
    <Header />
    
    <main class="main-content">
      <div class="container">
        <h2>💼 Employer Dashboard</h2>
        
        <div class="welcome-card">
          <h3>Chào mừng, {{ user?.fullName }}!</h3>
          <p>Email: {{ user?.email }}</p>
          <p>Role: Nhà tuyển dụng</p>
        </div>

        <div class="features">
          <div class="feature-card">
            <h4>📢 Đăng tin tuyển dụng</h4>
            <p>Tạo và quản lý tin tuyển dụng của bạn</p>
          </div>

          <div class="feature-card">
            <h4>👥 Quản lý ứng viên</h4>
            <p>Xem và đánh giá hồ sơ ứng viên</p>
          </div>

          <div class="feature-card">
            <h4>📊 Thống kê</h4>
            <p>Báo cáo hiệu quả tuyển dụng</p>
          </div>

          <div class="feature-card">
            <h4>⭐ Đánh giá</h4>
            <p>Quản lý đánh giá từ ứng viên</p>
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
  color: #4ecdc4;
  margin-bottom: 15px;
}

.welcome-card p {
  color: #666;
  margin: 5px 0;
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