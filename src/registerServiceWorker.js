// Minimal registration helper for vite-plugin-pwa generated SW
export async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      // console.log('Service worker registered', reg)
    } catch (err) {
      // console.warn('Service worker registration failed', err)
    }
  }
}
