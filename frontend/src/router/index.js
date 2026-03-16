import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ChangePassword from '../views/ChangePassword.vue';

/**
 * Đọc user từ localStorage an toàn
 */
function getStoredUser() {
  try {
    const rawUser = localStorage.getItem('user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    console.error('Lỗi parse user từ localStorage:', error);
    localStorage.removeItem('user');
    return null;
  }
}

/**
 * Lấy đường dẫn dashboard theo role
 */
function getDashboardPathByRole(role) {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'employer':
      return '/employer';
    case 'student':
      return '/student';
    default:
      return '/home';
  }
}

/**
 * Kiểm tra đã đăng nhập hợp lệ chưa
 */
function getAuthState() {
  const token = localStorage.getItem('token');
  const user = getStoredUser();

  const isAuthenticated = !!token && !!user && !!user.role;
  return { token, user, isAuthenticated };
}

const routes = [
  // ===== ROOT ENTRY =====
  {
    path: '/',
    name: 'RootEntry',
    redirect: () => {
      const { isAuthenticated, user } = getAuthState();
      return isAuthenticated ? getDashboardPathByRole(user.role) : '/home';
    },
  },

  // ===== PUBLIC =====
  
  {
    path: '',
    name: 'PublicJobs',
    component: () => import('../views/PublicJobs.vue'),
  },
  {
    path: '/jobs/public/:jobId',
    name: 'PublicJobDetail',
    component: () => import('../views/PublicJobDetail.vue'),
  },

  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guest: true },
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: ChangePassword,
    meta: { requiresAuth: true },
  },

  // ===== STUDENT =====
  {
    path: '/student',
    name: 'Student',
    component: () => import('../views/Student.vue'),
    meta: { requiresAuth: true, role: 'student' },
  },
  {
    path: '/student/profile',
    name: 'StudentProfile',
    component: () => import('../views/StudentProfile.vue'),
    meta: { requiresAuth: true, role: 'student' },
  },
  {
    path: '/student/jobs',
    name: 'StudentJobs',
    component: () => import('../views/StudentJobs.vue'),
    meta: { requiresAuth: true, role: 'student' },
  },
  {
    path: '/student/jobs/:id',
    name: 'JobDetail',
    component: () => import('@/views/JobDetail.vue'),
    meta: { requiresAuth: true, role: 'student' },
  },
  {
    path: '/student/applications',
    name: 'StudentApplications',
    component: () => import('../views/StudentApplications.vue'),
    meta: { requiresAuth: true, role: 'student' },
  },

  // ===== EMPLOYER =====
  {
    path: '/employer',
    name: 'Employer',
    component: () => import('../views/Employer.vue'),
    meta: { requiresAuth: true, role: 'employer' },
  },
  {
    path: '/employer/profile',
    name: 'EmployerProfile',
    component: () => import('../views/EmployerProfile.vue'),
    meta: { requiresAuth: true, role: 'employer' },
  },
  {
    path: '/employer/jobs',
    name: 'EmployerJobs',
    component: () => import('../views/EmployerJobs.vue'),
    meta: { requiresAuth: true, role: 'employer' },
  },
  {
    path: '/employer/jobs/create',
    name: 'JobCreate',
    component: () => import('../views/JobCreate.vue'),
    meta: { requiresAuth: true, role: 'employer' },
  },
  {
    path: '/employer/jobs/:jobId/edit',
    name: 'JobEdit',
    component: () => import('../views/JobEdit.vue'),
    meta: { requiresAuth: true, role: 'employer' },
  },
  {
    path: '/employer/applications',
    name: 'EmployerApplicationsAll',
    component: () => import('../views/EmployerApplications.vue'),
    meta: { requiresAuth: true, role: 'employer' },
  },
  {
    path: '/employer/applications/:jobId',
    name: 'EmployerApplicationsByJob',
    component: () => import('../views/EmployerApplications.vue'),
    meta: { requiresAuth: true, role: 'employer' },
  },

  // ===== ADMIN =====
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/profile',
    name: 'AdminProfile',
    component: () => import('../views/AdminProfile.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/employers',
    name: 'AdminEmployers',
    component: () => import('../views/AdminEmployers.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/AdminUsers.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/jobs',
    name: 'AdminJobs',
    component: () => import('../views/AdminJobs.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: () => import('../views/AdminReports.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },

  { path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const { token, user, isAuthenticated } = getAuthState();

  // Trường hợp token có nhưng user lỗi / thiếu role -> clear luôn
  if (token && (!user || !user.role)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // 1) Route cần đăng nhập
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      return next('/login');
    }

    if (to.meta.role && to.meta.role !== user.role) {
      return next(getDashboardPathByRole(user.role));
    }

    return next();
  }

  // 2) Route chỉ dành cho khách / landing guest
  if (to.meta.guest || to.meta.guestLanding) {
    if (isAuthenticated) {
      return next(getDashboardPathByRole(user.role));
    }
    return next();
  }

  // 3) Route public bình thường
  return next();
});

export default router;