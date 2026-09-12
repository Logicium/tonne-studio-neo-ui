import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue') },
    { path: '/work', name: 'work', component: () => import('@/pages/WorkPage.vue') },
    { path: '/work/:slug', name: 'project', component: () => import('@/pages/ProjectPage.vue') },
    { path: '/studio', name: 'studio', component: () => import('@/pages/StudioPage.vue') },
    { path: '/contact', name: 'contact', component: () => import('@/pages/ContactPage.vue') },
    // Working page for choosing Fig. 02 clips. Not linked from the site.
    { path: '/picker', name: 'picker', component: () => import('@/pages/PickerPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  // The curtain in App.vue owns the scroll position on navigation.
  scrollBehavior: () => false,
})

export default router
