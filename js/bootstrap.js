import { recruitment } from './site-config.js';

async function fragment(name) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(new URL(`../includes/${name}.html`, import.meta.url), { signal: controller.signal });
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    const template = document.createElement('template');
    template.innerHTML = await response.text();
    return template.content;
  } finally {
    clearTimeout(timeout);
  }
}

async function include(name) {
  const slot = document.querySelector(`[data-include="${name}"]`);
  try {
    slot.replaceWith(await fragment(name));
  } catch (error) {
    // Keep the inline email/telephone usable when JavaScript works but fetch fails.
    slot.dataset.failed = 'true';
    console.warn('공통 영역을 불러오지 못했습니다.', error);
  }
}

await Promise.all([include('header'), include('footer')]);
const page = document.body.dataset.page;
const currentPath = page === 'home' ? './' : `./${page}.html`;
document.querySelectorAll('.nav__links a, .nav__sheet > a').forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
  if (page === 'home' && link.getAttribute('href') === './') link.href = '#hero';
});
if (page === 'home' && document.querySelector('.nav__logo')) document.querySelector('.nav__logo').href = '#hero';
document.querySelectorAll('[data-current-year]').forEach(node => { node.textContent = new Date().getFullYear(); });

// Initialize motion only after the common mobile menu exists.
await import('./site.js');

if (page === 'home' && recruitment.url) {
  try {
    const content = await fragment('recruitment');
    for (const key of ['title', 'description']) content.querySelector(`[data-recruitment="${key}"]`).textContent = recruitment[key];
    content.querySelector('[data-recruitment-link]').href = recruitment.url;
    document.getElementById('recruitmentSlot').replaceWith(content);
  } catch (error) {
    console.warn('채용 안내를 불러오지 못했습니다.', error);
  }
}
