<template>
  <div class="profile-page">
    <Header />
    
    <div class="container">
      <div class="profile-layout">
        <!-- Sidebar -->
        <aside class="profile-sidebar">
          <div class="profile-card">
            <div class="avatar-section">
              <div class="avatar-large">
                {{ getInitials(profile?.fullName) }}
              </div>
              <button class="btn-upload">
                📷 Thay ảnh
              </button>
            </div>
            
            <h2>{{ profile?.fullName }}</h2>
            <p class="email">{{ profile?.email }}</p>
            <span class="role-badge">Sinh viên</span>
            
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-value">75%</span>
                <span class="stat-label">Hoàn thành</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">12</span>
                <span class="stat-label">Ứng tuyển</span>
              </div>
            </div>
          </div>

          <nav class="profile-nav">
            <button 
              :class="{ active: activeTab === 'info' }"
              @click="activeTab = 'info'"
            >
              👤 Thông tin cá nhân
            </button>
            <button 
              :class="{ active: activeTab === 'education' }"
              @click="activeTab = 'education'"
            >
              🎓 Học vấn
            </button>
            <button 
              :class="{ active: activeTab === 'skills' }"
              @click="activeTab = 'skills'"
            >
              ⭐ Kỹ năng
            </button>
            <router-link
              to="/change-password"
              class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
            >
              Đổi mật khẩu
            </router-link>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="profile-main">
          <!-- Personal Info -->
          <div v-if="activeTab === 'info'" class="content-section">
            <div class="section-header">
              <h2>Thông tin cá nhân</h2>
              <button v-if="!editMode" @click="editMode = true" class="btn btn-outline">
                ✏️ Chỉnh sửa
              </button>
              <div v-else class="edit-actions">
                <button @click="handleSave" class="btn btn-primary">
                  💾 Lưu
                </button>
                <button @click="handleCancel" class="btn btn-outline">
                  ✕ Hủy
                </button>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Họ và tên</label>
                <input 
                  v-model="formData.fullName" 
                  :disabled="!editMode"
                  type="text"
                />
              </div>

              <div class="form-group">
                <label>Email</label>
                <input 
                  v-model="formData.email" 
                  disabled
                  type="email"
                />
                <small>Email không thể thay đổi</small>
              </div>

              <div class="form-group">
                <label>Số điện thoại</label>
                <input 
                  v-model="formData.phone" 
                  :disabled="!editMode"
                  type="tel"
                />
              </div>

              <div class="form-group">
                <label>Ngày sinh</label>
                <input 
                  v-model="formData.birthday" 
                  :disabled="!editMode"
                  type="date"
                />
              </div>

              <div class="form-group full-width">
                <label>Địa chỉ</label>
                <input 
                  v-model="formData.address" 
                  :disabled="!editMode"
                  type="text"
                />
              </div>

              <div class="form-group full-width">
                <label>Giới thiệu bản thân</label>
                <textarea 
                  v-model="formData.bio" 
                  :disabled="!editMode"
                  rows="4"
                  placeholder="Viết một vài dòng giới thiệu về bản thân..."
                ></textarea>
              </div>
            </div>

            <div v-if="message" class="alert" :class="{ success: isSuccess, error: !isSuccess }">
              {{ message }}
            </div>
          </div>

          <!-- Education -->
          <div v-if="activeTab === 'education'" class="content-section">
            <div class="section-header">
              <h2>Học vấn</h2>
              <button v-if="!editMode" @click="editMode = true" class="btn btn-outline">
                ✏️ Chỉnh sửa
              </button>
              <div v-else class="edit-actions">
                <button @click="handleSave" class="btn btn-primary">
                  💾 Lưu
                </button>
                <button @click="handleCancel" class="btn btn-outline">
                  ✕ Hủy
                </button>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Mã sinh viên</label>
                <input 
                  v-model="formData.studentId" 
                  :disabled="!editMode"
                  type="text"
                />
              </div>

              <div class="form-group">
                <label>Trường đại học</label>
                <input 
                  v-model="formData.university" 
                  :disabled="!editMode"
                  type="text"
                />
              </div>

              <div class="form-group">
                <label>Ngành học</label>
                <input 
                  v-model="formData.major" 
                  :disabled="!editMode"
                  type="text"
                />
              </div>
              
              <div class="form-group">
              <label>Năm học hiện tại</label>
              <select v-model="formData.academicYear" :disabled="!editMode">
                <option value="1">Năm 1</option>
                <option value="2">Năm 2</option>
                <option value="3">Năm 3</option>
                <option value="4">Năm 4</option>
                <option value="5">Năm 5</option>
                <option value="graduated">Đã tốt nghiệp</option>
              </select>
            </div>

              <div class="form-group">
                <label>Năm tốt nghiệp</label>
                <input 
                  v-model="formData.graduationYear" 
                  :disabled="!editMode"
                  type="number"
                  min="2020"
                  max="2030"
                />
              </div>

              <div class="form-group">
                <label>GPA</label>
                <input 
                  v-model="formData.gpa" 
                  :disabled="!editMode"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                />
              </div>

              <!-- ✅ THÊM: Loại hình công việc mong muốn (giữ nguyên style hiện có) -->
              <div class="form-group full-width">
                <label>Loại hình công việc mong muốn</label>

                <div class="skills-list">
                  <div 
                    v-for="item in preferredJobTypeOptions" 
                    :key="item.value"
                    class="skill-tag"
                    :style="formData.preferredJobTypes.includes(item.value)
                      ? 'background: #e8ecff; border: 1px solid #667eea; color: #4b5fd6;'
                      : ''"
                  >
                    <span>{{ item.label }}</span>
                    <button 
                      v-if="editMode"
                      type="button"
                      @click="togglePreferredJobType(item.value)"
                      class="btn-remove"
                      :style="formData.preferredJobTypes.includes(item.value)
                        ? 'background: #dc3545;'
                        : 'background: #28a745;'"
                      :title="formData.preferredJobTypes.includes(item.value) ? 'Bỏ chọn' : 'Chọn'"
                    >
                      {{ formData.preferredJobTypes.includes(item.value) ? '✕' : '+' }}
                    </button>
                  </div>
                </div>

                <small>Chọn 1 hoặc nhiều loại hình để hệ thống gợi ý chính xác hơn</small>
              </div>

              <div class="form-group full-width">
                <label>Nhóm nghề quan tâm</label>
                <input
                  v-model="formData.preferredCategoriesText"
                  :disabled="!editMode"
                  type="text"
                  placeholder="Ví dụ: Frontend, Backend, Data Analyst, Tester"
                />
                <small>Nhập nhiều giá trị, ngăn cách bằng dấu phẩy</small>
              </div>

              <div class="form-group full-width">
                <label>Vị trí mong muốn</label>
                <input
                  v-model="formData.desiredJobTitlesText"
                  :disabled="!editMode"
                  type="text"
                  placeholder="Ví dụ: Frontend Developer Intern, Backend Intern"
                />
                <small>Nhập nhiều giá trị, ngăn cách bằng dấu phẩy</small>
              </div>

              <div class="form-group full-width">
                <label>Khu vực mong muốn làm việc</label>
                <input
                  v-model="formData.preferredLocationsText"
                  :disabled="!editMode"
                  type="text"
                  placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh, Đà Nẵng"
                />
                <small>Nhập nhiều giá trị, ngăn cách bằng dấu phẩy</small>
              </div>

              <div class="form-group full-width">
                <label>Hình thức làm việc mong muốn</label>
                <div class="skills-list">
                  <div
                    v-for="item in preferredWorkModeOptions"
                    :key="item.value"
                    class="skill-tag"
                    :style="formData.preferredWorkModes.includes(item.value)
                      ? 'background: #e8ecff; border: 1px solid #667eea; color: #4b5fd6;'
                      : ''"
                  >
                    <span>{{ item.label }}</span>
                    <button
                      v-if="editMode"
                      type="button"
                      @click="togglePreferredWorkMode(item.value)"
                      class="btn-remove"
                      :style="formData.preferredWorkModes.includes(item.value)
                        ? 'background: #dc3545;'
                        : 'background: #28a745;'"
                      :title="formData.preferredWorkModes.includes(item.value) ? 'Bỏ chọn' : 'Chọn'"
                    >
                      {{ formData.preferredWorkModes.includes(item.value) ? '✕' : '+' }}
                    </button>
                  </div>
                </div>
                <small>Chọn Onsite / Remote / Hybrid để gợi ý sát hơn</small>
              </div>

              <div class="form-group full-width">
                <label>Dự án đã làm</label>
                <textarea
                  v-model="formData.projectsText"
                  :disabled="!editMode"
                  rows="3"
                  placeholder="Ví dụ: Website tìm việc sinh viên, Hệ thống quản lý quán cafe"
                ></textarea>
                <small>Nhập nhiều dự án, ngăn cách bằng dấu phẩy</small>
              </div>

              <div class="form-group full-width">
                <label>Công nghệ đã dùng trong dự án</label>
                <input
                  v-model="formData.projectTechnologiesText"
                  :disabled="!editMode"
                  type="text"
                  placeholder="Ví dụ: VueJS, NodeJS, MongoDB, Express"
                />
                <small>Nhập nhiều công nghệ, ngăn cách bằng dấu phẩy</small>
              </div>

              <div class="form-group full-width">
                <label>Chứng chỉ</label>
                <input
                  v-model="formData.certificationsText"
                  :disabled="!editMode"
                  type="text"
                  placeholder="Ví dụ: TOEIC 750, MOS, Google Data Analytics"
                />
                <small>Nhập nhiều giá trị, ngăn cách bằng dấu phẩy</small>
              </div>

              <div class="form-group full-width">
                <label>Link CV</label>
                <input
                  v-model="formData.resumeUrl"
                  :disabled="!editMode"
                  type="text"
                  placeholder="Link file CV đã upload"
                />
              </div>

              <div class="form-group full-width">
                <label>Portfolio URL</label>
                <input
                  v-model="formData.portfolioUrl"
                  :disabled="!editMode"
                  type="text"
                  placeholder="https://..."
                />
              </div>

              <div class="form-group">
                <label>GitHub URL</label>
                <input
                  v-model="formData.githubUrl"
                  :disabled="!editMode"
                  type="text"
                  placeholder="https://github.com/..."
                />
              </div>

              <div class="form-group">
                <label>LinkedIn URL</label>
                <input
                  v-model="formData.linkedinUrl"
                  :disabled="!editMode"
                  type="text"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>
          </div>

          <!-- Skills -->
          <div v-if="activeTab === 'skills'" class="content-section">
            <div class="section-header">
              <h2>Kỹ năng</h2>
              <button v-if="!editMode" @click="editMode = true" class="btn btn-outline">
                ✏️ Chỉnh sửa
              </button>
              <div v-else class="edit-actions">
                <button @click="handleSave" class="btn btn-primary">
                  💾 Lưu
                </button>
                <button @click="handleCancel" class="btn btn-outline">
                  ✕ Hủy
                </button>
              </div>
            </div>
            <div v-if="activeTab === 'skills'" class="content-section">
             <!-- Existing skills content -->
    
            <!-- ✅ THÊM COMPONENT UPLOAD CV -->
            <UploadCV @uploaded="handleCVUploaded" />
            </div>
            <div class="skills-section">
              <div class="skills-list">
                <div 
                  v-for="(skill, index) in formData.skills" 
                  :key="index"
                  class="skill-tag"
                >
                  <span>{{ skill }}</span>
                  <button 
                    v-if="editMode"
                    @click="removeSkill(index)"
                    class="btn-remove"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div v-if="editMode" class="add-skill">
                <input 
                  v-model="newSkill"
                  @keyup.enter="addSkill"
                  type="text"
                  placeholder="Thêm kỹ năng mới (Enter để thêm)"
                />
                <button @click="addSkill" class="btn btn-primary">
                  ➕ Thêm
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import Header from '../components/Header.vue';
import api from '../services/api';
import UploadCV from '@/components/UploadCV.vue';
import { useAuth } from '../composables/useAuth';

