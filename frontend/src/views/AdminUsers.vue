<template>
  <div class="admin-users">
    <Header />

    <div class="container">
      <div class="page-header">
        <h1>👥 Quản lý Người dùng</h1>
        <div class="filter-tabs">
          <button :class="{ active: filter === 'all' }" @click="filter = 'all'">
            📋 Tất cả ({{ users.length }})
          </button>
          <button :class="{ active: filter === 'student' }" @click="filter = 'student'">
            🎓 Sinh viên ({{ studentCount }})
          </button>
          <button :class="{ active: filter === 'employer' }" @click="filter = 'employer'">
            💼 Nhà tuyển dụng ({{ employerCount }})
          </button>
          <button :class="{ active: filter === 'admin' }" @click="filter = 'admin'">
            ⚙️ Admin ({{ adminCount }})
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <div v-if="message" class="alert" :class="{ success: isSuccess, error: !isSuccess }">
        {{ message }}
      </div>

      <div v-if="!loading" class="employers-table">
        <table>
          <thead>
            <tr>
              <th>Họ tên / Công ty</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Role</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="`${user.role}-${user._id}`">
              <td>
                <div class="company-cell">
                  <div class="company-logo">
                    {{ getInitials(user.fullName || user.companyName) }}
                  </div>
                  <div>
                    <strong>{{ user.fullName || user.companyName || '-' }}</strong>
                    <p v-if="user.companyName && user.fullName">{{ user.companyName }}</p>
                  </div>
                </div>
              </td>
              <td>{{ user.email || '-' }}</td>
              <td>{{ user.phone || '-' }}</td>
              <td>
                <span class="role-badge" :class="user.role">
                  {{ getRoleName(user.role) }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <span class="status-badge" :class="{ verified: user.isActive !== false, locked: user.isActive === false }">
                  {{ user.isActive === false ? '🔒 Đã khóa' : '✅ Hoạt động' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    class="btn-action view"
                    @click="viewDetails(user)"
                    title="Xem chi tiết"
                  >
                    👁️
                  </button>
                  <button
                    class="btn-action approve"
                    @click="openResetModal(user)"
                    title="Reset mật khẩu"
                  >
                    🔑
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredUsers.length === 0">
              <td colspan="7" class="empty-state">
                <p>📭 Không có người dùng nào</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal xem chi tiết -->
      <div v-if="selectedUser && !showReset" class="modal" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="btn-close" @click="closeModal">✕</button>

          <h2>{{ selectedUser.fullName || selectedUser.companyName || 'Chi tiết user' }}</h2>

          <div class="detail-grid">
            <div class="detail-item">
              <label>Email:</label>
              <span>{{ selectedUser.email || '-' }}</span>
            </div>

            <div class="detail-item">
              <label>Số điện thoại:</label>
              <span>{{ selectedUser.phone || 'Chưa có' }}</span>
            </div>

            <div class="detail-item">
              <label>Role:</label>
              <span>{{ getRoleName(selectedUser.role) }}</span>
            </div>

            <div class="detail-item">
              <label>Ngày tạo:</label>
              <span>{{ formatDate(selectedUser.createdAt) }}</span>
            </div>

            <div class="detail-item">
              <label>Trạng thái:</label>
              <span class="status-badge" :class="{ verified: selectedUser.isActive !== false, locked: selectedUser.isActive === false }">
                {{ selectedUser.isActive === false ? '🔒 Đã khóa' : '✅ Hoạt động' }}
              </span>
            </div>

            <div class="detail-item full-width" v-if="selectedUser.role === 'student'">
              <label>Thông tin học tập:</label>
              <p>
                {{ selectedUser.university || 'Chưa có trường' }}
                <span v-if="selectedUser.major"> - {{ selectedUser.major }}</span>
              </p>
            </div>

            <div class="detail-item full-width" v-if="selectedUser.role === 'employer'">
              <label>Thông tin công ty:</label>
              <p>
                {{ selectedUser.companyName || 'Chưa có tên công ty' }}
                <span v-if="selectedUser.industry"> - {{ selectedUser.industry }}</span>
              </p>
            </div>
          </div>

          <div class="modal-actions">
            <button
              class="btn"
              :class="selectedUser.isActive === false ? 'btn-success' : 'btn-danger'"
              @click="handleToggleUserStatus(selectedUser)"
            >
              {{ selectedUser.isActive === false ? '🔓 Mở khóa user' : '🔒 Khóa user' }}
            </button>

            <button class="btn btn-outline" @click="closeModal">
              Đóng
            </button>
          </div>
        </div>
      </div>

      <!-- Modal reset password -->
      <div v-if="selectedUser && showReset" class="modal" @click="closeModal">
        <div class="modal-content small" @click.stop>
          <button class="btn-close" @click="closeModal">✕</button>

          <h2>Reset mật khẩu</h2>
          <p class="reset-desc">
            Đặt mật khẩu mới cho
            <strong>{{ selectedUser.fullName || selectedUser.companyName }}</strong>
          </p>

          <div class="form-group">
            <label>Mật khẩu mới</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          <div class="modal-actions">
            <button class="btn btn-success" @click="handleResetPassword" :disabled="resetLoading">
              {{ resetLoading ? 'Đang reset...' : 'Xác nhận reset' }}
            </button>
            <button class="btn btn-outline" @click="closeModal">
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '../components/Header.vue';
import api from '../services/api';

const loading = ref(false);
const message = ref('');
const isSuccess = ref(false);
const users = ref([]);
const filter = ref('all');
const selectedUser = ref(null);
const showReset = ref(false);
const newPassword = ref('');
const resetLoading = ref(false);

const studentCount = computed(() => users.value.filter((u) => u.role === 'student').length);
const employerCount = computed(() => users.value.filter((u) => u.role === 'employer').length);
const adminCount = computed(() => users.value.filter((u) => u.role === 'admin').length);

const filteredUsers = computed(() => {
  if (filter.value === 'all') return users.value;
  return users.value.filter((u) => u.role === filter.value);
});

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

const fetchUsers = async () => {
  try {
    loading.value = true;
    message.value = '';

    const res = await api.get('/admin/users');
    users.value = res.data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    message.value = 'Không thể tải danh sách người dùng';
    isSuccess.value = false;
  } finally {
    loading.value = false;
  }
};

const viewDetails = (user) => {
  selectedUser.value = { ...user };
  showReset.value = false;
  newPassword.value = '';
};

const openResetModal = (user) => {
  selectedUser.value = { ...user };
  showReset.value = true;
  newPassword.value = '';
};

const closeModal = () => {
  selectedUser.value = null;
  showReset.value = false;
  newPassword.value = '';
};

const handleResetPassword = async () => {
  if (!newPassword.value || newPassword.value.length < 6) {
    message.value = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    isSuccess.value = false;
    return;
  }

  try {
    resetLoading.value = true;

    const res = await api.put(
      `/admin/users/${selectedUser.value.role}/${selectedUser.value._id}/reset-password`,
      { newPassword: newPassword.value }
    );

    message.value = res.data.message || 'Reset mật khẩu thành công';
    isSuccess.value = true;
    closeModal();
  } catch (error) {
    console.error('Error resetting password:', error);
    message.value = error.response?.data?.message || 'Reset mật khẩu thất bại';
    isSuccess.value = false;
  } finally {
    resetLoading.value = false;
  }
};

const handleToggleUserStatus = async (user) => {
  try {
    const res = await api.put(`/admin/users/${user.role}/${user._id}/toggle-status`);

    message.value = res.data.message || 'Cập nhật trạng thái thành công';
    isSuccess.value = true;

    const index = users.value.findIndex(
      (u) => u._id === user._id && u.role === user.role
    );

    if (index !== -1) {
      users.value[index].isActive = !users.value[index].isActive;
    }

    if (
      selectedUser.value &&
      selectedUser.value._id === user._id &&
      selectedUser.value.role === user.role
    ) {
      selectedUser.value.isActive = !selectedUser.value.isActive;
    }
  } catch (error) {
    console.error('Error toggling user status:', error);
    message.value = error.response?.data?.message || 'Cập nhật trạng thái thất bại';
    isSuccess.value = false;
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
.admin-users {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 30px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.page-header h1 {
  font-size: 32px;
  color: #2c3e50;
  margin: 0;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-tabs button {
  padding: 10px 20px;
  border: 2px solid #e0e6ed;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.filter-tabs button:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.filter-tabs button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.loading {
  text-align: center;
  padding: 60px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e6ed;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

.alert {
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
}

.alert.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.employers-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9fa;
}

th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e6ed;
}

td {
  padding: 15px;
  border-bottom: 1px solid #e0e6ed;
}

tr:hover {
  background: #f8f9fa;
}

.company-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-logo {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
}

.role-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.role-badge.student {
  background: #e3f2fd;
  color: #1976d2;
}

.role-badge.employer {
  background: #fff3e0;
  color: #f57c00;
}

.role-badge.admin {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  background: #fff3cd;
  color: #856404;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.verified {
  background: #d4edda;
  color: #155724;
}

.status-badge.locked {
  background: #f8d7da;
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
}

.btn-action.view {
  background: #e3f2fd;
}

.btn-action.approve {
  background: #d4edda;
}

.btn-action:hover {
  transform: scale(1.1);
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #666;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-content.small {
  max-width: 500px;
}

.btn-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 35px;
  height: 35px;
  border: none;
  background: #f8f9fa;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
}

.modal-content h2 {
  margin-bottom: 25px;
  color: #2c3e50;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.detail-item span,
.detail-item p {
  color: #2c3e50;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
  justify-content: flex-end;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-outline {
  background: white;
  color: #666;
  border: 2px solid #e0e6ed;
}

.btn:hover {
  transform: translateY(-2px);
}

.form-group {
  margin-top: 16px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #667eea;
}

.reset-desc {
  color: #666;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 992px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 20px 15px;
  }

  .employers-table {
    overflow-x: auto;
  }

  table {
    min-width: 900px;
  }
}
</style>