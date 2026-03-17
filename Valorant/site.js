// site.js — handles modal sign-in, toasts, username display, popup forgot flow, and reset handling
document.addEventListener('DOMContentLoaded', function () {
  // toast helper
  function showToast(message, ms = 2000) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 240);
    }, ms);
  }

  /* -----------------------
     Sign-in modal + navbar username
     ----------------------- */
  const modal = document.getElementById('signinModal');
  const modalClose = modal ? modal.querySelector('.modal-close') : null;
  const signinForm = document.getElementById('signinForm');

  function openModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('show');
    const first = modal.querySelector('input,button');
    if (first) first.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('show');
  }

  function updateUserDisplay(username) {
    const userDisplay = document.getElementById('userDisplay');
    if (!userDisplay) return;
    if (username) {
      userDisplay.innerHTML = `
        <span class="user-name">${username}</span>
        <button id="signOutBtn" class="nav-signin" style="margin-left:10px;">Sign out</button>
      `;
      const signOutBtn = document.getElementById('signOutBtn');
      if (signOutBtn) {
        signOutBtn.addEventListener('click', function (e) {
          e.preventDefault();
          localStorage.removeItem('currentUser');
          updateUserDisplay('');
          showToast('Signed out', 1200);
        });
      }
    } else {
      userDisplay.innerHTML = '<button id="signInBtn" class="nav-signin">Sign in</button>';
      const signInBtn = document.getElementById('signInBtn');
      if (signInBtn) {
        signInBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
      }
    }
  }

  // Ensure click handler for sign-in button (userDisplay may be dynamic)
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) {
    userDisplay.addEventListener('click', function (e) {
      if (e.target.id === 'signInBtn') {
        e.preventDefault();
        openModal();
      }
    });
  }

  if (modalClose) modalClose.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Sign-in submission: store username and show in navbar
  if (signinForm) {
    signinForm.addEventListener('submit', function (e) {
      if (!signinForm.checkValidity()) return;
      e.preventDefault();
      const usernameInput = document.getElementById('si-Username');
      const username = usernameInput ? usernameInput.value.trim() : 'User';
      localStorage.setItem('currentUser', username);
      updateUserDisplay(username);
      showToast('Signed in — welcome!', 1200);
      closeModal();
    });
  }

  // On load restore user
  (function checkUserOnLoad() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) updateUserDisplay(savedUser);
  })();

  /* -----------------------
     Reset / forgot-password handling (parent-side modal)
     ----------------------- */
  const resetModal = document.getElementById('resetModal');
  const resetModalClose = resetModal ? resetModal.querySelector('.modal-close') : null;
  const resetEmailEl = document.getElementById('resetEmail');
  const openResetFormBtn = document.getElementById('openResetForm');
  const dismissResetBtn = document.getElementById('dismissReset');
  const resetForm = document.getElementById('resetForm');
  const resetView = document.getElementById('resetView');
  const resetSuccess = document.getElementById('resetSuccess');
  const closeSuccessBtn = document.getElementById('closeSuccess');

  function openResetModal() {
    if (!resetModal) return;
    resetModal.setAttribute('aria-hidden', 'false');
    resetModal.classList.add('show');
    const first = resetModal.querySelector('button, input, a');
    if (first) first.focus();
  }
  function closeResetModal() {
    if (!resetModal) return;
    resetModal.setAttribute('aria-hidden', 'true');
    resetModal.classList.remove('show');
    if (resetView) resetView.style.display = '';
    if (resetForm) resetForm.style.display = 'none';
    if (resetSuccess) resetSuccess.style.display = 'none';
  }

  if (resetModalClose) resetModalClose.addEventListener('click', (e) => { e.preventDefault(); closeResetModal(); });
  if (resetModal) resetModal.addEventListener('click', (e) => { if (e.target === resetModal) closeResetModal(); });
  if (dismissResetBtn) dismissResetBtn.addEventListener('click', (e) => { e.preventDefault(); closeResetModal(); });
  if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', (e) => { e.preventDefault(); closeResetModal(); });

  if (openResetFormBtn) {
    openResetFormBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (resetView) resetView.style.display = 'none';
      if (resetForm) { resetForm.style.display = ''; const first = resetForm.querySelector('input'); if (first) first.focus(); }
    });
  }

  // Reset password validation controls (parent modal)
  const newPwd = document.getElementById('newPassword');
  const newConfirm = document.getElementById('confirmNew');
  const resetPwStatus = document.getElementById('resetPwStatus');
  const resetConfirmStatus = document.getElementById('resetConfirmStatus');
  const doResetBtn = document.getElementById('doReset');

  const strongPwRegex = /^(?=.{8,18}$)(?=.*[A-Z])(?=.*[^A-Za-z0-9]).*$/;

  function updateResetPwStatus() {
    if (!newPwd || !resetPwStatus) return;
    const ok = strongPwRegex.test(newPwd.value);
    if (ok) { resetPwStatus.classList.remove('invalid'); resetPwStatus.classList.add('valid'); resetPwStatus.textContent = '✓'; }
    else { resetPwStatus.classList.remove('valid'); resetPwStatus.classList.add('invalid'); resetPwStatus.textContent = '✕'; }
  }
  function updateResetConfirmStatus() {
    if (!newConfirm || !resetConfirmStatus) return;
    const match = newConfirm.value !== '' && newPwd.value === newConfirm.value;
    if (match) { resetConfirmStatus.classList.remove('invalid'); resetConfirmStatus.classList.add('valid'); resetConfirmStatus.textContent = '✓'; }
    else { resetConfirmStatus.classList.remove('valid'); resetConfirmStatus.classList.add('invalid'); resetConfirmStatus.textContent = '✕'; }
  }
  function updateDoResetButton() {
    if (!doResetBtn || !newPwd || !newConfirm) return;
    const allGood = strongPwRegex.test(newPwd.value) && newPwd.value === newConfirm.value;
    doResetBtn.disabled = !allGood;
  }
  if (newPwd) newPwd.addEventListener('input', function () { updateResetPwStatus(); updateResetConfirmStatus(); updateDoResetButton(); });
  if (newConfirm) newConfirm.addEventListener('input', function () { updateResetConfirmStatus(); updateDoResetButton(); });

  if (resetForm) {
    resetForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!strongPwRegex.test(newPwd.value) || newPwd.value !== newConfirm.value) {
        showToast('Please fix the password fields', 1600);
        return;
      }
      if (resetForm) resetForm.style.display = 'none';
      if (resetSuccess) resetSuccess.style.display = '';
      showToast('Password updated (demo)', 1600);
      setTimeout(() => { closeResetModal(); }, 1400);
    });
  }

  /* -----------------------
     Message listener for popup interactions (supports both flows)
     - 'reset-link'  : popup posted a reset link payload (older flow)
     - 'reset-success': popup posted that reset succeeded (reset-password.html)
     ----------------------- */
  window.addEventListener('message', function (ev) {
    try {
      const data = ev.data || {};
      if (data && data.type === 'reset-link') {
        if (resetEmailEl) resetEmailEl.textContent = data.email || 'your email';
        openResetModal();
        showToast('Reset link received on the main page', 1400);
      } else if (data && data.type === 'reset-success') {
        showToast('Password reset successful for ' + (data.email || ''), 1600);
        setTimeout(() => { openModal(); }, 700);
      }
    } catch (err) {
      // ignore
    }
  }, false);

  /* -----------------------
     Open modal from URL hash/query (signin or reset)
     ----------------------- */
  (function openModalFromUrl() {
    const shouldOpenHash = location.hash === '#signin';
    const shouldOpenQuery = new URLSearchParams(location.search).get('open') === 'signin';
    if (shouldOpenHash || shouldOpenQuery) {
      setTimeout(() => { openModal(); try { history.replaceState(null, '', location.pathname); } catch (err) {} }, 60);
    }
    const resetToken = new URLSearchParams(location.search).get('reset');
    if (resetToken) {
      setTimeout(() => {
        if (resetEmailEl) resetEmailEl.textContent = 'your email (via link)';
        openResetModal();
        if (resetView) resetView.style.display = 'none';
        if (resetForm) resetForm.style.display = '';
      }, 120);
      try { history.replaceState(null, '', location.pathname); } catch (err) {}
    }
  })();

  /* -----------------------
     Generic form confirmation handler for non-modal forms
     ----------------------- */
  document.querySelectorAll('form').forEach(form => {
    if (form.id === 'signinForm' || form.id === 'resetForm') return;
    form.addEventListener('submit', function (e) {
      const proceed = confirm('Are you sure you want to submit this form?');
      if (!proceed) {
        e.preventDefault();
        showToast('Submission cancelled', 1400);
      } else {
        showToast('Form submitted', 1200);
      }
    });
  });

  /* -----------------------
     Open forgot-password in centered popup (from sign-in modal)
     Element expected: <a id="openForgot" ...>
     ----------------------- */
  const openForgot = document.getElementById('openForgot');
  if (openForgot) {
    openForgot.addEventListener('click', function (e) {
      e.preventDefault();
      const w = 420, h = 520;
      const left = Math.max(0, Math.round((screen.width / 2) - (w / 2)));
      const top = Math.max(0, Math.round((screen.height / 2) - (h / 2)));
      window.open('forgot-password.html', 'forgot', `width=${w},height=${h},left=${left},top=${top}`);
    });
  }

});