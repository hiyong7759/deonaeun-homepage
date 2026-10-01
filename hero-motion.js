/* Decorative motion stops when the hero is hidden or reduced motion is requested. */
(() => {
  const hero = document.querySelector('#hero');
  if (!hero) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const svgs = [...hero.querySelectorAll('svg')];
  let visible = true;
  function syncMotion() {
    const paused = preference.matches || document.hidden || !visible;
    hero.classList.toggle('hero-motion-paused', paused);
    svgs.forEach(svg => {
      if (typeof svg.pauseAnimations !== 'function') return;
      if (paused) {
        svg.pauseAnimations();
        if (preference.matches) svg.setCurrentTime(0);
      } else {
        svg.unpauseAnimations();
      }
    });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncMotion();
    }).observe(hero);
  }
  preference.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  syncMotion();
})();
