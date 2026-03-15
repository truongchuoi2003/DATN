<template>
  <header class="header">
    <div class="container">
      <div class="logo">
        <router-link :to="homeRoute" class="logo-link">
          <h1>DATN Platform</h1>
        </router-link>
      </div>

      <!-- ===== NAV KHI ĐÃ ĐĂNG NHẬP ===== -->
      <nav v-if="isLoggedIn" class="nav">
        <router-link
          to="/student/profile"
          class="nav-link"
          v-if="user?.role === 'student'"
        >
          Hồ sơ
        </router-link>

        <router-link
          to="/employer/profile"
          class="nav-link"
          v-if="user?.role === 'employer'"
        >
          Hồ sơ
        </router-link>

        <router-link
          to="/admin/profile"
          class="nav-link"
          v-if="user?.role === 'admin'"
        >
          Hồ sơ
        </router-link>

        <div class="notification-wrapper" ref="notificationRef">
          <button class="notification-btn" @click="toggleNotifications" type="button">
            <span class="bell">🔔</span>
            <span v-if="unreadCount > 0" class="notification-badge">
              {{ unreadCount > 99 ? '99+' : unreadCount }}
            </span>
          </button>

          <div v-if="showNotifications" class="notification-dropdown">
            <div class="notification-header">
              <h3>Thông báo</h3>
              <button
                v-if="notifications.length > 0 && unreadCount > 0"
                class="mark-all-btn"
                @click="markAllAsRead"
                type="button"
              >
                Đọc tất cả
              </button>
            </div>

            <div v-if="loadingNotifications" class="notification-loading">
              Đang tải...
            </div>

            <div v-else-if="notifications.length === 0" class="notification-empty">
              Chưa có thông báo nào
            </div>

            <div v-else class="notification-list">
              <div
                v-for="item in notifications"
                :key="item._id"
                class="notification-item"
                :class="{ unread: !item.isRead }"
                @click="handleNotificationClick(item)"
              >
                <div class="notification-content">
                  <div class="notification-title-row">
                    <h4>{{ item.title }}</h4>
                    <span v-if="!item.isRead" class="dot"></span>
                  </div>
                  <p>{{ item.message }}</p>
                  <small>{{ formatTime(item.createdAt) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="user-info">
          <div class="header-avatar">
            <img v-if="user?.avatar" :src="getFullAssetUrl(user.avatar)" alt="avatar" />
            <span v-else>{{ getInitials(user?.fullName) }}</span>
          </div>

          <div class="user-text">
            <span class="welcome">
              Xin chào, <strong>{{ user?.fullName }}</strong>
            </span>
            <span class="role-badge" :class="user?.role">
              {{ getRoleName(user?.role) }}
            </span>
          </div>
        </div>

        <button @click="handleLogout" class="logout-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Đăng xuất
        </button>
      </nav>

      <!-- ===== NAV KHI CHƯA ĐĂNG NHẬP ===== -->
      <nav v-else class="nav">
        <router-link to="/" class="nav-link">
          Việc làm
        </router-link>

        <router-link to="/home" class="nav-link">
          Giới thiệu
        </router-link>

        <router-link to="/login" class="nav-link">
          Đăng nhập
        </router-link>

        <router-link to="/register" class="nav-link nav-link-primary">
          Đăng ký
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import api from '../services/api';

const router = useRouter();
const { user, isLoggedIn, logout } = useAuth();

const showNotifications = ref(false);
const notifications = ref([]);
const unreadCount = ref(0);
const loadingNotifications = ref(false);
const notificationRef = ref(null);

let pollingInterval = null;

const homeRoute = computed(() => {
  if (!user.value) return '/';

  const roleRoutes = {
    student: '/student',
    employer: '/employer',
    admin: '/admin',
  };

  return roleRoutes[user.value.role] || '/';
});

const getRoleName = (role) => {
  const roles = {
    student: 'Sinh viên',
    employer: 'Nhà tuyển dụng',
    admin: 'Quản trị viên',
  };
  return roles[role] || role;
};

const handleLogout = () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    logout();
  }
};

