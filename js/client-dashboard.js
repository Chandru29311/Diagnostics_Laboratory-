/**
 * DIAGNOSTIC LABORATORY - CLIENT DASHBOARD JS (client-dashboard.js)
 * Patient portal KPIs, visual appointment tracker with GSAP,
 * appointment reschedule/cancellation, new booking validation,
 * simulated report viewer, and notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
  initDemoStorage();
  checkAuthSession('client');
  loadClientKPIs();
  loadClientAppointments();
  loadClientReports();
  loadClientNotifications();
  initClientBookingForm();
  initRescheduleModal();
  initAppointmentTracker();
});

// Calculate Client KPIs
function loadClientKPIs() {
  const appointments = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
  const reports = JSON.parse(localStorage.getItem('apex_reports') || '[]');

  // Active / Upcoming
  const upcoming = appointments.find(a => a.status === 'Confirmed' || a.status === 'Pending');
  const pendingCount = appointments.filter(a => a.status === 'Pending').length;
  const reportsCount = reports.filter(r => r.status === 'Ready' || r.status === 'Reviewed').length;

  const upcomingEl = document.getElementById('clientKpiUpcoming');
  const pendingEl = document.getElementById('clientKpiPending');
  const reportsEl = document.getElementById('clientKpiReports');

  if (upcomingEl) {
    if (upcoming) {
      upcomingEl.innerHTML = `<span style="font-size:1.1rem; font-weight:700;">${upcoming.date}</span><br><span style="font-size:0.75rem; color:var(--teal-accent); font-weight:500;">${upcoming.time} &bull; ${upcoming.testName.slice(0, 24)}...</span>`;
    } else {
      upcomingEl.innerHTML = `<span style="font-size:1.1rem; color:var(--text-muted);">None Scheduled</span>`;
    }
  }

  if (pendingEl) pendingEl.textContent = pendingCount;
  if (reportsEl) reportsEl.textContent = reportsCount;
}

// Visual Appointment Tracking Progress Bar
function initAppointmentTracker() {
  const appointments = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
  const activeAppt = appointments.find(a => a.status === 'Confirmed' || a.status === 'Pending') || appointments[0];

  const steps = document.querySelectorAll('.tracker-step');
  if (!steps.length || !activeAppt) return;

  const currentRefEl = document.getElementById('trackerApptRef');
  if (currentRefEl) {
    currentRefEl.textContent = `Tracking Appointment: ${activeAppt.id} (${activeAppt.testName})`;
  }

  // Determine stage based on demo status
  let activeIndex = 1; // Default to Confirmed
  if (activeAppt.status === 'Pending') activeIndex = 0;
  if (activeAppt.status === 'Confirmed') activeIndex = 1;
  if (activeAppt.status === 'Completed') activeIndex = 4;

  steps.forEach((step, idx) => {
    step.classList.remove('completed', 'current');
    if (idx < activeIndex) {
      step.classList.add('completed');
    } else if (idx === activeIndex) {
      step.classList.add('current');
    }
  });

  // Animate tracker entrance with GSAP
  if (typeof gsap !== 'undefined') {
    gsap.fromTo('.tracker-step', 
      { scale: 0.9, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        stagger: 0.08,
        duration: 0.5,
        ease: 'power2.out',
        clearProps: 'all'
      }
    );
  }
}

// Load Patient's Appointments
function loadClientAppointments() {
  const container = document.getElementById('clientApptsList');
  if (!container) return;

  const appointments = JSON.parse(localStorage.getItem('apex_appointments') || '[]');

  if (!appointments.length) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem; background:#FFFFFF; border-radius:var(--radius-lg); border:1px dashed var(--border-medium);">
        <i class="fa-regular fa-calendar-xmark" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:1rem; display:block;"></i>
        <h4 style="color:var(--primary-navy); margin-bottom:0.5rem;">No Appointments Scheduled</h4>
        <p style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:1.5rem;">You do not have any active or past laboratory appointments.</p>
        <button type="button" class="btn btn-teal btn-sm" onclick="switchDashTab('tabClientBookNew')">
          <i class="fa-solid fa-plus"></i> Book Your First Test
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = appointments.map(a => {
    const badgeClass = a.status === 'Confirmed' ? 'badge-confirmed' :
                       a.status === 'Pending' ? 'badge-pending' :
                       a.status === 'Completed' ? 'badge-completed' : 'badge-cancelled';
    const isPastOrCancelled = a.status === 'Completed' || a.status === 'Cancelled';

    return `
      <div class="card-clinical" style="padding:1.5rem; margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <span style="font-size:0.75rem; font-weight:700; color:var(--teal-accent); text-transform:uppercase;">Booking Ref: ${a.id}</span>
            <h4 style="font-size:1.2rem; color:var(--primary-navy); margin:0.2rem 0;">${a.testName}</h4>
            <div style="font-size:0.85rem; color:var(--text-secondary);">
              <i class="fa-regular fa-calendar" style="color:var(--teal-accent); margin-right:0.3rem;"></i> ${a.date} at ${a.time}
            </div>
          </div>
          <span class="badge ${badgeClass}">${a.status}</span>
        </div>

        <div style="background:var(--surface-bg); padding:0.85rem 1rem; border-radius:var(--radius-sm); font-size:0.825rem; color:var(--text-secondary); margin-bottom:1.25rem; display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
          <div><strong>Patient:</strong> ${a.patientName} (${a.patientPhone || 'On File'})</div>
          <div><strong>Location:</strong> Apex Central Lab &bull; Phlebotomy Suite 4</div>
        </div>

        <div style="display:flex; gap:0.6rem; justify-content:flex-end; flex-wrap:wrap;">
          <button type="button" class="btn btn-outline btn-sm" onclick="viewClientApptDetails('${a.id}')">
            <i class="fa-solid fa-eye"></i> View Details
          </button>
          ${!isPastOrCancelled ? `
            <button type="button" class="btn btn-outline btn-sm" onclick="openRescheduleModal('${a.id}')">
              <i class="fa-regular fa-clock"></i> Reschedule
            </button>
            <button type="button" class="btn btn-outline btn-sm" style="color:#EF4444; border-color:#EF4444;" onclick="cancelClientAppt('${a.id}')">
              <i class="fa-solid fa-ban"></i> Cancel
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function viewClientApptDetails(apptId) {
  const appointments = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
  const a = appointments.find(item => item.id === apptId);
  if (!a) return;

  showConfirmDialog(
    `Appointment Reference: ${a.id}`,
    `Investigation: ${a.testName}
Scheduled Date: ${a.date}
Slot: ${a.time}
Status: ${a.status}
Patient: ${a.patientName}
Collection Site: Central Laboratory, Phlebotomy Station B
Notes: Please bring photo ID and adhere to specified fasting rules.`
  );
}

function cancelClientAppt(apptId) {
  showConfirmDialog(
    'Cancel Appointment',
    `Are you sure you want to cancel appointment ${apptId}? This slot will be released back to the demo laboratory.`,
    () => {
      const appointments = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
      const idx = appointments.findIndex(item => item.id === apptId);
      if (idx !== -1) {
        appointments[idx].status = 'Cancelled';
        localStorage.setItem('apex_appointments', JSON.stringify(appointments));
        loadClientAppointments();
        loadClientKPIs();
        initAppointmentTracker();
        showToast('Appointment Cancelled', `Appointment ${apptId} has been cancelled.`, 'info');
      }
    }
  );
}

// Reschedule Modal
function initRescheduleModal() {
  let modal = document.getElementById('rescheduleModal');
  if (!modal) {
    const markup = `
      <div class="modal-overlay" id="rescheduleModal" aria-hidden="true">
        <div class="modal-container" role="dialog" style="max-width:480px;">
          <div class="modal-header">
            <h3 class="modal-title" style="font-size:1.25rem;">Reschedule Appointment</h3>
            <button type="button" class="modal-close-btn" data-close-modal="rescheduleModal">&times;</button>
          </div>
          <form id="rescheduleForm" class="modal-body">
            <input type="hidden" id="rescheduleApptId">
            <div class="form-group">
              <label class="form-label">New Date *</label>
              <input type="date" id="rescheduleNewDate" class="form-control" required>
            </div>
            <div class="form-group">
              <label class="form-label">Preferred Time Slot *</label>
              <select id="rescheduleNewSlot" class="form-control" required>
                <option value="07:30 AM">07:30 AM (Fasting)</option>
                <option value="08:30 AM">08:30 AM (Fasting)</option>
                <option value="09:30 AM">09:30 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="04:30 PM">04:30 PM</option>
              </select>
            </div>
            <div class="modal-footer" style="padding:1rem 0 0 0; background:none;">
              <button type="button" class="btn btn-outline btn-sm" data-close-modal="rescheduleModal">Cancel</button>
              <button type="submit" class="btn btn-teal btn-sm">Confirm Reschedule</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', markup);
    modal = document.getElementById('rescheduleModal');
    modal.querySelectorAll('[data-close-modal]').forEach(b => {
      b.addEventListener('click', () => closeModal('rescheduleModal'));
    });

    const form = document.getElementById('rescheduleForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const apptId = document.getElementById('rescheduleApptId').value;
      const newDate = document.getElementById('rescheduleNewDate').value;
      const newSlot = document.getElementById('rescheduleNewSlot').value;

      if (!newDate) {
        showToast('Validation Error', 'Please select a valid future date.', 'warning');
        return;
      }

      const appointments = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
      const idx = appointments.findIndex(item => item.id === apptId);
      if (idx !== -1) {
        appointments[idx].date = newDate;
        appointments[idx].time = newSlot;
        appointments[idx].status = 'Confirmed';
        localStorage.setItem('apex_appointments', JSON.stringify(appointments));

        form.reset();
        closeModal('rescheduleModal');
        loadClientAppointments();
        loadClientKPIs();
        initAppointmentTracker();
        showToast('Rescheduled Successfully', `Your appointment has been moved to ${newDate} at ${newSlot}.`, 'success');
      }
    });
  }
}

function openRescheduleModal(apptId) {
  initRescheduleModal();
  document.getElementById('rescheduleApptId').value = apptId;
  const dateInp = document.getElementById('rescheduleNewDate');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInp.min = tomorrow.toISOString().split('T')[0];
  dateInp.value = tomorrow.toISOString().split('T')[0];
  openModal('rescheduleModal');
}

// Inline "Book a New Test" Tab
function initClientBookingForm() {
  const form = document.getElementById('clientNewBookForm');
  if (!form) return;

  const testSelect = document.getElementById('clientBookTestSelect');
  if (testSelect && testSelect.options.length === 0) {
    const tests = JSON.parse(localStorage.getItem('apex_tests') || '[]');
    tests.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.name;
      opt.textContent = `${t.name} — $${t.price.toFixed(2)}`;
      testSelect.appendChild(opt);
    });

    // Packages
    const optGroup = document.createElement('optgroup');
    optGroup.label = 'Health Checkup Packages';
    [
      'Basic Health Checkup Package ($65.00)',
      'Comprehensive Executive Health Package ($149.00)',
      'Diabetes Screening Package ($79.00)',
      'Heart Health Screening Package ($89.00)'
    ].forEach(pkg => {
      const opt = document.createElement('option');
      opt.value = pkg.split(' (')[0];
      opt.textContent = pkg;
      optGroup.appendChild(opt);
    });
    testSelect.appendChild(optGroup);
  }

  const dateInput = document.getElementById('clientBookDate');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const testName = document.getElementById('clientBookTestSelect').value;
    const date = document.getElementById('clientBookDate').value;
    const slot = document.getElementById('clientBookSlot').value;
    const session = JSON.parse(localStorage.getItem('apex_auth_session') || '{}');

    if (!testName || !date || !slot) {
      showToast('Validation Error', 'Please complete all required fields.', 'warning');
      return;
    }

    const ref = 'APX-' + Math.floor(1000 + Math.random() * 9000);
    const newAppt = {
      id: ref,
      patientName: session.name || 'Dr. Sarah Lin (Client)',
      patientEmail: session.email || 'client@diagnosticlab.com',
      patientPhone: '+1 (555) 432-8765',
      testName: testName,
      date: date,
      time: slot,
      status: 'Confirmed',
      notes: 'Booked via patient portal.',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const appointments = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
    appointments.unshift(newAppt);
    localStorage.setItem('apex_appointments', JSON.stringify(appointments));

    // Also push notification
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

    form.reset();
    const dateInp = document.getElementById('clientBookDate');
    if (dateInp) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInp.value = tomorrow.toISOString().split('T')[0];
    }

    showToast('Appointment Confirmed!', `Booking Ref: ${ref}. Added to your appointments.`, 'success', 5000);
    switchDashTab('tabClientAppointments');
    loadClientAppointments();
    loadClientKPIs();
    initAppointmentTracker();
  });
}

// Load Client Reports
function loadClientReports() {
  const container = document.getElementById('clientReportsList');
  if (!container) return;

  const reports = JSON.parse(localStorage.getItem('apex_reports') || '[]');

  if (!reports.length) {
    container.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);">No reports currently on file.</div>`;
    return;
  }

  container.innerHTML = reports.map(r => {
    const badgeClass = r.status === 'Reviewed' ? 'badge-completed' :
                       r.status === 'Ready' ? 'badge-confirmed' : 'badge-processing';
    return `
      <div class="card-clinical" style="padding:1.5rem; margin-bottom:1rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
        <div style="display:flex; align-items:center; gap:1.25rem;">
          <div style="width:48px; height:48px; border-radius:12px; background:var(--teal-accent-light); color:var(--teal-accent); display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
            <i class="fa-regular fa-file-pdf"></i>
          </div>
          <div>
            <span style="font-size:0.75rem; font-weight:700; color:var(--teal-accent);">${r.reportId}</span>
            <h4 style="font-size:1.15rem; color:var(--primary-navy); margin:0.15rem 0;">${r.testName}</h4>
            <div style="font-size:0.8rem; color:var(--text-secondary);">
              Sample: ${r.specimen || 'Serum'} &bull; Published: ${r.date}
            </div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:1rem;">
          <span class="badge ${badgeClass}">${r.status}</span>
          <button type="button" class="btn btn-teal btn-sm" onclick="openSimulatedReportModal('${r.reportId}')">
            <i class="fa-regular fa-eye"></i> View Report
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Load Client Notifications
function loadClientNotifications() {
  const container = document.getElementById('clientNotifsList');
  if (!container) return;

  const notifs = JSON.parse(localStorage.getItem('apex_notifications') || '[]');
  const unreadCount = notifs.filter(n => !n.read).length;

  const bubble = document.getElementById('clientNotifBubble');
  if (bubble) {
    bubble.textContent = unreadCount;
    bubble.style.display = unreadCount > 0 ? 'flex' : 'none';
  }

  container.innerHTML = notifs.map(n => `
    <div class="notif-card-item ${n.read ? '' : 'unread'}" style="margin-bottom:0.75rem;">
      <div class="notif-type-icon">
        <i class="fa-solid ${n.type === 'appointment' ? 'fa-calendar-check' : 'fa-file-waveform'}"></i>
      </div>
      <div style="flex:1;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="font-size:0.9rem; color:var(--primary-navy);">${n.title}</strong>
          <span style="font-size:0.72rem; color:var(--text-muted);">${n.time}</span>
        </div>
        <p style="font-size:0.825rem; color:var(--text-secondary); margin:0.25rem 0 0 0;">${n.message}</p>
      </div>
    </div>
  `).join('');
}

// Re-use Simulated Report Modal
function openSimulatedReportModal(reportId) {
  const reports = JSON.parse(localStorage.getItem('apex_reports') || '[]');
  const r = reports.find(item => item.reportId === reportId);
  if (!r) return;

  let modal = document.getElementById('clientReportModal');
  if (!modal) {
    const markup = `
      <div class="modal-overlay" id="clientReportModal" aria-hidden="true">
        <div class="modal-container" role="dialog" style="max-width:760px;">
          <div class="modal-header">
            <div>
              <span class="badge badge-cancelled" style="margin-bottom:0.3rem;"><i class="fa-solid fa-triangle-exclamation"></i> DEMO — NOT FOR CLINICAL USE</span>
              <h3 class="modal-title" style="font-size:1.35rem;">Patient Diagnostic Report</h3>
            </div>
            <button type="button" class="modal-close-btn" data-close-modal="clientReportModal">&times;</button>
          </div>
          <div class="modal-body" id="clientReportContent">
            <!-- Dynamically Rendered Report Sheet -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline btn-sm" data-close-modal="clientReportModal">Close</button>
            <button type="button" class="btn btn-teal btn-sm" onclick="window.print()">
              <i class="fa-solid fa-print"></i> Print Demo Report
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', markup);
    modal = document.getElementById('clientReportModal');
    modal.querySelectorAll('[data-close-modal]').forEach(b => {
      b.addEventListener('click', () => closeModal('clientReportModal'));
    });
  }

  const container = document.getElementById('clientReportContent');
  container.innerHTML = `
    <div class="report-sheet">
      <div class="report-watermark">DEMO &bull; NOT FOR CLINICAL USE</div>

      <div class="report-header-banner">
        <div>
          <h2 style="font-family:var(--font-display); font-size:1.5rem; color:var(--primary-navy); margin-bottom:0.2rem;">APEX DIAGNOSTIC LABORATORY</h2>
          <div style="font-size:0.75rem; color:var(--text-secondary);">Accredited Reference Laboratory &bull; Medical Director: Julian Ross, MD</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.8rem; font-weight:700; color:var(--teal-accent);">PATIENT CLINICAL REPORT</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">ACCESSION: ${r.reportId}</div>
        </div>
      </div>

      <div class="report-meta-grid">
        <div class="report-meta-item"><strong>Patient Name:</strong> ${r.patientName}</div>
        <div class="report-meta-item"><strong>Patient ID:</strong> ${r.patientId || 'PT-1001'}</div>
        <div class="report-meta-item"><strong>Date Collected:</strong> ${r.date}</div>
        <div class="report-meta-item"><strong>Specimen Type:</strong> ${r.specimen || 'Serum'}</div>
        <div class="report-meta-item"><strong>Investigation:</strong> ${r.testName}</div>
        <div class="report-meta-item"><strong>Report Status:</strong> <span class="badge badge-confirmed">${r.status}</span></div>
      </div>

      <div class="table-responsive" style="margin-bottom:1.5rem;">
        <table class="clinical-table" style="border:1px solid var(--border-light);">
          <thead>
            <tr>
              <th>Analyte / Parameter</th>
              <th>Observed Result</th>
              <th>Biological Reference Interval</th>
              <th>Flag</th>
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
          <strong>Verified By:</strong><br>
          ${r.labDoctor || 'Dr. Julian Ross, MD'}<br>
          <em style="color:#EF4444;">* Simulated test findings for demonstration purposes only.</em>
        </div>
        <div style="text-align:center;">
          <div style="font-family:'DM Serif Display',serif; font-size:1.1rem; color:var(--primary-navy);">Julian Ross, MD</div>
          <div style="border-top:1px solid #000; width:130px; margin-top:2px;">Laboratory Signature</div>
        </div>
      </div>
    </div>
  `;

  openModal('clientReportModal');
}
