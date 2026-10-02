/* Shared lifecycle: decorative work runs only while it can be seen. */
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const watchers = new Set();
  const sheet = document.getElementById('navSheet');
  let pageHidden = false;
  const state = visible => ({
    visible,
    reduced: preference.matches,
    hidden: document.hidden || pageHidden,
    menuOpen: !!sheet?.classList.contains('is-open'),
    active: visible && !preference.matches && !document.hidden && !pageHidden && !sheet?.classList.contains('is-open')
  });
  const refresh = () => watchers.forEach(watcher => watcher());
  preference.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pagehide', () => { pageHidden = true; refresh(); });
  window.addEventListener('pageshow', () => { pageHidden = false; refresh(); });
  if (sheet) new MutationObserver(refresh).observe(sheet, { attributes: true, attributeFilter: ['class'] });

  function observe(element, callback) {
    const rect = element.getBoundingClientRect();
    let visible = rect.bottom > 0 && rect.top < innerHeight;
    let disposed = false;
    let last = '';
    function notify() {
      if (disposed) return;
      const next = state(visible);
      const signature = JSON.stringify(next);
      if (signature === last) return;
      last = signature;
      element.classList.toggle('interaction-paused', !next.active);
      callback(next);
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      notify();
    }, { threshold: 0 });
    observer.observe(element);
    watchers.add(notify);
    queueMicrotask(notify);
    return () => { disposed = true; observer.disconnect(); watchers.delete(notify); };
  }

  function loop(element, render) {
    let active = false;
    let frame = 0;
    let previous = 0;
    let elapsed = 0;
    let disposed = false;
    const draw = delta => render({ time: elapsed, delta, active, reduced: preference.matches });
    function tick(now) {
      frame = 0;
      if (!active || disposed) return;
      const delta = previous ? Math.min((now - previous) / 1000, .05) : 0;
      previous = now;
      elapsed += delta;
      draw(delta);
      frame = requestAnimationFrame(tick);
    }
    const unobserve = observe(element, next => {
      active = next.active;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (active) frame = requestAnimationFrame(tick);
      else if (next.visible && !next.hidden && !next.menuOpen) draw(0);
    });
    return {
      get active() { return active; },
      invalidate() { if (!disposed && !active) draw(0); },
      destroy() { disposed = true; active = false; cancelAnimationFrame(frame); unobserve(); }
    };
  }
  window.DeonaeunMotion = { get reduced() { return preference.matches; }, observe, loop };
})();
