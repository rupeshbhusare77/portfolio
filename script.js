/* ═══════════════════════════
   CURSOR GLOW
═══════════════════════════ */
const glow = document.getElementById('cursorGlow');
let mx=0,my=0,gx=0,gy=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
(function tick(){
  gx+=(mx-gx)*0.1; gy+=(my-gy)*0.1;
  if(glow){glow.style.left=gx+'px';glow.style.top=gy+'px';}
  requestAnimationFrame(tick);
})();

/* ═══════════════════════════
   SIDEBAR
═══════════════════════════ */
const burger  = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');

function openSidebar(){
  sidebar.classList.add('open');
  overlay.classList.add('active');
  burger.classList.add('active');
  document.body.style.overflow='hidden';
}
function closeSidebar(){
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  burger.classList.remove('active');
  document.body.style.overflow='';
}

burger.addEventListener('click',e=>{
  e.stopPropagation();
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
overlay.addEventListener('click', closeSidebar);

/* close sidebar on ALL nav link clicks (mobile) */
document.querySelectorAll('.nav-link').forEach(l=>{
  l.addEventListener('click',()=>{ 
    if(window.innerWidth < 960) {
      closeSidebar();
    }
  });
});

/* close sidebar when clicking outside */
document.addEventListener('click', e=>{
  if(window.innerWidth < 960 && sidebar.classList.contains('open')) {
    if(!sidebar.contains(e.target) && !burger.contains(e.target)) {
      closeSidebar();
    }
  }
});

/* ═══════════════════════════
   ACTIVE NAV ON SCROLL
═══════════════════════════ */
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
const sections = document.querySelectorAll('section[id]');

const secObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      navLinks.forEach(l=>l.classList.remove('active'));
      const a = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
      if(a) a.classList.add('active');
    }
  });
},{threshold:0.3,rootMargin:'-5% 0px -5% 0px'});
sections.forEach(s=>secObs.observe(s));

/* ═══════════════════════════
   REVEAL ON SCROLL
═══════════════════════════ */
const revObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      revObs.unobserve(e.target);
    }
  });
},{threshold:0.07,rootMargin:'0px 0px -30px 0px'});

document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

/* stagger project + skill cards */
const gridObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    e.target.querySelectorAll('.proj-card,.skill-card').forEach((c,i)=>{
      c.style.transitionDelay = `${i*0.07}s`;
      c.classList.add('reveal');
      setTimeout(()=>c.classList.add('visible'), i*70+50);
    });
    gridObs.unobserve(e.target);
  });
},{threshold:0.04});

document.querySelectorAll('.projects-grid,.skills-grid').forEach(g=>gridObs.observe(g));

/* ═══════════════════════════
   GALLERY CAROUSEL
═══════════════════════════ */
const track    = document.getElementById('galleryTrack');
const wrapper  = document.getElementById('galleryWrapper');
const prevBtn  = document.getElementById('galleryPrev');
const nextBtn  = document.getElementById('galleryNext');
const dotsWrap = document.getElementById('galleryDots');
const countEl  = document.getElementById('galleryCount');
const cards    = track ? Array.from(track.querySelectorAll('.art-card')) : [];

let cur = 0;
let tX  = 0;
let wasGalleryDragged = false;

/* build dots */
function buildDots(){
  if(!dotsWrap) return;
  dotsWrap.innerHTML = '';
  cards.forEach((_,i)=>{
    const d = document.createElement('button');
    d.className = 'g-dot' + (i===0?' active':'');
    d.setAttribute('aria-label',`Slide ${i+1}`);
    d.addEventListener('click',()=>goTo(i));
    dotsWrap.appendChild(d);
  });
}

function updateUI(){
  if(dotsWrap){
    dotsWrap.querySelectorAll('.g-dot').forEach((d,i)=>d.classList.toggle('active',i===cur));
  }
  if(countEl) countEl.textContent = `${cur+1} / ${cards.length}`;
}

function applyTransform(x, animated=true){
  track.style.transition = animated
    ? 'transform 0.48s cubic-bezier(0.4,0,0.2,1)'
    : 'none';
  track.style.transform = `translateX(${x}px)`;
}

function goTo(idx){
  if(!cards.length) return;
  cur = Math.max(0, Math.min(idx, cards.length-1));

  const wLeft = wrapper.getBoundingClientRect().left;
  const cLeft = cards[cur].getBoundingClientRect().left;
  const delta = cLeft - wLeft;
  tX -= delta;

  const paddingLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
  tX = Math.min(paddingLeft, tX);

  applyTransform(tX);
  updateUI();
}

/* ── drag / swipe ── */
let dragStartX = 0;
let dragStartTX = 0;
let isDragging = false;

if(wrapper){
  /* MOUSE */
  wrapper.addEventListener('mousedown', e=>{
    isDragging = true;
    dragStartX = e.clientX;
    dragStartTX = tX;
    wrapper.classList.add('grabbing');
  });

  window.addEventListener('mousemove', e=>{
    if(!isDragging) return;
    const dx = e.clientX - dragStartX;
    applyTransform(dragStartTX + dx, false);
  });

  window.addEventListener('mouseup', e=>{
    if(!isDragging) return;
    isDragging = false;
    wrapper.classList.remove('grabbing');
    const dx = dragStartX - e.clientX;
    if(Math.abs(dx) > 50) {
      wasGalleryDragged = true;
      goTo(dx > 0 ? cur+1 : cur-1);
    }
    else { tX = dragStartTX; applyTransform(tX); }
  });

  /* TOUCH */
  let touchStartX = 0;
  wrapper.addEventListener('touchstart', e=>{
    touchStartX = e.touches[0].clientX;
  },{passive:true});

  wrapper.addEventListener('touchend', e=>{
    const dx = touchStartX - e.changedTouches[0].clientX;
    if(Math.abs(dx) > 40) {
      wasGalleryDragged = true;
      goTo(dx > 0 ? cur+1 : cur-1);
    }
  },{passive:true});
}

prevBtn && prevBtn.addEventListener('click',()=>goTo(cur-1));
nextBtn && nextBtn.addEventListener('click',()=>goTo(cur+1));

document.addEventListener('keydown', e=>{
  if(e.key==='ArrowLeft')  goTo(cur-1);
  if(e.key==='ArrowRight') goTo(cur+1);
});

/* Debounced resize */
let resizeTimeout;
window.addEventListener('resize',()=>{
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(()=>{
    tX = 0;
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';
    cur = 0;
    updateUI();
  }, 250);
});

if(cards.length){ buildDots(); updateUI(); }

/* ═══════════════════════════
   ART MODAL  — click to preview
═══════════════════════════ */
const modal      = document.getElementById('art-modal');
const modalImg   = document.getElementById('modalImg');
const modalCap   = document.getElementById('modalCaption');
const modalBg    = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');

/* Attach click to EVERY art card */
cards.forEach(card=>{
  card.addEventListener('click', e=>{
    /* Don't fire if user was dragging the gallery */
    if(wasGalleryDragged) {
      wasGalleryDragged = false;
      return;
    }

    const img = card.dataset.img;
    if(!img || !modal) return;

    /* Set image - this will display in modal-img */
    modalImg.style.backgroundImage = `url('${img}')`;
    
    /* Open modal */
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeModal(){
  if(!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

modalBg    && modalBg.addEventListener('click', closeModal);
modalClose && modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });
