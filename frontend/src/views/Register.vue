<template>
  <div>
    <h2>Register</h2>

    <form @submit.prevent="handleRegister">
      <input v-model="form.fullName" placeholder="Full name" />
      <input v-model="form.email" placeholder="Email" />
      <input v-model="form.password" type="password" placeholder="Password" />

      <select v-model="form.role">
        <option value="student">Student</option>
        <option value="employer">Employer</option>
      </select>

      <button type="submit">Register</button>
    </form>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import api from '../services/api';

const message = ref('');

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  role: 'student',
});

const handleRegister = async () => {
  try {
    const res = await api.post('/auth/register', form);
    message.value = 'Register success 🎉';
    console.log(res.data);
  } catch (err) {
    message.value = err.response?.data?.message || 'Register failed';
  }
};
</script>
