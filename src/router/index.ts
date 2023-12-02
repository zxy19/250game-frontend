import { createRouter, createWebHistory } from 'vue-router'
import home from '../views/home.vue'
import gamepadVue from '@/views/gamepad.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: home
    },{
      path: '/game',
      name: 'game',
      component: gamepadVue
    }
  ]
})

export default router
