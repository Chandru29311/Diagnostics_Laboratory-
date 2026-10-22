/**
 * DIAGNOSTIC LABORATORY - MAIN JAVASCRIPT (main.js)
 * Global handlers, Navbar, Preloader, Toast system,
 * Modal controls, and LocalStorage Demo State Initializer.
 */

// Initialize Demo Data in localStorage if not already present
function initDemoStorage() {
  // 1. Initial Diagnostic Tests
  if (!localStorage.getItem('apex_tests')) {
    const initialTests = [
      {
        id: 'T101',
        name: 'Complete Blood Count (CBC)',
        category: 'Blood Tests',
        sample: 'Whole Blood (EDTA)',
        price: 25.00,
        tat: 'Same Day (4 Hours)',
        prep: 'No special fasting required. Stay well hydrated.',
        desc: 'Evaluates overall health and detects a wide range of disorders including anemia, infection, and leukemia.',
        popular: true
      },
      {
        id: 'T102',
        name: 'Fasting Blood Glucose Test',
        category: 'Biochemistry',
        sample: 'Blood Serum',
        price: 18.00,
        tat: 'Same Day',
        prep: 'Overnight fasting for 8 to 10 hours required before sample collection.',
        desc: 'Measures blood sugar levels to screen for and monitor pre-diabetes and diabetes mellitus.',
        popular: true
      },
      {
        id: 'T103',
        name: 'Comprehensive Lipid Profile',
        category: 'Biochemistry',
        sample: 'Blood Serum',
        price: 38.00,
        tat: '24 Hours',
        prep: 'Requires 10-12 hours of fasting. Avoid fatty meals the evening before.',
        desc: 'Assesses cardiovascular risk by quantifying Total Cholesterol, HDL, LDL, VLDL, and Triglycerides.',
        popular: true
      },
      {
        id: 'T104',
        name: 'Thyroid Profile (TSH, Free T3, Free T4)',
        category: 'Hormone Testing',
        sample: 'Blood Serum',
        price: 45.00,
        tat: '24 Hours',
        prep: 'No strict fasting required; morning collection recommended prior to medication.',
        desc: 'Evaluates thyroid gland activity and screens for hyperthyroidism and hypothyroidism.',
        popular: true
      },
      {
        id: 'T105',
        name: 'Liver Function Test (LFT)',
        category: 'Clinical Pathology',
        sample: 'Blood Serum',
        price: 34.00,
        tat: 'Same Day',
        prep: 'Fasting for 8 hours is advised. Avoid alcohol for 24 hours prior.',
        desc: 'Measures enzymes, bilirubin, and proteins to evaluate liver function and liver tissue integrity.',
        popular: true
      },
      {
        id: 'T106',
        name: 'Kidney Function Test (KFT / RFT)',
        category: 'Biochemistry',
        sample: 'Blood Serum & Spot Urine',
        price: 32.00,
        tat: 'Same Day',
        prep: 'Drink plenty of water before testing. Avoid intense workouts 24h prior.',
        desc: 'Monitors renal clearance through Creatinine, Blood Urea Nitrogen (BUN), and Uric Acid levels.',
        popular: true
      },
      {
        id: 'T107',
        name: 'Vitamin D 25-Hydroxy Test',
        category: 'Hormone Testing',
        sample: 'Blood Serum',
        price: 42.00,
        tat: '24 Hours',
        prep: 'No fasting required. Routine blood collection.',
        desc: 'Determines vitamin D deficiency or toxicity, essential for bone density and immune regulation.',
        popular: true
      },
      {
        id: 'T108',
        name: 'HbA1c Glycated Hemoglobin',
        category: 'Biochemistry',
        sample: 'Whole Blood',
        price: 28.00,
        tat: 'Same Day',
        prep: 'No fasting required. Can be taken anytime of day.',
        desc: 'Provides an average picture of blood sugar regulation over the preceding 2 to 3 months.',
        popular: true
      },
      {
        id: 'T109',
        name: 'Comprehensive Urine Analysis',
        category: 'Clinical Pathology',
        sample: 'Mid-stream Clean Catch Urine',
        price: 15.00,
        tat: 'Same Day (2 Hours)',
        prep: 'Collect first morning midstream urine using a sterile sample cup.',
        desc: 'Detects urinary tract infections, metabolic abnormalities, and early signs of kidney disease.',
        popular: false
      },
      {
        id: 'T110',
        name: 'Multiplex Respiratory PCR Panel',
        category: 'Molecular Diagnostics',
        sample: 'Nasopharyngeal Swab',
        price: 95.00,
        tat: '12-24 Hours',
        prep: 'Do not use nasal sprays within 4 hours before swab collection.',
        desc: 'High-sensitivity nucleic acid amplification detecting Influenza, RSV, and Covid viral strains.',
        popular: false
      },
      {
        id: 'T111',
        name: 'Comprehensive Allergy IgE Panel',
        category: 'Allergy Testing',
        sample: 'Blood Serum',
        price: 85.00,
        tat: '48 Hours',
        prep: 'Consult your clinician regarding antihistamines before the blood draw.',
        desc: 'Screens for specific allergen reactivity across 40 food, pollen, and environmental triggers.',
        popular: false
      },
      {
        id: 'T112',
        name: 'High-Sensitivity Cardiac Troponin I',
        category: 'Biochemistry',
        sample: 'Blood Plasma / Serum',
        price: 52.00,
        tat: 'Stat (1 Hour)',
        prep: 'Urgent diagnostic parameter; no fasting required.',
        desc: 'High precision biomarker for myocardial injury assessment and clinical triage.',
        popular: false
      }
    ];
    localStorage.setItem('apex_tests', JSON.stringify(initialTests));
  }

  // 2. Initial Demo Appointments
  if (!localStorage.getItem('apex_appointments')) {
    const initialAppointments = [
      {
        id: 'APX-7821',
        patientName: 'Eleanor Vance',
        patientEmail: 'eleanor.vance@example.com',
        patientPhone: '+1 (555) 234-8901',
        testName: 'Complete Blood Count (CBC)',
        testId: 'T101',
        date: '2026-10-24',
        time: '09:00 AM',
        status: 'Confirmed',
        notes: 'Routine health checkup requisition.',
        createdAt: '2026-10-14'
      },
      {
        id: 'APX-8104',
        patientName: 'Marcus Sterling',
        patientEmail: 'marcus.s@example.com',
        patientPhone: '+1 (555) 789-1234',
        testName: 'Comprehensive Lipid Profile',
        testId: 'T103',
        date: '2026-10-25',
        time: '08:30 AM',
        status: 'Pending',
        notes: 'Patient requested morning fasting slot.',
        createdAt: '2026-10-15'
      },
      {
        id: 'APX-6590',
        patientName: 'Dr. Sarah Lin (Client)',
        patientEmail: 'client@diagnosticlab.com',
        patientPhone: '+1 (555) 432-8765',
        testName: 'Thyroid Profile (TSH, Free T3, Free T4)',
        testId: 'T104',
        date: '2026-10-28',
        time: '10:15 AM',
        status: 'Confirmed',
        notes: 'Annual endocrinology review.',
        createdAt: '2026-10-15'
      },
      {
        id: 'APX-5412',
        patientName: 'Arthur Pendelton',
        patientEmail: 'arthur.p@example.com',
        patientPhone: '+1 (555) 890-4567',
        testName: 'Vitamin D 25-Hydroxy Test',
        testId: 'T107',
        date: '2026-10-20',
        time: '11:00 AM',
        status: 'Completed',
        notes: 'Sample processed, report uploaded.',
        createdAt: '2026-10-12'
      },
      {
        id: 'APX-4198',
        patientName: 'Clara Oswald',
        patientEmail: 'clara.o@example.com',
        patientPhone: '+1 (555) 678-9012',
        testName: 'Fasting Blood Glucose Test',
        testId: 'T102',
        date: '2026-10-18',
        time: '08:00 AM',
        status: 'Completed',
        notes: 'Completed without incident.',
        createdAt: '2026-10-11'
      }
    ];
    localStorage.setItem('apex_appointments', JSON.stringify(initialAppointments));
  }

  // 3. Initial Demo Reports
  if (!localStorage.getItem('apex_reports')) {
    const initialReports = [
      {
        reportId: 'REP-9021',
        patientId: 'PT-1004',
        patientName: 'Arthur Pendelton',
        testName: 'Vitamin D 25-Hydroxy Test',
        date: '2026-10-20',
        status: 'Reviewed',
        specimen: 'Serum',
        labDoctor: 'Dr. Julian Ross, MD (Pathologist)',
        results: [
          { analyte: '25-OH Vitamin D Total', value: '38.4 ng/mL', refRange: '30.0 - 100.0 ng/mL', flag: 'Normal' },
          { analyte: 'Calcium, Serum', value: '9.4 mg/dL', refRange: '8.6 - 10.2 mg/dL', flag: 'Normal' }
        ]
      },
      {
        reportId: 'REP-8840',
        patientId: 'PT-1002',
        patientName: 'Clara Oswald',
        testName: 'Fasting Blood Glucose Test',
        date: '2026-10-18',
        status: 'Ready',
        specimen: 'Plasma Fluoride',
        labDoctor: 'Dr. Elena Rostova, PhD',
        results: [
          { analyte: 'Fasting Plasma Glucose', value: '94 mg/dL', refRange: '70 - 99 mg/dL', flag: 'Normal' }
        ]
      },
      {
        reportId: 'REP-7731',
        patientId: 'PT-1001',
        patientName: 'Dr. Sarah Lin (Client)',
        testName: 'Thyroid Profile (TSH, Free T3, Free T4)',
        date: '2026-10-16',
        status: 'Processing',
        specimen: 'Serum',
        labDoctor: 'Laboratory Automator Bench 3',
        results: [
          { analyte: 'TSH (Third Gen)', value: 'Pending', refRange: '0.45 - 4.50 uIU/mL', flag: 'Processing' },
          { analyte: 'Free Thyroxine (FT4)', value: 'Pending', refRange: '0.82 - 1.77 ng/dL', flag: 'Processing' }
        ]
      }
    ];
    localStorage.setItem('apex_reports', JSON.stringify(initialReports));
  }

  // 4. Initial Demo Patients
  if (!localStorage.getItem('apex_patients')) {
    const initialPatients = [
      { id: 'PT-1001', name: 'Dr. Sarah Lin (Client)', email: 'client@diagnosticlab.com', phone: '+1 (555) 432-8765', appointments: 3, lastVisit: '2026-10-15' },
      { id: 'PT-1002', name: 'Clara Oswald', email: 'clara.o@example.com', phone: '+1 (555) 678-9012', appointments: 2, lastVisit: '2026-10-18' },
      { id: 'PT-1003', name: 'Marcus Sterling', email: 'marcus.s@example.com', phone: '+1 (555) 789-1234', appointments: 1, lastVisit: '2026-10-15' },
      { id: 'PT-1004', name: 'Arthur Pendelton', email: 'arthur.p@example.com', phone: '+1 (555) 890-4567', appointments: 4, lastVisit: '2026-10-20' },
      { id: 'PT-1005', name: 'Eleanor Vance', email: 'eleanor.vance@example.com', phone: '+1 (555) 234-8901', appointments: 1, lastVisit: '2026-10-14' }
    ];
    localStorage.setItem('apex_patients', JSON.stringify(initialPatients));
  }

  // 5. Initial Demo Notifications
  if (!localStorage.getItem('apex_notifications')) {
    const initialNotifs = [
      { id: 'NT-1', title: 'New Appointment Booked', message: 'Marcus Sterling scheduled Lipid Profile for Oct 25.', time: '10 mins ago', read: false, type: 'appointment' },
      { id: 'NT-2', title: 'Lab Report Ready for Review', message: 'Report REP-9021 (Arthur Pendelton) flagged Ready.', time: '1 hour ago', read: false, type: 'report' },
      { id: 'NT-3', title: 'System Notice', message: 'Specimen cold-storage telemetry operating normally.', time: '4 hours ago', read: true, type: 'system' }
    ];
    localStorage.setItem('apex_notifications', JSON.stringify(initialNotifs));
  }
}

