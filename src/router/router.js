import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"
import Error404View from "../views/Error404View.vue"


const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView
    },
    {
        path: '/home',
        redirect: '/'
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: Error404View
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router