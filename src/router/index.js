import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/new-request',
      name: 'NewRequest',
      component: () => import('@/views/NewRequest.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/history',
      name: 'RequestHistory',
      component: () => import('@/views/RequestHistory.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/samples',
      name: 'Samples',
      component: () => import('@/views/Samples.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/Settings.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const userData = localStorage.getItem('userData')
  const isAuthenticated = !!userData
  
  // Allow access to login page without auth
  if (to.path === '/login') {
    if (isAuthenticated) {
      next('/')
    } else {
      next()
    }
    return
  }
  
  // Protected routes require authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
