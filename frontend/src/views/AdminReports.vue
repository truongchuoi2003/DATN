<template>
  <div class="admin-reports">
    <Header />

    <div class="container">
      <div class="page-header">
        <h1>🚨 Quản lý Reports</h1>
        <div class="filter-tabs">
          <button :class="{ active: statusFilter === 'all' }" @click="statusFilter = 'all'">
            📋 Tất cả ({{ reports.length }})
          </button>
          <button :class="{ active: statusFilter === 'open' }" @click="statusFilter = 'open'">
            🆕 Mới ({{ openCount }})
          </button>
          <button :class="{ active: statusFilter === 'in_review' }" @click="statusFilter = 'in_review'">
            👀 Đang xử lý ({{ inReviewCount }})
          </button>
          <button :class="{ active: statusFilter === 'resolved' }" @click="statusFilter = 'resolved'">
            ✅ Đã xử lý ({{ resolvedCount }})
          </button>
          <button :class="{ active: statusFilter === 'dismissed' }" @click="statusFilter = 'dismissed'">
            ❌ Bỏ qua ({{ dismissedCount }})
          </button>
        </div>
      </div>

      <div class="secondary-filter">
        <label>Lọc theo đối tượng bị report:</label>
        <select v-model="targetTypeFilter">
          <option value="all">Tất cả</option>
          <option value="student">Ứng viên</option>
          <option value="employer">Nhà tuyển dụng</option>
          <option value="job">Bài đăng</option>
        </select>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải reports...</p>
      </div>

      <div v-if="message" class="alert" :class="{ success: isSuccess, error: !isSuccess }">
        {{ message }}
      </div>

      <div v-if="!loading" class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Người report</th>
              <th>Đối tượng bị report</th>
              <th>Lý do</th>
              <th>Liên quan</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in filteredReports" :key="report._id">
              <td>
                <strong>{{ getReporterName(report) }}</strong>
                <p>{{ getReporterEmail(report) }}</p>
                <small class="muted">{{ getReporterRoleLabel(report.reporterRole) }}</small>
              </td>

              <td>
                <strong>{{ getTargetLabel(report) }}</strong>
                <p>{{ getTargetName(report) }}</p>
              </td>

              <td>
                <strong>{{ getReasonLabel(report.reason) }}</strong>
                <p>{{ truncateText(report.description, 80) }}</p>
              </td>

              <td>
                <div class="related-box">
                  <p v-if="report.relatedJob"><strong>Job:</strong> {{ report.relatedJob.title }}</p>
                  <p v-if="report.relatedApplication"><strong>Application:</strong> {{ report.relatedApplication.status }}</p>
                  <p v-if="!report.relatedJob && !report.relatedApplication">-</p>
                </div>
              </td>

              <td>{{ formatDate(report.createdAt) }}</td>

              <td>
                <span class="status-badge" :class="report.status">
                  {{ getStatusLabel(report.status) }}
                </span>
              </td>

              <td>
                <div class="action-buttons">
                  <button class="btn-action view" @click="viewReport(report._id)">👁️</button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredReports.length === 0">
              <td colspan="7" class="empty-state">
                <p>📭 Không có report nào</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="selectedReport" class="modal" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <button class="btn-close" @click="closeModal">✕</button>

        <h2>📌 Chi tiết report</h2>

        <div class="detail-grid">
          <div class="detail-item">
            <label>Người report:</label>
            <span>{{ getReporterName(selectedReport) }}</span>
          </div>

          <div class="detail-item">
            <label>Vai trò:</label>
            <span>{{ getReporterRoleLabel(selectedReport.reporterRole) }}</span>
          </div>

          <div class="detail-item">
            <label>Đối tượng bị report:</label>
            <span>{{ getTargetLabel(selectedReport) }}</span>
          </div>

          <div class="detail-item">
            <label>Tên đối tượng:</label>
            <span>{{ getTargetName(selectedReport) }}</span>
          </div>

          <div class="detail-item">
            <label>Lý do:</label>
            <span>{{ getReasonLabel(selectedReport.reason) }}</span>
          </div>

          <div class="detail-item">
            <label>Ngày tạo:</label>
            <span>{{ formatDateTime(selectedReport.createdAt) }}</span>
          </div>

          <div class="detail-item full-width">
            <label>Mô tả chi tiết:</label>
            <p class="multiline-text">{{ selectedReport.description }}</p>
          </div>

          <div class="detail-item full-width" v-if="selectedReport.relatedJob">
            <label>Job liên quan:</label>
            <p>{{ selectedReport.relatedJob.title }}</p>
          </div>

          <div class="detail-item full-width" v-if="selectedReport.adminNote">
            <label>Ghi chú admin:</label>
            <p class="multiline-text">{{ selectedReport.adminNote }}</p>
          </div>
        </div>

        <div class="status-section">
          <label>Cập nhật trạng thái</label>
          <select v-model="updateForm.status">
            <option value="open">Mới</option>
            <option value="in_review">Đang xử lý</option>
            <option value="resolved">Đã xử lý</option>
            <option value="dismissed">Bỏ qua</option>
          </select>

          <textarea
            v-model="updateForm.adminNote"
            rows="4"
            placeholder="Nhập ghi chú xử lý của admin..."
          ></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn btn-primary" @click="updateStatus">
            💾 Lưu cập nhật
          </button>
          <button class="btn btn-outline" @click="closeModal">
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Header from '../components/Header.vue';
import api from '../services/api';

