<template>
  <div class="job-create">
    <Header />
    
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>➕ Đăng tin tuyển dụng mới</h1>
          <p class="subtitle">Điền đầy đủ thông tin để thu hút ứng viên chất lượng</p>
        </div>
        <router-link to="/employer/jobs" class="btn btn-outline">
          ← Quay lại
        </router-link>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="job-form">
        <!-- Basic Info -->
        <div class="form-section">
          <h2>📋 Thông tin cơ bản</h2>
          
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Tiêu đề công việc <span class="required">*</span></label>
              <input 
                v-model="form.title" 
                type="text"
                placeholder="VD: Senior Full Stack Developer"
                required
                maxlength="200"
              />
            </div>

            <div class="form-group">
              <label>Loại hình công việc <span class="required">*</span></label>
              <select v-model="form.jobType" required>
                <option value="">-- Chọn loại hình --</option>
                <option value="full-time">Toàn thời gian</option>
                <option value="part-time">Bán thời gian</option>
                <option value="internship">Thực tập</option>
                <option value="contract">Hợp đồng</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div class="form-group">
              <label>Cấp bậc <span class="required">*</span></label>
              <select v-model="form.level" required>
                <option value="">-- Chọn cấp bậc --</option>
                <option value="intern">Thực tập sinh</option>
                <option value="fresher">Fresher</option>
                <option value="junior">Junior</option>
                <option value="middle">Middle</option>
                <option value="senior">Senior</option>
                <option value="leader">Leader</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div class="form-group">
              <label>Kinh nghiệm <span class="required">*</span></label>
              <select v-model="form.experience" required>
                <option value="">-- Chọn kinh nghiệm --</option>
                <option value="no-experience">Không yêu cầu</option>
                <option value="0-1-year">0-1 năm</option>
                <option value="1-3-years">1-3 năm</option>
                <option value="3-5-years">3-5 năm</option>
                <option value="5+-years">Trên 5 năm</option>
              </select>
            </div>

            <div class="form-group">
              <label>Số lượng tuyển <span class="required">*</span></label>
              <input 
                v-model.number="form.slots" 
                type="number"
                min="1"
                required
              />
            </div>

            <div class="form-group">
              <label>Hạn nộp hồ sơ <span class="required">*</span></label>
              <input 
                v-model="form.deadline" 
                type="date"
                :min="today"
                required
              />
            </div>
          </div>
        </div>

        <!-- Salary -->
        <div class="form-section">
          <h2>💰 Mức lương</h2>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Lương tối thiểu (VND) <span class="required">*</span></label>
              <input 
                v-model.number="form.salary.min" 
                type="number"
                min="0"
                step="1000000"
                placeholder="VD: 15000000"
                required
              />
              <small>{{ formatCurrency(form.salary.min) }}</small>
            </div>

            <div class="form-group">
              <label>Lương tối đa (VND) <span class="required">*</span></label>
              <input 
                v-model.number="form.salary.max" 
                type="number"
                min="0"
                step="1000000"
                placeholder="VD: 25000000"
                required
              />
              <small>{{ formatCurrency(form.salary.max) }}</small>
            </div>

            <div class="form-group">
              <label>Đơn vị tiền tệ</label>
              <select v-model="form.salary.currency">
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.salary.negotiable" />
                <span>Có thể thương lượng</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="form-section">
          <h2>📍 Địa điểm làm việc</h2>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Thành phố <span class="required">*</span></label>
              <select v-model="form.location.city" required>
                <option value="">-- Chọn thành phố --</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Hải Phòng">Hải Phòng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>Địa chỉ cụ thể <span class="required">*</span></label>
              <input 
                v-model="form.location.address" 
                type="text"
                placeholder="VD: 123 Đường ABC, Quận XYZ"
                required
              />
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="form-section">
          <h2>📝 Mô tả chi tiết</h2>
          
          <div class="form-group">
            <label>Mô tả công việc <span class="required">*</span></label>
            <textarea 
              v-model="form.description" 
              rows="8"
              placeholder="Mô tả chi tiết về công việc, môi trường làm việc, văn hóa công ty..."
              required
              maxlength="5000"
            ></textarea>
            <small>{{ form.description.length }}/5000 ký tự</small>
          </div>

          <div class="form-group">
            <label>Yêu cầu công việc <span class="required">*</span></label>
            <textarea 
              v-model="form.requirements" 
              rows="8"
              placeholder="- Tốt nghiệp Đại học chuyên ngành liên quan&#10;- Thành thạo React, Node.js&#10;- Có kinh nghiệm làm việc nhóm..."
              required
              maxlength="3000"
            ></textarea>
            <small>{{ form.requirements.length }}/3000 ký tự</small>
          </div>

          <div class="form-group">
            <label>Quyền lợi</label>
            <textarea 
              v-model="form.benefits" 
              rows="6"
              placeholder="- Lương thưởng cạnh tranh&#10;- Bảo hiểm đầy đủ&#10;- Làm việc remote&#10;- Du lịch hàng năm..."
              maxlength="2000"
            ></textarea>
            <small>{{ form.benefits.length }}/2000 ký tự</small>
          </div>
        </div>

        <!-- Skills & Categories -->
        <div class="form-section">
          <h2>🔧 Kỹ năng & Lĩnh vực</h2>
          
          <div class="form-group">
            <label>Kỹ năng yêu cầu</label>
            <div class="tags-input">
              <div class="tags-list">
                <span 
                  v-for="(skill, index) in form.skills" 
                  :key="index"
                  class="tag"
                >
                  {{ skill }}
                  <button type="button" @click="removeSkill(index)" class="tag-remove">×</button>
                </span>
              </div>
              <input 
                v-model="newSkill"
                @keyup.enter="addSkill"
                type="text"
                placeholder="Thêm kỹ năng (Enter để thêm)"
              />
            </div>
            <small>VD: React, Node.js, MongoDB, Docker...</small>
          </div>

          <div class="form-group">
            <label>Lĩnh vực</label>
            <div class="tags-input">
              <div class="tags-list">
                <span 
                  v-for="(category, index) in form.categories" 
                  :key="index"
                  class="tag"
                >
                  {{ category }}
                  <button type="button" @click="removeCategory(index)" class="tag-remove">×</button>
                </span>
              </div>
              <input 
                v-model="newCategory"
                @keyup.enter="addCategory"
                type="text"
                placeholder="Thêm lĩnh vực (Enter để thêm)"
              />
            </div>
            <small>VD: IT, Software Development, Web Development...</small>
          </div>
        </div>

        <!-- Alert -->
        <div v-if="message" class="alert" :class="{ success: isSuccess, error: !isSuccess }">
          {{ message }}
        </div>

        <!-- Submit -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">
              <span class="spinner"></span> Đang xử lý...
            </span>
            <span v-else>✅ Đăng tin tuyển dụng</span>
          </button>
          <router-link to="/employer/jobs" class="btn btn-outline">
            Hủy
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import api from '../services/api';

