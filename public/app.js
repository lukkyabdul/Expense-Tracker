// Antigravity Expense Tracker App Script

// ==========================================================================
// STATE MANAGEMENT & DOM ELEMENTS
// ==========================================================================
let currentTransactions = [];
let incomeChart = null;
let categoryChart = null;
let editingIncomeId = null;
let editingExpenseId = null;

// Auth data
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
const userEmail = localStorage.getItem('userEmail') || '';
const userName = localStorage.getItem('userName') || 'User';

// Header elements
const sidebarName = document.getElementById('sidebar-name');
const sidebarEmail = document.getElementById('sidebar-email');
const sidebarAvatar = document.getElementById('sidebar-avatar');
const headerName = document.getElementById('header-name');
const headerAvatar = document.getElementById('header-avatar');
const currentDateBox = document.getElementById('current-date-box');

// Stats Elements
const incomeTotalEl = document.getElementById('income-total');
const expenseTotalEl = document.getElementById('expense-total');
const netTotalEl = document.getElementById('net-total');
const transactionCountEl = document.getElementById('transaction-count');

// Message notification banner
const messageBanner = document.getElementById('message-banner');
let bannerTimeout = null;

// Page titles
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');

// ==========================================================================
// AUTHENTICATION GUARD
// ==========================================================================
if (!isLoggedIn || !userEmail) {
  window.location.href = 'login.html';
}

// ==========================================================================
// API HELPER FUNCTION (INJECTS USER EMAIL HEADER)
// ==========================================================================
async function apiFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-email': userEmail,
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    // If unauthorized, redirect to login
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
    return;
  }
  
  return response;
}

// ==========================================================================
// HELPER METHODS
// ==========================================================================
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function showNotification(message, isError = false) {
  if (bannerTimeout) clearTimeout(bannerTimeout);
  
  messageBanner.textContent = message;
  messageBanner.className = isError ? 'error' : 'success';
  
  bannerTimeout = setTimeout(() => {
    messageBanner.className = '';
  }, 4000);
}