const loading = ref(false);
const reports = ref([]);
const selectedReport = ref(null);
const message = ref('');
const isSuccess = ref(false);

const statusFilter = ref('all');
const targetTypeFilter = ref('all');

const updateForm = ref({
  status: 'open',
  adminNote: '',
});

const openCount = computed(() => reports.value.filter((r) => r.status === 'open').length);
const inReviewCount = computed(() => reports.value.filter((r) => r.status === 'in_review').length);
const resolvedCount = computed(() => reports.value.filter((r) => r.status === 'resolved').length);
const dismissedCount = computed(() => reports.value.filter((r) => r.status === 'dismissed').length);

const filteredReports = computed(() => {
  return reports.value.filter((report) => {
    const matchStatus = statusFilter.value === 'all' || report.status === statusFilter.value;
    const matchTarget = targetTypeFilter.value === 'all' || report.targetType === targetTypeFilter.value;
    return matchStatus && matchTarget;
  });
});

const fetchReports = async () => {
  try {
    loading.value = true;
    message.value = '';

    const res = await api.get('/admin/reports');
    reports.value = res.data.reports || [];
  } catch (error) {
    console.error('Error fetching reports:', error);
    message.value = error.response?.data?.message || 'Không thể tải reports';
    isSuccess.value = false;
  } finally {
    loading.value = false;
  }
};

const viewReport = async (reportId) => {
  try {
    const res = await api.get(`/admin/reports/${reportId}`);
    selectedReport.value = res.data.report;
    updateForm.value.status = res.data.report.status || 'open';
    updateForm.value.adminNote = res.data.report.adminNote || '';
  } catch (error) {
    console.error('Error fetching report detail:', error);
    message.value = error.response?.data?.message || 'Không thể tải chi tiết report';
    isSuccess.value = false;
  }
};

const updateStatus = async () => {
  if (!selectedReport.value) return;

  try {
    const res = await api.patch(`/admin/reports/${selectedReport.value._id}/status`, {
      status: updateForm.value.status,
      adminNote: updateForm.value.adminNote,
    });

    message.value = res.data.message || 'Cập nhật thành công';
    isSuccess.value = true;

    const index = reports.value.findIndex((r) => r._id === selectedReport.value._id);
    if (index !== -1) {
      reports.value[index].status = updateForm.value.status;
      reports.value[index].adminNote = updateForm.value.adminNote;
    }

    selectedReport.value.status = updateForm.value.status;
    selectedReport.value.adminNote = updateForm.value.adminNote;
  } catch (error) {
    console.error('Error updating report status:', error);
    message.value = error.response?.data?.message || 'Không thể cập nhật report';
    isSuccess.value = false;
  }
};

