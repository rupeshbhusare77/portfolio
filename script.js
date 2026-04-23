/* ============================================
   CURSOR GLOW
============================================ */
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top  = e.clientY + 'px';
});

/* ============================================
   HAMBURGER / SIDEBAR
============================================ */
const hamburger      = document.getElementById('hamburger');
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
  hamburger.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
  hamburger.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', (e) => {
  e.stopPropagation();
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
sidebarOverlay.addEventListener('click', closeSidebar);

// Close on nav link click (mobile)
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth < 900) closeSidebar();
  });
});

/* ============================================
   ACTIVE NAV HIGHLIGHT ON SCROLL
============================================ */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4, rootMargin: '-10% 0px -10% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ============================================
   REVEAL ON SCROLL
============================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================
   PROJECT CARDS STAGGER REVEAL
============================================ */
const projectObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const cards = entry.target.querySelectorAll('.project-card, .skill-card');
      cards.forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.07}s`;
        card.classList.add('visible');
      });
      projectObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.projects-grid, .skills-grid').forEach(g => {
  g.querySelectorAll('.project-card, .skill-card').forEach(c => c.classList.add('reveal'));
  projectObserver.observe(g);
});

/* ============================================
   GALLERY CAROUSEL
============================================ */
const track      = document.getElementById('galleryTrack');
const prevBtn    = document.getElementById('galleryPrev');
const nextBtn    = document.getElementById('galleryNext');
const dotsWrap   = document.getElementById('galleryDots');
const cards      = track ? Array.from(track.querySelectorAll('.art-card')) : [];

let currentIndex = 0;
let isDragging = false;
let startX = 0;
let startScrollLeft = 0;

function getVisibleCount() {
  const w = window.innerWidth - (window.innerWidth >= 900 ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-w')) || 260 : 0);
  const cardW = cards[0] ? cards[0].offsetWidth + 20 : 210;
  return Math.max(1, Math.floor(w / cardW));
}

function buildDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = '';
  const total = cards.length;
  for (let i = 0; i < total; i++) {
    const d = document.createElement('button');
    d.className = 'gallery-dot' + (i === currentIndex ? ' active' : '');
    d.setAttribute('aria-label', `Go to slide ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  }
}

function updateDots() {
  if (!dotsWrap) return;
  dotsWrap.querySelectorAll('.gallery-dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentIndex);
  });
}

function goTo(index) {
  currentIndex = Math.max(0, Math.min(index, cards.length - 1));
  const card = cards[currentIndex];
  if (card) {
    const gap = 20;
    const offset = card.offsetLeft - gap;
    track.style.transform = `translateX(-${offset}px)`;
  }
  updateDots();
}

if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

// Drag / swipe on gallery wrapper
const wrapper = track ? track.parentElement : null;
if (wrapper) {
  wrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startScrollLeft = currentIndex;
    wrapper.style.userSelect = 'none';
  });
  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    wrapper.style.userSelect = '';
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
    }
  });

  // Touch
  wrapper.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startScrollLeft = currentIndex;
  }, { passive: true });
  wrapper.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
    }
  }, { passive: true });
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft')  goTo(currentIndex - 1);
  if (e.key === 'ArrowRight') goTo(currentIndex + 1);
});

window.addEventListener('resize', () => goTo(currentIndex));
if (cards.length) { buildDots(); goTo(0); }

/* ============================================
   ART MODAL
============================================ */
const artModal = document.getElementById('art-modal');
const modalImg = document.getElementById('modalImg');

document.querySelectorAll('.art-card').forEach(card => {
  card.addEventListener('click', () => {
    const imgEl  = card.querySelector('.art-img');
    const title  = card.dataset.title || '';
    const desc   = card.dataset.desc  || '';
    modalImg.style.backgroundImage = imgEl.style.backgroundImage;
    artModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

artModal.addEventListener('click', (e) => {
  if (e.target === artModal || e.target.closest('.art-modal-close')) {
    artModal.classList.remove('open');
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && artModal.classList.contains('open')) {
    artModal.classList.remove('open');
    document.body.style.overflow = '';
  }
});