const { refreshUser } = useAuth();

const activeTab = ref('info');
const editMode = ref(false);
const message = ref('');
const isSuccess = ref(false);
const profile = ref(null);
const newSkill = ref('');

const passwordMessage = ref('');
const passwordSuccess = ref(false);

// ✅ options cho loại hình công việc mong muốn
const preferredJobTypeOptions = [
  { value: 'internship', label: 'Internship' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Contract' },
];

// ✅ options cho hình thức làm việc
const preferredWorkModeOptions = [
  { value: 'onsite', label: 'Onsite' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

const joinArrayToText = (arr) => {
  if (!Array.isArray(arr)) return '';
  return arr.filter(Boolean).join(', ');
};

const parseTextToArray = (text) => {
  if (!text) return [];
  return [...new Set(
    String(text)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  )];
};

const formData = reactive({
  fullName: '',
  email: '',
  phone: '',
  birthday: '',
  address: '',
  bio: '',

  studentId: '',
  university: '',
  major: '',
  academicYear: '1',
  graduationYear: null,
  gpa: null,

  skills: [],
  preferredJobTypes: [],
  preferredWorkModes: [],

  // ✅ các trường mới cho recommend
  preferredCategoriesText: '',
  desiredJobTitlesText: '',
  preferredLocationsText: '',
  projectsText: '',
  projectTechnologiesText: '',
  certificationsText: '',

  // ✅ link hồ sơ
  resumeUrl: '',
  portfolioUrl: '',
  githubUrl: '',
  linkedinUrl: '',
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0];
  }
  return name.substring(0, 2).toUpperCase();
};

const fetchProfile = async () => {
  try {
    const res = await api.get('/profile');
    profile.value = res.data.profile;

    Object.assign(formData, {
      fullName: profile.value.fullName || '',
      email: profile.value.email || '',
      phone: profile.value.phone || '',
      birthday: profile.value.birthday ? profile.value.birthday.split('T')[0] : '',
      address: profile.value.address || '',
      bio: profile.value.bio || '',

      studentId: profile.value.studentId || '',
      university: profile.value.university || '',
      major: profile.value.major || '',
      academicYear: profile.value.academicYear || '1',
      graduationYear: profile.value.graduationYear || null,
      gpa: profile.value.gpa || null,

      skills: profile.value.skills || [],
      preferredJobTypes: profile.value.preferredJobTypes || [],
      preferredWorkModes: profile.value.preferredWorkModes || [],

      preferredCategoriesText: joinArrayToText(profile.value.preferredCategories || []),
      desiredJobTitlesText: joinArrayToText(profile.value.desiredJobTitles || []),
      preferredLocationsText: joinArrayToText(profile.value.preferredLocations || []),
      projectsText: joinArrayToText(profile.value.projects || []),
      projectTechnologiesText: joinArrayToText(profile.value.projectTechnologies || []),
      certificationsText: joinArrayToText(profile.value.certifications || []),

      resumeUrl: profile.value.resumeUrl || '',
      portfolioUrl: profile.value.portfolioUrl || '',
      githubUrl: profile.value.githubUrl || '',
      linkedinUrl: profile.value.linkedinUrl || '',
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
};

const handleSave = async () => {
  try {
    message.value = '';

    const payload = {
      fullName: formData.fullName,
      phone: formData.phone,
      birthday: formData.birthday || null,
      address: formData.address,
      bio: formData.bio,

      studentId: formData.studentId,
      university: formData.university,
      major: formData.major,
      academicYear: formData.academicYear,
      graduationYear: formData.graduationYear ? Number(formData.graduationYear) : null,
      gpa: formData.gpa !== null && formData.gpa !== '' ? Number(formData.gpa) : null,

      skills: Array.isArray(formData.skills)
        ? [...new Set(formData.skills)].filter(Boolean)
        : [],

      preferredJobTypes: Array.isArray(formData.preferredJobTypes)
        ? [...new Set(formData.preferredJobTypes)].filter(Boolean)
        : [],

      preferredWorkModes: Array.isArray(formData.preferredWorkModes)
        ? [...new Set(formData.preferredWorkModes)].filter(Boolean)
        : [],

      preferredCategories: parseTextToArray(formData.preferredCategoriesText),
      desiredJobTitles: parseTextToArray(formData.desiredJobTitlesText),
      preferredLocations: parseTextToArray(formData.preferredLocationsText),
      projects: parseTextToArray(formData.projectsText),
      projectTechnologies: parseTextToArray(formData.projectTechnologiesText),
      certifications: parseTextToArray(formData.certificationsText),

      resumeUrl: formData.resumeUrl,
      portfolioUrl: formData.portfolioUrl,
      githubUrl: formData.githubUrl,
      linkedinUrl: formData.linkedinUrl,
    };

    const res = await api.put('/profile', payload);

    profile.value = res.data.profile;

    // ✅ đồng bộ localStorage nếu app đang dùng dữ liệu user từ localStorage
    const oldUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem(
      'user',
      JSON.stringify({
        ...oldUser,
        ...res.data.profile,
      })
    );
    refreshUser();

    message.value = 'Cập nhật thành công! ✅';
    isSuccess.value = true;
    editMode.value = false;

    setTimeout(() => {
      message.value = '';
    }, 3000);

    await fetchProfile();
  } catch (error) {
    message.value = error.response?.data?.message || 'Cập nhật thất bại';
    isSuccess.value = false;
  }
};

const handleCancel = () => {
  editMode.value = false;
  message.value = '';
  fetchProfile();
};

const addSkill = () => {
  if (newSkill.value.trim()) {
    const skill = newSkill.value.trim();
    if (!formData.skills.includes(skill)) {
      formData.skills.push(skill);
    }
    newSkill.value = '';
  }
};

const removeSkill = (index) => {
  formData.skills.splice(index, 1);
};

const togglePreferredJobType = (value) => {
  if (!editMode.value) return;

  const index = formData.preferredJobTypes.indexOf(value);
  if (index >= 0) {
    formData.preferredJobTypes.splice(index, 1);
  } else {
    formData.preferredJobTypes.push(value);
  }
};

const togglePreferredWorkMode = (value) => {
  if (!editMode.value) return;

  const index = formData.preferredWorkModes.indexOf(value);
  if (index >= 0) {
    formData.preferredWorkModes.splice(index, 1);
  } else {
    formData.preferredWorkModes.push(value);
  }
};

const handleChangePassword = async () => {
  try {
    passwordMessage.value = '';

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      passwordMessage.value = 'Vui lòng điền đầy đủ thông tin';
      passwordSuccess.value = false;
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      passwordMessage.value = 'Mật khẩu mới không khớp';
      passwordSuccess.value = false;
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      passwordMessage.value = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      passwordSuccess.value = false;
      return;
    }

    await api.put('/profile/change-password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    passwordMessage.value = 'Đổi mật khẩu thành công! ✅';
    passwordSuccess.value = true;

    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';

    setTimeout(() => {
      passwordMessage.value = '';
    }, 3000);
  } catch (error) {
    passwordMessage.value = error.response?.data?.message || 'Đổi mật khẩu thất bại';
    passwordSuccess.value = false;
  }
};

const handleCVUploaded = (cvUrl) => {
  formData.resumeUrl = cvUrl || '';
  message.value = 'CV đã được tải lên, nhớ bấm "Lưu" để cập nhật hồ sơ ✅';
  isSuccess.value = true;

  setTimeout(() => {
    message.value = '';
  }, 3000);
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

.profile-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

/* Sidebar */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.avatar-section {
  margin-bottom: 20px;
}

.avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  margin: 0 auto 15px;
}

.btn-upload {
  padding: 8px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-upload:hover {
  background: #e0e0e0;
}

.profile-card h2 {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.email {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.role-badge {
  display: inline-block;
  padding: 5px 15px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.profile-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 13px;
  color: #999;
}

.profile-nav {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.profile-nav button {
  padding: 12px 15px;
  background: transparent;
  border: none;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  color: #666;
}

.profile-nav button:hover {
  background: #f5f5f5;
}

.profile-nav button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Main Content */
.profile-main {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h2 {
  font-size: 24px;
  color: #2c3e50;
}

.edit-actions {
  display: flex;
  gap: 10px;
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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

.form-group input,
.form-group textarea {
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  font-family: inherit;
}

.form-group input:disabled,
.form-group textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group small {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.alert {
  padding: 12px 15px;
  border-radius: 8px;
  margin-top: 20px;
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

/* Skills */
.skills-section {
  margin-bottom: 30px;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.skill-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 14px;
  color: #2c3e50;
}

.btn-remove {
  width: 20px;
  height: 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-remove:hover {
  transform: scale(1.1);
}

.add-skill {
  display: flex;
  gap: 10px;
}

.add-skill input {
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.cv-upload {
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;
}

.cv-upload h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #2c3e50;
}

.upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.upload-icon {
  font-size: 48px;
}

.upload-hint {
  font-size: 12px;
  color: #999;
}

.cv-link {
  margin-top: 15px;
  font-size: 14px;
  color: #666;
}

.cv-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.cv-link a:hover {
  text-decoration: underline;
}

/* Password Form */
.password-form {
  max-width: 500px;
}

.password-form .form-group {
  margin-bottom: 20px;
}

/* Responsive */
@media (max-width: 968px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>