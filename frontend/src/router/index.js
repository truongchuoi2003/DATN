import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guest: true }
  },
  {
    path: '/student',
    name: 'Student',
    component: () => import('../views/Student.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/profile',
    name: 'StudentProfile',
    component: () => import('../views/StudentProfile.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
  path: '/student/jobs',
  name: 'StudentJobs',
  component: () => import('../views/StudentJobs.vue'),
  meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/employer',
    name: 'Employer',
    component: () => import('../views/Employer.vue'),
    meta: { requiresAuth: true, role: 'employer' }
  },
  {
    path: '/employer/profile',
    name: 'EmployerProfile',
    component: () => import('../views/EmployerProfile.vue'),
    meta: { requiresAuth: true, role: 'employer' }
  },
  {
  path: '/employer/jobs',
  name: 'EmployerJobs',
  component: () => import('../views/EmployerJobs.vue'),
  meta: { requiresAuth: true, role: 'employer' }
  },
  {
  path: '/employer/jobs/create',
  name: 'JobCreate',
  component: () => import('../views/JobCreate.vue'),
  meta: { requiresAuth: true, role: 'employer' }
  },
  {
   path: '/employer/jobs/:jobId/edit',
  name: 'JobEdit',
  component: () => import('../views/JobEdit.vue'),
  meta: { requiresAuth: true, role: 'employer' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/profile',
    name: 'AdminProfile',
    component: () => import('../views/AdminProfile.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  },
  {
  path: '/admin/employers',
  name: 'AdminEmployers',
  component: () => import('../views/AdminEmployers.vue'),
  meta: { requiresAuth: true, role: 'admin' }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  
  // Route cần authentication
  if (to.meta.requiresAuth) {
    if (!token) {
      // Chưa login → redirect về login
      next('/login');
    } else if (user && to.meta.role && to.meta.role !== user.role) {
      // Login rồi nhưng sai role → redirect về đúng role
      next(`/${user.role}`);
    } else {
      // OK
      next();
    }
  }
  // Route cho guest (login, register)
  else if (to.meta.guest) {
    if (token && user) {
      // Đã login rồi → không cho vào login/register nữa
      next(`/${user.role}`);
    } else {
      next();
    }
  }
  // Route khác
  else {
    next();
  }
});

export default router;