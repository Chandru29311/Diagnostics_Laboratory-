/**
 * DIAGNOSTIC LABORATORY - SHARED DASHBOARD JS (dashboard.js)
 * Base sidebar toggling, tab switching, session initialization,
 * confirmation modals, and logout handling.
 */

document.addEventListener('DOMContentLoaded', () => {
  initDashboardSidebar();
  initDashboardDate();
});

// Guard & Initialize Session
function checkAuthSession(expectedRole = 'admin') {
  let session = JSON.parse(localStorage.getItem('apex_auth_session') || 'null');

  if (!session || !session.email) {
    // If no session exists, create a default session for the dashboard
    const defaultEmail = expectedRole === 'admin' ? 'admin@stackly.com' : 'client@stackly.com';
    const derivedName = typeof deriveNameFromEmail === 'function' 
      ? deriveNameFromEmail(defaultEmail) 
      : (expectedRole === 'admin' ? 'Admin' : 'Client');
    session = {
      isLoggedIn: true,
      role: expectedRole,
      email: defaultEmail,
      name: derivedName,
      patientId: expectedRole === 'client' ? 'PT-1001' : null,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('apex_auth_session', JSON.stringify(session));
  } else {
    // If name is missing or has old hardcoded demo string, re-derive from the email
    if (!session.name || session.name.includes('(Admin)') || session.name.includes('(Client)') || session.name === 'Dr. Julian Ross' || session.name === 'Dr. Sarah Lin' || session.name === 'Dr.Refai Ross') {
      session.name = typeof deriveNameFromEmail === 'function'
        ? deriveNameFromEmail(session.email)
        : session.email.split('@')[0];
      localStorage.setItem('apex_auth_session', JSON.stringify(session));
    }
  }

  // Update profile avatar, names, emails, and roles across the dashboard DOM
  const userNameEls = document.querySelectorAll('.dash-user-name');
  const userRoleEls = document.querySelectorAll('.dash-user-role');
  const userAvatarEls = document.querySelectorAll('.dash-user-avatar');
  const userEmailEls = document.querySelectorAll('.dash-user-email');

  userNameEls.forEach(el => {
    el.textContent = session.name;
  });

  userRoleEls.forEach(el => {
    el.textContent = session.role === 'admin' ? 'Laboratory Administrator' : 'Verified Patient';
  });

  const initials = typeof getInitialsFromName === 'function'
    ? getInitialsFromName(session.name)
    : session.name.substring(0, 2).toUpperCase();

  userAvatarEls.forEach(el => {
    el.textContent = initials;
  });

  userEmailEls.forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.value = session.email;
    } else {
      el.textContent = session.email;
    }
  });

  // Also populate profile form inputs if present on page
  const profileNameInputs = document.querySelectorAll('#clientProfileName, #profileInputName, input[name="profileFullName"]');
  profileNameInputs.forEach(input => {
    input.value = session.name;
  });

  const profileEmailInputs = document.querySelectorAll('#clientProfileEmail, #profileInputEmail, input[name="profileEmail"]');
  profileEmailInputs.forEach(input => {
    input.value = session.email;
  });

  return session;
}

// Sidebar Drawer & Tab Navigation Switcher
function initDashboardSidebar() {
  const toggleBtn = document.querySelector('.dash-mobile-toggle');
  const sidebar = document.querySelector('.dash-sidebar');

  if (toggleBtn && sidebar) {
    let backdrop = document.querySelector('.dash-sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'dash-sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    function toggleSidebar() {
      const isOpen = sidebar.classList.toggle('open');
      document.body.classList.toggle('dash-sidebar-open', isOpen);
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      document.body.classList.remove('dash-sidebar-open');
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSidebar();
    });

    backdrop.addEventListener('click', closeSidebar);

    // Close when clicking outside on mobile / tablet
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
          closeSidebar();
        }
      }
    });
  }

  // Tab switching links
  const navLinks = document.querySelectorAll('.sidebar-link[data-tab]');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const tabId = link.getAttribute('data-tab');
      switchDashTab(tabId);
      if (window.innerWidth <= 1024 && sidebar) {
        sidebar.classList.remove('open');
        document.body.classList.remove('dash-sidebar-open');
      }
    });
  });
}

function switchDashTab(tabId) {
  // Update sidebar active links
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-tab') === tabId);
  });

  // Update tab panes
  document.querySelectorAll('.dash-tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  const activePane = document.getElementById(tabId);
  if (activePane) {
    activePane.classList.add('active');
    // Scroll top of main container
    const main = document.querySelector('.dash-main');
    if (main) main.scrollTop = 0;
  }
}

// Current Date in Topbar
function initDashboardDate() {
  const dateEl = document.getElementById('dashCurrentDate');
  if (dateEl) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    dateEl.innerHTML = `<i class="fa-regular fa-calendar" style="color:var(--teal-accent)"></i> ${new Date().toLocaleDateString('en-US', options)}`;
  }
}

// Universal Confirmation Dialog
function showConfirmDialog(title, message, onConfirm) {
  let modal = document.getElementById('confirmActionModal');
  if (!modal) {
    const markup = `
      <div class="modal-overlay" id="confirmActionModal" aria-hidden="true">
        <div class="modal-container" role="dialog" style="max-width:440px;">
          <div class="modal-header">
            <h4 class="modal-title" id="confirmModalTitle" style="font-size:1.2rem;">Confirm Action</h4>
            <button type="button" class="modal-close-btn" data-close-modal="confirmActionModal">&times;</button>
          </div>
          <div class="modal-body">
            <p id="confirmModalMessage" style="font-size:0.925rem; color:var(--text-secondary); margin:0;">Are you sure?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline btn-sm" data-close-modal="confirmActionModal">Cancel</button>
            <button type="button" class="btn btn-navy btn-sm" id="confirmModalActionBtn">Confirm</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', markup);
    modal = document.getElementById('confirmActionModal');
    modal.querySelectorAll('[data-close-modal]').forEach(b => {
      b.addEventListener('click', () => closeModal('confirmActionModal'));
    });
  }

  document.getElementById('confirmModalTitle').textContent = title;
  document.getElementById('confirmModalMessage').textContent = message;

  const actionBtn = document.getElementById('confirmModalActionBtn');
  actionBtn.onclick = () => {
    closeModal('confirmActionModal');
    if (typeof onConfirm === 'function') onConfirm();
  };

  openModal('confirmActionModal');
}

// Confirm Logout Handler
function handleLogout() {
  showConfirmDialog(
    'Log Out of Portal',
    'Are you sure you wish to log out of your demo laboratory session?',
    () => {
      localStorage.removeItem('apex_auth_session');
      showToast('Logged Out', 'You have been safely signed out. Returning to login...', 'info', 2000);
      setTimeout(() => {
        window.location.href = 'Login.html';
      }, 800);
    }
  );
}