// Preloader Handler with Failsafe
function removePreloader() {
  const preloader = document.querySelector('.preloader');
  if (preloader && !preloader.classList.contains('fade-out')) {
    preloader.classList.add('fade-out');
    setTimeout(() => {
      if (preloader.parentNode) preloader.remove();
    }, 400);
  }
}

// Global Helper: Derive Display Name from Login Email
function deriveNameFromEmail(email) {
  if (!email || typeof email !== 'string') return 'User';
  const localPart = email.split('@')[0].trim();
  if (!localPart) return 'User';
  let cleaned = localPart.replace(/[._\-+]+/g, ' ').replace(/\d+/g, '').trim();
  if (!cleaned) cleaned = localPart;
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// Global Helper: Get Initials from Full Name
function getInitialsFromName(name) {
  if (!name || typeof name !== 'string') return 'U';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

window.addEventListener('load', () => {
  initDemoStorage();
  setTimeout(removePreloader, 150);
});

// Failsafe: Remove preloader after 800ms regardless of window load event
setTimeout(removePreloader, 800);

document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  initDemoStorage();
  initNavbar();
  initMobileMenu();
  highlightActiveNav();
  setupBookingModal();
  setupToastContainer();
  initPlaceholderLinksTo404();
});

// Initialize AOS (Animate On Scroll) Library
function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 750,
      easing: 'ease-out-cubic',
      once: true,
      offset: 35,
      delay: 50,
      mirror: false
    });
    window.addEventListener('load', () => {
      AOS.refresh();
    });
  }
}

