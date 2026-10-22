/**
 * DIAGNOSTIC LABORATORY - TESTS DIRECTORY JS (tests.js)
 * Real-time search, multi-faceted filtering, sorting,
 * test detail inspection modal, and booking triggers.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTestsDirectory();
  initTestsFaq();
  initQuickNav();
});

let allTests = [];

function initTestsDirectory() {
  const container = document.getElementById('testsDirectoryGrid');
  if (!container) return;

  // Load from localStorage
  allTests = JSON.parse(localStorage.getItem('apex_tests') || '[]');
  if (!allTests.length) {
    initDemoStorage();
    allTests = JSON.parse(localStorage.getItem('apex_tests') || '[]');
  }

  // Bind Filter Controls
  const searchInput = document.getElementById('testSearchInput');
  const categoryFilter = document.getElementById('testCategoryFilter');
  const sampleFilter = document.getElementById('testSampleFilter');
  const prepFilter = document.getElementById('testPrepFilter');
  const sortFilter = document.getElementById('testSortFilter');
  const resetBtn = document.getElementById('resetFiltersBtn');

  function applyFilters() {
    const query = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const sample = sampleFilter.value;
    const prep = prepFilter.value;
    const sort = sortFilter.value;

    let filtered = allTests.filter(test => {
      // Search
      const matchSearch = test.name.toLowerCase().includes(query) ||
                          test.desc.toLowerCase().includes(query) ||
                          test.category.toLowerCase().includes(query);
      if (!matchSearch) return false;

      // Category
      if (category !== 'all' && test.category !== category) return false;

      // Sample
      if (sample !== 'all') {
        if (!test.sample.toLowerCase().includes(sample.toLowerCase())) return false;
      }

      // Prep
      if (prep === 'fasting') {
        if (!test.prep.toLowerCase().includes('fasting') && !test.prep.toLowerCase().includes('hours')) return false;
      } else if (prep === 'non-fasting') {
        if (test.prep.toLowerCase().includes('fasting required') || test.prep.toLowerCase().includes('8 to 10 hours') || test.prep.toLowerCase().includes('10-12 hours')) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      if (sort === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });

    renderTestCards(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
  if (sampleFilter) sampleFilter.addEventListener('change', applyFilters);
  if (prepFilter) prepFilter.addEventListener('change', applyFilters);
  if (sortFilter) sortFilter.addEventListener('change', applyFilters);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchInput.value = '';
      categoryFilter.value = 'all';
      sampleFilter.value = 'all';
      prepFilter.value = 'all';
      sortFilter.value = 'name-asc';
      applyFilters();
    });
  }

  // Initial render
  applyFilters();
}

function renderTestCards(tests) {
  const container = document.getElementById('testsDirectoryGrid');
  const countEl = document.getElementById('resultsCount');

  if (countEl) {
    countEl.textContent = `${tests.length} ${tests.length === 1 ? 'test' : 'tests'} available`;
  }

  if (!tests.length) {
    container.innerHTML = `
      <div class="empty-directory-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-magnifying-glass-chart empty-icon"></i>
        <h4 class="empty-title">No Diagnostic Tests Match Your Filter</h4>
        <p style="color:var(--text-secondary); max-width:440px; margin:0 auto 1.5rem auto;">
          Try adjusting your search criteria, clearing specific sample filters, or exploring our general clinical departments.
        </p>
        <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('resetFiltersBtn').click()">
          <i class="fa-solid fa-rotate-left"></i> Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = tests.map(t => `
    <div class="test-card" data-id="${t.id}">
      <span class="test-category-tag">${t.category}</span>
      <h4>${t.name}</h4>
      <p>${t.desc}</p>
      
      <div class="test-meta-list">
        <div class="test-meta-row">
          <span class="meta-label">Sample:</span>
          <span class="meta-val">${t.sample}</span>
        </div>
        <div class="test-meta-row">
          <span class="meta-label">Turnaround:</span>
          <span class="meta-val">${t.tat || 'Same Day'}</span>
        </div>
        <div class="test-meta-row">
          <span class="meta-label">Preparation:</span>
          <span class="meta-val" title="${t.prep}">${t.prep.length > 30 ? t.prep.slice(0, 28) + '...' : t.prep}</span>
        </div>
      </div>

      <div class="test-card-footer">
        <div class="test-price-box">
          <span class="test-price-label">Indicative Demo</span>
          <span class="test-price">$${t.price.toFixed(2)}</span>
        </div>
        <div class="test-card-actions">
          <button type="button" class="btn btn-outline btn-sm test-btn-details" onclick="viewTestDetails('${t.id}')" title="View Test Details">
            <i class="fa-solid fa-eye"></i> Details
          </button>
          <button type="button" class="btn btn-teal btn-sm test-btn-book" onclick="triggerBookingModal('${t.name}')">
            Book
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Open Detailed Test Inspection Modal
function viewTestDetails(testId) {
  const tests = JSON.parse(localStorage.getItem('apex_tests') || '[]');
  const test = tests.find(t => t.id === testId);
  if (!test) return;

  // Create or retrieve detail modal
  let detailModal = document.getElementById('testDetailModal');
  if (!detailModal) {
    const markup = `
      <div class="modal-overlay" id="testDetailModal" aria-hidden="true">
        <div class="modal-container" role="dialog">
          <div class="modal-header">
            <div>
              <span class="section-tag" style="margin-bottom:0.25rem; font-size:0.7rem;" id="modalTestCategory">Category</span>
              <h3 class="modal-title" id="modalTestName" style="font-size:1.35rem;">Test Name</h3>
            </div>
            <button type="button" class="modal-close-btn" data-close-modal="testDetailModal" aria-label="Close dialog">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-body" id="modalTestBody">
            <!-- Dynamic Content -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline btn-sm" data-close-modal="testDetailModal">Close</button>
            <button type="button" class="btn btn-teal btn-sm" id="modalBookNowBtn">
              <i class="fa-regular fa-calendar-check"></i> Book This Test
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', markup);
    detailModal = document.getElementById('testDetailModal');

    // Attach close listener
    detailModal.querySelectorAll('[data-close-modal]').forEach(b => {
      b.addEventListener('click', () => closeModal('testDetailModal'));
    });
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) closeModal('testDetailModal');
    });
  }

  document.getElementById('modalTestCategory').textContent = test.category;
  document.getElementById('modalTestName').textContent = test.name;

  document.getElementById('modalTestBody').innerHTML = `
    <div class="test-detail-section">
      <div class="detail-label">Clinical Overview & Purpose</div>
      <div class="detail-value">${test.desc}</div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;" class="test-detail-section">
      <div>
        <div class="detail-label">Specimen Requirement</div>
        <div class="detail-value"><i class="fa-solid fa-vial" style="color:var(--teal-accent); margin-right:0.3rem;"></i> ${test.sample}</div>
      </div>
      <div>
        <div class="detail-label">Estimated Turnaround</div>
        <div class="detail-value"><i class="fa-regular fa-clock" style="color:var(--teal-accent); margin-right:0.3rem;"></i> ${test.tat || 'Same Day (4-6 Hours)'}</div>
      </div>
    </div>

    <div class="test-detail-section">
      <div class="detail-label">Preparation & Patient Instructions</div>
      <div class="detail-value" style="background:var(--surface-bg); padding:0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-light);">
        <i class="fa-solid fa-triangle-exclamation" style="color:#F59E0B; margin-right:0.4rem;"></i>
        ${test.prep}
      </div>
    </div>

    <div class="test-detail-section" style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div class="detail-label">Indicative Demo Price</div>
        <div style="font-size:1.6rem; font-weight:700; color:var(--primary-navy);">$${test.price.toFixed(2)}</div>
      </div>
      <span class="badge badge-confirmed"><i class="fa-solid fa-check"></i> Available at Central Lab</span>
    </div>
  `;

  const bookBtn = document.getElementById('modalBookNowBtn');
  bookBtn.onclick = () => {
    closeModal('testDetailModal');
    triggerBookingModal(test.name);
  };

  openModal('testDetailModal');
}

// Accessible FAQ Accordion for Tests Page
function initTestsFaq() {
  const faqItems = document.querySelectorAll('.test-faq-section .faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (questionBtn && answer) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other FAQs
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            const otherAns = other.querySelector('.faq-answer');
            if (otherAns) otherAns.style.maxHeight = null;
          }
        });

        // Toggle clicked FAQ
        if (!isActive) {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          item.classList.remove('active');
          questionBtn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = null;
        }
      });
    }
  });
}

// Quick Anchor Navigation Pill Highlight on Scroll
function initQuickNav() {
  const pills = document.querySelectorAll('.quick-nav-pill');
  if (!pills.length) return;

  const sections = Array.from(pills).map(pill => {
    const id = pill.getAttribute('href');
    return id && id.startsWith('#') ? document.querySelector(id) : null;
  }).filter(Boolean);

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) {
        currentId = '#' + sec.id;
      }
    });

    if (currentId) {
      pills.forEach(pill => {
        if (pill.getAttribute('href') === currentId) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    }
  }, { passive: true });
}
