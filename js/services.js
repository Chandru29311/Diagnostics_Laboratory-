/**
 * DIAGNOSTIC LABORATORY - SERVICES JS (services.js)
 * Smooth department reveals with guaranteed visibility and clearProps.
 */

document.addEventListener('DOMContentLoaded', () => {
  initServicesAnimations();
});

function initServicesAnimations() {
  const blocks = document.querySelectorAll('.department-block');
  const guideCards = document.querySelectorAll('.sample-guide-card');

  // Immediately guarantee visibility
  blocks.forEach(b => {
    const content = b.querySelector('.department-content');
    const visual = b.querySelector('.department-visual');
    if (content) content.style.visibility = 'visible';
    if (visual) visual.style.visibility = 'visible';
  });
  guideCards.forEach(c => c.style.visibility = 'visible');

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Stagger department blocks safely
  blocks.forEach(block => {
    const content = block.querySelector('.department-content');
    const visual = block.querySelector('.department-visual');

    if (content) {
      gsap.fromTo(content,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: block,
            start: 'top 92%',
            once: true
          }
        }
      );
    }

    if (visual) {
      gsap.fromTo(visual,
        { opacity: 0, scale: 0.96 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.75,
          ease: 'power2.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: block,
            start: 'top 92%',
            once: true
          }
        }
      );
    }
  });

  // Stagger sample guide cards safely
  if (guideCards.length) {
    gsap.fromTo(guideCards,
      { opacity: 0, y: 25 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.65,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.sample-info-grid',
          start: 'top 92%',
          once: true
        }
      }
    );
  }

  // Failsafe: refresh ScrollTrigger and ensure visibility
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 500);
}
