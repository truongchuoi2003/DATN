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
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
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