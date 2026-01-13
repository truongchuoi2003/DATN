<template>
  <div class="dashboard">
    <Header />
    
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1>Xin chào, {{ user?.fullName }}! 👋</h1>
          <p>Chào mừng bạn đến với DATN Platform - Nơi bắt đầu sự nghiệp của bạn</p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              📝
            </div>
            <div class="stat-info">
              <h3>12</h3>
              <p>Đơn ứng tuyển</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              💼
            </div>
            <div class="stat-info">
              <h3>3</h3>
              <p>Đang chờ phản hồi</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              ✅
            </div>
            <div class="stat-info">
              <h3>2</h3>
              <p>Được chấp nhận</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              ⭐
            </div>
            <div class="stat-info">
              <h3>156</h3>
              <p>Công việc phù hợp</p>
            </div>
          </div>
        </div>

        <!-- Main Grid -->
        <div class="dashboard-grid">
          <!-- Left Column -->
          <div class="left-column">
            <!-- Profile Completion -->
            <div class="card">
              <div class="card-header">
                <h2>Hồ sơ của bạn</h2>
                <span class="badge badge-warning">75% hoàn thành</span>
              </div>
              <div class="card-body">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 75%"></div>
                </div>
                <p class="progress-text">Hoàn thiện hồ sơ để tăng cơ hội tìm được việc làm phù hợp</p>
                <button class="btn btn-primary">Cập nhật hồ sơ</button>
              </div>
            </div>

            <!-- Recent Applications -->
            <div class="card">
              <div class="card-header">
                <h2>Đơn ứng tuyển gần đây</h2>
                <a href="#" class="link">Xem tất cả</a>
              </div>
              <div class="card-body">
                <div class="application-list">
                  <div class="application-item">
                    <div class="company-logo">FPT</div>
                    <div class="application-info">
                      <h4>Frontend Developer</h4>
                      <p>FPT Software</p>
                      <span class="status status-pending">Đang chờ</span>
                    </div>
                    <div class="application-date">2 ngày trước</div>
                  </div>

                  <div class="application-item">
                    <div class="company-logo">VNG</div>
                    <div class="application-info">
                      <h4>Backend Developer</h4>
                      <p>VNG Corporation</p>
                      <span class="status status-accepted">Chấp nhận</span>
                    </div>
                    <div class="application-date">5 ngày trước</div>
                  </div>

                  <div class="application-item">
                    <div class="company-logo">MB</div>
                    <div class="application-info">
                      <h4>Data Analyst</h4>
                      <p>MoMo</p>
                      <span class="status status-rejected">Từ chối</span>
                    </div>
                    <div class="application-date">1 tuần trước</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="right-column">
            <!-- Recommended Jobs -->
            <div class="card">
              <div class="card-header">
                <h2>Việc làm phù hợp</h2>
                <a href="#" class="link">Xem thêm</a>
              </div>
              <div class="card-body">
                <div class="job-list">
                  <div class="job-item">
                    <div class="job-header">
                      <div class="company-avatar">F</div>
                      <div class="job-title-area">
                        <h4>Full Stack Developer</h4>
                        <p>FPT Software</p>
                      </div>
                    </div>
                    <div class="job-tags">
                      <span class="tag">React</span>
                      <span class="tag">Node.js</span>
                      <span class="tag">MongoDB</span>
                    </div>
                    <div class="job-footer">
                      <span class="salary">15-25 triệu</span>
                      <button class="btn btn-sm btn-outline">Ứng tuyển</button>
                    </div>
                  </div>

                  <div class="job-item">
                    <div class="job-header">
                      <div class="company-avatar" style="background: #ff6b6b;">V</div>
                      <div class="job-title-area">
                        <h4>Mobile Developer</h4>
                        <p>Viettel Solutions</p>
                      </div>
                    </div>
                    <div class="job-tags">
                      <span class="tag">Flutter</span>
                      <span class="tag">Firebase</span>
                    </div>
                    <div class="job-footer">
                      <span class="salary">12-20 triệu</span>
                      <button class="btn btn-sm btn-outline">Ứng tuyển</button>
                    </div>
                  </div>

                  <div class="job-item">
                    <div class="job-header">
                      <div class="company-avatar" style="background: #4ecdc4;">G</div>
                      <div class="job-title-area">
                        <h4>UI/UX Designer</h4>
                        <p>Gameloft Vietnam</p>
                      </div>
                    </div>
                    <div class="job-tags">
                      <span class="tag">Figma</span>
                      <span class="tag">Sketch</span>
                    </div>
                    <div class="job-footer">
                      <span class="salary">10-18 triệu</span>
                      <button class="btn btn-sm btn-outline">Ứng tuyển</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="card">
              <div class="card-header">
                <h2>Hành động nhanh</h2>
              </div>
              <div class="card-body">
                <div class="quick-actions">
                  <button class="action-btn">
                    <span class="action-icon">📄</span>
                    <span>Tải CV lên</span>
                  </button>
                  <button class="action-btn">
                    <span class="action-icon">🔍</span>
                    <span>Tìm việc làm</span>
                  </button>
                  <button class="action-btn">
                    <span class="action-icon">💬</span>
                    <span>Tin nhắn</span>
                  </button>
                  <button class="action-btn">
                    <span class="action-icon">⚙️</span>
                    <span>Cài đặt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import api from '../services/api';