// Generate dynamic color avatar based on name
function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&font-size=0.4`;
}

// Update profile indicators across the layout
function updateProfileUI(name, email) {
  sidebarName.textContent = name;
  sidebarEmail.textContent = email;
  headerName.textContent = name;
  
  const avatarUrl = getAvatarUrl(name);
  sidebarAvatar.src = avatarUrl;
  headerAvatar.src = avatarUrl;
  
  const settingsAvatar = document.getElementById('settings-avatar');
  const settingsProfileName = document.getElementById('settings-profile-name');
  const settingsProfileEmail = document.getElementById('settings-profile-email');
  
  if (settingsAvatar) settingsAvatar.src = avatarUrl;
  if (settingsProfileName) settingsProfileName.textContent = name;
  if (settingsProfileEmail) settingsProfileEmail.textContent = email;
  
  const profileNameInput = document.getElementById('profile-name');
  if (profileNameInput && !profileNameInput.value) {
    profileNameInput.value = name;
  }
}

// ==========================================================================
// TAB ROUTING MANAGEMENT (SPA VIEW SWITCHER)
// ==========================================================================
const tabSelectors = document.querySelectorAll('.sidebar ul li');
const tabContents = document.querySelectorAll('.tab-content');

const tabSubtitles = {
  dashboard: 'Welcome back! Manage your finances smarter.',
  income: 'Track and manage your revenue streams.',
  expense: 'Stay on top of what you spend.',
  settings: 'Manage user profile settings and interface themes.'
};

tabSelectors.forEach(selector => {
  selector.addEventListener('click', () => {
    const targetTab = selector.getAttribute('data-tab');
    
    // Set active link style
    tabSelectors.forEach(item => item.classList.remove('active'));
    selector.classList.add('active');
    
    // Switch visible tab panel
    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === `${targetTab}-tab`) {
        content.classList.add('active');
      }
    });

    // Update Header Text dynamically
    pageTitle.textContent = selector.textContent.replace(/[^\w\s]/g, '').trim() + ' Overview';
    if (targetTab === 'settings') {
      pageTitle.textContent = 'Settings & Preferences';
    }
    pageSubtitle.textContent = tabSubtitles[targetTab] || '';
    
    // Refresh datasets when switching to views
    loadData();
  });
});

// ==========================================================================
// THEME SWITCHER SYSTEM
// ==========================================================================
const themeOptions = document.querySelectorAll('.theme-option');

function applyTheme(themeName) {
  document.body.className = '';
  document.body.classList.add(themeName);
  localStorage.setItem('selectedTheme', themeName);

  themeOptions.forEach(opt => {
    opt.classList.remove('active');
    if (opt.getAttribute('data-theme') === themeName) {
      opt.classList.add('active');
    }
  });
}

themeOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    const selectedTheme = opt.getAttribute('data-theme');
    applyTheme(selectedTheme);
    showNotification(`Theme updated to ${opt.querySelector('.theme-name').textContent}`);
  });
});

// Initialize Theme
const savedTheme = localStorage.getItem('selectedTheme') || 'theme-crimson';
applyTheme(savedTheme);

// ==========================================================================
// DATA LOADING AND RE-RENDERING
// ==========================================================================
async function loadData() {
  try {
    const [expensesRes, summaryRes] = await Promise.all([
      apiFetch('/api/expenses'),
      apiFetch('/api/summary')
    ]);

    if (!expensesRes.ok || !summaryRes.ok) {
      throw new Error('Failed to download ledger stats.');
    }

    currentTransactions = await expensesRes.json();
    const summaryData = await summaryRes.json();

    // Render components
    renderStats(summaryData);
    renderDashboardCharts(currentTransactions);
    renderRecentTransactions(currentTransactions.slice(0, 5));
    renderIncomeList();
    renderExpenseList();
  } catch (error) {
    showNotification(error.message, true);
  }
}

// Render header stats
function renderStats(summary) {
  incomeTotalEl.textContent = formatCurrency(summary.income);
  expenseTotalEl.textContent = formatCurrency(summary.expense);
  
  const net = summary.net;
  netTotalEl.textContent = formatCurrency(net);
  
  // Color code Net Balance dynamically
  const balanceCard = document.querySelector('.balance-card');
  if (net < 0) {
    netTotalEl.style.color = '#ef4444';
  } else {
    netTotalEl.style.color = '';
  }
  
  transactionCountEl.textContent = summary.count;
}

// Render Recent Table (Dashboard view)
function renderRecentTransactions(transactions) {
  const tbody = document.getElementById('recent-transactions-tbody');
  if (!tbody) return;

  if (transactions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="no-data">No transactions logged yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = transactions.map(item => {
    const isIncome = item.type === 'income';
    const typeLabel = isIncome ? 'Income' : 'Expense';
    const typeBadge = isIncome ? 'badge income' : 'badge expense';
    const amtColor = isIncome ? 'amount-text income' : 'amount-text expense';
    const sign = isIncome ? '+' : '-';

    return `
      <tr>
        <td>${formatDate(item.date)}</td>
        <td><span class="badge cat">${item.category}</span></td>
        <td><span class="${typeBadge}">${typeLabel}</span></td>
        <td>${item.description}</td>
        <td><span class="${amtColor}">${sign} ${formatCurrency(item.amount)}</span></td>
      </tr>
    `;
  }).join('');
}

// ==========================================================================
// CHARTS DESIGN WITH CHART.JS
// ==========================================================================
function renderDashboardCharts(transactions) {
  const isDarkTheme = document.body.classList.contains('theme-ocean') || document.body.classList.contains('theme-cyberpunk');
  const textColor = isDarkTheme ? '#94a3b8' : '#475569';
  const gridColor = isDarkTheme ? '#1e293b' : '#f1f5f9';

  // Process data for Income vs Expense
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

  // Bar Chart
  const incomeCtx = document.getElementById('incomeChart');
  if (incomeCtx) {
    if (incomeChart) incomeChart.destroy();
    
    incomeChart = new Chart(incomeCtx, {
      type: 'bar',
      data: {
        labels: ['Income', 'Expense'],
        datasets: [{
          data: [totalIncome, totalExpense],
          backgroundColor: ['#10b981', '#ef4444'],
          borderRadius: 12,
          barThickness: 45
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true }
        }
      }
    });
  }

  // Expense Categories Doughnut Chart
  const categoryTotals = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
  });

  const categoryLabels = Object.keys(categoryTotals);
  const categoryValues = Object.values(categoryTotals);

  const categoryCtx = document.getElementById('categoryChart');
  if (categoryCtx) {
    if (categoryChart) categoryChart.destroy();

    if (categoryLabels.length === 0) {
      // Empty placeholder doughnut state
      categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: ['No Expenses'],
          datasets: [{
            data: [1],
            backgroundColor: [isDarkTheme ? '#1e293b' : '#e2e8f0']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor } }
          }
        }
      });
    } else {
      categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: categoryLabels,
          datasets: [{
            data: categoryValues,
            backgroundColor: ['#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e', '#10b981', '#64748b']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor } }
          }
        }
      });
    }
  }
}

// ==========================================================================
// INCOME MANAGEMENT LOGIC
// ==========================================================================
const incomeForm = document.getElementById('income-form');
const incomeListTbody = document.getElementById('income-list-tbody');
const incomeSearchFilter = document.getElementById('income-search-filter');
const incomeCategoryFilter = document.getElementById('income-category-filter');
const incomeSubmitBtn = document.getElementById('income-submit-btn');
const incomeCancelBtn = document.getElementById('income-cancel-btn');

function renderIncomeList() {
  if (!incomeListTbody) return;

  const searchQuery = (incomeSearchFilter?.value || '').toLowerCase().trim();
  const categoryFilter = incomeCategoryFilter?.value || '';

  const filteredIncomes = currentTransactions.filter(item => {
    if (item.type !== 'income') return false;
    const matchSearch = item.description.toLowerCase().includes(searchQuery);
    const matchCategory = categoryFilter === '' || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  if (filteredIncomes.length === 0) {
    incomeListTbody.innerHTML = `<tr><td colspan="5" class="no-data">No income records matching filters.</td></tr>`;
    return;
  }

  incomeListTbody.innerHTML = filteredIncomes.map(item => `
    <tr>
      <td>${formatDate(item.date)}</td>
      <td>${item.description}</td>
      <td><span class="badge cat">${item.category}</span></td>
      <td><span class="amount-text income">${formatCurrency(item.amount)}</span></td>
      <td>
        <div class="action-buttons">
          <button type="button" class="btn-icon edit-btn" onclick="editIncome(${item.id})">✏️</button>
          <button type="button" class="btn-icon delete-btn" onclick="deleteTransaction(${item.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Wire filters
