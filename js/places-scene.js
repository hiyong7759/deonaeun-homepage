const { gsap } = window;
(() => {
  'use strict';
  const runtime = window.DeonaeunMotion;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const ns = 'http://www.w3.org/2000/svg';
  const svgNode = (name, attrs) => {
    const node = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };
  const host = document.querySelector('.partners-scene');
  if (host && gsap) {
    const svg = host.querySelector('svg');
    const buttons = [...host.querySelectorAll('[data-partner]')];
    const signal = host.querySelector('.partners-scene__signal');
    const glow = host.querySelector('.partners-scene__signal-glow');
    const flash = host.querySelector('.partners-scene__hub-flash');
    const wave = host.querySelector('.partners-scene__wave');
    const echo = host.querySelector('.partners-scene__wave-echo');
    const role = host.querySelector('.partners-scene__role');
    let active = false, current = null, signalTween, clearTimer;
    const records = new Map(buttons.map(button => {
      const id = button.dataset.partner;
      const path = host.querySelector(`[data-partner-path="${id}"]`);
      return [id, { button, path, length: path.getTotalLength(), art: host.querySelector(`[data-partner-art="${id}"]`) }];
    }));
    function stopSignal() {
      signalTween?.kill(); signalTween = null;
      gsap.killTweensOf(flash);
      gsap.set([signal, glow, flash], { opacity: 0 });
    }
    function runSignal(record) {
      stopSignal();
      if (!active || reduced.matches) return;
      const progress = { value: 0 };
      gsap.set(signal, { opacity: 1 }); gsap.set(glow, { opacity: .85 });
      signalTween = gsap.to(progress, {
        value: 1, duration: 1.35, repeat: -1, repeatDelay: .25, ease: 'power1.inOut',
        onUpdate() {
          const point = record.path.getPointAtLength(record.length * progress.value);
          [signal, glow].forEach(node => { node.setAttribute('cx', point.x); node.setAttribute('cy', point.y); });
          if (progress.value > .9) flash.setAttribute('opacity', ((progress.value - .9) * 5).toFixed(2));
        },
        onRepeat() { gsap.fromTo(flash, { opacity: .5 }, { opacity: 0, duration: .7 }); }
      });
    }
    function select(id, announce = false) {
      clearTimeout(clearTimer);
      if (current === id) return;
      current = id;
      records.forEach((record, key) => {
        const selected = key === id;
        record.path.classList.toggle('is-active', selected);
        gsap.to(record.art, { y: selected && active && !reduced.matches ? -6 : 0, duration: active ? .45 : 0, ease: 'power3.out', overwrite: true });
        gsap.to(record.art.querySelector('.partners-scene__plate-light'), { opacity: selected ? .9 : 0, duration: active ? .35 : 0, overwrite: true });
      });
      const record = records.get(id);
      role.textContent = record ? record.button.dataset.partnerRole : '공공 정보화 파트너십';
      if (announce && record) host.querySelector('#partners-scene-status').textContent = record.button.getAttribute('aria-label');
      if (record) runSignal(record); else stopSignal();
    }
    function clear() { select(null); }
    buttons.forEach(button => {
      button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') select(button.dataset.partner); });
      button.addEventListener('pointerleave', () => { if (document.activeElement !== button) clearTimer = setTimeout(clear, 180); });
      button.addEventListener('focus', () => select(button.dataset.partner, true));
      button.addEventListener('blur', () => clearTimer = setTimeout(clear, 180));
      button.addEventListener('click', () => { select(button.dataset.partner, true); clearTimer = setTimeout(clear, 3600); });
    });
    host.addEventListener('pointermove', event => {
      if (!active || !fine.matches || event.pointerType === 'touch') return;
      const rect = host.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      gsap.to(svg, { rotationY: x * 9, rotationX: -y * 7, x: x * 5, y: y * 4, duration: .65, ease: 'power3.out', overwrite: true });
    }, { passive: true });
    host.addEventListener('pointerleave', () => {
      gsap.to(svg, { rotationX: 0, rotationY: 0, x: 0, y: 0, duration: active ? .65 : 0, overwrite: true });
      if (!host.contains(document.activeElement)) clearTimer = setTimeout(clear, 180);
    });
    host.addEventListener('click', event => {
      if (!active || reduced.matches) return;
      const rect = svg.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width * 520;
      const y = (event.clientY - rect.top) / rect.height * 520;
      [wave, echo].forEach(node => { node.setAttribute('cx', x); node.setAttribute('cy', y); });
      gsap.fromTo(wave, { attr: { r: 5 }, opacity: .8 }, { attr: { r: 240 }, opacity: 0, duration: 1.45, ease: 'power2.out', overwrite: true });
      gsap.fromTo(echo, { attr: { r: 5 }, opacity: .55 }, { attr: { r: 205 }, opacity: 0, duration: 1.5, delay: .15, ease: 'power2.out', overwrite: true });
    });
    runtime?.observe(host, state => {
      active = state.active;
      if (!active) {
        stopSignal(); gsap.killTweensOf([svg, wave, echo]);
        gsap.set(svg, { rotationX: 0, rotationY: 0, x: 0, y: 0 });
        gsap.set([wave, echo], { opacity: 0 });
        records.forEach((record, key) => { gsap.killTweensOf([record.art, record.art.querySelector('.partners-scene__plate-light')]); gsap.set(record.art, { y: 0 }); gsap.set(record.art.querySelector('.partners-scene__plate-light'), { opacity: key === current ? .9 : 0 }); });
      } else if (current) runSignal(records.get(current));
    });
  }

  const map = document.querySelector('.location-map');
  if (map) {
    const stage = document.createElement('div'); stage.className = 'places-map-stage'; stage.dataset.scene = 'location';
    map.before(stage); stage.append(map);
    map.setAttribute('role', 'group');
    const tooltip = document.createElement('div'); tooltip.className = 'places-map-tooltip';
    tooltip.setAttribute('role', 'status'); tooltip.setAttribute('aria-live', 'polite');
    const name = document.createElement('strong'), address = document.createElement('span');
    tooltip.append(name, address); stage.append(tooltip);
    const places = [...map.querySelectorAll('.location-map__place')].map((node, index) => {
      const point = node.querySelector('circle');
      const x = Number(point.getAttribute('cx')), y = Number(point.getAttribute('cy'));
      const halo = svgNode('circle', { class: 'places-map__halo', cx: x, cy: y, r: 25 });
      const ring = svgNode('circle', { class: 'places-map__ring', cx: x, cy: y, r: 20 });
      node.insertBefore(halo, point); node.insertBefore(ring, point);
      const title = node.querySelector('title').textContent.split(' · ');
      node.setAttribute('role', 'button'); node.setAttribute('tabindex', '-1');
      node.setAttribute('aria-label', `${node.dataset.place}, ${title.slice(1).join(' · ')}`);
      return { node, x, y, halo, ring, name: node.dataset.place, address: title.slice(1).join(' · '), index };
    });
    let current = null, active = false, hideTimer;
    const legend = [...document.querySelectorAll('.location-map__key li')].map((li, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'places-map__legend-hit';
      while (li.firstChild) button.append(li.firstChild);
      li.append(button);
      button.addEventListener('click', () => { show(places[index], true); hideTimer = setTimeout(hide, 4000); });
      button.addEventListener('focus', () => show(places[index]));
      button.addEventListener('blur', () => hideTimer = setTimeout(hide, 120));
      return button;
    });
    function position(record) {
      const width = stage.clientWidth, height = map.getBoundingClientRect().height;
      const px = record.x / 760 * width, py = record.y / 710 * height;
      const w = tooltip.offsetWidth, h = tooltip.offsetHeight;
      let left = px + 17;
      if (left + w > width - 12) left = px - w - 17;
      left = Math.max(12, Math.min(width - w - 12, left));
      const top = Math.max(12, Math.min(height - h - 12, py - h - 17));
      tooltip.style.left = `${left}px`; tooltip.style.top = `${top}px`;
    }
    function hide() {
      clearTimeout(hideTimer); current = null;
      places.forEach(record => {
        record.node.classList.remove('is-active');
        if (gsap) { gsap.killTweensOf([record.halo, record.ring]); gsap.to([record.halo, record.ring], { opacity: 0, duration: active ? .3 : 0 }); }
      });
      legend.forEach(button => button.classList.remove('is-active'));
      if (gsap) gsap.to(tooltip, { autoAlpha: 0, y: 3, duration: active ? .18 : 0, overwrite: true });
      else { tooltip.style.opacity = '0'; tooltip.style.visibility = 'hidden'; }
    }
    function show(record, pulse = false) {
      if (!record) return;
      clearTimeout(hideTimer);
      const changed = current !== record;
      current = record;
      places.forEach(item => {
        const selected = item === record;
        item.node.classList.toggle('is-active', selected);
        item.node.setAttribute('tabindex', selected ? '0' : '-1');
        if (gsap) gsap.to(item.halo, { opacity: selected ? .22 : 0, duration: active ? .3 : 0, overwrite: true });
        if (gsap) gsap.to(item.ring, { opacity: selected ? .9 : 0, duration: active ? .25 : 0, overwrite: true });
      });
      legend.forEach((button, index) => button.classList.toggle('is-active', places[index] === record));
      name.textContent = record.name; address.textContent = `충청북도 ${record.address}`;
      position(record);
      if (gsap) gsap.to(tooltip, { autoAlpha: 1, y: 0, duration: active ? .22 : 0, overwrite: true });
      else { tooltip.style.opacity = '1'; tooltip.style.visibility = 'visible'; }
      if ((changed || pulse) && active && gsap) gsap.fromTo(record.ring, { attr: { r: 14 } }, { attr: { r: 24 }, duration: .55, ease: 'power2.out', overwrite: 'auto' });
    }
    function nearest(event) {
      const rect = map.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width * 760;
      const y = (event.clientY - rect.top) / rect.height * 710;
      const sorted = places.map(record => ({ record, d: Math.hypot(record.x - x, record.y - y) })).sort((a, b) => a.d - b.d);
      return sorted[0]?.d < (event.pointerType === 'touch' ? 34 : 25) ? sorted[0].record : null;
    }
    map.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const record = nearest(event);
      if (record) show(record); else if (current) hideTimer = setTimeout(hide, 120);
    }, { passive: true });
    map.addEventListener('pointerleave', () => { if (!map.contains(document.activeElement)) hideTimer = setTimeout(hide, 160); });
    map.addEventListener('click', event => {
      const record = nearest(event);
      if (record) { show(record, true); hideTimer = setTimeout(hide, 4000); } else hide();
    });
    places.forEach((record, index) => {
      record.node.addEventListener('focus', () => show(record));
      record.node.addEventListener('blur', () => hideTimer = setTimeout(hide, 120));
      record.node.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); show(record, true); }
        else if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) {
          event.preventDefault();
          const next = (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + places.length) % places.length;
          places[next].node.focus({ preventScroll: true });
        } else if (event.key === 'Escape') hide();
      });
    });
    places.at(-1).node.setAttribute('tabindex', '0');
    new ResizeObserver(() => { if (current) position(current); }).observe(stage);
    runtime?.observe(stage, state => {
      active = state.active;
      if (state.hidden || !state.visible || state.menuOpen) hide();
      if (state.reduced && gsap) places.forEach(record => gsap.killTweensOf([record.halo, record.ring]));
    });
  }
})();