const router = useRouter();

const loading = ref(false);
const message = ref('');
const isSuccess = ref(false);
const newSkill = ref('');
const newCategory = ref('');

const today = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() + 1); // Tối thiểu ngày mai
  return date.toISOString().split('T')[0];
});

const form = reactive({
  title: '',
  description: '',
  requirements: '',
  benefits: '',
  location: {
    address: '',
    city: '',
  },
  salary: {
    min: 10000000,
    max: 20000000,
    currency: 'VND',
    negotiable: false,
  },
  jobType: '',
  level: '',
  experience: '',
  skills: [],
  categories: [],
  deadline: '',
  slots: 1,
});

const formatCurrency = (value) => {
  if (!value) return '';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const addSkill = () => {
  if (newSkill.value.trim() && !form.skills.includes(newSkill.value.trim())) {
    form.skills.push(newSkill.value.trim());
    newSkill.value = '';
  }
};

const removeSkill = (index) => {
  form.skills.splice(index, 1);
};

const addCategory = () => {
  if (newCategory.value.trim() && !form.categories.includes(newCategory.value.trim())) {
    form.categories.push(newCategory.value.trim());
    newCategory.value = '';
  }
};

const removeCategory = (index) => {
  form.categories.splice(index, 1);
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    message.value = '';

    // Validate
    if (form.salary.min > form.salary.max) {
      message.value = 'Lương tối thiểu không được lớn hơn lương tối đa';
      isSuccess.value = false;
      loading.value = false;
      return;
    }

    if (new Date(form.deadline) <= new Date()) {
      message.value = 'Hạn nộp hồ sơ phải là ngày trong tương lai';
      isSuccess.value = false;
      loading.value = false;
      return;
    }

    const res = await api.post('/jobs', form);

    message.value = 'Đăng tin thành công! 🎉';
    isSuccess.value = true;

    // Redirect sau 2 giây
    setTimeout(() => {
      router.push('/employer/jobs');
    }, 2000);
  } catch (error) {
    console.error('Create job error:', error);
    message.value = error.response?.data?.message || 'Đăng tin thất bại';
    isSuccess.value = false;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.job-create {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* Form */
.job-form {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-section {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 2px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 30px;
}

.form-section h2 {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.required {
  color: #e74c3c;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4ecdc4;
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
}

.form-group small {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 12px 0;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Tags Input */
.tags-input {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  min-height: 50px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #4ecdc4;
  color: white;
  border-radius: 20px;
  font-size: 13px;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s;
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tags-input input {
  border: none;
  outline: none;
  padding: 8px;
  font-size: 14px;
  width: 100%;
}

/* Alert */
.alert {
  padding: 12px 15px;
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

/* Form Actions */
.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  border: 2px solid #e0e0e0;
  color: #666;
}

.btn-outline:hover {
  border-color: #4ecdc4;
  color: #4ecdc4;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>