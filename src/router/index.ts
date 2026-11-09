import { createRouter, createWebHistory } from 'vue-router'
import { notFoundRoute, publicRoutes } from '@/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...publicRoutes,
    // Working page for choosing Fig. 02 clips. Not linked from the site, never indexed.
    { path: '/picker', name: 'picker', component: () => import('@/pages/PickerPage.vue') },
    notFoundRoute,
  ],
  // The curtain in App.vue owns the scroll position on navigation.
  scrollBehavior: () => false,
})

export default router
