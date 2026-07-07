document.getElementById('forgotPasswordForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const messageEl = document.getElementById('message');

  if (!email) {
    messageEl.textContent = 'Please enter your email address.';
    messageEl.style.color = 'red';
    return;
  }

  // In a real application, you would make an API call here to trigger a password reset email.
  // For this demo, we will just show a success message.
  messageEl.textContent = 'If an account with that email exists, password reset instructions have been sent.';
  messageEl.style.color = 'green';
});