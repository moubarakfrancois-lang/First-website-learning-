/* Sign-in page — demo auth only. No real accounts, sessions, or OAuth calls happen here. */
let isSignUp = false;

document.getElementById('auth-toggle').addEventListener('click', (e) => {
  const link = e.target.closest('#toggle-mode');
  if (!link) return;
  e.preventDefault();
  isSignUp = !isSignUp;
  document.getElementById('auth-title').textContent = isSignUp ? 'Create your account' : 'Welcome back';
  document.getElementById('auth-sub').textContent = isSignUp
    ? 'Save your addresses and order history.'
    : 'Sign in to track orders and save your favorite scents.';
  document.getElementById('auth-submit').textContent = isSignUp ? 'Create Account' : 'Sign In';
  document.getElementById('auth-toggle').innerHTML = isSignUp
    ? `Already have an account? <a href="#" id="toggle-mode">Sign in</a>`
    : `Don't have an account? <a href="#" id="toggle-mode">Create one</a>`;
});

document.getElementById('auth-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  localStorage.setItem('candleist_user', JSON.stringify({ email, provider: 'email' }));
  showToast(isSignUp ? `Account created for ${email} (demo)` : `Signed in as ${email} (demo)`);
  setTimeout(() => (location.href = 'index.html'), 900);
});

function demoOAuthSignIn(provider, email) {
  localStorage.setItem('candleist_user', JSON.stringify({ email, provider }));
  showToast(`Signed in with ${provider} as ${email} (demo — connect a real OAuth client ID to go live)`);
  setTimeout(() => (location.href = 'index.html'), 1100);
}

document.getElementById('google-btn').addEventListener('click', () => demoOAuthSignIn('Google', 'demo.user@gmail.com'));
document.getElementById('facebook-btn').addEventListener('click', () => demoOAuthSignIn('Facebook', 'demo.user@facebook.com'));
