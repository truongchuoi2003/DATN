<template>
  <div class="upload-cv-section">
    <h3>📄 CV của bạn</h3>
    
    <!-- Hiển thị CV hiện tại -->
    <div v-if="currentCV" class="current-cv">
      <div class="cv-info">
        <span class="cv-icon">✅</span>
        <div class="cv-details">
          <p class="cv-name">CV đã tải lên</p>
          <a :href="getFullUrl(currentCV)" target="_blank" class="cv-link">
            📥 Xem CV hiện tại
          </a>
        </div>
      </div>
      <button @click="showUploadForm = true" class="btn-change">
        🔄 Thay đổi CV
      </button>
    </div>

    <!-- Form upload CV -->
    <div v-if="!currentCV || showUploadForm" class="upload-form">
      <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
        <input 
          ref="fileInput"
          type="file" 
          @change="handleFileSelect"
          accept=".pdf,.doc,.docx"
          style="display: none"
        />
        
        <div class="upload-content" @click="$refs.fileInput.click()">
          <div class="upload-icon">📤</div>
          <p class="upload-text">
            <strong>Click để chọn file</strong> hoặc kéo thả file vào đây
          </p>
          <p class="upload-hint">Hỗ trợ: PDF, DOC, DOCX (Tối đa 5MB)</p>
        </div>
      </div>

      <!-- Preview file đã chọn -->
      <div v-if="selectedFile" class="file-preview">
        <div class="file-info">
          <span class="file-icon">📄</span>
          <div class="file-details">
            <p class="file-name">{{ selectedFile.name }}</p>
            <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
        </div>
        <button @click="clearFile" class="btn-remove">✕</button>
      </div>

      <!-- Buttons -->
      <div class="upload-actions">
        <button 
          v-if="showUploadForm && currentCV"
          @click="cancelUpload" 
          class="btn btn-secondary"
        >
          Hủy
        </button>
        <button 
          @click="uploadCV" 
          :disabled="!selectedFile || uploading"
          class="btn btn-primary"
        >
          {{ uploading ? '⏳ Đang tải lên...' : '📤 Tải lên CV' }}
        </button>
      </div>

      <!-- Progress bar -->
      <div v-if="uploading" class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const currentCV = ref(null);
const selectedFile = ref(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const showUploadForm = ref(false);
const fileInput = ref(null);

const emit = defineEmits(['uploaded']);

// Load current CV
const loadCurrentCV = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    currentCV.value = res.data.profile?.resumeUrl;
    console.log('Current CV:', currentCV.value);
  } catch (error) {
    console.error('Error loading CV:', error);
  }
};

// Handle file select
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  validateAndSetFile(file);
};

// Handle drag and drop
const handleDrop = (event) => {
  const file = event.dataTransfer.files[0];
  validateAndSetFile(file);
};

// Validate and set file
const validateAndSetFile = (file) => {
  if (!file) return;

  // Check file type
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    alert('❌ Chỉ chấp nhận file PDF, DOC, DOCX!');
    return;
  }

  // Check file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('❌ File không được vượt quá 5MB!');
    return;
  }

  selectedFile.value = file;
  console.log('File selected:', file.name);
};

// Clear selected file
const clearFile = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// Cancel upload
const cancelUpload = () => {
  showUploadForm.value = false;
  clearFile();
};

// Upload CV
const uploadCV = async () => {
  if (!selectedFile.value) {
    alert('Vui lòng chọn file CV!');
    return;
  }

  try {
    uploading.value = true;
    uploadProgress.value = 0;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('resume', selectedFile.value);

    const res = await axios.put(
      `${API_URL}/profile`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      }
    );

    console.log('Upload response:', res.data);

    currentCV.value = res.data.profile?.resumeUrl;
    showUploadForm.value = false;
    clearFile();
    
    alert('✅ Tải lên CV thành công!');
    emit('uploaded', currentCV.value);
  } catch (error) {
    console.error('Upload error:', error);
    alert(error.response?.data?.message || '❌ Không thể tải lên CV. Vui lòng thử lại!');
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Get full URL
const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:4000${url}`;
};

onMounted(() => {
  loadCurrentCV();
});
</script>

<style scoped>
.upload-cv-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.upload-cv-section h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 20px;
}

/* Current CV */
.current-cv {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.cv-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.cv-icon {
  font-size: 32px;
}

.cv-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cv-name {
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.cv-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.cv-link:hover {
  text-decoration: underline;
}

.btn-change {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-change:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

/* Upload Form */
.upload-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.upload-text {
  font-size: 16px;
  color: #2c3e50;
  margin: 0;
}

.upload-hint {
  font-size: 13px;
  color: #999;
  margin: 0;
}

/* File Preview */
.file-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  font-size: 24px;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.file-name {
  font-weight: 500;
  color: #2c3e50;
  margin: 0;
  font-size: 14px;
}

.file-size {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.btn-remove {
  width: 30px;
  height: 30px;
  border: none;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-remove:hover {
  background: #ff5252;
  transform: scale(1.1);
}

/* Actions */
.upload-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 24px;
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

/* Progress Bar */
.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}
</style>