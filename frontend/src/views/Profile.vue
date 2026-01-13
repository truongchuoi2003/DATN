<template>
  <div class="profile-page">
    <h2>My Profile</h2>
    <div v-if="loading">Loading...</div>

    <form v-else @submit.prevent="save">
      <div v-if="role === 'student'">
        <label>Full name</label>
        <input v-model="form.fullName" />

        <label>Birthday</label>
        <input type="date" v-model="form.birthday" />

        <label>Phone</label>
        <input v-model="form.phone" />

        <label>University</label>
        <input v-model="form.university" />

        <label>Major</label>
        <input v-model="form.major" />

        <label>Skills (comma separated)</label>
        <input v-model="form.skillsText" />

        <label>Longitude</label>
        <input v-model.number="form.lng" />
        <label>Latitude</label>
        <input v-model.number="form.lat" />

        <label>CV</label>
        <div v-if="form.resumeUrl"><a :href="form.resumeUrl" target="_blank">View resume</a></div>
        <input type="file" @change="uploadResume" />
      </div>

      <div v-else-if="role === 'employer'">
        <label>Company name</label>
        <input v-model="form.companyName" />

        <label>Contact name</label>
        <input v-model="form.fullName" />

        <label>Phone</label>
        <input v-model="form.phone" />

        <label>Address</label>
        <input v-model="form.address" />

        <label>Website</label>
        <input v-model="form.website" />

        <label>Longitude</label>
        <input v-model.number="form.lng" />
        <label>Latitude</label>
        <input v-model.number="form.lat" />

        <label>Logo</label>
        <div v-if="form.logo"><img :src="form.logo" alt="logo" style="height:48px" /></div>
        <input type="file" @change="uploadLogo" />
      </div>

      <div class="form-actions">
        <button type="submit" class="save-btn">Lưu</button>

     <!-- Hủy / Quay về trang chủ -->
        <button type="button" @click="goHome">
            Quay về trang chủ
        </button>
      </div>
    </form>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const token = localStorage.getItem('token') || ''; // or use Pinia store
const headers = token ? { Authorization: `Bearer ${token}` } : {};

const role = ref('student'); // fallback, will set from server
const loading = ref(true);
const message = ref('');
const form = ref({});

// helper to load profile
const load = async () => {
  try {
    loading.value = true;
    const res = await api.get('/profile/me', { headers });
    const data = res.data || {};
    // set role from token? try data.role or get from /auth/user endpoint; fallback to stored
    if (data.role) role.value = data.role;
    // normalize structure
    form.value = {
      ...data,
      skillsText: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || '').toString(),
      lng: data.location?.coordinates?.[0] || data.lng || '',
      lat: data.location?.coordinates?.[1] || data.lat || ''
    };
  } catch (err) {
    console.error(err);
    message.value = err.response?.data?.message || 'Cannot load profile';
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const save = async () => {
  try {
    const payload = { ...form.value };
    // convert skillsText to array
    if (payload.skillsText !== undefined) {
      payload.skills = payload.skillsText.split(',').map(s => s.trim()).filter(Boolean);
      delete payload.skillsText;
    }
    // set location
    if (payload.lng !== undefined && payload.lat !== undefined && payload.lng !== '' && payload.lat !== '') {
      payload.location = { type: 'Point', coordinates: [payload.lng, payload.lat] };
    }
    // call API
    const res = await api.put('/profile/me', payload, { headers });
    message.value = 'Saved';
    form.value = { ...res.data, skillsText: (res.data.skills || []).join(', '), lng: res.data.location?.coordinates?.[0], lat: res.data.location?.coordinates?.[1] };
  } catch (err) {
    console.error(err);
    message.value = err.response?.data?.message || 'Save failed';
  }
};

const uploadResume = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  try {
    const res = await api.post('/profile/me/upload-resume', fd, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    });
    message.value = 'Resume uploaded';
    form.value.resumeUrl = res.data.resumeUrl || res.data.resumeUrl || `/uploads/${res.data.resumeUrl?.split('/').pop()}`;
    await load();
  } catch (err) {
    console.error(err);
    message.value = err.response?.data?.message || 'Upload failed';
  }
};

const uploadLogo = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  try {
    const res = await api.post('/profile/me/upload-logo', fd, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    });
    message.value = 'Logo uploaded';
    await load();
  } catch (err) {
    console.error(err);
    message.value = err.response?.data?.message || 'Upload failed';
  }
};

const goHome = () => {
  window.location.href = '/';
};
</script>

<style scoped>
.profile-page { max-width: 720px; margin: 16px auto; padding: 16px; }
label { display:block; margin-top:8px; font-weight:600; }
input, textarea { width:100%; padding:8px; margin-top:4px; box-sizing:border-box; }
button { margin-top:12px; padding:8px 16px; }
.form-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.save-btn {
  padding: 8px 16px;
  background:#2d8cff; color:white; border:none; border-radius:6px;
}

.cancel-btn {
  padding: 8px 14px;
  background: transparent;
  border: 1px solid #ccc;
  border-radius:6px;
  cursor: pointer;
}

</style>
