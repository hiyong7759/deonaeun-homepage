const nav = document.getElementById('nav');
const burger = document.getElementById('navBurger');
const sheet = document.getElementById('navSheet');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 981px)');
const setSheet = open => {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  sheet.classList.toggle('is-open', open);
  sheet.setAttribute('aria-hidden', String(!open));
  sheet.inert = !open;
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => setSheet(!sheet.classList.contains('is-open')));
sheet.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setSheet(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && sheet.classList.contains('is-open')) { setSheet(false); burger.focus(); }
});
desktop.addEventListener('change', ({matches}) => { if (matches) setSheet(false); });

const sideNav = document.getElementById('sideNav');
const dots = [...sideNav.querySelectorAll('[data-target]')];
const sections = dots.map(dot => document.getElementById(dot.dataset.target));
const dark = new Set(document.body.dataset.darkSections.split(','));
const offset = Number(document.body.dataset.scrollOffset);
for (const dot of dots) dot.addEventListener('click', () => {
  const section = document.getElementById(dot.dataset.target);
  if (section) window.scrollTo({top: section.offsetTop - offset, behavior: reduced.matches ? 'instant' : 'smooth'});
});
function update() {
  nav.classList.toggle('scrolled', scrollY > 8);
  const probe = scrollY + innerHeight * .35;
  let active = sections[0];
  for (const section of sections) if (section && section.offsetTop - offset <= probe) active = section;
  for (const dot of dots) {
    const selected = dot.dataset.target === active?.id;
    dot.classList.toggle('active', selected);
    if (selected) dot.setAttribute('aria-current', 'location'); else dot.removeAttribute('aria-current');
  }
  sideNav.classList.toggle('is-dark', dark.has(active?.id));
}
addEventListener('scroll', update, {passive: true});
addEventListener('resize', update);
update();

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); }
}, {threshold: .08});
document.querySelectorAll('.section,.cta,.hero__stats,.marquee-section,.cat-section,.end-cta,.lead-section,.partners-section,.connection-note,.map-section,.info-section,.dir-section,.visit-cta').forEach(element => {
  if (!reduced.matches) { element.classList.add('reveal'); observer.observe(element); }
});
