<template>
  <div class="job-detail">
    <Header />
    
    <div class="container">
      <!-- Back Button -->
      <button @click="$router.go(-1)" class="btn-back">
        ← Quay lại
      </button>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải thông tin công việc...</p>
      </div>

      <!-- Job Detail -->
      <div v-else-if="job" class="detail-content">
        <!-- Job Header -->
        <div class="job-header">
          <div class="company-section">
            <div class="company-logo">
              {{ getInitials(job.employer?.companyName) }}
            </div>
            <div class="company-info">
              <h1>{{ job.title }}</h1>
              <h3>{{ job.employer?.companyName }}</h3>
              <div class="job-meta">
                <span>📍 {{ job.location.city }}</span>
                <span>💼 {{ getJobTypeLabel(job.jobType) }}</span>
                <span>⭐ {{ getLevelLabel(job.level) }}</span>
                <span>👁️ {{ job.views }} lượt xem</span>
              </div>
            </div>
          </div>
          
          <div class="action-section">
            <button 
              v-if="!hasApplied" 
              @click="showApplicationModal = true" 
              class="btn btn-apply"
            >
              📝 Ứng tuyển ngay
            </button>
            <button 
              v-else
              class="btn btn-applied" 
              disabled
            >
              ✅ Đã ứng tuyển
            </button>
            <button @click="saveJob" class="btn btn-save">
              {{ isSaved ? '❤️ Đã lưu' : '🤍 Lưu tin' }}
            </button>
          </div>
        </div>

        <!-- Job Info Cards -->
        <div class="info-cards">
          <div class="info-card">
            <div class="card-icon">💰</div>
            <div class="card-content">
              <span class="card-label">Mức lương</span>
              <span class="card-value">{{ formatSalary(job.salary) }}</span>
            </div>
          </div>

          <div class="info-card">
            <div class="card-icon">📅</div>
            <div class="card-content">
              <span class="card-label">Hạn nộp hồ sơ</span>
              <span class="card-value" :class="{ expired: isExpired(job.deadline) }">
                {{ formatDate(job.deadline) }}
              </span>
            </div>
          </div>

          <div class="info-card">
            <div class="card-icon">👥</div>
            <div class="card-content">
              <span class="card-label">Số lượng tuyển</span>
              <span class="card-value">{{ job.slots }} người</span>
            </div>
          </div>

          <div class="info-card">
            <div class="card-icon">💼</div>
            <div class="card-content">
              <span class="card-label">Kinh nghiệm</span>
              <span class="card-value">{{ getExperienceLabel(job.experience) }}</span>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="main-grid">
          <!-- Left Column -->
          <div class="left-column">
            <!-- Description -->
            <div class="content-section">
              <h2>📋 Mô tả công việc</h2>
              <p class="description">{{ job.description }}</p>
            </div>

            <!-- Requirements -->
            <div class="content-section">
              <h2>✅ Yêu cầu ứng viên</h2>
              <p class="description">{{ job.requirements }}</p>
            </div>

            <!-- Benefits -->
            <div class="content-section" v-if="job.benefits">
              <h2>🎁 Quyền lợi</h2>
              <p class="description">{{ job.benefits }}</p>
            </div>

            <!-- Skills -->
            <div class="content-section" v-if="job.skills && job.skills.length > 0">
              <h2>🔧 Kỹ năng yêu cầu</h2>
              <div class="skills-list">
                <span v-for="skill in job.skills" :key="skill" class="skill-tag">
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right Column - Sidebar -->
          <div class="right-column">
            <!-- Company Info -->
            <div class="sidebar-card">
              <h3>🏢 Thông tin công ty</h3>
              <div class="company-details">
                <div class="detail-row">
                  <span class="label">Tên công ty:</span>
                  <span class="value">{{ job.employer?.companyName }}</span>
                </div>
                <div class="detail-row" v-if="job.employer?.companySize">
                  <span class="label">Quy mô:</span>
                  <span class="value">{{ job.employer?.companySize }}</span>
                </div>
                <div class="detail-row" v-if="job.employer?.website">
                  <span class="label">Website:</span>
                  <a
                    :href="normalizeExternalUrl(job.employer?.website)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="value link"
                  >
                    {{ job.employer?.website }}
                  </a>

                </div>
              </div>
            </div>

            <!-- Location -->
            <div class="sidebar-card">
              <h3>📍 Địa điểm làm việc</h3>
              <div class="location-info">
                <p><strong>{{ job.location.address }}</strong></p>
                <p>{{ job.location.city }}</p>
              </div>
            </div>

            <!-- Application Stats -->
            <div class="sidebar-card stats-card">
              <h3>📊 Thống kê</h3>
              <div class="stats">
                <div class="stat">
                  <span class="stat-number">{{ job.applicationsCount || 0 }}</span>
                  <span class="stat-label">Người ứng tuyển</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ job.views || 0 }}</span>
                  <span class="stat-label">Lượt xem</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="not-found">
        <p>❌ Không tìm thấy tin tuyển dụng</p>
        <router-link to="/student/jobs" class="btn btn-primary">
          Xem danh sách công việc
        </router-link>
      </div>
    </div>

    <!-- Application Modal -->
    <div v-if="showApplicationModal" class="modal" @click="closeApplicationModal">
      <div class="modal-content" @click.stop>
        <button class="btn-close" @click="closeApplicationModal">✕</button>
        
        <h2>📝 Ứng tuyển: {{ job?.title }}</h2>
        
        <form @submit.prevent="submitApplication">
          <!-- Cover Letter -->
          <div class="form-group">
            <label class="required">✍️ Thư xin việc</label>
            <textarea 
              v-model="application.coverLetter"
              placeholder="Giới thiệu bản thân và lý do bạn phù hợp với vị trí này..."
              rows="6"
              required
              maxlength="1000"
            ></textarea>
            <small class="help-text">
              {{ application.coverLetter.length }}/1000 ký tự
            </small>
          </div>

          <!-- Expected Salary -->
          <div class="form-group">
            <label>💰 Mức lương mong muốn (VND/tháng)</label>
            <input 
              v-model.number="application.expectedSalary"
              type="number"
              placeholder="Ví dụ: 15000000"
              min="0"
              step="1000000"
            />
          </div>

          <!-- Available Start Date -->
          <div class="form-group">
            <label>📅 Có thể bắt đầu từ</label>
            <input 
              v-model="application.availableFrom"
              type="date"
              :min="today"
            />
          </div>

          <!-- Additional Info -->
          <div class="form-group">
            <label>💬 Thông tin thêm (không bắt buộc)</label>
            <textarea 
              v-model="application.additionalInfo"
              placeholder="Thông tin bổ sung về kinh nghiệm, dự án, chứng chỉ..."
              rows="4"
              maxlength="500"
            ></textarea>
            <small class="help-text">
              {{ application.additionalInfo.length }}/500 ký tự
            </small>
          </div>

          <!-- Note about CV -->
          <div class="info-box">
            <p>ℹ️ <strong>Lưu ý:</strong> Hệ thống sẽ sử dụng CV đã tải lên trong profile của bạn. 
            Nếu chưa có CV, vui lòng vào <router-link to="/student/profile">Hồ sơ</router-link> để tải lên trước.</p>
          </div>

          <!-- Submit Button -->
          <div class="modal-actions">
            <button 
              type="button" 
              @click="closeApplicationModal" 
              class="btn btn-secondary"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="submitting"
            >
              {{ submitting ? '⏳ Đang gửi...' : '📤 Gửi hồ sơ' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const loading = ref(true);
const job = ref(null);
const hasApplied = ref(false);
const isSaved = ref(false);
const showApplicationModal = ref(false);
const submitting = ref(false);

const today = new Date().toISOString().split('T')[0];

const application = reactive({
  coverLetter: '',
  expectedSalary: null,
  availableFrom: '',
  additionalInfo: ''
});


// ✅ Fetch job detail - GỌI API PUBLIC
const fetchJobDetail = async () => {
  try {
    loading.value = true;
    
    // ✅ GỌI API PUBLIC - không cần token
    const res = await axios.get(`${API_URL}/jobs/public/${route.params.id}`);
    job.value = res.data.job;
    
    console.log('✅ Job loaded:', job.value);
    
    // Check if already applied (cần token)
    await checkApplicationStatus();
  } catch (error) {
    console.error('❌ Error fetching job:', error);
    alert('Không thể tải thông tin công việc');
  } finally {
    loading.value = false;
  }
};

// ✅ Check if user has applied - CẦN TOKEN
const checkApplicationStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('ℹ️ User not logged in, skip check applied');
      return;
    }

    const res = await axios.get(
      `${API_URL}/applications/check/${route.params.id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    hasApplied.value = res.data.hasApplied;
    console.log('✅ Application status checked:', hasApplied.value);
  } catch (error) {
    console.error('❌ Error checking application status:', error);
    hasApplied.value = false;
  }
};

// ✅ Submit application - CẦN TOKEN
const submitApplication = async () => {
  try {
    submitting.value = true;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('⚠️ Vui lòng đăng nhập để ứng tuyển!');
      router.push('/login');
      return;
    }

    const payload = {
      jobId: route.params.id,
      coverLetter: application.coverLetter,
      expectedSalary: application.expectedSalary || null,
      availableFrom: application.availableFrom || null,
      additionalInfo: application.additionalInfo || null,
    };

    console.log('📤 Submitting application:', payload);

    const res = await axios.post(
      `${API_URL}/applications`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Application submitted:', res.data);

    alert('✅ Ứng tuyển thành công! Chúc bạn may mắn!');
    hasApplied.value = true;
    closeApplicationModal();
    
    // Redirect to applications page
    router.push('/student/applications');
  } catch (error) {
    console.error('❌ Error submitting application:', error);
    console.error('Error response:', error.response?.data);
    alert(error.response?.data?.message || 'Không thể gửi đơn ứng tuyển. Vui lòng thử lại!');
  } finally {
    submitting.value = false;
  }
};

const normalizeExternalUrl = (url) => {
  if (!url) return '';
  const u = String(url).trim();
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
};

const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(String(id || ''));

// Close modal
const closeApplicationModal = () => {
  showApplicationModal.value = false;
  application.coverLetter = '';
  application.expectedSalary = null;
  application.availableFrom = '';
  application.additionalInfo = '';
};

// Save job (placeholder)
const saveJob = async () => {
  alert('Tính năng lưu tin đang được phát triển!');
};

// Utility functions
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0];
  }
  return name.substring(0, 2).toUpperCase();
};

const formatSalary = (salary) => {
  if (!salary) return 'Thỏa thuận';
  const min = (salary.min / 1000000).toFixed(0);
  const max = (salary.max / 1000000).toFixed(0);
  return `${min} - ${max} triệu ${salary.currency}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

const isExpired = (deadline) => {
  return new Date(deadline) < new Date();
};

const getJobTypeLabel = (type) => {
  const types = {
    'full-time': 'Toàn thời gian',
    'part-time': 'Bán thời gian',
    'internship': 'Thực tập',
    'contract': 'Hợp đồng',
    'freelance': 'Freelance',
  };
  return types[type] || type;
};

const getLevelLabel = (level) => {
  const levels = {
    'intern': 'Thực tập sinh',
    'fresher': 'Fresher',
    'junior': 'Junior',
    'middle': 'Middle',
    'senior': 'Senior',
    'leader': 'Leader',
    'manager': 'Manager',
  };
  return levels[level] || level;
};

const getExperienceLabel = (exp) => {
  if (!exp) return 'Không yêu cầu';
  const labels = {
    'no-experience': 'Không yêu cầu',
    '0-1-year': '0-1 năm',
    '1-3-years': '1-3 năm',
    '3-5-years': '3-5 năm',
    '5+-years': 'Trên 5 năm'
  };
  return labels[exp] || exp;
};

onMounted(() => {
  console.log('🚀 JobDetail mounted, job ID:', route.params.id);
  fetchJobDetail();
});
</script>

<style scoped>
/* Copy toàn bộ CSS từ file JobDetail.vue cũ */
.job-detail {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

.btn-back {
  padding: 10px 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.btn-back:hover {
  border-color: #667eea;
  color: #667eea;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
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

.job-header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
}

.company-section {
  display: flex;
  gap: 20px;
  flex: 1;
}

.company-logo {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 28px;
  flex-shrink: 0;
}

.company-info h1 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.company-info h3 {
  font-size: 18px;
  color: #667eea;
  margin-bottom: 12px;
  font-weight: 500;
}

.job-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  color: #666;
  font-size: 14px;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.info-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
}

.card-icon {
  width: 50px;
  height: 50px;
  background: #f0f0f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}

.card-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.card-value.expired {
  color: #dc3545;
}

.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.content-section h2 {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.description {
  font-size: 15px;
  line-height: 1.8;
  color: #666;
  white-space: pre-line;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  padding: 8px 16px;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
}

.sidebar-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.sidebar-card h3 {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.company-details,
.location-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.detail-row .label {
  color: #999;
  font-size: 13px;
}

.detail-row .value {
  color: #2c3e50;
  font-weight: 500;
}

.detail-row .link {
  color: #667eea;
  text-decoration: none;
}

.detail-row .link:hover {
  text-decoration: underline;
}

.stats {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 13px;
  color: #999;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  white-space: nowrap;
}

.btn-apply {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-apply:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-applied {
  background: #d4edda;
  color: #155724;
  cursor: not-allowed;
}

.btn-save {
  background: white;
  border: 2px solid #e0e0e0;
  color: #666;
}

.btn-save:hover {
  border-color: #667eea;
  color: #667eea;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  border: 2px solid #e0e0e0;
  color: #666;
}

.btn-secondary:hover {
  border-color: #999;
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group label.required::after {
  content: ' *';
  color: #dc3545;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="date"],
.form-group textarea {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
}

.help-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

.info-box {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-box p {
  margin: 0;
  font-size: 14px;
  color: #1976d2;
}

.info-box a {
  color: #1565c0;
  text-decoration: underline;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
}

.not-found {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
}

.not-found p {
  font-size: 18px;
  color: #999;
  margin-bottom: 20px;
}

@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .job-header {
    flex-direction: column;
  }

  .company-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .action-section {
    width: 100%;
  }

  .action-section .btn {
    width: 100%;
  }

  .info-cards {
    grid-template-columns: 1fr;
  }
}
</style>