incomeSearchFilter?.addEventListener('input', renderIncomeList);
incomeCategoryFilter?.addEventListener('change', renderIncomeList);

incomeForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const description = document.getElementById('income-description').value.trim();
  const amount = Number(document.getElementById('income-amount').value);
  const category = document.getElementById('income-category').value;
  const date = document.getElementById('income-date').value;

  if (!description || !amount || !category || !date) {
    showNotification('Please fill out all fields.', true);
    return;
  }

  const payload = { description, amount, category, date, type: 'income' };

  try {
    let res;
    if (editingIncomeId) {
      res = await apiFetch(`/api/expenses/${editingIncomeId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      res = await apiFetch('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to save income record.');
    }

    showNotification(editingIncomeId ? 'Income record updated.' : 'Income transaction saved!');
    resetIncomeForm();
    loadData();
  } catch (error) {
    showNotification(error.message, true);
  }
});

function editIncome(id) {
  const transaction = currentTransactions.find(t => t.id === id);
  if (!transaction) return;

  editingIncomeId = id;
  document.getElementById('income-description').value = transaction.description;
  document.getElementById('income-amount').value = transaction.amount;
  document.getElementById('income-category').value = transaction.category;
  document.getElementById('income-date').value = transaction.date;

  document.getElementById('income-form-title').textContent = '✏️ Edit Income';
  incomeSubmitBtn.textContent = 'Update Income';
  incomeCancelBtn.style.display = 'block';

  // Smooth scroll form into view on mobile
  document.getElementById('income-form').scrollIntoView({ behavior: 'smooth' });
}

function resetIncomeForm() {
  editingIncomeId = null;
  incomeForm.reset();
  document.getElementById('income-form-title').textContent = '➕ Add Income';
  incomeSubmitBtn.textContent = 'Save Income';
  incomeCancelBtn.style.display = 'none';
  // set default date
  document.getElementById('income-date').value = new Date().toISOString().split('T')[0];
}

incomeCancelBtn?.addEventListener('click', resetIncomeForm);
window.editIncome = editIncome; // Expose to global scope for HTML inline calls

// ==========================================================================
// EXPENSE MANAGEMENT LOGIC
// ==========================================================================
const expenseForm = document.getElementById('expense-form');
const expenseListTbody = document.getElementById('expense-list-tbody');
const expenseSearchFilter = document.getElementById('expense-search-filter');
const expenseCategoryFilter = document.getElementById('expense-category-filter');
const expenseSubmitBtn = document.getElementById('expense-submit-btn');
const expenseCancelBtn = document.getElementById('expense-cancel-btn');

function renderExpenseList() {
  if (!expenseListTbody) return;

  const searchQuery = (expenseSearchFilter?.value || '').toLowerCase().trim();
  const categoryFilter = expenseCategoryFilter?.value || '';

  const filteredExpenses = currentTransactions.filter(item => {
    if (item.type !== 'expense') return false;
    const matchSearch = item.description.toLowerCase().includes(searchQuery);
    const matchCategory = categoryFilter === '' || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  if (filteredExpenses.length === 0) {
    expenseListTbody.innerHTML = `<tr><td colspan="5" class="no-data">No expense records matching filters.</td></tr>`;
    return;
  }

  expenseListTbody.innerHTML = filteredExpenses.map(item => `
    <tr>
      <td>${formatDate(item.date)}</td>
      <td>${item.description}</td>
      <td><span class="badge cat">${item.category}</span></td>
      <td><span class="amount-text expense">${formatCurrency(item.amount)}</span></td>
      <td>
        <div class="action-buttons">
          <button type="button" class="btn-icon edit-btn" onclick="editExpense(${item.id})">✏️</button>
          <button type="button" class="btn-icon delete-btn" onclick="deleteTransaction(${item.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Wire filters
expenseSearchFilter?.addEventListener('input', renderExpenseList);
expenseCategoryFilter?.addEventListener('change', renderExpenseList);

expenseForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const description = document.getElementById('expense-description').value.trim();
  const amount = Number(document.getElementById('expense-amount').value);
  const category = document.getElementById('expense-category').value;
  const date = document.getElementById('expense-date').value;

  if (!description || !amount || !category || !date) {
    showNotification('Please fill out all fields.', true);
    return;
  }

  const payload = { description, amount, category, date, type: 'expense' };

  try {
    let res;
    if (editingExpenseId) {
      res = await apiFetch(`/api/expenses/${editingExpenseId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      res = await apiFetch('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to save expense record.');
    }

    showNotification(editingExpenseId ? 'Expense record updated.' : 'Expense transaction saved!');
    resetExpenseForm();
    loadData();
  } catch (error) {
    showNotification(error.message, true);
  }
});

function editExpense(id) {
  const transaction = currentTransactions.find(t => t.id === id);
  if (!transaction) return;

  editingExpenseId = id;
  document.getElementById('expense-description').value = transaction.description;
  document.getElementById('expense-amount').value = transaction.amount;
  document.getElementById('expense-category').value = transaction.category;
  document.getElementById('expense-date').value = transaction.date;

  document.getElementById('expense-form-title').textContent = '✏️ Edit Expense';
  expenseSubmitBtn.textContent = 'Update Expense';
  expenseCancelBtn.style.display = 'block';

  document.getElementById('expense-form').scrollIntoView({ behavior: 'smooth' });
}

function resetExpenseForm() {
  editingExpenseId = null;
  expenseForm.reset();
  document.getElementById('expense-form-title').textContent = '➕ Add Expense';
  expenseSubmitBtn.textContent = 'Save Expense';
  expenseCancelBtn.style.display = 'none';
  document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
}

expenseCancelBtn?.addEventListener('click', resetExpenseForm);
window.editExpense = editExpense; // Expose to global scope

// ==========================================================================
// DELETE TRANSACTION (SHARED METHOD)
// ==========================================================================
async function deleteTransaction(id) {
  if (!confirm('Are you sure you want to permanently delete this transaction?')) return;

  try {
    const res = await apiFetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      throw new Error('Could not delete transaction from database.');
    }

    showNotification('Transaction deleted successfully.');
    
    // If we delete the one being edited, reset forms
    if (editingIncomeId === id) resetIncomeForm();
    if (editingExpenseId === id) resetExpenseForm();

    loadData();
  } catch (error) {
    showNotification(error.message, true);
  }
}
window.deleteTransaction = deleteTransaction; // Expose to global scope

// ==========================================================================
// PROFILE MANAGEMENT LOGIC
// ==========================================================================
const profileForm = document.getElementById('profile-form');

async function loadProfile() {
  try {
    const res = await apiFetch('/api/profile');
    if (!res.ok) throw new Error('Profile download failed.');
    
    const profile = await res.json();
    localStorage.setItem('userName', profile.name);
    updateProfileUI(profile.name, profile.email);
  } catch (error) {
    console.error(error.message);
    // fallback UI indicators
    updateProfileUI(userName, userEmail);
  }
}

profileForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('profile-name').value.trim();
  const password = document.getElementById('profile-current-password').value;
  const newPassword = document.getElementById('profile-new-password').value;

  if (!name || !password) {
    showNotification('Display Name and Current Password are required.', true);
    return;
  }

  const payload = { name, password };
  if (newPassword) {
    payload.newPassword = newPassword;
  }

  try {
    const res = await apiFetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update profile.');
    }

    showNotification('Profile updated successfully!');
    document.getElementById('profile-current-password').value = '';
    document.getElementById('profile-new-password').value = '';
    
    // Refresh user details in display
    localStorage.setItem('userName', data.user.name);
    updateProfileUI(data.user.name, data.user.email);
  } catch (error) {
    showNotification(error.message, true);
  }
});

// ==========================================================================
// INITIAL SETUP ON PAGELOAD
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
  // Set default form dates
  const todayStr = new Date().toISOString().split('T')[0];
  const incDate = document.getElementById('income-date');
  const expDate = document.getElementById('expense-date');
  if (incDate) incDate.value = todayStr;
  if (expDate) expDate.value = todayStr;

  // Format header calendar box
  if (currentDateBox) {
    currentDateBox.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Handle Logout
  const logoutBtn = document.getElementById('logout-button');
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
  });

  // Pull initial records
  loadProfile();
  loadData();
});
