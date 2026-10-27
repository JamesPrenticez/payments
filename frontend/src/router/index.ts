import { computed, ref } from 'vue'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'

const routes = { '/': HomeView, '/about': AboutView }

const path = ref(location.pathname)
addEventListener('popstate', () => (path.value = location.pathname))

// ponytail: unknown paths fall back to Home; add a NotFound view if it matters
export const currentView = computed(() => routes[path.value as keyof typeof routes] ?? HomeView)

export function navigate(to: string) {
  history.pushState({}, '', to)
  path.value = to
}