import { useRouter } from 'vue-router';

const props = defineProps({
  initialProfile: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['saved']);

const router = (() => {
  try { return useRouter(); } catch (e) { return null; }
})();

const token = localStorage.getItem('token') || '';
const headers = token ? { Authorization: `Bearer ${token}` } : {};

const loading = ref(false);
const message = ref('');
const isDirty = ref(false);

const form = reactive({
  fullName: '',
  birthday: '',
  phone: '',
  address: '',
  university: '',
  major: '',
  graduationYear: '',
  skillsText: '',
  lng: '',
  lat: '',
  resumeUrl: ''
});

onMounted(() => {
  if (props.initialProfile) {
    const p = props.initialProfile;
    form.fullName = p.fullName || '';
    form.birthday = p.birthday ? p.birthday.split('T')[0] : (p.birthday || '');
    form.phone = p.phone || '';
    form.address = p.address || '';
    form.university = p.university || '';
    form.major = p.major || '';
    form.graduationYear = p.graduationYear || '';
    form.skillsText = Array.isArray(p.skills) ? p.skills.join(', ') : (p.skills || '');
    form.lng = p.location?.coordinates?.[0] ?? '';
    form.lat = p.location?.coordinates?.[1] ?? '';
    form.resumeUrl = p.resumeUrl || '';
  }
});

// mark dirty on any change
watch(form, () => { isDirty.value = true; }, { deep: true });

const save = async () => {
  try {
    loading.value = true;
    message.value = '';
    const payload = {
      fullName: form.fullName,
      birthday: form.birthday || undefined,
      phone: form.phone,
      address: form.address,
      university: form.university,
      major: form.major,
      graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
      skills: form.skillsText ? form.skillsText.split(',').map(s => s.trim()).filter(Boolean) : undefined,
    };
    if (form.lng !== '' && form.lat !== '') {
      payload.location = { type: 'Point', coordinates: [Number(form.lng), Number(form.lat)] };
    }
    const res = await api.put('/profile/me', payload, { headers });
    message.value = 'Lưu thành công';
    isDirty.value = false;
    emit('saved');
  } catch (err) {
    console.error(err);
    message.value = err.response?.data?.message || 'Lỗi khi lưu';
  } finally {
    loading.value = false;
  }
};

const uploadResume = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  try {
    loading.value = true;
    const res = await api.post('/profile/me/upload-resume', fd, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    });
    // server returns profile, set resumeUrl
    form.resumeUrl = res.data.resumeUrl || res.data.resumeUrl || (`/uploads/${res.data._id ? '' : ''}`);
    message.value = 'Upload CV thành công';
    isDirty.value = false;
    emit('saved');
  } catch (err) {
    console.error(err);
    message.value = err.response?.data?.message || 'Upload thất bại';
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  if (isDirty.value) {
    if (!confirm('Bạn có thay đổi chưa lưu. Rời đi không?')) return;
  }
  if (router) router.push('/');
  else window.location.href = '/';
};
</script>

<template>
  <div class="student-profile">
    <h3>Hồ sơ Sinh viên</h3>

    <form @submit.prevent="save">
      <label>Họ và tên</label>
      <input v-model="form.fullName" @input="() => isDirty = true" required />

      <label>Ngày sinh</label>
      <input type="date" v-model="form.birthday" @input="() => isDirty = true" />

      <label>Số điện thoại</label>
      <input v-model="form.phone" @input="() => isDirty = true" />

      <label>Trường</label>
      <input v-model="form.university" @input="() => isDirty = true" />

      <label>Ngành</label>
      <input v-model="form.major" @input="() => isDirty = true" />

      <label>Năm tốt nghiệp</label>
      <input type="number" v-model="form.graduationYear" @input="() => isDirty = true" />

      <label>Kỹ năng (phân tách bằng dấu ,)</label>
      <input v-model="form.skillsText" @input="() => isDirty = true" />

      <label>Longitude</label>
      <input v-model.number="form.lng" placeholder="vd: 106.700" />

      <label>Latitude</label>
      <input v-model.number="form.lat" placeholder="vd: 10.780" />

      <label>CV</label>
      <div v-if="form.resumeUrl"><a :href="form.resumeUrl" target="_blank">Xem CV</a></div>
      <input type="file" @change="uploadResume" />

      <div class="form-actions">
        <button type="submit" class="btn">Lưu</button>
        <button type="button" class="btn ghost" @click="cancel">Quay về</button>
      </div>
      <p v-if="message" class="msg">{{ message }}</p>
    </form>
  </div>
</template>

<style scoped>
.student-profile { padding: 12px; background: #fff; border-radius:6px; }
label { display:block; margin-top:8px; font-weight:600; }
input { width:100%; padding:8px; margin-top:4px; box-sizing:border-box; }
.form-actions { margin-top:12px; display:flex; gap:8px; }
.btn { padding:8px 12px; border-radius:6px; border:none; background:#2d8cff; color:white; cursor:pointer; }
.btn.ghost { background:transparent; border:1px solid #ddd; color:#333; }
.msg { margin-top:8px; color:#2d8cff; }
</style>
