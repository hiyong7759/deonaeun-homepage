/* One illustration changes with the original five process steps. */
(() => {
  const section = document.getElementById('process');
  const flow = section?.querySelector('.process-flow');
  const originalSteps = [...(flow?.querySelectorAll('.process-step') || [])];
  if (originalSteps.length !== 5 || flow.dataset.sceneReady) return;
  const stages = originalSteps.map((step, index) => ({
    name: step.querySelector('h4').textContent.trim(),
    description: step.querySelector('p').textContent.trim(),
    key: ['analysis', 'design', 'build', 'verify', 'operate'][index]
  }));
  const artwork = document.createElement('div');
  artwork.className = 'process-art';
  artwork.setAttribute('aria-hidden', 'true');
  artwork.innerHTML = `
    <svg class="process-art__svg" viewBox="0 0 760 390" focusable="false">
      <defs>
        <radialGradient id="process-scene-light"><stop stop-color="#f3d8ba" stop-opacity=".36"/><stop offset="1" stop-color="#f3d8ba" stop-opacity="0"/></radialGradient>
        <linearGradient id="process-scene-paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffefa"/><stop offset="1" stop-color="#f6f3ea"/></linearGradient>
        <filter id="process-scene-shadow" x="-35%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="12" stdDeviation="13" flood-color="#3b3329" flood-opacity=".085"/></filter>
        <pattern id="process-scene-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#b4ad9f" stroke-width=".5" opacity=".23"/></pattern>
        <clipPath id="process-scene-lens-clip"><circle cx="531" cy="211" r="55"/></clipPath>
      </defs>
      <ellipse cx="382" cy="219" rx="334" ry="169" fill="url(#process-scene-light)"/>
      <rect class="process-art__blueprint" x="95" y="26" width="568" height="332" rx="20" fill="url(#process-scene-grid)"/>
      <g class="process-art__guides" fill="none" stroke="#b7b3a8" stroke-width="1" stroke-dasharray="3 5"><path d="M170 28V351 M622 28V351 M143 65H651 M143 323H651"/><path d="M172 40H620 M148 66V323" stroke-dasharray="none"/><path d="M172 36V44 M620 36V44 M144 66H152 M144 323H152" stroke-dasharray="none"/></g>
      <path class="process-art__orbit" d="M122 168C122 67 600 27 657 136C720 254 633 358 358 350C117 343 50 277 122 168Z" fill="none" stroke="#d5b89b" stroke-width="1"/>
      <g class="process-art__app">
        <rect class="process-art__frame" x="170" y="64" width="452" height="260" rx="17"/>
        <path class="process-art__topline" d="M171 99H621"/>
        <g class="process-art__chrome"><circle cx="190" cy="82" r="3" fill="#e68f55"/><circle cx="201" cy="82" r="3" fill="#d5d1c7"/><circle cx="212" cy="82" r="3" fill="#d5d1c7"/><rect x="244" y="78" width="109" height="7" rx="3.5" fill="#c8c7bf"/><rect x="556" y="77" width="43" height="9" rx="4.5" fill="#ece7dc"/></g>
      </g>
      <g class="process-art__design-lines" fill="none" stroke="#b9a791" stroke-width="1.2" stroke-dasharray="3 5"><path d="M309 170H345 M309 263H345 M467 192V211"/><circle cx="309" cy="170" r="3" fill="#f1e5d5"/><circle cx="345" cy="170" r="3" fill="#f1e5d5"/></g>
      <g class="process-art__module" data-module="0"><rect class="process-art__module-bg" rx="12"/><path class="process-art__paper-fold"/><rect class="process-art__accent" x="17" y="21" width="4" height="15" rx="2"/><text class="process-art__module-title" x="30" y="33"></text><path class="process-art__wire"/><g class="process-art__content"><rect class="process-art__bar process-art__bar--one" x="17" y="55" height="6" rx="3"/><rect class="process-art__bar process-art__bar--two" x="17" y="72" height="5" rx="2.5"/><rect class="process-art__bar process-art__bar--three" x="17" y="89" height="5" rx="2.5"/><rect class="process-art__block" x="17" y="112" height="21" rx="6"/></g></g>
      <g class="process-art__module" data-module="1"><rect class="process-art__module-bg" rx="12"/><path class="process-art__paper-fold"/><rect class="process-art__accent" x="17" y="21" width="4" height="15" rx="2"/><text class="process-art__module-title" x="30" y="33"></text><path class="process-art__wire"/><g class="process-art__content"><rect class="process-art__bar process-art__bar--one" x="17" y="55" height="6" rx="3"/><rect class="process-art__bar process-art__bar--two" x="17" y="72" height="5" rx="2.5"/><rect class="process-art__bar process-art__bar--three" x="17" y="89" height="5" rx="2.5"/><rect class="process-art__block" x="17" y="112" height="21" rx="6"/></g></g>
      <g class="process-art__module" data-module="2"><rect class="process-art__module-bg" rx="12"/><path class="process-art__paper-fold"/><rect class="process-art__accent" x="17" y="21" width="4" height="15" rx="2"/><text class="process-art__module-title" x="30" y="33"></text><path class="process-art__wire"/><g class="process-art__content"><rect class="process-art__bar process-art__bar--one" x="17" y="55" height="6" rx="3"/><rect class="process-art__bar process-art__bar--two" x="17" y="72" height="5" rx="2.5"/><rect class="process-art__bar process-art__bar--three" x="17" y="89" height="5" rx="2.5"/><rect class="process-art__block" x="17" y="112" height="21" rx="6"/></g></g>
      <g class="process-art__review">
        <path d="M183 107V94H201 M592 94H610V111 M184 294V312H202 M592 312H610V294" fill="none" stroke="#ec995d" stroke-width="2"/>
        <path d="m570 252 49 50" stroke="#38434a" stroke-width="15" stroke-linecap="round"/>
        <circle cx="531" cy="211" r="65" fill="#fffdf6" stroke="#ebaa77" stroke-width="1.5" filter="url(#process-scene-shadow)"/>
        <g clip-path="url(#process-scene-lens-clip)"><rect x="472" y="150" width="125" height="125" fill="#fff9ed"/><path d="M480 179H590 M480 216H590 M480 253H590 M499 160V270 M551 160V270" fill="none" stroke="#e4dbca" stroke-width="1"/><rect x="506" y="187" width="35" height="20" rx="4" fill="#e7ab7c"/><rect x="506" y="224" width="67" height="6" rx="3" fill="#b8bcae"/><path d="M487 166H576" stroke="#33454b" stroke-width="8" stroke-linecap="round"/></g>
        <circle cx="531" cy="211" r="55" fill="none" stroke="#e9ded0"/>
      </g>
      <g class="process-art__operation">
        <path d="M100 193H170 M622 193H680 M397 324V351" fill="none" stroke="#c6b8a7" stroke-width="1.2"/>
        <circle cx="92" cy="193" r="15" fill="#fdfaf3" stroke="#d9c4ac"/><circle cx="687" cy="193" r="15" fill="#fdfaf3" stroke="#d9c4ac"/><circle cx="397" cy="359" r="10" fill="#fdfaf3" stroke="#d9c4ac"/>
        <circle cx="92" cy="193" r="4" fill="#ef9b61"/><circle cx="687" cy="193" r="4" fill="#ef9b61"/><circle cx="397" cy="359" r="3" fill="#ef9b61"/>
        <g class="process-art__signals" fill="none" stroke="#e78243" stroke-width="2.8" stroke-linecap="round" stroke-dasharray="4 96"><path d="M92 193H228V271H467V161H687V193" pathLength="100"/><path d="M92 193H228V271H467V161H687V193" pathLength="100" style="animation-delay:-2.5s"/><path d="M467 271H397V359" pathLength="100" style="animation-delay:-1.5s"/></g>
      </g>
      <circle class="process-art__wave" cx="391" cy="203" r="24" fill="none" stroke="#ed9e63" stroke-width="1" opacity="0"/>
    </svg>`;
  const caption = document.createElement('p');
  caption.className = 'process-caption';
  caption.id = 'process-scene-description';
  caption.setAttribute('aria-live', 'polite');
  caption.setAttribute('aria-atomic', 'true');
  flow.append(artwork, caption);
  const buttons = originalSteps.map((step, index) => {
    const number = step.querySelector('.process-step__node');
    const heading = step.querySelector('h4');
    const description = step.querySelector('p');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'process-label';
    button.setAttribute('aria-controls', caption.id);
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-describedby', `process-source-${index}`);
    button.innerHTML = `<span class="process-label__number">${String(index + 1).padStart(2, '0')}</span><span class="process-label__name"></span>`;
    button.querySelector('.process-label__name').textContent = stages[index].name;
    description.id = `process-source-${index}`;
    description.classList.add('process-source-copy');
    number.remove();
    heading.replaceWith(button);
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', event => {
      const direction = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 };
      let next;
      if (event.key in direction) next = (index + direction[event.key] + 5) % 5;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = 4;
      if (next === undefined) return;
      event.preventDefault();
      buttons[next].focus({ preventScroll: true });
      select(next);
    });
    return button;
  });
  const modules = [...artwork.querySelectorAll('.process-art__module')].map(element => ({
    element,
    background: element.querySelector('.process-art__module-bg'),
    fold: element.querySelector('.process-art__paper-fold'),
    title: element.querySelector('text'),
    wire: element.querySelector('.process-art__wire'),
    bars: [...element.querySelectorAll('.process-art__bar')],
    block: element.querySelector('.process-art__block')
  }));
  const layouts = [
    [{ x: 132, y: 115, w: 151, h: 166, angle: -7 }, { x: 306, y: 76, w: 151, h: 166, angle: 0 }, { x: 480, y: 119, w: 151, h: 166, angle: 7 }],
    [{ x: 187, y: 116, w: 127, h: 191, angle: 0 }, { x: 329, y: 116, w: 276, h: 88, angle: 0 }, { x: 329, y: 219, w: 276, h: 88, angle: 0 }]
  ];
  const values = layouts[0].map(value => ({ ...value }));
  const opacity = { app: 0, blueprint: 0, guides: 0, lines: 0, review: 0, operation: 0, orbit: 0 };
  const layers = {
    app: artwork.querySelector('.process-art__app'), blueprint: artwork.querySelector('.process-art__blueprint'),
    guides: artwork.querySelector('.process-art__guides'), lines: artwork.querySelector('.process-art__design-lines'),
    review: artwork.querySelector('.process-art__review'), operation: artwork.querySelector('.process-art__operation'), orbit: artwork.querySelector('.process-art__orbit')
  };
  const wave = artwork.querySelector('.process-art__wave');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, selected = 0, entered = false, animation;

  function draw(index) {
    const model = modules[index], value = values[index];
    model.element.setAttribute('transform', `translate(${value.x} ${value.y}) rotate(${value.angle} ${value.w / 2} ${value.h / 2})`);
    model.background.setAttribute('width', value.w);
    model.background.setAttribute('height', value.h);
    model.fold.setAttribute('d', `M${value.w - 24} 0V17Q${value.w - 24} 24 ${value.w - 17} 24H${value.w}`);
    model.wire.setAttribute('d', `M17 51H${value.w - 17}V${value.h - 17}H17Z M17 51L${value.w - 17} ${value.h - 17} M${value.w - 17} 51L17 ${value.h - 17}`);
    model.bars.forEach((bar, i) => {
      bar.setAttribute('width', Math.max(20, (value.w - 34) * [.79, .56, .66][i]));
      bar.setAttribute('y', Math.min(55 + i * 17, value.h - 19));
      bar.style.opacity = value.h > 110 || i === 0 ? '1' : '0';
    });
    model.block.setAttribute('width', Math.max(20, value.w - 34));
    model.block.setAttribute('y', value.h - 38);
    model.block.style.opacity = value.h > 120 ? '1' : '0';
  }
  function drawLayers() {
    Object.entries(layers).forEach(([key, layer]) => { layer.style.opacity = opacity[key]; });
  }
  function render(animate = true, entrance = false) {
    animation?.kill(); animation = null;
    flow.dataset.stage = stages[selected].key;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === selected)));
    caption.textContent = stages[selected].description;
    const names = selected === 0 ? ['현황', '요구사항', '범위'] : ['사용자 화면', '업무 기능', '데이터'];
    modules.forEach((module, i) => { module.title.textContent = names[i]; module.element.style.opacity = '1'; });
    const target = layouts[selected === 0 ? 0 : 1];
    const targetOpacity = {
      app: selected === 0 ? .09 : 1,
      blueprint: selected === 1 ? 1 : 0,
      guides: selected === 1 ? 1 : 0,
      lines: selected === 1 || selected === 4 ? 1 : 0,
      review: selected === 3 ? 1 : 0,
      operation: selected === 4 ? 1 : 0,
      orbit: selected === 4 ? .55 : 0
    };
    const moving = animate && active && !reduced.matches && !!window.gsap;
    if (!moving) {
      target.forEach((layout, i) => { Object.assign(values[i], layout); draw(i); });
      Object.assign(opacity, targetOpacity); drawLayers();
      wave.style.opacity = '0';
      layers.review.removeAttribute('transform');
      return;
    }
    animation = window.gsap.timeline({ defaults: { duration: .85, ease: 'power3.inOut' } });
    target.forEach((layout, i) => {
      const destination = { ...layout, onUpdate: () => draw(i) };
      if (entrance) {
        animation.fromTo(values[i], { ...layout, x: layout.x + (i - 1) * 18, y: layout.y + 26, angle: 0 }, destination, i * .09);
        animation.fromTo(modules[i].element, { opacity: 0 }, { opacity: 1, duration: .55, ease: 'power2.out' }, i * .09);
      } else if (selected === 2) {
        animation.fromTo(values[i], { ...layout, x: layout.x + [-72, 65, 95][i], y: layout.y + [14, -42, 47][i], angle: [-5, 4, 5][i] }, destination, i * .095);
        animation.fromTo(modules[i].element, { opacity: .25 }, { opacity: 1, duration: .65 }, i * .095);
      } else animation.to(values[i], destination, i * .065);
    });
    animation.to(opacity, { ...targetOpacity, duration: .65, onUpdate: drawLayers }, 0);
    animation.fromTo(wave, { attr: { r: 20 }, opacity: .2 }, { attr: { r: 285 }, opacity: 0, duration: 1.05, ease: 'power2.out' }, 0);
    if (selected === 3) animation.fromTo(layers.review, { attr: { transform: 'translate(45 -14)' } }, { attr: { transform: 'translate(0 0)' }, duration: .95 }, .1);
  }
  function select(index) {
    if (selected === index) return;
    selected = index;
    render();
  }
  section.classList.add('process-scene-section');
  flow.classList.add('process-scene');
  flow.dataset.sceneReady = 'true';
  flow.dataset.interaction = 'process';
  render(false);
  function sync(state) {
    active = state.active;
    flow.classList.toggle('process-scene-paused', !active);
    if (state.reduced) { entered = true; render(false); }
    else if (active && !entered) { entered = true; render(true, true); }
    else animation?.paused(!active);
  }
  if (window.DeonaeunMotion) window.DeonaeunMotion.observe(flow, sync);
  else {
    let visible = false;
    const menu = document.getElementById('navSheet');
    const update = () => sync({ active: visible && !document.hidden && !reduced.matches && !menu?.classList.contains('is-open'), reduced: reduced.matches });
    if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }).observe(flow);
    else visible = true;
    reduced.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    if (menu) new MutationObserver(update).observe(menu, { attributes: true, attributeFilter: ['class'] });
    update();
  }
})();
