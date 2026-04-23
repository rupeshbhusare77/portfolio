/* ===========================
   CURSOR GLOW
=========================== */
const glow = document.getElementById('cursorGlow');
let mx = 0, my = 0, gx = 0, gy = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function animGlow() {
  gx += (mx - gx) * 0.12;
  gy += (my - gy) * 0.12;
  if (glow) { glow.style.left = gx + 'px'; glow.style.top = gy + 'px'; }
  requestAnimationFrame(animGlow);
})();

/* ===========================
   SIDEBAR
=========================== */
const hamburger = document.getElementById('hamburger');
const sidebar   = document.getElementById('sidebar');
const overlay   = document.getElementById('sidebarOverlay');

function openNav()  { sidebar.classList.add('open'); overlay.classList.add('active'); hamburger.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeNav() { sidebar.classList.remove('open'); overlay.classList.remove('active'); hamburger.classList.remove('active'); document.body.style.overflow = ''; }

hamburger.addEventListener('click', e => { e.stopPropagation(); sidebar.classList.contains('open') ? closeNav() : openNav(); });
overlay.addEventListener('click', closeNav);
document.querySelectorAll('.nav-link[href^="#"]').forEach(l => l.addEventListener('click', () => { if (window.innerWidth < 960) closeNav(); }));

/* ===========================
   ACTIVE NAV
=========================== */
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
const sections = document.querySelectorAll('section[id]');

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const a = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
      if (a) a.classList.add('active');
    }
  });
}, { threshold: 0.35, rootMargin: '-5% 0px -5% 0px' });
sections.forEach(s => io.observe(s));

/* ===========================
   REVEAL ON SCROLL
=========================== */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* stagger grids */
const gridObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.project-card, .skill-card').forEach((c, i) => {
      c.classList.add('reveal');
      setTimeout(() => c.classList.add('visible'), i * 75);
    });
    gridObs.unobserve(e.target);
  });
}, { threshold: 0.05 });
document.querySelectorAll('.projects-grid, .skills-grid').forEach(g => gridObs.observe(g));

/* ===========================
   GALLERY CAROUSEL
=========================== */
const track    = document.getElementById('galleryTrack');
const wrapper  = document.getElementById('galleryWrapper');
const prevBtn  = document.getElementById('galleryPrev');
const nextBtn  = document.getElementById('galleryNext');
const dotsWrap = document.getElementById('galleryDots');
const artCards = track ? Array.from(track.querySelectorAll('.art-card')) : [];

let cur = 0;

function cardWidth() {
  return artCards[0] ? artCards[0].getBoundingClientRect().width + 20 : 195;
}

function buildDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = '';
  artCards.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'gallery-dot' + (i === cur ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });
}

function updateDots() {
  if (!dotsWrap) return;
  dotsWrap.querySelectorAll('.gallery-dot').forEach((d, i) => d.classList.toggle('active', i === cur));
}

function goTo(idx) {
  cur = Math.max(0, Math.min(idx, artCards.length - 1));
  const card = artCards[cur];
  if (!card) return;
  /* offset: card's left edge minus wrapper left minus gap offset */
  const wRect = wrapper.getBoundingClientRect();
  const cRect = card.getBoundingClientRect();
  const currentOffset = parseFloat(track.style.transform.replace('translateX(', '').replace('px)', '') || 0);
  const newOffset = currentOffset - (cRect.left - wRect.left) + 12;
  track.style.transform = `translateX(${newOffset}px)`;
  updateDots();
}

/* drag / swipe */
let dragStartX = 0, dragging = false;
if (wrapper) {
  wrapper.addEventListener('mousedown', e => { dragging = true; dragStartX = e.clientX; wrapper.classList.add('grabbing'); });
  window.addEventListener('mouseup', e => {
    if (!dragging) return; dragging = false; wrapper.classList.remove('grabbing');
    const dx = dragStartX - e.clientX;
    if (Math.abs(dx) > 45) goTo(dx > 0 ? cur + 1 : cur - 1);
  });
  wrapper.addEventListener('touchstart', e => { dragStartX = e.touches[0].clientX; }, { passive: true });
  wrapper.addEventListener('touchend', e => {
    const dx = dragStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) goTo(dx > 0 ? cur + 1 : cur - 1);
  }, { passive: true });
}

if (prevBtn) prevBtn.addEventListener('click', () => goTo(cur - 1));
if (nextBtn) nextBtn.addEventListener('click', () => goTo(cur + 1));

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') goTo(cur - 1);
  if (e.key === 'ArrowRight') goTo(cur + 1);
});

window.addEventListener('resize', () => { track.style.transform = 'translateX(0)'; cur = 0; updateDots(); });

if (artCards.length) { buildDots(); }

/* ===========================
   ART MODAL
=========================== */
const modal    = document.getElementById('art-modal');
const modalImg = document.getElementById('modalImg');
const modalClose = document.getElementById('modalClose');

artCards.forEach(card => {
  card.addEventListener('click', () => {
    const img = card.dataset.img;
    if (!img) return;
    modalImg.style.backgroundImage = `url('${img}')`;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeModal() { modal.classList.remove('open'); document.body.style.overflow = ''; }
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
if (modalClose) modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
