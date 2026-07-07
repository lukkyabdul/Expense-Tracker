document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const messageEl = document.getElementById('message');

  messageEl.textContent = '';
  messageEl.style.color = 'red';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed.');
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', data.user.email);
    localStorage.setItem('userName', data.user.name);
    window.location.href = 'index.html';
  } catch (error) {
    messageEl.textContent = error.message;
  }
});