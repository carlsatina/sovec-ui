import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'
import router from './router'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: 'DARK' }).catch(() => null)
  StatusBar.setBackgroundColor({ color: '#f6f8f7' }).catch(() => null)
  Keyboard.setResizeMode({ mode: 'native' }).catch(() => null)
}
