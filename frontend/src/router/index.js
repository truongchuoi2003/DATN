import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import { authStorage } from '../utils/authStorage'

function getDashboardPathByRole(role) {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'employer':
      return '/employer'
    case 'student':
      return '/student'
    default:
      return '/home'
  }
}

function getAuthState() {
  const token = authStorage.getToken()
  const user = authStorage.getUser()
  const isAuthenticated = !!token && !!user && !!user.role

  return { token, user, isAuthenticated }
}

const routes = [
  {
    path: '/',
    name: 'RootEntry',
    redirect: () => {
      const { isAuthenticated, user } = getAuthState()
      return isAuthenticated ? getDashboardPathByRole(user.role) : '/home'
    },
  },

  {
    path: '/home',
    name: 'PublicJobs',
    component: () => import('../views/PublicJobs.vue'),
  },
  {
    path: '/jobs/public',
    redirect: '/home',
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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const { token, user, isAuthenticated } = getAuthState()

  if (token && (!user || !user.role)) {
    authStorage.clear()
  }

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      return next('/login')
    }

    if (to.meta.role && to.meta.role !== user.role) {
      return next(getDashboardPathByRole(user.role))
    }

    return next()
  }

  if (to.meta.guest) {
    if (isAuthenticated) {
      return next(getDashboardPathByRole(user.role))
    }
    return next()
  }

  return next()
})

export default router