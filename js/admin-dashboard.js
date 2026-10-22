/**
 * DIAGNOSTIC LABORATORY - ADMIN DASHBOARD JS (admin-dashboard.js)
 * KPI calculations, dynamic appointment management, full test CRUD,
 * simulated report viewing, SVG charts with period filters, and notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
  initDemoStorage();
  checkAuthSession('admin');
  loadAdminKPIs();
  loadAppointmentsTable();
  loadTestsCRUDTable();
  loadPatientsTable();
  loadReportsTable();
  loadNotificationsList();
  initAnalyticsCharts();
  initTestModalForms();
  initAdminSettings();
});

// Calculate & Animate KPI Cards
function loadAdminKPIs() {
  const appointments = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
  const tests = JSON.parse(localStorage.getItem('apex_tests') || '[]');
  const reports = JSON.parse(localStorage.getItem('apex_reports') || '[]');

  const totalAppts = appointments.length;
  const pendingAppts = appointments.filter(a => a.status === 'Pending').length;
  const availableTests = tests.length;
  const reportsReady = reports.filter(r => r.status === 'Ready' || r.status === 'Reviewed').length;

  animateValue('kpiTotalAppts', totalAppts);
  animateValue('kpiPendingAppts', pendingAppts);
  animateValue('kpiAvailableTests', availableTests);
  animateValue('kpiReportsReady', reportsReady);
}

function animateValue(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;
  let current = 0;
  const duration = 800;
  const step = Math.max(1, Math.floor(target / 20));
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target;
      clearInterval(interval);
    } else {
      el.textContent = current;
    }
  }, 30);
}

// ==========================================================================
// APPOINTMENTS MANAGEMENT (ADMIN)
// ==========================================================================
function loadAppointmentsTable() {
  const tableBody = document.getElementById('adminApptsTableBody');
  if (!tableBody) return;

  const searchInput = document.getElementById('apptSearchInput');
  const statusFilter = document.getElementById('apptStatusFilter');

  function render() {
    const appointments = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const status = statusFilter ? statusFilter.value : 'all';

    const filtered = appointments.filter(a => {
      const matchSearch = a.id.toLowerCase().includes(q) ||
                          a.patientName.toLowerCase().includes(q) ||
                          a.testName.toLowerCase().includes(q);
      const matchStatus = status === 'all' || a.status === status;
      return matchSearch && matchStatus;
    });

    if (!filtered.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="table-empty-row">
            <i class="fa-solid fa-calendar-xmark" style="font-size:2rem; margin-bottom:0.5rem; display:block;"></i>
            No appointments match current search criteria.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(a => {
      const badgeClass = a.status === 'Confirmed' ? 'badge-confirmed' :
                         a.status === 'Pending' ? 'badge-pending' :
                         a.status === 'Completed' ? 'badge-completed' : 'badge-cancelled';
      return `
        <tr>
          <td><strong>${a.id}</strong></td>
          <td>
            <div style="font-weight:600;">${a.patientName}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${a.patientEmail || ''}</div>
          </td>
          <td>${a.testName}</td>
          <td>
            <div>${a.date}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${a.time}</div>
          </td>
          <td><span class="badge ${badgeClass}">${a.status}</span></td>
          <td>
            <div style="display:flex; gap:0.4rem;">
              <button type="button" class="btn-action-icon" onclick="viewApptDetails('${a.id}')" title="View Details">
                <i class="fa-solid fa-eye"></i>
              </button>
              ${a.status === 'Pending' ? `
                <button type="button" class="btn-action-icon" style="color:var(--teal-accent);" onclick="updateApptStatus('${a.id}', 'Confirmed')" title="Confirm Appointment">
                  <i class="fa-solid fa-check"></i>
                </button>
              ` : ''}
              ${a.status === 'Confirmed' ? `
                <button type="button" class="btn-action-icon" style="color:#10B981;" onclick="updateApptStatus('${a.id}', 'Completed')" title="Mark Completed">
                  <i class="fa-solid fa-check-double"></i>
                </button>
              ` : ''}
              ${a.status !== 'Cancelled' && a.status !== 'Completed' ? `
                <button type="button" class="btn-action-icon danger" onclick="confirmCancelAppt('${a.id}')" title="Cancel Appointment">
                  <i class="fa-solid fa-ban"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (searchInput) searchInput.addEventListener('input', render);
  if (statusFilter) statusFilter.addEventListener('change', render);

  render();
}

function updateApptStatus(apptId, newStatus) {
  const appointments = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
  const index = appointments.findIndex(a => a.id === apptId);
  if (index !== -1) {
    appointments[index].status = newStatus;
    localStorage.setItem('apex_appointments', JSON.stringify(appointments));
    loadAppointmentsTable();
    loadAdminKPIs();
    showToast('Appointment Updated', `Appointment ${apptId} status changed to ${newStatus}.`, 'success');
  }
}

function confirmCancelAppt(apptId) {
  showConfirmDialog(
    'Cancel Appointment',
    `Are you sure you wish to cancel demo appointment ${apptId}?`,
    () => {
      updateApptStatus(apptId, 'Cancelled');
    }
  );
}

function viewApptDetails(apptId) {
  const appointments = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
  const a = appointments.find(item => item.id === apptId);
  if (!a) return;

  showConfirmDialog(
    `Appointment Reference: ${a.id}`,
    `Patient: ${a.patientName}
Email: ${a.patientEmail}
Phone: ${a.patientPhone}
Test: ${a.testName}
Date & Time: ${a.date} at ${a.time}
Status: ${a.status}
Notes: ${a.notes || 'None recorded'}`,
    null
  );
}

// ==========================================================================
// DIAGNOSTIC TESTS CRUD (ADMIN)
// ==========================================================================
function loadTestsCRUDTable() {
  const tableBody = document.getElementById('adminTestsTableBody');
  if (!tableBody) return;

  const tests = JSON.parse(localStorage.getItem('apex_tests') || '[]');
  const searchInput = document.getElementById('testsTableSearch');
  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filtered = tests.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));

  if (!filtered.length) {
    tableBody.innerHTML = `<tr><td colspan="6" class="table-empty-row">No tests found in directory.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(t => `
    <tr>
      <td><strong>${t.id}</strong></td>
      <td>
        <div style="font-weight:600;">${t.name}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${t.desc.slice(0, 50)}...</div>
      </td>
      <td><span class="badge badge-confirmed">${t.category}</span></td>
      <td>${t.sample}</td>
      <td><strong>$${t.price.toFixed(2)}</strong></td>
      <td>
        <div style="display:flex; gap:0.4rem;">
          <button type="button" class="btn-action-icon" onclick="openEditTestModal('${t.id}')" title="Edit Test">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button type="button" class="btn-action-icon danger" onclick="confirmDeleteTest('${t.id}')" title="Delete Test">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', loadTestsCRUDTable);
  }
}

function initTestModalForms() {
  const form = document.getElementById('testCRUDForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isEdit = document.getElementById('testModalIsEdit').value === 'true';
    const id = document.getElementById('testFormId').value.trim();
    const name = document.getElementById('testFormName').value.trim();
    const category = document.getElementById('testFormCategory').value;
    const sample = document.getElementById('testFormSample').value.trim();
    const price = parseFloat(document.getElementById('testFormPrice').value);
    const tat = document.getElementById('testFormTat').value.trim();
    const prep = document.getElementById('testFormPrep').value.trim();
    const desc = document.getElementById('testFormDesc').value.trim();

    if (!id || !name || !category || isNaN(price)) {
      showToast('Incomplete Form', 'Please complete all required fields.', 'warning');
      return;
    }

    const tests = JSON.parse(localStorage.getItem('apex_tests') || '[]');

    if (isEdit) {
      const idx = tests.findIndex(t => t.id === id);
      if (idx !== -1) {
        tests[idx] = { id, name, category, sample, price, tat, prep, desc };
        showToast('Test Updated', `Successfully updated ${name}.`, 'success');
      }
    } else {
      // Check unique
      if (tests.some(t => t.id === id)) {
        showToast('ID Exists', 'A diagnostic test with this ID already exists.', 'error');
        return;
      }
      tests.unshift({ id, name, category, sample, price, tat, prep, desc });
      showToast('Test Created', `Added ${name} to diagnostic menu.`, 'success');
    }

    localStorage.setItem('apex_tests', JSON.stringify(tests));
    form.reset();
    closeModal('testCRUDModal');
    loadTestsCRUDTable();
    loadAdminKPIs();
  });
}

function openAddTestModal() {
  document.getElementById('testModalTitle').textContent = 'Add New Diagnostic Test';
  document.getElementById('testModalIsEdit').value = 'false';
  document.getElementById('testFormId').readOnly = false;
  document.getElementById('testCRUDForm').reset();
  document.getElementById('testFormId').value = 'T' + Math.floor(200 + Math.random() * 800);
  openModal('testCRUDModal');
}

function openEditTestModal(testId) {
  const tests = JSON.parse(localStorage.getItem('apex_tests') || '[]');
  const t = tests.find(item => item.id === testId);
  if (!t) return;

  document.getElementById('testModalTitle').textContent = 'Edit Diagnostic Test';
  document.getElementById('testModalIsEdit').value = 'true';
  document.getElementById('testFormId').value = t.id;
  document.getElementById('testFormId').readOnly = true;
  document.getElementById('testFormName').value = t.name;
  document.getElementById('testFormCategory').value = t.category;
  document.getElementById('testFormSample').value = t.sample;
  document.getElementById('testFormPrice').value = t.price;
  document.getElementById('testFormTat').value = t.tat || '';
  document.getElementById('testFormPrep').value = t.prep || '';
  document.getElementById('testFormDesc').value = t.desc || '';

  openModal('testCRUDModal');
}

function confirmDeleteTest(testId) {
  showConfirmDialog(
    'Delete Diagnostic Test',
    `Are you sure you want to delete test ${testId}? This action removes it from the local test catalog.`,
    () => {
      let tests = JSON.parse(localStorage.getItem('apex_tests') || '[]');
      tests = tests.filter(t => t.id !== testId);
      localStorage.setItem('apex_tests', JSON.stringify(tests));
      loadTestsCRUDTable();
      loadAdminKPIs();
      showToast('Test Deleted', `Test ${testId} removed.`, 'info');
    }
  );
}

// ==========================================================================
// PATIENTS MANAGEMENT (ADMIN)
// ==========================================================================
function loadPatientsTable() {
  const tableBody = document.getElementById('adminPatientsTableBody');
  if (!tableBody) return;

  const patients = JSON.parse(localStorage.getItem('apex_patients') || '[]');
  tableBody.innerHTML = patients.map(p => `
    <tr>
      <td><strong>${p.id}</strong></td>
      <td>
        <div style="font-weight:600;">${p.name}</div>
      </td>
      <td>
        <div>${p.email}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${p.phone}</div>
      </td>
      <td><span class="badge badge-confirmed">${p.appointments} Bookings</span></td>
      <td>${p.lastVisit}</td>
      <td>
        <button type="button" class="btn btn-outline btn-sm" onclick="viewPatientProfile('${p.id}')">
          <i class="fa-regular fa-id-card"></i> View Profile
        </button>
      </td>
    </tr>
  `).join('');
}

function viewPatientProfile(patientId) {
  const patients = JSON.parse(localStorage.getItem('apex_patients') || '[]');
  const p = patients.find(item => item.id === patientId);
  if (!p) return;

  showConfirmDialog(
    `Patient Profile: ${p.name}`,
    `Demo Patient ID: ${p.id}
Email: ${p.email}
Phone: ${p.phone}
Total Appointments: ${p.appointments}
Last Activity: ${p.lastVisit}
(Fictional demonstration profile only)`
  );
}

// ==========================================================================
// REPORTS MANAGEMENT & MOCK VIEWER (ADMIN)
// ==========================================================================
function loadReportsTable() {
  const tableBody = document.getElementById('adminReportsTableBody');
  if (!tableBody) return;

  const reports = JSON.parse(localStorage.getItem('apex_reports') || '[]');
  tableBody.innerHTML = reports.map(r => {
    const badgeClass = r.status === 'Reviewed' ? 'badge-completed' :
                       r.status === 'Ready' ? 'badge-confirmed' : 'badge-processing';
    return `
      <tr>
        <td><strong>${r.reportId}</strong></td>
        <td>${r.patientName}</td>
        <td>${r.testName}</td>
        <td>${r.date}</td>
        <td><span class="badge ${badgeClass}">${r.status}</span></td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button type="button" class="btn btn-teal btn-sm" onclick="openSimulatedReportModal('${r.reportId}')">
              <i class="fa-regular fa-file-lines"></i> View Report
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="toggleReportStatus('${r.reportId}')" title="Advance Status">
              <i class="fa-solid fa-arrows-rotate"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function toggleReportStatus(reportId) {
  const reports = JSON.parse(localStorage.getItem('apex_reports') || '[]');
  const r = reports.find(item => item.reportId === reportId);
  if (!r) return;

  if (r.status === 'Processing') r.status = 'Ready';
  else if (r.status === 'Ready') r.status = 'Reviewed';
  else r.status = 'Processing';

  localStorage.setItem('apex_reports', JSON.stringify(reports));
  loadReportsTable();
  loadAdminKPIs();
  showToast('Report Status Updated', `Report ${reportId} marked as ${r.status}.`, 'success');
}

function openSimulatedReportModal(reportId) {
  const reports = JSON.parse(localStorage.getItem('apex_reports') || '[]');
  const r = reports.find(item => item.reportId === reportId);
  if (!r) return;

  let modal = document.getElementById('simulatedReportModal');
  if (!modal) {
    const markup = `
      <div class="modal-overlay" id="simulatedReportModal" aria-hidden="true">
        <div class="modal-container" role="dialog" style="max-width:760px;">
          <div class="modal-header">
            <div>
              <span class="badge badge-cancelled" style="margin-bottom:0.3rem;"><i class="fa-solid fa-triangle-exclamation"></i> DEMO — NOT FOR CLINICAL USE</span>
              <h3 class="modal-title" style="font-size:1.35rem;">Diagnostic Laboratory Report</h3>
            </div>
            <button type="button" class="modal-close-btn" data-close-modal="simulatedReportModal">&times;</button>
          </div>
          <div class="modal-body" id="simulatedReportContainer">
            <!-- Dynamically Rendered Report Sheet -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline btn-sm" data-close-modal="simulatedReportModal">Close</button>
            <button type="button" class="btn btn-teal btn-sm" onclick="window.print()">
              <i class="fa-solid fa-print"></i> Print Demo Sheet
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', markup);
    modal = document.getElementById('simulatedReportModal');
    modal.querySelectorAll('[data-close-modal]').forEach(b => {
      b.addEventListener('click', () => closeModal('simulatedReportModal'));
    });
  }

  const container = document.getElementById('simulatedReportContainer');
  container.innerHTML = `
    <div class="report-sheet">
      <div class="report-watermark">DEMO &bull; NOT FOR CLINICAL USE</div>

      <div class="report-header-banner">
        <div>
          <h2 style="font-family:var(--font-display); font-size:1.6rem; color:var(--primary-navy); margin-bottom:0.2rem;">APEX DIAGNOSTIC LABORATORY</h2>
          <div style="font-size:0.75rem; color:var(--text-secondary);">MMR Complex, Chinna Thirupathi, near Chinna Muniyappan Kovil, Salem, Tamil Nadu 636008 &bull; Tel: +91 9876543210 &bull; Email: info@stackly.com</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.8rem; font-weight:700; color:var(--teal-accent);">OFFICIAL SPECIMEN REPORT</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">ACCESSION: ${r.reportId}</div>
        </div>
      </div>

      <div class="report-meta-grid">
        <div class="report-meta-item"><strong>Patient Name:</strong> ${r.patientName}</div>
        <div class="report-meta-item"><strong>Patient ID:</strong> ${r.patientId || 'PT-1004'}</div>
        <div class="report-meta-item"><strong>Date Collected:</strong> ${r.date}</div>
        <div class="report-meta-item"><strong>Specimen Type:</strong> ${r.specimen || 'Blood Serum'}</div>
        <div class="report-meta-item"><strong>Investigation:</strong> ${r.testName}</div>
        <div class="report-meta-item"><strong>Report Status:</strong> <span class="badge badge-confirmed">${r.status}</span></div>
      </div>

      <div class="table-responsive" style="margin-bottom:1.5rem;">
        <table class="clinical-table" style="border:1px solid var(--border-light);">
          <thead>
            <tr>
              <th>Analyte / Parameter</th>
              <th>Observed Result</th>
              <th>Reference Interval</th>
              <th>Clinical Flag</th>
            </tr>
          </thead>
          <tbody>
            ${(r.results || [
              { analyte: 'Observed Analyte Parameter', value: 'Within Limits', refRange: 'Standard', flag: 'Normal' }
            ]).map(res => `
              <tr>
                <td><strong>${res.analyte}</strong></td>
                <td style="font-weight:600; color:var(--primary-navy);">${res.value}</td>
                <td style="color:var(--text-secondary);">${res.refRange}</td>
                <td><span class="badge badge-completed">${res.flag}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top:1px dashed var(--border-medium); padding-top:1rem; font-size:0.75rem; color:var(--text-muted);">
        <div>
          <strong>Pathologist Verification:</strong><br>
          ${r.labDoctor || 'Dr. Julian Ross, MD (Pathologist)'}<br>
          <em style="color:#EF4444;">* Simulated demonstration values. Not for medical treatment decisions.</em>
        </div>
        <div style="text-align:center;">
          <div style="font-family:'DM Serif Display',serif; font-size:1.1rem; color:var(--primary-navy);">Julian Ross, MD</div>
          <div style="border-top:1px solid #000; width:140px; margin-top:2px;">Digital Signature</div>
        </div>
      </div>
    </div>
  `;

  openModal('simulatedReportModal');
}

// ==========================================================================
// NOTIFICATIONS (ADMIN)
// ==========================================================================
function loadNotificationsList() {
  const container = document.getElementById('adminNotifsContainer');
  if (!container) return;

  const notifs = JSON.parse(localStorage.getItem('apex_notifications') || '[]');
  const unreadCount = notifs.filter(n => !n.read).length;

  const bubble = document.getElementById('notifBubbleCount');
  if (bubble) {
    bubble.textContent = unreadCount;
    bubble.style.display = unreadCount > 0 ? 'flex' : 'none';
  }

  if (!notifs.length) {
    container.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);">No new notifications.</div>`;
    return;
  }

  container.innerHTML = notifs.map(n => `
    <div class="notif-card-item ${n.read ? '' : 'unread'}" id="notifItem_${n.id}">
      <div class="notif-type-icon">
        <i class="fa-solid ${n.type === 'appointment' ? 'fa-calendar-check' : n.type === 'report' ? 'fa-file-waveform' : 'fa-bell'}"></i>
      </div>
      <div style="flex:1;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="font-size:0.9rem; color:var(--primary-navy);">${n.title}</strong>
          <span style="font-size:0.72rem; color:var(--text-muted);">${n.time}</span>
        </div>
        <p style="font-size:0.825rem; color:var(--text-secondary); margin:0.25rem 0 0 0;">${n.message}</p>
      </div>
      <button type="button" class="btn-action-icon" onclick="toggleReadNotif('${n.id}')" title="Toggle Read State">
        <i class="fa-solid ${n.read ? 'fa-envelope-open' : 'fa-envelope'}"></i>
      </button>
    </div>
  `).join('');
}

function toggleReadNotif(id) {
  const notifs = JSON.parse(localStorage.getItem('apex_notifications') || '[]');
  const n = notifs.find(item => item.id === id);
  if (n) {
    n.read = !n.read;
    localStorage.setItem('apex_notifications', JSON.stringify(notifs));
    loadNotificationsList();
  }
}

function markAllNotifsRead() {
  const notifs = JSON.parse(localStorage.getItem('apex_notifications') || '[]');
  notifs.forEach(n => n.read = true);
  localStorage.setItem('apex_notifications', JSON.stringify(notifs));
  loadNotificationsList();
  showToast('Notifications Marked', 'All notifications marked as read.', 'info');
}

// ==========================================================================
// ANALYTICS SVG CHARTS (ADMIN)
// ==========================================================================
function initAnalyticsCharts() {
  const pills = document.querySelectorAll('.period-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const period = pill.getAttribute('data-period');
      renderSvgCharts(period);
    });
  });

  renderSvgCharts('30d');
}

function renderSvgCharts(period = '30d') {
  const lineChartBox = document.getElementById('appointmentsTrendChart');
  const barChartBox = document.getElementById('popularTestsBarChart');

  if (!lineChartBox || !barChartBox) return;

  // Multipliers for illustrative period variations
  const mult = period === '7d' ? 0.3 : period === '30d' ? 1 : period === '3m' ? 2.8 : 9.5;

  // 1. Line Chart SVG
  lineChartBox.innerHTML = `
    <svg viewBox="0 0 500 200" width="100%" height="100%">
      <!-- Grid lines -->
      <line x1="40" y1="30" x2="480" y2="30" stroke="#E2E8F0" stroke-dasharray="4"/>
      <line x1="40" y1="80" x2="480" y2="80" stroke="#E2E8F0" stroke-dasharray="4"/>
      <line x1="40" y1="130" x2="480" y2="130" stroke="#E2E8F0" stroke-dasharray="4"/>
      <line x1="40" y1="180" x2="480" y2="180" stroke="#CBD5E1"/>

      <!-- Axes text -->
      <text x="15" y="35" font-size="10" fill="#94A3B8">${Math.round(40 * mult)}</text>
      <text x="15" y="85" font-size="10" fill="#94A3B8">${Math.round(25 * mult)}</text>
      <text x="15" y="135" font-size="10" fill="#94A3B8">${Math.round(10 * mult)}</text>
      <text x="25" y="185" font-size="10" fill="#94A3B8">0</text>

      <!-- Trend Area -->
      <polygon points="50,180 50,140 120,110 190,130 260,70 330,90 400,45 470,60 470,180" 
               fill="rgba(32, 184, 166, 0.15)"/>
      
      <!-- Trend Line -->
      <polyline points="50,140 120,110 190,130 260,70 330,90 400,45 470,60" 
                fill="none" stroke="#20B8A6" stroke-width="3" stroke-linecap="round"/>

      <!-- Data Dots -->
      <circle cx="50" cy="140" r="4" fill="#123B5D" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="120" cy="110" r="4" fill="#123B5D" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="190" cy="130" r="4" fill="#123B5D" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="260" cy="70" r="4" fill="#123B5D" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="330" cy="90" r="4" fill="#123B5D" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="400" cy="45" r="4" fill="#123B5D" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="470" cy="60" r="4" fill="#123B5D" stroke="#FFFFFF" stroke-width="2"/>

      <text x="50" y="195" font-size="10" fill="#64748B" text-anchor="middle">W1</text>
      <text x="120" y="195" font-size="10" fill="#64748B" text-anchor="middle">W2</text>
      <text x="190" y="195" font-size="10" fill="#64748B" text-anchor="middle">W3</text>
      <text x="260" y="195" font-size="10" fill="#64748B" text-anchor="middle">W4</text>
      <text x="330" y="195" font-size="10" fill="#64748B" text-anchor="middle">W5</text>
      <text x="400" y="195" font-size="10" fill="#64748B" text-anchor="middle">W6</text>
      <text x="470" y="195" font-size="10" fill="#64748B" text-anchor="middle">W7</text>
    </svg>
  `;

  // 2. Bar Chart SVG
  barChartBox.innerHTML = `
    <svg viewBox="0 0 350 200" width="100%" height="100%">
      <rect x="30" y="30" width="${Math.min(260, 220 * (mult / 3))}" height="22" rx="4" fill="#123B5D"/>
      <text x="35" y="45" font-size="10" fill="#FFFFFF" font-weight="600">CBC Panel</text>
      <text x="300" y="45" font-size="10" fill="#64748B">${Math.round(240 * mult)}</text>

      <rect x="30" y="65" width="${Math.min(260, 185 * (mult / 3))}" height="22" rx="4" fill="#20B8A6"/>
      <text x="35" y="80" font-size="10" fill="#FFFFFF" font-weight="600">Lipid Profile</text>
      <text x="300" y="80" font-size="10" fill="#64748B">${Math.round(195 * mult)}</text>

      <rect x="30" y="100" width="${Math.min(260, 160 * (mult / 3))}" height="22" rx="4" fill="#1D5482"/>
      <text x="35" y="115" font-size="10" fill="#FFFFFF" font-weight="600">Thyroid Profile</text>
      <text x="300" y="115" font-size="10" fill="#64748B">${Math.round(160 * mult)}</text>

      <rect x="30" y="135" width="${Math.min(260, 125 * (mult / 3))}" height="22" rx="4" fill="#F59E0B"/>
      <text x="35" y="150" font-size="10" fill="#FFFFFF" font-weight="600">Blood Glucose</text>
      <text x="300" y="150" font-size="10" fill="#64748B">${Math.round(130 * mult)}</text>

      <rect x="30" y="170" width="${Math.min(260, 95 * (mult / 3))}" height="22" rx="4" fill="#10B981"/>
      <text x="35" y="185" font-size="10" fill="#FFFFFF" font-weight="600">Vitamin D</text>
      <text x="300" y="185" font-size="10" fill="#64748B">${Math.round(98 * mult)}</text>
    </svg>
  `;
}

// ==========================================================================
// ADMIN SETTINGS
// ==========================================================================
function initAdminSettings() {
  const form = document.getElementById('adminSettingsForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Settings Saved', 'Demo laboratory configuration preferences saved to localStorage.', 'success');
  });
}
