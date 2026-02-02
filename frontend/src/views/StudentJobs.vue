<template>
  <div class="student-jobs">
    <Header />
    
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>🔍 Tìm việc làm</h1>
          <p class="subtitle">Khám phá hàng ngàn cơ hội việc làm phù hợp với bạn</p>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="search-section">
        <div class="search-bar">
          <input 
            v-model="filters.search"
            @input="debounceSearch"
            type="text"
            placeholder="🔍 Tìm kiếm theo vị trí, công ty..."
            class="search-input"
          />
          <button @click="handleSearch" class="btn-search">Tìm kiếm</button>
        </div>

        <div class="filters">
          <select v-model="filters.city" @change="handleSearch">
            <option value="">📍 Tất cả thành phố</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Hải Phòng">Hải Phòng</option>
            <option value="Cần Thơ">Cần Thơ</option>
          </select>

          <select v-model="filters.jobType" @change="handleSearch">
            <option value="">💼 Loại hình</option>
            <option value="full-time">Toàn thời gian</option>
            <option value="part-time">Bán thời gian</option>
            <option value="internship">Thực tập</option>
            <option value="contract">Hợp đồng</option>
            <option value="freelance">Freelance</option>
          </select>

          <select v-model="filters.level" @change="handleSearch">
            <option value="">⭐ Cấp bậc</option>
            <option value="intern">Thực tập sinh</option>
            <option value="fresher">Fresher</option>
            <option value="junior">Junior</option>
            <option value="middle">Middle</option>
            <option value="senior">Senior</option>
          </select>

          <button @click="resetFilters" class="btn-reset">🔄 Đặt lại</button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-bar">
        <p>Tìm thấy <strong>{{ total }}</strong> công việc</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải công việc...</p>
      </div>

      <!-- Jobs List -->
      <div v-else class="jobs-grid">
        <div v-if="jobs.length === 0" class="empty-state">
          <p>📭 Không tìm thấy công việc phù hợp</p>
          <button @click="resetFilters" class="btn btn-primary">Xem tất cả công việc</button>
        </div>

        <div v-else>
          <div v-for="job in jobs" :key="job._id" class="job-card">
            <!-- Company Logo & Info -->
            <div class="job-header">
              <div class="company-logo">
                {{ getInitials(job.employer?.companyName) }}
              </div>
              <div class="job-title-area">
                <h3>{{ job.title }}</h3>
                <p class="company-name">{{ job.employer?.companyName }}</p>
              </div>
            </div>

            <!-- Job Details -->
            <div class="job-details">
              <div class="detail-item">
                <span class="icon">📍</span>
                <span>{{ job.location.city }}</span>
              </div>
              <div class="detail-item">
                <span class="icon">💰</span>
                <span>{{ formatSalary(job.salary) }}</span>
              </div>
              <div class="detail-item">
                <span class="icon">💼</span>
                <span>{{ getJobTypeLabel(job.jobType) }}</span>
              </div>
              <div class="detail-item">
                <span class="icon">⭐</span>
                <span>{{ getLevelLabel(job.level) }}</span>
              </div>
            </div>

            <!-- Skills -->
            <div class="job-skills" v-if="job.skills && job.skills.length > 0">
              <span v-for="skill in job.skills.slice(0, 4)" :key="skill" class="skill-tag">
                {{ skill }}
              </span>
              <span v-if="job.skills.length > 4" class="skill-more">
                +{{ job.skills.length - 4 }}
              </span>
            </div>

            <!-- Footer -->
            <div class="job-footer">
              <div class="job-meta">
                <span class="meta-item">👁️ {{ job.views || 0 }}</span>
                <span class="meta-item">👥 {{ job.applicationsCount || 0 }}</span>
              </div>
              <router-link :to="`/student/jobs/${job._id}`" class="btn btn-primary">
                Xem chi tiết →
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="changePage(page - 1)" 
          :disabled="page === 1"
          class="btn-page"
        >
          ← Trước
        </button>
        <span class="page-info">Trang {{ page }} / {{ totalPages }}</span>
        <button 
          @click="changePage(page + 1)" 
          :disabled="page === totalPages"
          class="btn-page"
        >
          Sau →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import Header from '../components/Header.vue';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const loading = ref(false);
const jobs = ref([]);
const total = ref(0);
const page = ref(1);
const totalPages = ref(1);

const filters = reactive({
  search: '',
  city: '',
  jobType: '',
  level: '',
});

let searchTimeout = null;

// ✅ SỬA: Gọi API public, không cần token
const fetchJobs = async () => {
  try {
    loading.value = true;

    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.city) params.append('city', filters.city);
    if (filters.jobType) params.append('jobType', filters.jobType);
    if (filters.level) params.append('level', filters.level);
    params.append('page', page.value);
    params.append('limit', 12);

    // ✅ GỌI API PUBLIC - KHÔNG CẦN TOKEN
    const res = await axios.get(`${API_URL}/jobs/public?${params.toString()}`);
    
    console.log('✅ Jobs fetched:', res.data);
    
    jobs.value = res.data.jobs;
    total.value = res.data.total;
    totalPages.value = res.data.totalPages;
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    console.error('Error details:', error.response?.data);
    alert('Không thể tải danh sách công việc: ' + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
  }
};

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 500);
};

const handleSearch = () => {
  page.value = 1;
  fetchJobs();
};

const resetFilters = () => {
  filters.search = '';
  filters.city = '';
  filters.jobType = '';
  filters.level = '';
  page.value = 1;
  fetchJobs();
};

const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage;
    fetchJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

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

onMounted(() => {
  console.log('🚀 StudentJobs mounted, fetching jobs...');
  fetchJobs();
});
</script>

<style scoped>
.student-jobs {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Page Header */
.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.subtitle {
  color: #666;
  font-size: 16px;
}

/* Search Section */
.search-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-search {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-search:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filters select {
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.filters select:focus {
  outline: none;
  border-color: #667eea;
}

.btn-reset {
  padding: 10px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-reset:hover {
  border-color: #667eea;
  color: #667eea;
}

/* Stats Bar */
.stats-bar {
  background: white;
  padding: 15px 25px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stats-bar strong {
  color: #667eea;
}

/* Loading */
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
}

.empty-state p {
  font-size: 18px;
  color: #999;
  margin-bottom: 20px;
}

/* Jobs Grid */
.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.job-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.job-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.job-header {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.company-logo {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  flex-shrink: 0;
}

.job-title-area h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.company-name {
  font-size: 14px;
  color: #666;
}

.job-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.icon {
  font-size: 16px;
}

.job-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.skill-tag {
  padding: 5px 12px;
  background: #f0f0f0;
  border-radius: 15px;
  font-size: 12px;
  color: #666;
}

.skill-more {
  padding: 5px 12px;
  background: #667eea;
  color: white;
  border-radius: 15px;
  font-size: 12px;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.job-meta {
  display: flex;
  gap: 15px;
}

.meta-item {
  font-size: 13px;
  color: #999;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.btn-page {
  padding: 10px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-page:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 500;
  color: #2c3e50;
}

/* Responsive */
@media (max-width: 768px) {
  .jobs-grid {
    grid-template-columns: 1fr;
  }

  .search-bar {
    flex-direction: column;
  }

  .filters {
    flex-direction: column;
  }

  .filters select {
    width: 100%;
  }

  .job-details {
    grid-template-columns: 1fr;
  }
}
</style>