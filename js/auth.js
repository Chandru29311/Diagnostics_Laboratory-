/**
 * DIAGNOSTIC LABORATORY - AUTHENTICATION JS (auth.js)
 * Demo Login & Signup handlers, role switching, password toggling,
 * validation, and redirection to Admin or Client Dashboard.
 */

document.addEventListener('DOMContentLoaded', () => {
  initRoleToggles();
  initPasswordToggles();
  initLoginForm();
  initSignupForm();
  initAuthAnimations();
});

// GSAP Animations on Entrance
function initAuthAnimations() {
  if (typeof gsap === 'undefined') return;

  gsap.fromTo('.auth-form-container', 
    { y: 25, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out', clearProps: 'all' }
  );

  gsap.fromTo('.auth-visual-quote', 
    { x: -25, opacity: 0 }, 
    { x: 0, opacity: 1, duration: 0.8, delay: 0.1, ease: 'power2.out', clearProps: 'all' }
  );
}

// Role Toggle Switcher (Admin vs Client)
function initRoleToggles() {
  const roleButtons = document.querySelectorAll('.role-toggle-btn');
  const roleInput = document.getElementById('authRoleInput');
  const autofillLabel = document.getElementById('demoRoleLabel');

  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      roleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const role = btn.getAttribute('data-role');
      if (roleInput) roleInput.value = role;

      if (autofillLabel) {
        autofillLabel.textContent = role === 'admin' ? 'Demo Admin' : 'Demo Client';
      }

      // Update autofill button behavior if on login page
      const emailField = document.getElementById('loginEmail');
      const passField = document.getElementById('loginPassword');
      if (emailField && passField) {
        if (role === 'admin') {
          emailField.placeholder = 'admin@diagnosticlab.com';
        } else {
          emailField.placeholder = 'client@diagnosticlab.com';
        }
      }
    });
  });
}

// Password Visibility Toggle
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentNode.querySelector('input');
      const icon = btn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
}

// Quick Autofill for Demo Testing
function autofillDemoCredentials() {
  const roleInput = document.getElementById('authRoleInput');
  const emailField = document.getElementById('loginEmail');
  const passField = document.getElementById('loginPassword');

  if (!emailField || !passField) return;

  const role = roleInput ? roleInput.value : 'client';
  if (role === 'admin') {
    emailField.value = 'admin@diagnosticlab.com';
    passField.value = 'admin123';
  } else {
    emailField.value = 'client@diagnosticlab.com';
    passField.value = 'client123';
  }

  showToast('Demo Credentials Filled', `Populated ${role.toUpperCase()} test credentials. Click LOGIN to proceed.`, 'info', 3000);
}

// Login Handler
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const role = document.getElementById('authRoleInput').value;
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();

    if (!email) {
      return;
    }
    if (!pass) {
      return;
    }

    const derivedName = typeof deriveNameFromEmail === 'function'
      ? deriveNameFromEmail(email)
      : email.split('@')[0].replace(/[._\-+]/g, ' ').trim();

    // Set authenticated session with login email and derived name
    const session = {
      isLoggedIn: true,
      role: role,
      email: email,
      name: derivedName,
      patientId: role === 'client' ? 'PT-1001' : null,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('apex_auth_session', JSON.stringify(session));

    // Clear form inputs
    form.reset();

    setTimeout(() => {
      if (role === 'admin') {
        window.location.href = 'AdminDashboard.html';
      } else {
        window.location.href = 'ClientDashboard.html';
      }
    }, 250);
  });
}

// Signup Handler
function initSignupForm() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const role = document.getElementById('authRoleInput').value;
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const pass = document.getElementById('signupPassword').value.trim();
    const confirmPass = document.getElementById('signupConfirmPassword').value.trim();
    const terms = document.getElementById('signupTerms').checked;

    if (!name || name.length < 3) {
      showToast('Validation Error', 'Please enter your full name (minimum 3 characters).', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Validation Error', 'Please enter a valid email address.', 'warning');
      return;
    }

    if (!pass || pass.length < 6) {
      showToast('Validation Error', 'Password must be at least 6 characters in length.', 'warning');
      return;
    }

    if (pass !== confirmPass) {
      showToast('Validation Error', 'Password confirmation does not match.', 'warning');
      return;
    }

    if (!terms) {
      showToast('Validation Error', 'You must agree to the Terms of Service & Privacy Policy.', 'warning');
      return;
    }

    // Store demo patient record if signing up as client
    if (role === 'client') {
      const patients = JSON.parse(localStorage.getItem('apex_patients') || '[]');
      const newPatient = {
        id: 'PT-' + Math.floor(1000 + Math.random() * 9000),
        name: name,
        email: email,
        phone: '+1 (555) 000-0000',
        appointments: 0,
        lastVisit: 'New Member'
      };
      patients.unshift(newPatient);
      localStorage.setItem('apex_patients', JSON.stringify(patients));
    }

    // Clear registration inputs on successful submission
    form.reset();

    // Only when all data is filled correctly, redirect to 404 page
    window.location.href = '404.html';
  });
}
