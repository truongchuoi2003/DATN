<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-2xl mx-auto px-4 py-10">
      <div class="bg-white rounded-2xl shadow p-6">
        <h1 class="text-2xl font-bold text-slate-800 mb-2">Đổi mật khẩu</h1>
        <p class="text-sm text-slate-500 mb-6">
          Nhập mật khẩu hiện tại và mật khẩu mới của bạn.
        </p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
            <input
              v-model="form.currentPassword"
              type="password"
              class="w-full border rounded-xl px-4 py-3"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Mật khẩu mới</label>
            <input
              v-model="form.newPassword"
              type="password"
              class="w-full border rounded-xl px-4 py-3"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Xác nhận mật khẩu mới</label>
            <input
              v-model="form.confirmNewPassword"
              type="password"
              class="w-full border rounded-xl px-4 py-3"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-60"
          >
            {{ loading ? 'Đang cập nhật...' : 'Đổi mật khẩu' }}
          </button>
        </form>

        <div v-if="success" class="mt-4 text-sm text-emerald-600">
          {{ success }}
        </div>

        <div v-if="error" class="mt-4 text-sm text-red-600">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import api from '@/services/api';

const loading = ref(false);
const success = ref('');
const error = ref('');

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
});

const handleSubmit = async () => {
  try {
    loading.value = true;
    success.value = '';
    error.value = '';

    const { data } = await api.put('/auth/change-password', form);

    success.value = data.message || 'Đổi mật khẩu thành công';

    form.currentPassword = '';
    form.newPassword = '';
    form.confirmNewPassword = '';
  } catch (err) {
    error.value = err.response?.data?.message || 'Có lỗi xảy ra';
  } finally {
    loading.value = false;
  }
};
</script>