const closeModal = () => {
  selectedReport.value = null;
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('vi-VN');
};

const truncateText = (text, max = 80) => {
  if (!text) return '-';
  return text.length > max ? text.slice(0, max) + '...' : text;
};

const getReporterRoleLabel = (role) => {
  return role === 'employer' ? 'Nhà tuyển dụng' : 'Sinh viên';
};

const getReporterName = (report) => {
  if (!report?.reporterId) return '-';
  return report.reporterId.companyName || report.reporterId.fullName || '-';
};

const getReporterEmail = (report) => {
  return report?.reporterId?.email || '-';
};

const getTargetLabel = (report) => {
  const map = {
    student: 'Ứng viên',
    employer: 'Nhà tuyển dụng',
    job: 'Bài đăng',
  };
  return map[report?.targetType] || '-';
};

const getTargetName = (report) => {
  const target = report?.targetId;
  if (!target) return '-';

  if (report.targetType === 'student') {
    return target.fullName || target.email || '-';
  }

  if (report.targetType === 'employer') {
    return target.companyName || target.fullName || target.email || '-';
  }

  if (report.targetType === 'job') {
    return target.title || '-';
  }

  return '-';
};

const getReasonLabel = (reason) => {
  const map = {
    spam: 'Spam',
    fake_information: 'Thông tin giả',
    inappropriate_content: 'Nội dung không phù hợp',
    fraud: 'Lừa đảo',
    harassment: 'Quấy rối',
    unprofessional_behavior: 'Hành vi thiếu chuyên nghiệp',
    other: 'Khác',
  };
  return map[reason] || reason || '-';
};

const getStatusLabel = (status) => {
  const map = {
    open: '🆕 Mới',
    in_review: '👀 Đang xử lý',
    resolved: '✅ Đã xử lý',
    dismissed: '❌ Bỏ qua',
  };
  return map[status] || status || '-';
};

onMounted(fetchReports);
</script>

<style scoped>
.admin-reports {
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
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
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
  padding: 10px 18px;
  border: 2px solid #e0e6ed;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.filter-tabs button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.secondary-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.secondary-filter label {
  font-weight: 600;
  color: #334155;
}

.secondary-filter select {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  min-width: 220px;
}

.loading {
  text-align: center;
  padding: 60px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

.alert {
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
}

.alert.success {
  background: #d4edda;
  color: #155724;
}

.alert.error {
  background: #f8d7da;
  color: #721c24;
}

.table-wrapper {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9fa;
}

th, td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #e0e6ed;
  vertical-align: top;
}

tr:hover {
  background: #f8fafc;
}

.muted {
  color: #64748b;
  font-size: 12px;
}

.related-box p {
  margin: 0 0 4px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  display: inline-block;
}

.status-badge.open {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge.in_review {
  background: #fff7ed;
  color: #c2410c;
}

.status-badge.resolved {
  background: #dcfce7;
  color: #166534;
}

.status-badge.dismissed {
  background: #f1f5f9;
  color: #475569;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
}

.btn-action.view {
  background: #e0f2fe;
  color: #0369a1;
}

.empty-state {
  text-align: center;
  color: #64748b;
  padding: 40px;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 920px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 28px;
}

.btn-close {
  position: absolute;
  top: 14px;
  right: 14px;
  border: none;
  background: #f1f5f9;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.detail-item {
  background: #f8fafc;
  border-radius: 10px;
  padding: 14px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  display: block;
  font-weight: 700;
  margin-bottom: 8px;
  color: #334155;
}

.multiline-text {
  white-space: pre-line;
  line-height: 1.6;
  margin: 0;
}

.status-section {
  margin-top: 20px;
  display: grid;
  gap: 12px;
}

.status-section label {
  font-weight: 700;
  color: #334155;
}

.status-section select,
.status-section textarea {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 12px;
  font: inherit;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-outline {
  background: white;
  border: 1px solid #cbd5e1;
  color: #334155;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 20px 12px;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  table {
    min-width: 1100px;
  }

  .page-header h1 {
    font-size: 26px;
  }
}
</style>