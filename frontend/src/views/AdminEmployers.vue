<template>
  <div class="admin-employers">
    <Header />
    
    <div class="container">
      <div class="page-header">
        <h1>🏢 Quản lý Nhà tuyển dụng</h1>
        <div class="filter-tabs">
          <button 
            :class="{ active: filter === 'pending' }" 
            @click="filter = 'pending'"
          >
            ⏳ Chờ duyệt ({{ pendingCount }})
          </button>
          <button 
            :class="{ active: filter === 'verified' }" 
            @click="filter = 'verified'"
          >
            ✅ Đã xác thực ({{ verifiedCount }})
          </button>
          <button 
            :class="{ active: filter === 'all' }" 
            @click="filter = 'all'"
          >
            📋 Tất cả ({{ employers.length }})
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Alert -->
      <div v-if="message" class="alert" :class="{ success: isSuccess, error: !isSuccess }">
        {{ message }}
      </div>

      <!-- Employers Table -->
      <div v-if="!loading" class="employers-table">
        <table>
          <thead>
            <tr>
              <th>Công ty</th>
              <th>Email</th>
              <th>Người đại diện</th>
              <th>Lĩnh vực</th>
              <th>Quy mô</th>
              <th>Ngày đăng ký</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employer in filteredEmployers" :key="employer._id">
              <td>
                <div class="company-cell">
                  <div class="company-logo">{{ getInitials(employer.companyName) }}</div>
                  <div>
                    <strong>{{ employer.companyName }}</strong>
                    <p v-if="employer.website">
                      <a :href="employer.website" target="_blank">{{ employer.website }}</a>
                    </p>
                  </div>
                </div>
              </td>
              <td>{{ employer.email }}</td>
              <td>{{ employer.fullName }}</td>
              <td>{{ employer.industry || '-' }}</td>
              <td>{{ employer.companySize || '-' }}</td>
              <td>{{ formatDate(employer.createdAt) }}</td>
              <td>
                <span class="status-badge" :class="{ verified: employer.verified }">
                  {{ employer.verified ? '✅ Đã xác thực' : '⏳ Chờ duyệt' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="btn-action view" 
                    @click="viewDetails(employer)"
                    title="Xem chi tiết"
                  >
                    👁️
                  </button>
                  <button 
                    v-if="!employer.verified"
                    class="btn-action approve" 
                    @click="handleVerify(employer._id)"
                    title="Xác thực"
                  >
                    ✅
                  </button>
                  <button 
                    v-if="employer.verified"
                    class="btn-action reject" 
                    @click="handleReject(employer._id)"
                    title="Hủy xác thực"
                  >
                    ❌
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredEmployers.length === 0" class="empty-state">
          <p>📭 Không có nhà tuyển dụng nào</p>
        </div>
      </div>

      <!-- Detail Modal -->
      <div v-if="selectedEmployer" class="modal" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="btn-close" @click="closeModal">✕</button>
          
          <h2>{{ selectedEmployer.companyName }}</h2>
          
          <div class="detail-grid">
            <div class="detail-item">
              <label>Email:</label>
              <span>{{ selectedEmployer.email }}</span>
            </div>
            
            <div class="detail-item">
              <label>Người đại diện:</label>
              <span>{{ selectedEmployer.fullName }}</span>
            </div>
            
            <div class="detail-item">
              <label>Số điện thoại:</label>
              <span>{{ selectedEmployer.phone || 'Chưa có' }}</span>
            </div>
            
            <div class="detail-item">
              <label>Lĩnh vực:</label>
              <span>{{ selectedEmployer.industry || 'Chưa có' }}</span>
            </div>
            
            <div class="detail-item">
              <label>Quy mô:</label>
              <span>{{ selectedEmployer.companySize || 'Chưa có' }}</span>
            </div>
            
            <div class="detail-item">
              <label>Website:</label>
              <span v-if="selectedEmployer.website">
                <a :href="selectedEmployer.website" target="_blank">{{ selectedEmployer.website }}</a>
              </span>
              <span v-else>Chưa có</span>
            </div>
            
            <div class="detail-item">
              <label>Mã số thuế:</label>
              <span>{{ selectedEmployer.taxCode || 'Chưa có' }}</span>
            </div>
            
            <div class="detail-item">
              <label>Địa chỉ:</label>
              <span>{{ selectedEmployer.address || 'Chưa có' }}</span>
            </div>
            
            <div class="detail-item full-width">
              <label>Mô tả:</label>
              <p>{{ selectedEmployer.description || 'Chưa có mô tả' }}</p>
            </div>
            
            <div class="detail-item">
              <label>Ngày đăng ký:</label>
              <span>{{ formatDate(selectedEmployer.createdAt) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Trạng thái:</label>
              <span class="status-badge" :class="{ verified: selectedEmployer.verified }">
                {{ selectedEmployer.verified ? '✅ Đã xác thực' : '⏳ Chờ duyệt' }}
              </span>
            </div>
          </div>

          <div class="modal-actions">
            <button 
              v-if="!selectedEmployer.verified"
              class="btn btn-success" 
              @click="handleVerify(selectedEmployer._id)"
            >
              ✅ Xác thực
            </button>
            <button 
              v-if="selectedEmployer.verified"
              class="btn btn-danger" 
              @click="handleReject(selectedEmployer._id)"
            >
              ❌ Hủy xác thực
            </button>
            <button class="btn btn-outline" @click="closeModal">
              Đóng
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
const employers = ref([]);
const filter = ref('pending'); // pending, verified, all
const selectedEmployer = ref(null);

const pendingCount = computed(() => employers.value.filter(e => !e.verified).length);
const verifiedCount = computed(() => employers.value.filter(e => e.verified).length);

const filteredEmployers = computed(() => {
  if (filter.value === 'pending') {
    return employers.value.filter(e => !e.verified);
  } else if (filter.value === 'verified') {
    return employers.value.filter(e => e.verified);
  }
  return employers.value;
});

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0];
  }
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

const fetchEmployers = async () => {
  try {
    loading.value = true;
    const res = await api.get('/admin/employers');
    employers.value = res.data.employers;
  } catch (error) {
    console.error('Error fetching employers:', error);
    message.value = 'Không thể tải danh sách nhà tuyển dụng';
    isSuccess.value = false;
  } finally {
    loading.value = false;
  }
};

const handleVerify = async (employerId) => {
  if (!confirm('Xác nhận xác thực nhà tuyển dụng này?')) return;

  try {
    message.value = '';
    await api.put(`/admin/employers/${employerId}/verify`);
    
    message.value = 'Xác thực thành công! ✅';
    isSuccess.value = true;
    
    // Update local state
    const employer = employers.value.find(e => e._id === employerId);
    if (employer) employer.verified = true;
    
    selectedEmployer.value = null;
    
    setTimeout(() => {
      message.value = '';
    }, 3000);
  } catch (error) {
    message.value = error.response?.data?.message || 'Xác thực thất bại';
    isSuccess.value = false;
  }
};

const handleReject = async (employerId) => {
  if (!confirm('Xác nhận hủy xác thực nhà tuyển dụng này?')) return;

  try {
    message.value = '';
    await api.put(`/admin/employers/${employerId}/reject`);
    
    message.value = 'Đã hủy xác thực';
    isSuccess.value = true;
    
    // Update local state
    const employer = employers.value.find(e => e._id === employerId);
    if (employer) employer.verified = false;
    
    selectedEmployer.value = null;
    
    setTimeout(() => {
      message.value = '';
    }, 3000);
  } catch (error) {
    message.value = error.response?.data?.message || 'Hủy xác thực thất bại';
    isSuccess.value = false;
  }
};

const viewDetails = (employer) => {
  selectedEmployer.value = employer;
};

const closeModal = () => {
  selectedEmployer.value = null;
};

onMounted(() => {
  fetchEmployers();
});
</script>

<style scoped>
.admin-employers {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 30px 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.filter-tabs {
  display: flex;
  gap: 10px;
}

.filter-tabs button {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
}

.filter-tabs button:hover {
  border-color: #667eea;
}

.filter-tabs button.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.alert {
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
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
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
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
  border-radius: 8px;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
}

.company-cell strong {
  display: block;
  color: #2c3e50;
  margin-bottom: 4px;
}

.company-cell p {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.company-cell a {
  color: #667eea;
  text-decoration: none;
}

.company-cell a:hover {
  text-decoration: underline;
}

.status-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: #fff3cd;
  color: #856404;
}

.status-badge.verified {
  background: #d4edda;
  color: #155724;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 35px;
  height: 35px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-action.view:hover {
  border-color: #667eea;
}

.btn-action.approve:hover {
  border-color: #43e97b;
  background: #43e97b;
}

.btn-action.reject:hover {
  border-color: #ff6b6b;
  background: #ff6b6b;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

/* Modal */
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.btn-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 35px;
  height: 35px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #e0e0e0;
  transform: rotate(90deg);
}

.modal-content h2 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 25px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

.detail-item span,
.detail-item p {
  font-size: 14px;
  color: #2c3e50;
}

.detail-item a {
  color: #667eea;
  text-decoration: none;
}

.detail-item a:hover {
  text-decoration: underline;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-success {
  background: #43e97b;
  color: white;
}

.btn-success:hover {
  background: #38d66e;
  transform: translateY(-2px);
}

.btn-danger {
  background: #ff6b6b;
  color: white;
}

.btn-danger:hover {
  background: #ff5252;
  transform: translateY(-2px);
}

.btn-outline {
  background: white;
  border: 1px solid #e0e0e0;
  color: #666;
}

.btn-outline:hover {
  border-color: #667eea;
  color: #667eea;
}

@media (max-width: 768px) {
  .filter-tabs {
    flex-direction: column;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  table {
    font-size: 12px;
  }

  th, td {
    padding: 10px;
  }
}
</style>