const API_BASE = "http://localhost:3000/api";

// ── Helpers ──────────────────────────────────────────────────
function showError(msg) {
  const banner = document.getElementById('error-banner');
  banner.textContent = msg;
  banner.style.display = 'block';
}

function hideError() {
  document.getElementById('error-banner').style.display = 'none';
}

function setLoading(on) {
  document.getElementById('login-btn').disabled = on;
  document.getElementById('btn-text').textContent = on ? 'Signing in…' : 'Sign in';
  document.getElementById('spinner').style.display = on ? 'block' : 'none';
}

function markField(id, errorId, valid) {
  document.getElementById(id).classList.toggle('error', !valid);
  document.getElementById(errorId).style.display = valid ? 'none' : 'block';
}

// ── Toggle password visibility ───────────────────────────────
document.getElementById('toggle-pw').addEventListener('click', function () {
  const pw = document.getElementById('password');
  const isHidden = pw.type === 'password';
  pw.type = isHidden ? 'text' : 'password';
  this.textContent = isHidden ? '🙈' : '👁';
});

// ── Clear errors on input ────────────────────────────────────
document.getElementById('email').addEventListener('input', function () {
  markField('email', 'email-error', true);
  hideError();
});

document.getElementById('password').addEventListener('input', function () {
  markField('password', 'password-error', true);
  hideError();
});

// ── Rate limiting (3 attempts per minute) ────────────────────
let attempts = 0;
let lockUntil = 0;

// ── Redirect if already logged in ────────────────────────────
if (localStorage.getItem('token')) {
  window.location.href = 'dashboard.html';
}

// ── Form submit ──────────────────────────────────────────────
document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  hideError();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passOk  = password.length >= 8;

  markField('email',    'email-error',    emailOk);
  markField('password', 'password-error', passOk);

  if (!emailOk || !passOk) return;

  if (Date.now() < lockUntil) {
    const secs = Math.ceil((lockUntil - Date.now()) / 1000);
    showError(`Too many attempts. Please wait ${secs} seconds.`);
    return;
  }

  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      attempts++;
      if (attempts >= 3) {
        lockUntil = Date.now() + 60000;
        attempts = 0;
        showError('Too many failed attempts. Please wait 60 seconds.');
      } else {
        showError(data.message || 'Invalid email or password.');
      }
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    attempts = 0;
    window.location.href = 'dashboard.html';

  } catch (err) {
    console.error(err);
    showError('Could not reach the server. Please make sure the backend is running and try again.');
  } finally {
    setLoading(false);
  }
});