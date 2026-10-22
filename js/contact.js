/**
 * DIAGNOSTIC LABORATORY - CONTACT PAGE JS (contact.js)
 * Form validation with inline error states, phone/email regex check,
 * demo submission handling, and FAQ accordions.
 */

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initContactFaq();
});

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const phoneInput = document.getElementById('contactPhone');
  const typeSelect = document.getElementById('contactType');
  const subjectInput = document.getElementById('contactSubject');
  const messageInput = document.getElementById('contactMessage');
  const consentCheckbox = document.getElementById('contactConsent');
  const successBanner = document.getElementById('contactSuccessBanner');

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePhone(phone) {
    // Allows standard international and local formats (10-15 digits)
    const clean = String(phone).replace(/[^0-9]/g, '');
    return clean.length >= 10 && clean.length <= 15;
  }

  function setError(input, feedbackId, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    const feedback = document.getElementById(feedbackId);
    if (feedback) {
      feedback.textContent = message;
      feedback.classList.add('show');
    }
    return false;
  }

  function setValid(input, feedbackId) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    const feedback = document.getElementById(feedbackId);
    if (feedback) {
      feedback.classList.remove('show');
    }
    return true;
  }

  // Live input clearing of errors
  [nameInput, emailInput, phoneInput, subjectInput, messageInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        inp.classList.remove('is-invalid');
        const fb = inp.parentNode.querySelector('.invalid-feedback');
        if (fb) fb.classList.remove('show');
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // 1. Name
    if (!nameInput.value.trim() || nameInput.value.trim().length < 3) {
      isValid = setError(nameInput, 'nameFeedback', 'Please provide your full legal name (minimum 3 characters).');
    } else {
      setValid(nameInput, 'nameFeedback');
    }

    // 2. Email
    if (!nameInput.value.trim() || !validateEmail(emailInput.value.trim())) {
      isValid = setError(emailInput, 'emailFeedback', 'Please provide a valid email address (e.g., patient@example.com).') && isValid;
    } else {
      setValid(emailInput, 'emailFeedback');
    }

    // 3. Phone
    if (!phoneInput.value.trim() || !validatePhone(phoneInput.value.trim())) {
      isValid = setError(phoneInput, 'phoneFeedback', 'Please enter a valid phone number (at least 10 digits).') && isValid;
    } else {
      setValid(phoneInput, 'phoneFeedback');
    }

    // 4. Inquiry Type
    if (!typeSelect.value) {
      isValid = setError(typeSelect, 'typeFeedback', 'Please select an inquiry category.') && isValid;
    } else {
      setValid(typeSelect, 'typeFeedback');
    }

    // 5. Subject
    if (!subjectInput.value.trim() || subjectInput.value.trim().length < 4) {
      isValid = setError(subjectInput, 'subjectFeedback', 'Subject must be at least 4 characters.') && isValid;
    } else {
      setValid(subjectInput, 'subjectFeedback');
    }

    // 6. Message
    if (!messageInput.value.trim() || messageInput.value.trim().length < 15) {
      isValid = setError(messageInput, 'messageFeedback', 'Please describe your inquiry in greater detail (minimum 15 characters).') && isValid;
    } else {
      setValid(messageInput, 'messageFeedback');
    }

    // 7. Consent
    if (!consentCheckbox.checked) {
      const fb = document.getElementById('consentFeedback');
      if (fb) fb.classList.add('show');
      isValid = false;
    } else {
      const fb = document.getElementById('consentFeedback');
      if (fb) fb.classList.remove('show');
    }

    if (!isValid) {
      showToast('Validation Error', 'Please correct the highlighted fields before submitting.', 'warning');
      return;
    }

    // Successfully submitted: reset/clear all form inputs and validation states
    form.reset();

    [nameInput, emailInput, phoneInput, subjectInput, messageInput, typeSelect].forEach(inp => {
      if (inp) {
        inp.classList.remove('is-valid', 'is-invalid');
      }
    });
    document.querySelectorAll('.invalid-feedback.show').forEach(fb => fb.classList.remove('show'));
    if (consentCheckbox) consentCheckbox.checked = false;

    // Display confirmation banner
    if (successBanner) {
      successBanner.classList.add('active');
      successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    try {
      const notifs = JSON.parse(localStorage.getItem('apex_notifications') || '[]');
      notifs.unshift({
        id: 'MSG-' + Date.now().toString().slice(-4),
        title: 'New Contact Inquiry Received',
        message: 'Your message has been received and logged.',
        time: 'Just now',
        read: false,
        type: 'contact'
      });
      localStorage.setItem('apex_notifications', JSON.stringify(notifs));
    } catch (err) {}

    showToast('Inquiry Submitted', 'Your message has been sent successfully.', 'success');
  });
}

function initContactFaq() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (questionBtn && answer) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(other => {
          other.classList.remove('active');
          const otherAns = other.querySelector('.faq-answer');
          if (otherAns) otherAns.style.maxHeight = null;
        });

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
}