const fetchUnreadCount = async () => {
  try {
    const res = await api.get('/notifications/unread-count');
    unreadCount.value = res.data?.unreadCount || 0;
  } catch (error) {
    console.error('Lỗi tải unread notifications:', error);
  }
};

const fetchNotifications = async () => {
  try {
    loadingNotifications.value = true;
    const res = await api.get('/notifications?limit=10');
    notifications.value = res.data?.notifications || [];
  } catch (error) {
    console.error('Lỗi tải notifications:', error);
  } finally {
    loadingNotifications.value = false;
  }
};

const toggleNotifications = async () => {
  showNotifications.value = !showNotifications.value;

  if (showNotifications.value) {
    await fetchNotifications();
    await fetchUnreadCount();
  }
};

const markAllAsRead = async () => {
  try {
    await api.patch('/notifications/mark-all-read');
    notifications.value = notifications.value.map((item) => ({
      ...item,
      isRead: true,
    }));
    unreadCount.value = 0;
  } catch (error) {
    console.error('Lỗi mark all notifications:', error);
  }
};

const markOneAsRead = async (notificationId) => {
  try {
    await api.patch(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Lỗi mark notification as read:', error);
  }
};

const handleNotificationClick = async (item) => {
  if (!item.isRead) {
    await markOneAsRead(item._id);
    item.isRead = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  }

  showNotifications.value = false;

  if (item.link) {
    router.push(item.link);
  }
};

const formatTime = (dateString) => {
  if (!dateString) return '';

  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;

  return date.toLocaleDateString('vi-VN');
};

const handleClickOutside = (event) => {
  if (notificationRef.value && !notificationRef.value.contains(event.target)) {
    showNotifications.value = false;
  }
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getFullAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:4000${url}`;
};

onMounted(async () => {
  if (isLoggedIn.value) {
    await fetchUnreadCount();

    pollingInterval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
  }

  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  document.removeEventListener('click', handleClickOutside);
});
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
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.header-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-text {
  display: flex;
  flex-direction: column;
}

.logo-link {
  text-decoration: none;
  color: white;
  display: block;
  transition: all 0.3s;
}

.logo-link:hover {
  opacity: 0.9;
  transform: scale(1.03);
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
}

.nav {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-link-primary {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
}

.nav-link-primary:hover {
  background: rgba(255, 255, 255, 0.28);
}

.notification-wrapper {
  position: relative;
}

.notification-btn {
  position: relative;
  border: none;
  background: rgba(255, 255, 255, 0.18);
  color: white;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.25s ease;
}

.notification-btn:hover {
  background: rgba(255, 255, 255, 0.28);
}

.bell {
  display: inline-block;
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #ff4d4f;
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  width: 360px;
  max-height: 420px;
  overflow: hidden;
  background: white;
  color: #1f2937;
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
  z-index: 999;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  color: #111827;
}

.mark-all-btn {
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.notification-loading,
.notification-empty {
  padding: 18px 16px;
  font-size: 14px;
  color: #6b7280;
}

.notification-list {
  max-height: 350px;
  overflow-y: auto;
}

.notification-item {
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.2s ease;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item.unread {
  background: #eef4ff;
}

.notification-content h4 {
  margin: 0;
  font-size: 14px;
  color: #111827;
}

.notification-content p {
  margin: 6px 0 8px;
  font-size: 13px;
  line-height: 1.5;
  color: #4b5563;
}

.notification-content small {
  color: #9ca3af;
  font-size: 12px;
}

.notification-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #2563eb;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
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

.logout-btn svg {
  width: 16px;
  height: 16px;
}



@media (max-width: 900px) {
  .nav {
    gap: 12px;
  }

  .welcome {
    display: none;
  }

  .notification-dropdown {
    width: 320px;
    right: -20px;
  }
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    gap: 15px;
  }

  .nav {
    justify-content: center;
  }
}
</style>
