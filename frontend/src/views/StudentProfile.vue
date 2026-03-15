<template>
  <div class="profile-page">
    <Header />

    <div class="container">
      <div class="profile-layout">
        <aside class="profile-sidebar">
          <div class="profile-card">
            <div class="avatar-section">
              <UploadAvatar
                :current-avatar="profile?.avatar || ''"
                :full-name="profile?.fullName || ''"
                @uploaded="handleAvatarUploaded"
              />
            </div>

            <h2>{{ profile?.fullName }}</h2>
            <p class="email">{{ profile?.email }}</p>
            <span class="role-badge">Sinh viên</span>

            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-value">{{ profileCompletion }}%</span>
                <span class="stat-label">Hoàn thành</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ completedRequirementCount }}/{{ profileRequirements.length }}</span>
                <span class="stat-label">Mục đã đủ</span>
              </div>
            </div>
          </div>

          <nav class="profile-nav">
            <button :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">
              👤 Thông tin cá nhân
            </button>
            <button :class="{ active: activeTab === 'education' }" @click="activeTab = 'education'">
              🎓 Học vấn
            </button>
            <button :class="{ active: activeTab === 'skills' }" @click="activeTab = 'skills'">
              ⭐ Kỹ năng
            </button>
            <router-link
              to="/change-password"
              class="nav-link-like"
            >
              Đổi mật khẩu
            </router-link>
          </nav>
        </aside>

        <main class="profile-main">
          <div v-if="activeTab === 'info'" class="content-section">
            <div class="section-header">
              <h2>Thông tin cá nhân</h2>
              <button v-if="!editMode" @click="editMode = true" class="btn btn-outline">
                ✏️ Chỉnh sửa
              </button>
              <div v-else class="edit-actions">
                <button @click="handleSave" class="btn btn-primary">💾 Lưu</button>
                <button @click="handleCancel" class="btn btn-outline">✕ Hủy</button>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Họ và tên</label>
                <input v-model="formData.fullName" :disabled="!editMode" type="text" />
              </div>

              <div class="form-group">
                <label>Email</label>
                <input v-model="formData.email" disabled type="email" />
                <small>Email không thể thay đổi</small>
              </div>

              <div class="form-group">
                <label>Số điện thoại</label>
                <input v-model="formData.phone" :disabled="!editMode" type="tel" />
              </div>

              <div class="form-group">
                <label>Ngày sinh</label>
                <input v-model="formData.birthday" :disabled="!editMode" type="date" />
              </div>

              <div class="form-group full-width">
                <label>Địa chỉ</label>
                <input v-model="formData.address" :disabled="!editMode" type="text" />
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

          <div v-if="activeTab === 'education'" class="content-section">
            <div class="section-header">
              <h2>Học vấn</h2>
              <button v-if="!editMode" @click="editMode = true" class="btn btn-outline">
                ✏️ Chỉnh sửa
              </button>
              <div v-else class="edit-actions">
                <button @click="handleSave" class="btn btn-primary">💾 Lưu</button>
                <button @click="handleCancel" class="btn btn-outline">✕ Hủy</button>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Mã sinh viên</label>
                <input v-model="formData.studentId" :disabled="!editMode" type="text" />
              </div>

              <div class="form-group">
                <label>Trường đại học</label>
                <input v-model="formData.university" :disabled="!editMode" type="text" />
              </div>

              <div class="form-group">
                <label>Ngành học</label>
                <input v-model="formData.major" :disabled="!editMode" type="text" />
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
                  max="2035"
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

          <div v-if="activeTab === 'skills'" class="content-section">
            <div class="section-header">
              <h2>Kỹ năng</h2>
              <button v-if="!editMode" @click="editMode = true" class="btn btn-outline">
                ✏️ Chỉnh sửa
              </button>
              <div v-else class="edit-actions">
                <button @click="handleSave" class="btn btn-primary">💾 Lưu</button>
                <button @click="handleCancel" class="btn btn-outline">✕ Hủy</button>
              </div>
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
                <button @click="addSkill" class="btn btn-primary">➕ Thêm</button>
              </div>
            </div>

            <UploadCV @uploaded="handleCVUploaded" />
          </div>

          <div v-if="message" class="alert" :class="{ success: isSuccess, error: !isSuccess }">
            {{ message }}
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import Header from '../components/Header.vue';
import api from '../services/api';
import UploadCV from '@/components/UploadCV.vue';
import UploadAvatar from '@/components/UploadAvatar.vue';
import { useAuth } from '../composables/useAuth';

