<template>
  <header class="public-header">
    <div class="container">
      <router-link to="/" class="brand">
        <span class="brand-icon">🎓</span>
        <div>
          <h1>DATN Platform</h1>
          <p>Kết nối sinh viên và nhà tuyển dụng</p>
        </div>
      </router-link>

      <nav class="nav">
        <router-link to="/" class="nav-link">Trang chủ</router-link>
        <router-link to="/jobs/public" class="nav-link">Việc làm</router-link>
        <router-link to="/login" class="nav-link outline">Đăng nhập</router-link>
        <router-link to="/register" class="nav-link primary">Đăng ký</router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.public-header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e7eb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #1f2937;
}

.brand-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.brand h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.brand p {
  margin: 2px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.nav-link {
  text-decoration: none;
  color: #374151;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 600;
  transition: 0.2s ease;
}

.nav-link:hover {
  background: #f3f4f6;
}

.nav-link.outline {
  border: 1px solid #d1d5db;
}

.nav-link.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav {
    width: 100%;
  }
}
</style>
