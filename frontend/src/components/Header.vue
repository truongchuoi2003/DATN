<template>
  <header class="header">
    <div class="container">
      <div class="logo">
        <h1>DATN Platform</h1>
      </div>

      <nav v-if="isLoggedIn" class="nav">
        <div class="user-info">
          <span class="welcome">Xin chào, <strong>{{ user?.fullName }}</strong></span>
          <span class="role-badge" :class="user?.role">{{ getRoleName(user?.role) }}</span>
        </div>

        <!-- Profile button -->
        <button @click="goProfile" class="profile-btn" aria-label="Xem hồ sơ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Hồ sơ
        </button>

        <button @click="handleLogout" class="logout-btn" aria-label="Đăng xuất">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Đăng xuất
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const { user, isLoggedIn, logout } = useAuth();
const router = useRouter();

const getRoleName = (role) => {
  const roles = {
    student: 'Sinh viên',
    employer: 'Nhà tuyển dụng',
    admin: 'Quản trị viên'
  };
  return roles[role] || role;
};

const handleLogout = () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    logout();
    router.push('/login');
  }
};

const goProfile = () => {
  // navigate to profile page
  router.push('/profile');
};
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 8px;
}

.welcome {
  font-size: 14px;
}

.welcome strong {
  font-weight: 600;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
}

.role-badge.admin {
  background: #ff6b6b;
}

.role-badge.employer {
  background: #4ecdc4;
}

.role-badge.student {
  background: #45b7d1;
}

/* Profile button (similar style to logout) */
.profile-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.12);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.profile-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.logout-btn svg,
.profile-btn svg {
  width: 16px;
  height: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    gap: 15px;
  }

  .welcome {
    font-size: 12px;
  }
}
</style>