const { refreshUser, updateUser } = useAuth();

const activeTab = ref('info');
const editMode = ref(false);
const message = ref('');
const isSuccess = ref(false);
const profile = ref(null);
const newSkill = ref('');

const hasValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && String(value).trim() !== '';
};

const profileRequirements = computed(() => {
  const currentProfile = profile.value || {};

  return [
    { label: 'Họ và tên', ok: hasValue(currentProfile.fullName) },
    { label: 'Số điện thoại', ok: hasValue(currentProfile.phone) },
    { label: 'Ngày sinh', ok: hasValue(currentProfile.birthday) },
    { label: 'Địa chỉ', ok: hasValue(currentProfile.address) },
    { label: 'Trường đại học', ok: hasValue(currentProfile.university) },
    { label: 'Chuyên ngành', ok: hasValue(currentProfile.major) },
    { label: 'Kỹ năng', ok: hasValue(currentProfile.skills) },
    { label: 'Loại hình công việc mong muốn', ok: hasValue(currentProfile.preferredJobTypes) },
    { label: 'Nhóm nghề quan tâm', ok: hasValue(currentProfile.preferredCategories) },
    { label: 'Vị trí mong muốn', ok: hasValue(currentProfile.desiredJobTitles) },
    { label: 'Khu vực mong muốn làm việc', ok: hasValue(currentProfile.preferredLocations) },
    { label: 'CV', ok: hasValue(currentProfile.resumeUrl) },
  ];
});

const completedRequirementCount = computed(() => {
  return profileRequirements.value.filter((item) => item.ok).length;
});

const profileCompletion = computed(() => {
  if (!profileRequirements.value.length) return 0;
  return Math.round((completedRequirementCount.value / profileRequirements.value.length) * 100);
});

const preferredJobTypeOptions = [
  { value: 'internship', label: 'Internship' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Contract' },
];

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
  preferredCategoriesText: '',
  desiredJobTitlesText: '',
  preferredLocationsText: '',
  projectsText: '',
  projectTechnologiesText: '',
  certificationsText: '',
  resumeUrl: '',
  portfolioUrl: '',
  githubUrl: '',
  linkedinUrl: '',
});

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
    updateUser(res.data.profile);
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

const handleCVUploaded = async (cvUrl) => {
  formData.resumeUrl = cvUrl || '';
  message.value = 'CV đã được tải lên thành công ✅';
  isSuccess.value = true;
  await fetchProfile();

  setTimeout(() => {
    message.value = '';
  }, 3000);
};

const handleAvatarUploaded = async (avatarUrl) => {
  if (!profile.value) return;

  profile.value = {
    ...profile.value,
    avatar: avatarUrl,
  };

  updateUser({ avatar: avatarUrl });
  refreshUser();

  message.value = 'Ảnh đại diện đã được cập nhật ✅';
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

.profile-nav button,
.nav-link-like {
  padding: 12px 15px;
  background: transparent;
  border: none;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  color: #666;
  text-decoration: none;
}

.profile-nav button:hover,
.nav-link-like:hover {
  background: #f5f5f5;
}

.profile-nav button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

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
.form-group textarea,
.form-group select {
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  font-family: inherit;
}

.form-group input:disabled,
.form-group textarea:disabled,
.form-group select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
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

@media (max-width: 968px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>