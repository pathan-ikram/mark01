const API_BASE = "http://10.143.172.186:3000/api";

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showError(msg) {
  const banner = document.getElementById('error-banner');
  document.getElementById('success-banner').style.display = 'none';
  banner.textContent = msg;
  banner.style.display = 'block';
}

function showSuccess(msg) {
  const banner = document.getElementById('success-banner');
  document.getElementById('error-banner').style.display = 'none';
  banner.textContent = msg;
  banner.style.display = 'block';
}

function hideBanners() {
  document.getElementById('error-banner').style.display = 'none';
  document.getElementById('success-banner').style.display = 'none';
}

function setLoading(on) {
  document.getElementById('signup-btn').disabled = on;
  document.getElementById('btn-text').textContent = on ? 'Creating accountâ€¦' : 'Create account';
  document.getElementById('spinner').style.display = on ? 'block' : 'none';
}

function markField(id, errorId, valid) {
  document.getElementById(id).classList.toggle('error', !valid);
  document.getElementById(errorId).style.display = valid ? 'none' : 'block';
}

// â”€â”€ Toggle password visibility â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.getElementById('toggle-pw').addEventListener('click', function () {
  const pw = document.getElementById('password');
  const confirmPw = document.getElementById('confirm-password');
  const isHidden = pw.type === 'password';
  pw.type = isHidden ? 'text' : 'password';
  confirmPw.type = isHidden ? 'text' : 'password';
  this.textContent = isHidden ? 'ðŸ™ˆ' : 'ðŸ‘';
});

// â”€â”€ Clear errors on input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
['fullname', 'username', 'email', 'password', 'confirm-password'].forEach((id) => {
  document.getElementById(id).addEventListener('input', function () {
    markField(id, id + '-error', true);
    hideBanners();
  });
});

// â”€â”€ Redirect if already logged in â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
if (localStorage.getItem('token')) {
  window.location.href = 'dashboard.html';
}

// â”€â”€ Form submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.getElementById('signup-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  hideBanners();

  const fullname        = document.getElementById('fullname').value.trim();
  const username         = document.getElementById('username').value.trim();
  const email            = document.getElementById('email').value.trim();
  const phone            = document.getElementById('phone').value.trim();
  const country          = document.getElementById('country').value.trim();
  const password         = document.getElementById('password').value;
  const confirmPassword  = document.getElementById('confirm-password').value;

  const fullnameOk = fullname.length > 0;
  const usernameOk = /^[a-zA-Z0-9_]{3,50}$/.test(username);
  const emailOk    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passOk     = password.length >= 8;
  const confirmOk  = password === confirmPassword && confirmPassword.length > 0;

  markField('fullname', 'fullname-error', fullnameOk);
  markField('username', 'username-error', usernameOk);
  markField('email', 'email-error', emailOk);
  markField('password', 'password-error', passOk);
  markField('confirm-password', 'confirm-password-error', confirmOk);

  if (!fullnameOk || !usernameOk || !emailOk || !passOk || !confirmOk) return;

  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname,
        username,
        email,
        password,
        phone: phone || null,
        country: country || null
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showError(data.message || 'Could not create account.');
      return;
    }

    // If the backend issues a token on signup, log the user in immediately
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showSuccess('Account created! Redirectingâ€¦');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } else {
      // No token returned â€” send to login instead
      showSuccess('Account created! Redirecting to sign inâ€¦');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    }

  } catch (err) {
    console.error(err);
    showError('Could not reach the server. Please make sure the backend is running and try again.');
  } finally {
    setLoading(false);
  }
});