// Route buttons, links, and icons to 404 page (excluding navbar, sidebar, and auth pages)
function initPlaceholderLinksTo404() {
  const currentPath = (window.location.pathname || '').toLowerCase();
  const cleanPath = currentPath.split('?')[0].split('#')[0];
  const page = cleanPath.split('/').pop() || 'index.html';

  // Do not touch login, signup, or 404 pages
  if (
    page === 'login.html' ||
    page === 'signup.html' ||
    page === '404.html'
  ) {
    return;
  }

  const isDashboard = (page === 'clientdashboard.html' || page === 'admindashboard.html');

  // Use capture phase to intercept before component listeners or inline onclicks
  document.addEventListener(
    'click',
    (e) => {
      // Find clickable element: link, button, submit, icon, or card button
      const clickable = e.target.closest(
        'a, button, [role="button"], input[type="submit"], input[type="button"], i, svg, [class*="fa-"], [class*="icon"], .btn'
      );

      if (!clickable) return;

      // DO NOT TOUCH the navbar, mobile drawer, overlay, or hamburger toggle on public pages
      if (
        clickable.closest('.site-navbar') ||
        clickable.closest('.mobile-nav-drawer') ||
        clickable.closest('.mobile-nav-overlay') ||
        clickable.closest('.hamburger-btn') ||
        clickable.closest('.preloader')
      ) {
        return;
      }

      // DO NOT TOUCH the sidebar or sidebar mobile toggle on dashboard pages
      if (
        clickable.closest('.dash-sidebar') ||
        clickable.closest('.dash-sidebar-backdrop') ||
        clickable.closest('.dash-mobile-toggle')
      ) {
        return;
      }

      // On public pages, do not intercept buttons, inputs, or submits inside forms on raw click - let form validation validate first!
      if (!isDashboard && clickable.closest('form')) {
        return;
      }

      // Route all other buttons, links, and icons to 404 page
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.href = '404.html';
    },
    true
  );
}

