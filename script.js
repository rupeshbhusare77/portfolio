const hamburger = document.getElementById('hamburger');
const sidebar = document.querySelector('.sidebar');
const links = document.querySelectorAll('.nav-list a');

// Toggle sidebar & hamburger visibility
hamburger.addEventListener('click', (e) => {
  e.stopPropagation();                   // don’t trigger the document click
  sidebar.classList.toggle('open');
  hamburger.classList.toggle('hidden');
});

// Close on link click (mobile)
links.forEach(link =>
  link.addEventListener('click', () => {
    if (window.innerWidth < 768) {
      sidebar.classList.remove('open');
      hamburger.classList.remove('hidden');
    }
  })
);

// Close sidebar when clicking outside it
document.addEventListener('click', (e) => {
  if (
    window.innerWidth < 768 &&
    sidebar.classList.contains('open') &&
    !sidebar.contains(e.target) &&   // clicked outside sidebar
    !hamburger.contains(e.target)      // and not on the hamburger
  ) {
    sidebar.classList.remove('open');
    hamburger.classList.remove('hidden');
  }
});

// Highlight active nav on scroll
const sections = document.querySelectorAll('section');
const navLinks = Array.from(links);

function changeActive() {
  let index = sections.length;
  while (--index && window.scrollY + 100 < sections[index].offsetTop) { }
  navLinks.forEach(l => l.classList.remove('active'));
  navLinks[index].classList.add('active');
}

changeActive();
window.addEventListener('scroll', changeActive);



// -----------------------------------------------------------------
// IntersectionObserver for scroll‑into‑view animations
// -----------------------------------------------------------------
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const animObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('anim-show');
      obs.unobserve(entry.target);
    }
  });
}, observerOptions);

// find all elements that should animate on scroll or load
const toAnimate = document.querySelectorAll('.anim-hidden');
toAnimate.forEach(el => animObserver.observe(el));

// -----------------------------------------------------------------
// Page‑load stagger for initial animation
// -----------------------------------------------------------------
window.addEventListener('load', () => {
  // we’ll stagger them by 100ms
  toAnimate.forEach((el, i) => {
    // only fire those already in view — others will come in via the observer
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setTimeout(() => el.classList.add('anim-show'), i * 100);
    }
  });
});

// ----------------------
// Art Gallery Modal Logic
// ----------------------
const artModal = document.getElementById('art-modal');
const artModalImg = artModal.querySelector('.art-modal-img');
const artModalCaption = artModal.querySelector('.art-modal-caption');
const artModalClose = artModal.querySelector('.art-modal-close');

// Open modal on art card click
document.querySelectorAll('.art-card').forEach(card => {
    card.addEventListener('click', (e) => {
        // Prevent bubbling if clicking the close button
        if (e.target.closest('.art-modal-close')) return;

        const imgDiv = card.querySelector('.art-img');
        const info = card.querySelector('.project-info');
        const bgImg = imgDiv.style.backgroundImage.slice(5, -2); // remove url("...")

        artModalImg.style.backgroundImage = imgDiv.style.backgroundImage;
        artModalCaption.innerHTML = info.innerHTML;
        artModal.classList.add('open');
        document.body.style.overflow = 'hidden'; // prevent background scroll
    });
});

// Close modal on close button or clicking outside content
artModal.addEventListener('click', (e) => {
    if (
        e.target === artModal ||
        e.target.classList.contains('art-modal-close')
    ) {
        artModal.classList.remove('open');
        document.body.style.overflow = '';
    }
});

// Optional: ESC key closes modal
document.addEventListener('keydown', (e) => {
    if (artModal.classList.contains('open') && e.key === 'Escape') {
        artModal.classList.remove('open');
        document.body.style.overflow = '';
    }
});



function createBubble() {
    const container = document.querySelector('.bubble-container');
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    // Smaller size
    const size = Math.random() * 8 + 7; // 7px to 15px
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 98}%`;

    // Slower animation
    bubble.style.animationDuration = `${4.5 + Math.random()}s`;

    container.appendChild(bubble);

    bubble.addEventListener('animationend', () => {
        bubble.remove();
    });
}

// Less frequent bubbles for subtlety
setInterval(createBubble, 600); // every 600ms
