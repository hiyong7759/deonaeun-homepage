import './motion-runtime.js';
import './hero-motion.js';
if (document.getElementById('navBurger')) await import('./navigation.js');

// Load each scene only on its page; Three.js remains a separate local module.
const page = document.body.dataset.page;
// GSAP's browser distribution is a classic script, not an ES module.
function loadGsap() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('../assets/vendor/gsap.min.js', import.meta.url).href;
    script.onload = resolve;
    script.onerror = () => reject(new Error('GSAP 로드 실패'));
    document.head.append(script);
  });
}
async function startScenes() {
  if (page === 'home') {
    await Promise.all([import('./home-scene.js'), loadGsap().then(() => import('./process-scene.js'))]);
  } else if (page === 'services') {
    await import('./services-scene.js');
  } else if (page === 'location') {
    await Promise.all([loadGsap().then(() => import('./places-scene.js')), import('./kakao-map.js')]);
  } else {
    await loadGsap();
    await import('./places-scene.js');
  }
}
startScenes().catch(error => console.error('장면 초기화 실패:', error));
