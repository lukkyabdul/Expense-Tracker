document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const messageEl = document.getElementById('message');

  messageEl.textContent = '';
  messageEl.style.color = 'red';

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed.');
    }

    messageEl.style.color = 'green';
    messageEl.textContent = 'Registration successful! Redirecting to login...';

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);

  } catch (error) {
    messageEl.textContent = error.message;
  }
});