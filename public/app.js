const expenseForm = document.getElementById('expense-form');
const descriptionInput = document.getElementById('description');
const typeInput = document.getElementById('transaction-type');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const expenseList = document.getElementById('expense-list');
const categorySummary = document.getElementById('category-summary');
const incomeTotalElement = document.getElementById('income-total');
const expenseTotalElement = document.getElementById('expense-total');
const netTotalElement = document.getElementById('net-total');
const transactionCountElement = document.getElementById('transaction-count');
const messageBox = document.getElementById('message');

let editingId = null;
let messageTimeout = null;
let incomeChart = null;
let categoryChart = null;
let currentExpenses = [];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

function showMessage(message, isError = false) {
  messageBox.textContent = message;
  messageBox.style.color = isError ? '#dc2626' : '#0f766e';

  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }

  messageTimeout = setTimeout(() => {
    messageBox.textContent = '';
  }, 4000);
}

function resetForm() {
  expenseForm.reset();
  editingId = null;
  document.getElementById('save-button').textContent = 'Save Transaction';
}

function buildExpenseItem(expense) {
  const item = document.createElement('li');
  item.className = 'expense-item';

  const type = String(expense.type || 'expense').toLowerCase() === 'income' ? 'income' : 'expense';
  const typeLabel = type === 'income' ? 'Income' : 'Expense';

  item.innerHTML = `
    <div class="expense-item-header">
      <h3>${expense.description}</h3>
      <strong>${formatCurrency(expense.amount)}</strong>
    </div>
    <div class="expense-meta">
      <span class="type-badge ${type}">${typeLabel}</span>
      <span>${expense.category}</span>
      <span>${new Date(expense.date).toLocaleDateString()}</span>
    </div>
    <div class="expense-actions">
      <button type="button" class="edit">Edit</button>
      <button type="button" class="delete">Delete</button>
    </div>
  `;

  item.querySelector('.edit').addEventListener('click', () => {
    editingId = expense.id;
    descriptionInput.value = expense.description;
    typeInput.value = String(expense.type || 'expense').toLowerCase();
    amountInput.value = expense.amount;
    categoryInput.value = expense.category;
    dateInput.value = expense.date;
    document.getElementById('save-button').textContent = 'Update Transaction';
  });

  item.querySelector('.delete').addEventListener('click', async () => {
    if (!confirm('Delete this expense?')) {
      return;
    }
    try {
      const response = await fetch(`/api/expenses/${expense.id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Unable to delete expense');
      }
      await loadExpenses();
      showMessage('Expense deleted successfully.');
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  return item;
}

function renderCategorySummary(expenses) {
  const totals = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    acc[category] = (acc[category] || 0) + Number(expense.amount);
    return acc;
  }, {});

  if (Object.keys(totals).length === 0) {
    categorySummary.innerHTML = '<li>No categories yet.</li>';
    return;
  }

  categorySummary.innerHTML = Object.entries(totals)
    .map(
      ([category, amount]) => `
      <li>
        <span>${category}</span>
        <strong>${formatCurrency(amount)}</strong>
      </li>`
    )
    .join('');
}

function renderFundSummary(expenses) {
  const totals = expenses.reduce(
    (acc, expense) => {
      const type = String(expense.type || 'expense').toLowerCase() === 'income' ? 'income' : 'expense';
      acc[type] += Number(expense.amount);
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const net = totals.income - totals.expense;

  incomeTotalElement.textContent = formatCurrency(totals.income);
  expenseTotalElement.textContent = formatCurrency(totals.expense); 
  netTotalElement.textContent = formatCurrency(net); 
  transactionCountElement.textContent = expenses.length; 
  renderDashboardCharts(expenses);
}
function renderDashboardCharts(expenses) {
  const textColor = '#333';
  const gridColor = 'rgba(0, 0, 0, 0.1)';


  const income = expenses
    .filter((entry) => entry.type === 'income')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const expense = expenses
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const categoryTotals = {};

  expenses.forEach((expenseItem) => {
    if (expenseItem.type === 'expense') {
      const category = expenseItem.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(expenseItem.amount);
    }
  });

  const categoryLabels = Object.keys(categoryTotals);
  const categoryValues = Object.values(categoryTotals);

  const incomeCanvas = document.getElementById('incomeChart');
  const categoryCanvas = document.getElementById('categoryChart');

  if (incomeCanvas && window.Chart) {
    const incomeCtx = incomeCanvas.getContext('2d');
    if (incomeChart) {
      incomeChart.destroy();
    }

    incomeChart = new window.Chart(incomeCtx, {
      type: 'bar',
      data: {
        labels: ['Income', 'Expense'],
        datasets: [
          {
            data: [income, expense],
            backgroundColor: ['#22c55e', '#ef4444'],
            borderRadius: 10,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false, labels: { color: textColor } },
        },
        scales: {
          x: {
            ticks: { color: textColor },
            grid: { color: gridColor },
          },
          y: {
            beginAtZero: true,
            ticks: { color: textColor },
            grid: { color: gridColor },
          },
        },
      },
    });
  }

  if (categoryCanvas && window.Chart) {
    const categoryCtx = categoryCanvas.getContext('2d');
    if (categoryChart) {
      categoryChart.destroy();
    }

    categoryChart = new window.Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: categoryLabels,
        datasets: [
          {
            data: categoryValues,
            backgroundColor: ['#800020', '#E67E22', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor },
          },
        },
      },
    });
  }
}

async function loadExpenses() {
  try {
    const response = await fetch('/api/expenses');
    const expenses = await response.json(); 
    currentExpenses = expenses;

    expenseList.innerHTML = '';
    if (expenses.length === 0) {
      expenseList.innerHTML = '<li>No transactions yet. Add one to get started.</li>';
    }

    expenses.forEach((expense) => {
      expenseList.appendChild(buildExpenseItem(expense));
    });

    transactionCountElement.textContent = expenses.length;
    renderCategorySummary(expenses);
    renderFundSummary(expenses);
  } catch (error) {
    showMessage('Unable to load expenses.', true);
  }
}

expenseForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = {
    description: descriptionInput.value.trim(),
    type: String(typeInput.value || '').toLowerCase(),
    amount: Number(amountInput.value),
    category: categoryInput.value,
    date: dateInput.value,
  };

  if (!payload.description || !payload.type || !payload.amount || !payload.category || !payload.date) {
    showMessage('Please complete all fields.', true);
    return;
  }

  try {
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/expenses/${editingId}` : '/api/expenses';
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || 'Unable to save expense');
    }

    await loadExpenses();
    resetForm();
    showMessage(editingId ? 'Transaction updated successfully.' : 'Transaction added successfully.');
  } catch (error) {
    showMessage(error.message, true);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
    return;
  }

  // --- Settings Panel Logic ---
  const settingsToggle = document.getElementById('settings-toggle');
  const settingsPanel = document.getElementById('settings-panel');
  const logoutButton = document.getElementById('logout-button');

  // Toggle settings panel visibility
  settingsToggle.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
  });

  // Handle Logout
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
  });

  dateInput.value = new Date().toISOString().split('T')[0];
  loadExpenses();
});
