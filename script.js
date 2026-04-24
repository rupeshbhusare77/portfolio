/* ═══════════════════════════════
   CURSOR GLOW
═══════════════════════════════ */
const glow = document.getElementById('cursorGlow');
let mx=0,my=0,gx=0,gy=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
(function tick(){
  gx+=(mx-gx)*0.1; gy+=(my-gy)*0.1;
  if(glow){glow.style.left=gx+'px';glow.style.top=gy+'px';}
  requestAnimationFrame(tick);
})();

/* ═══════════════════════════════
   SIDEBAR TOGGLE
═══════════════════════════════ */
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
  sidebar.classList.contains('open')?closeSidebar():openSidebar();
});
overlay.addEventListener('click',closeSidebar);

/* close when nav link clicked on mobile */
document.querySelectorAll('.nav-link[href^="#"]').forEach(l=>{
  l.addEventListener('click',()=>{ if(window.innerWidth<960) closeSidebar(); });
});

/* ═══════════════════════════════
   ACTIVE NAV HIGHLIGHT
═══════════════════════════════ */
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
const sections = document.querySelectorAll('section[id]');

const secObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      navLinks.forEach(l=>l.classList.remove('active'));
      const a=document.querySelector(`.nav-link[href="#${e.target.id}"]`);
      if(a) a.classList.add('active');
    }
  });
},{threshold:0.3,rootMargin:'-5% 0px -5% 0px'});
sections.forEach(s=>secObs.observe(s));

/* ═══════════════════════════════
   REVEAL ON SCROLL
═══════════════════════════════ */
const revObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('visible');revObs.unobserve(e.target);}
  });
},{threshold:0.07,rootMargin:'0px 0px -30px 0px'});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

/* stagger cards when grid comes in view */
const gridObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    e.target.querySelectorAll('.proj-card,.skill-card').forEach((c,i)=>{
      c.style.transitionDelay=`${i*0.07}s`;
      c.classList.add('reveal');
      setTimeout(()=>c.classList.add('visible'),i*70+50);
    });
    gridObs.unobserve(e.target);
  });
},{threshold:0.04});
document.querySelectorAll('.projects-grid,.skills-grid').forEach(g=>gridObs.observe(g));

/* ═══════════════════════════════
   GALLERY CAROUSEL
═══════════════════════════════ */
const track    = document.getElementById('galleryTrack');
const wrapper  = document.getElementById('galleryWrapper');
const prevBtn  = document.getElementById('galleryPrev');
const nextBtn  = document.getElementById('galleryNext');
const dotsWrap = document.getElementById('galleryDots');
const countEl  = document.getElementById('galleryCount');
const cards    = track ? Array.from(track.querySelectorAll('.art-card')) : [];
let cur=0, tOffset=0;

/* Build dots */
function buildDots(){
  if(!dotsWrap) return;
  dotsWrap.innerHTML='';
  cards.forEach((_,i)=>{
    const d=document.createElement('button');
    d.className='g-dot'+(i===0?' active':'');
    d.setAttribute('aria-label',`Slide ${i+1}`);
    d.addEventListener('click',()=>goTo(i));
    dotsWrap.appendChild(d);
  });
}

function updateUI(){
  if(!dotsWrap) return;
  dotsWrap.querySelectorAll('.g-dot').forEach((d,i)=>d.classList.toggle('active',i===cur));
  if(countEl) countEl.textContent=`${cur+1} / ${cards.length}`;
}

function goTo(idx){
  if(!cards.length) return;
  cur=Math.max(0,Math.min(idx,cards.length-1));

  /* calc offset so current card left edge aligns to padding */
  const wRect=wrapper.getBoundingClientRect();
  const cRect=cards[cur].getBoundingClientRect();
  /* current visual left of card relative to wrapper */
  const cardVisualLeft = cRect.left - wRect.left;
  tOffset -= cardVisualLeft;
  /* clamp so we don't scroll past start */
  const minOffset=-(track.scrollWidth - wRect.width + parseFloat(getComputedStyle(track).paddingLeft||0));
  tOffset=Math.min(0,Math.max(tOffset,minOffset));
  track.style.transform=`translateX(${tOffset}px)`;
  updateUI();
}

if(prevBtn) prevBtn.addEventListener('click',()=>goTo(cur-1));
if(nextBtn) nextBtn.addEventListener('click',()=>goTo(cur+1));

document.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft') goTo(cur-1);
  if(e.key==='ArrowRight') goTo(cur+1);
});

/* Drag / Swipe */
let dragStart=0, dragging=false, lastOffset=0;

if(wrapper){
  wrapper.addEventListener('mousedown',e=>{
    dragging=true; dragStart=e.clientX; lastOffset=tOffset;
    wrapper.classList.add('grabbing');
  });
  window.addEventListener('mousemove',e=>{
    if(!dragging) return;
    const dx=e.clientX-dragStart;
    track.style.transform=`translateX(${lastOffset+dx}px)`;
  });
  window.addEventListener('mouseup',e=>{
    if(!dragging) return;
    dragging=false; wrapper.classList.remove('grabbing');
    const dx=dragStart-e.clientX;
    if(Math.abs(dx)>50) goTo(dx>0?cur+1:cur-1);
    else { tOffset=lastOffset; track.style.transform=`translateX(${tOffset}px)`; }
  });

  /* touch */
  wrapper.addEventListener('touchstart',e=>{dragStart=e.touches[0].clientX;},{passive:true});
  wrapper.addEventListener('touchend',e=>{
    const dx=dragStart-e.changedTouches[0].clientX;
    if(Math.abs(dx)>40) goTo(dx>0?cur+1:cur-1);
  },{passive:true});
}

window.addEventListener('resize',()=>{
  tOffset=0;
  track.style.transform='translateX(0)';
  cur=0; updateUI();
});

if(cards.length){ buildDots(); updateUI(); }

/* ═══════════════════════════════
   ART MODAL
═══════════════════════════════ */
const modal     = document.getElementById('art-modal');
const modalImg  = document.getElementById('modalImg');
const modalBg   = document.getElementById('modalBackdrop');
const modalCls  = document.getElementById('modalClose');

cards.forEach(card=>{
  card.addEventListener('click',()=>{
    const img=card.dataset.img;
    if(!img||!modal) return;
    modalImg.style.backgroundImage=`url('${img}')`;
    modal.classList.add('open');
    document.body.style.overflow='hidden';
  });
});

function closeModal(){
  if(!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow='';
}
if(modalBg)  modalBg.addEventListener('click',closeModal);
if(modalCls) modalCls.addEventListener('click',closeModal);
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });
