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
const chartContainer = document.getElementById('transaction-chart');
const messageBox = document.getElementById('message');

let editingId = null;
let messageTimeout = null;

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
  renderChart({ income: totals.income, expense: totals.expense, net });
}

function renderChart(values) {
  const maxValue = Math.max(values.income, values.expense, Math.abs(values.net), 1);

  chartContainer.innerHTML = Object.entries(values)
    .map(([key, amount]) => {
      const width = Math.round((Math.abs(amount) / maxValue) * 100);
      const label = key === 'net' ? 'Net' : key.charAt(0).toUpperCase() + key.slice(1);
      return `
        <div class="chart-row">
          <div class="chart-label">${label}</div>
          <div class="bar-wrapper">
            <div class="bar ${key}" style="width: ${width}%;"></div>
          </div>
          <div class="chart-value">${formatCurrency(amount)}</div>
        </div>`;
    })
    .join('');
}

async function loadExpenses() {
  try {
    const response = await fetch('/api/expenses');
    const expenses = await response.json();

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
  dateInput.value = new Date().toISOString().split('T')[0];
  loadExpenses();
});
