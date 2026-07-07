document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (email === 'admin@gmail.com' && password === '123456') {

    localStorage.setItem('isLoggedIn', 'true');

    window.location.href = 'index.html';

  } else {
    alert('Invalid Credentials');
  }
});