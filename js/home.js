/**
 * DIAGNOSTIC LABORATORY - HOME PAGE JS (home.js)
 * GSAP ScrollTrigger animations with guaranteed visibility,
 * Statistics counter increment, Accordion logic, and Facilities Lightbox.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure default visibility immediately so content is never blank
  ensureAllContentVisible();
  
  initHeroAnimations();
  initScrollAnimations();
  initStatCounters();
  initFaqAccordion();
  initFacilityLightbox();
});

// Guaranteed Failsafe: Ensures elements are never trapped in an invisible or misaligned state
function ensureAllContentVisible() {
  const elements = document.querySelectorAll(
    '.highlight-card, .service-card, .test-card, .package-card, .gallery-item, .testimonial-card, .hero-content, .hero-visual-card, .hero-title, .hero-desc, .hero-badge'
  );
  elements.forEach(el => {
    el.style.visibility = 'visible';
    el.style.opacity = '1';
  });
  // Clear any stuck inline transforms on cards so CSS flex/grid alignments are 100% pristine
  document.querySelectorAll('.highlight-card, .service-card, .test-card, .package-card, .why-card, .testimonial-card').forEach(el => {
    el.style.removeProperty('transform');
  });
}

// GSAP Hero Section Animations
function initHeroAnimations() {
  if (typeof gsap === 'undefined') {
    ensureAllContentVisible();
    return;
  }

  // Smooth entrance without leaving elements hidden
  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => {
      // Clear any inline styles that could hide or clip elements
      gsap.set('.hero-content, .hero-title, .hero-desc, .hero-badge, .hero-cta-group .btn', {
        clearProps: 'opacity,transform'
      });
    }
  });

  tl.fromTo('.hero-bg-img', 
    { scale: 1.1, opacity: 0.1 }, 
    { scale: 1.05, opacity: 0.28, duration: 1.2 }
  )
  .fromTo('.hero-badge', 
    { y: -15, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.5 }, 
    '-=0.8'
  )
  .fromTo('.hero-title', 
    { y: 25, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.6 }, 
    '-=0.5'
  )
  .fromTo('.hero-desc', 
    { y: 20, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.5 }, 
    '-=0.4'
  )
  .fromTo('.hero-cta-group .btn', 
    { y: 15, opacity: 0 }, 
    { y: 0, opacity: 1, stagger: 0.1, duration: 0.4 }, 
    '-=0.3'
  )
  .fromTo('.hero-visual-card', 
    { x: 30, opacity: 0 }, 
    { x: 0, opacity: 1, duration: 0.7 }, 
    '-=0.5'
  );

  // Gentle ambient floating effect for telemetry hero card
  gsap.to('.hero-visual-card', {
    y: 10,
    duration: 3.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
}

// GSAP ScrollTrigger Section Animations
function initScrollAnimations() {
  if (typeof gsap === 'undefined') {
    ensureAllContentVisible();
    return;
  }

  const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
  if (hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Helper function to animate element groups safely with clearProps
  function animateSafe(selector, triggerSelector, yOffset = 0) {
    const items = document.querySelectorAll(selector);
    if (!items.length) return;

    if (hasScrollTrigger) {
      gsap.fromTo(items, 
        { opacity: 0, y: yOffset },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.06,
          ease: 'power2.out',
          clearProps: 'all', // Clears inline opacity/transform once triggered so items are 100% visible and unconstrained
          scrollTrigger: {
            trigger: triggerSelector || selector,
            start: 'top 95%',
            once: true,
            onEnter: () => {
              items.forEach(el => { el.style.opacity = '1'; });
            },
            onComplete: () => {
              items.forEach(el => {
                el.style.removeProperty('transform');
                el.style.removeProperty('opacity');
              });
            }
          }
        }
      );
    } else {
      // Fallback if ScrollTrigger is not loaded
      items.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  }

  // Highlight cards are right at the fold, animate with opacity only (yOffset = 0)
  // to prevent any vertical displacement or baseline misalignment between cards
  animateSafe('.highlight-card', '.highlights-grid', 0);
  animateSafe('.service-card', '.services-grid', 20);
  animateSafe('.test-card', '.tests-grid', 20);
  animateSafe('.package-card', '.packages-grid', 20);
  animateSafe('.gallery-item', '.gallery-grid', 15);
  animateSafe('.testimonial-card', '.testimonials-grid', 20);

  // Process timeline connection line animation
  const activeLine = document.querySelector('.process-timeline-active-line');
  if (activeLine && hasScrollTrigger) {
    ScrollTrigger.create({
      trigger: '.process-timeline',
      start: 'top 80%',
      end: 'bottom 60%',
      onEnter: () => { activeLine.style.width = '90%'; },
      onLeaveBack: () => { activeLine.style.width = '0%'; }
    });
  } else if (activeLine) {
    activeLine.style.width = '90%';
  }

  // Refresh ScrollTrigger after all resources and fonts settle
  window.addEventListener('load', () => {
    if (hasScrollTrigger) {
      ScrollTrigger.refresh();
    }
    ensureAllContentVisible();
  });

  // Failsafe timer: ensure everything is visible and unshifted regardless of scroll state
  setTimeout(() => {
    ensureAllContentVisible();
    if (hasScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }, 400);
}

// Statistics Animated Counters
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  let started = false;

  function runCounters() {
    if (started) return;
    started = true;
    statNumbers.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const suffix = counter.getAttribute('data-suffix') || '';
      let current = 0;
      const step = Math.max(1, Math.floor(target / 30));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          counter.textContent = target.toLocaleString() + suffix;
          clearInterval(interval);
        } else {
          counter.textContent = current.toLocaleString() + suffix;
        }
      }, 35);
    });
  }

  window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;
    const rect = statsSection.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.9) {
      runCounters();
    }
  });

  // Fallback trigger after 2 seconds
  setTimeout(runCounters, 2000);
}

// Accessible FAQ Accordion
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (questionBtn && answer) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close others
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherAns = other.querySelector('.faq-answer');
            if (otherAns) otherAns.style.maxHeight = null;
          }
        });

        // Toggle current
        if (!isActive) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          item.classList.remove('active');
          answer.style.maxHeight = null;
        }
      });
    }
  });

  // Open first item
  if (faqItems.length > 0) {
    const firstItem = faqItems[0];
    const firstAnswer = firstItem.querySelector('.faq-answer');
    firstItem.classList.add('active');
    if (firstAnswer) firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
  }
}

// Lightbox for Facilities Gallery
function initFacilityLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!galleryItems.length) return;

  let lightbox = document.getElementById('facilityLightbox');
  if (!lightbox) {
    const markup = `
      <div class="lightbox-modal" id="facilityLightbox" aria-hidden="true">
        <div class="lightbox-content">
          <button class="lightbox-close" id="lightboxCloseBtn" aria-label="Close modal">&times;</button>
          <img class="lightbox-img" id="lightboxImg" src="" alt="Laboratory Facility Detail">
          <div class="lightbox-caption" id="lightboxCaption"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', markup);
    lightbox = document.getElementById('facilityLightbox');
  }

  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxCloseBtn');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.querySelector('h5') ? item.querySelector('h5').innerText : 'Laboratory Facility';
      const category = item.querySelector('span') ? item.querySelector('span').innerText : 'Clinical Facility';

      lightboxImg.src = img.src;
      lightboxCaption.innerHTML = `<strong>${title}</strong> &mdash; ${category}`;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}