// Sticky and Shrink Navbar
function initNavbar() {
  const navbar = document.querySelector('.site-navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// Mobile Hamburger & Off-canvas Drawer
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger-btn');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const closeBtns = document.querySelectorAll('.mobile-nav-close-btn');

  if (!hamburger || !drawer || !overlay) return;

  let savedScrollY = 0;

  function openMenu() {
    savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    hamburger.classList.add('is-active');
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('mobile-nav-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('is-active');
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('mobile-nav-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, savedScrollY);
  }

  function toggleMenu() {
    if (drawer.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);
  overlay.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', closeMenu);
  });

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (drawer.classList.contains('open')) {
        closeMenu();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeMenu();
    }
  });
}

// Highlight Current Page in Navbar
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Toast Notifications Container - Disabled across project
function setupToastContainer() {
  // Popups removed across the project
}

// Universal Toast Function - Disabled across project
function showToast(title, message, type = 'success', duration = 4500) {
  // Popups removed across the project
  return;
}

// Setup Global Quick Booking Modal
function setupBookingModal() {
  // If modal markup doesn't exist on page, inject universal booking modal
  if (!document.getElementById('quickBookModal')) {
    const modalMarkup = `
      <div class="modal-overlay" id="quickBookModal" aria-hidden="true">
        <div class="modal-container" role="dialog" aria-labelledby="quickBookTitle">
          <div class="modal-header">
            <div>
              <span class="section-tag" style="margin-bottom:0.25rem; font-size:0.7rem;">Frontend Demo Booking</span>
              <h3 class="modal-title" id="quickBookTitle">Schedule Diagnostic Test</h3>
            </div>
            <button type="button" class="modal-close-btn" data-close-modal="quickBookModal" aria-label="Close dialog">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form id="quickBookForm" class="modal-body" novalidate>
            <div style="background:var(--teal-accent-light); border:1px solid rgba(32,184,166,0.25); border-radius:var(--radius-md); padding:0.85rem 1rem; margin-bottom:1.25rem;">
              <p style="font-size:0.8rem; color:var(--primary-navy); margin:0;">
                <i class="fa-solid fa-circle-info" style="color:var(--teal-accent); margin-right:0.4rem;"></i>
                <strong>Notice:</strong> This is an interactive frontend demonstration. Your appointment is securely saved in your browser's demo storage and reflected on the dashboards.
              </p>
            </div>

            <div style="margin-bottom:1rem;">
              <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--primary-navy); margin-bottom:0.4rem;">Select Diagnostic Test / Package *</label>
              <select id="quickBookTestSelect" required style="width:100%; padding:0.75rem 1rem; border-radius:var(--radius-sm); border:1px solid var(--border-medium); background:#FFFFFF; font-size:0.9rem; color:var(--text-primary);">
                <!-- Populated dynamically -->
              </select>
            </div>

            <div class="form-group-row" style="margin-bottom:1rem;">
              <div>
                <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--primary-navy); margin-bottom:0.4rem;">Preferred Date *</label>
                <input type="date" id="quickBookDate" class="form-control" required style="width:100%;">
              </div>
              <div>
                <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--primary-navy); margin-bottom:0.4rem;">Preferred Slot *</label>
                <select id="quickBookSlot" class="form-control" required style="width:100%;">
                  <option value="07:30 AM">07:30 AM (Fasting)</option>
                  <option value="08:30 AM">08:30 AM (Fasting)</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>
            </div>

            <div class="form-group-row" style="margin-bottom:1rem;">
              <div>
                <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--primary-navy); margin-bottom:0.4rem;">Patient Full Name *</label>
                <input type="text" id="quickBookName" class="form-control" placeholder="e.g. Eleanor Vance" required style="width:100%;">
              </div>
              <div>
                <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--primary-navy); margin-bottom:0.4rem;">Contact Phone *</label>
                <input type="tel" id="quickBookPhone" class="form-control" placeholder="+1 (555) 000-0000" required style="width:100%;">
              </div>
            </div>

            <div style="margin-bottom:1.25rem;">
              <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--primary-navy); margin-bottom:0.4rem;">Email Address *</label>
              <input type="email" id="quickBookEmail" placeholder="patient@example.com" required style="width:100%; padding:0.7rem 0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-medium); font-size:0.9rem;">
            </div>

            <div class="modal-footer" style="padding-left:0; padding-right:0; padding-bottom:0;">
              <button type="button" class="btn btn-outline btn-sm" data-close-modal="quickBookModal">Cancel</button>
              <button type="submit" class="btn btn-teal btn-sm" id="submitQuickBookBtn">
                <i class="fa-solid fa-calendar-check"></i> Confirm Demo Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalMarkup);
  }

  // Populate tests in select
  const testSelect = document.getElementById('quickBookTestSelect');
  if (testSelect && testSelect.options.length === 0) {
    const tests = JSON.parse(localStorage.getItem('apex_tests') || '[]');
    tests.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.name;
      opt.textContent = `${t.name} — $${t.price.toFixed(2)}`;
      opt.dataset.id = t.id;
      testSelect.appendChild(opt);
    });

    // Also add health packages
    const pkgGroup = document.createElement('optgroup');
    pkgGroup.label = 'Health Checkup Packages';
    [
      { name: 'Basic Health Checkup Package', price: 65 },
      { name: 'Comprehensive Executive Health Package', price: 149 },
      { name: 'Cardiac & Lipid Screening Package', price: 89 },
      { name: 'Diabetes Complete Assessment Package', price: 79 },
      { name: "Women's Wellness Diagnostic Package", price: 119 },
      { name: 'Senior Citizen Vitality Screening', price: 129 }
    ].forEach(pkg => {
      const opt = document.createElement('option');
      opt.value = pkg.name;
      opt.textContent = `${pkg.name} — $${pkg.price.toFixed(2)}`;
      pkgGroup.appendChild(opt);
    });
    testSelect.appendChild(pkgGroup);
  }

  // Set min date to tomorrow
  const dateInput = document.getElementById('quickBookDate');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  // Form submit handler
  const form = document.getElementById('quickBookForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const testName = document.getElementById('quickBookTestSelect').value;
      const date = document.getElementById('quickBookDate').value;
      const slot = document.getElementById('quickBookSlot').value;
      const name = document.getElementById('quickBookName').value.trim();
      const phone = document.getElementById('quickBookPhone').value.trim();
      const email = document.getElementById('quickBookEmail').value.trim();

      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const phoneValid = phone.replace(/[^0-9]/g, '').length >= 7;

      if (!testName || !date || !slot || !name || name.length < 2 || !email || !emailValid || !phone || !phoneValid) {
        showToast('Incomplete Form', 'Please complete all required fields with valid details before submitting.', 'warning');
        return;
      }

      // Record appointment in demo storage
      const ref = 'APX-' + Math.floor(1000 + Math.random() * 9000);
      try {
        const appointments = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
        appointments.unshift({
          id: ref,
          patientName: name,
          patientEmail: email,
          patientPhone: phone,
          testName: testName,
          date: date,
          time: slot,
          status: 'Confirmed',
          notes: 'Booked via public website quick booking modal.',
          createdAt: new Date().toISOString().split('T')[0]
        });
        localStorage.setItem('apex_appointments', JSON.stringify(appointments));

        const notifs = JSON.parse(localStorage.getItem('apex_notifications') || '[]');
        notifs.unshift({
          id: 'NT-' + Date.now().toString().slice(-4),
          title: 'Appointment Scheduled',
          message: `Confirmed booking for ${testName} on ${date} (${slot}). Ref: ${ref}`,
          time: 'Just now',
          read: false,
          type: 'appointment'
        });
        localStorage.setItem('apex_notifications', JSON.stringify(notifs));
      } catch (err) {}

      // Successfully submitted: reset/clear all form data
      form.reset();
      const dateInp = document.getElementById('quickBookDate');
      if (dateInp) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInp.value = tomorrow.toISOString().split('T')[0];
      }

      closeModal('quickBookModal');
      showToast('Booking Confirmed!', `Your appointment has been scheduled (Ref: ${ref}).`, 'success');
    });
  }

  // Attach global close click listeners
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-close-modal');
      closeModal(target);
    });
  });

  // Close on outside click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });
}

// Global modal triggers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Function to invoke quick booking modal preselecting a test
function triggerBookingModal(preselectedTest = '') {
  openModal('quickBookModal');
  if (preselectedTest) {
    const sel = document.getElementById('quickBookTestSelect');
    if (sel) {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value.toLowerCase().includes(preselectedTest.toLowerCase())) {
          sel.selectedIndex = i;
          break;
        }
      }
    }
  }
}
