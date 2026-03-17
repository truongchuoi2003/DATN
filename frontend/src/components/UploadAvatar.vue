<template>
  <div class="upload-avatar-section">
    <div class="current-avatar-wrap">
      <div v-if="currentAvatar" class="avatar-preview">
        <img :src="getFullUrl(currentAvatar)" alt="Avatar" />
      </div>
      <div v-else class="avatar-fallback">
        {{ initials }}
      </div>
    </div>

    <div class="avatar-actions">
      <input
        ref="fileInput"
        type="file"
        accept=".png,.jpg,.jpeg"
        class="hidden-input"
        @change="handleFileSelect"
      />

      <button class="btn btn-outline" type="button" @click="openPicker">
        📷 {{ currentAvatar ? 'Thay ảnh' : 'Tải ảnh lên' }}
      </button>

      <button
        v-if="selectedFile"
        class="btn btn-primary"
        type="button"
        :disabled="uploading"
        @click="uploadAvatar"
      >
        {{ uploading ? '⏳ Đang tải...' : '💾 Lưu ảnh' }}
      </button>
    </div>

    <div v-if="selectedFile" class="selected-file">
      <span>Đã chọn: {{ selectedFile.name }}</span>
      <button type="button" class="clear-btn" @click="clearFile">✕</button>
    </div>

    <div v-if="uploading" class="progress-wrap">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <small>{{ uploadProgress }}%</small>
    </div>

    <small class="hint">Hỗ trợ JPG, JPEG, PNG. Tối đa 5MB.</small>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import api from '../services/api';

const props = defineProps({
  currentAvatar: {
    type: String,
    default: '',
  },
  fullName: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['uploaded']);

const fileInput = ref(null);
const selectedFile = ref(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const currentAvatar = ref(props.currentAvatar || '');

watch(
  () => props.currentAvatar,
  (value) => {
    currentAvatar.value = value || '';
  }
);

const initials = computed(() => {
  const name = props.fullName || '';
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

const openPicker = () => {
  fileInput.value?.click();
};

const validateFile = (file) => {
  if (!file) return false;

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    alert('❌ Chỉ chấp nhận file JPG, JPEG hoặc PNG');
    return false;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('❌ Ảnh không được vượt quá 5MB');
    return false;
  }

  return true;
};

const handleFileSelect = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!validateFile(file)) {
    clearFile();
    return;
  }
  selectedFile.value = file;
};

const clearFile = () => {
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
};

const uploadAvatar = async () => {
  if (!selectedFile.value) {
    alert('Vui lòng chọn ảnh đại diện');
    return;
  }

  try {
    uploading.value = true;
    uploadProgress.value = 0;
    const formData = new FormData();
    formData.append('avatar', selectedFile.value);

    const res = await api.put('/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;
        uploadProgress.value = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
      },
    });

    currentAvatar.value = res.data.profile?.avatar || '';
    clearFile();
    emit('uploaded', currentAvatar.value);
    alert('✅ Tải ảnh đại diện thành công');
  } catch (error) {
    console.error('Upload avatar error:', error);
    alert(error.response?.data?.message || '❌ Không thể tải ảnh đại diện');
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:4000${url}`;
};
</script>

<style scoped>
.upload-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.current-avatar-wrap {
  display: flex;
  justify-content: center;
}

.avatar-preview,
.avatar-fallback {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 42px;
  font-weight: 700;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.hidden-input {
  display: none;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
}

.clear-btn {
  border: none;
  background: #dc3545;
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
}

.progress-wrap {
  width: 100%;
  max-width: 220px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #ececec;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hint {
  color: #888;
  text-align: center;
  font-size: 12px;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-outline {
  background: white;
  border: 1px solid #d7d7d7;
  color: #555;
}
</style>