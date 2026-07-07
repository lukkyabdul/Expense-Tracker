const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDb, getExpenses, getExpense, createExpense, updateExpense, deleteExpense } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

initDb();

app.use(cors());
app.use(express.json());

function normalizeExpense(row) {
  return {
    id: row.id,
    description: row.description,
    type: String(row.type || 'expense').toLowerCase(),
    amount: Number(row.amount),
    category: row.category,
    date: row.date,
  };
}

function isValidDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function validateExpense(expense) {
  const errors = [];
  if (!expense || typeof expense !== 'object') {
    errors.push('Expense must be an object.');
    return errors;
  }

  if (!expense.description || !expense.description.toString().trim()) {
    errors.push('Description is required.');
  }

  const typeValue = String(expense.type || '').toLowerCase();
  if (!['income', 'expense'].includes(typeValue)) {
    errors.push('Type must be income or expense.');
  }

  const amount = Number(expense.amount);
  if (expense.amount == null || Number.isNaN(amount)) {
    errors.push('Amount must be a number.');
  } else if (amount <= 0) {
    errors.push('Amount must be greater than zero.');
  }

  if (!expense.category || !expense.category.toString().trim()) {
    errors.push('Category is required.');
  }

  if (!expense.date || !isValidDate(expense.date)) {
    errors.push('Date is required and must be valid.');
  }

  return errors;
}

app.get('/api/expenses', (req, res) => {
  const { category, type, from, to } = req.query;
  let rows = getExpenses();

  if (category) {
    rows = rows.filter((item) => item.category.toLowerCase() === String(category).toLowerCase());
  }

  if (type) {
    rows = rows.filter((item) => String(item.type).toLowerCase() === String(type).toLowerCase());
  }

  if (from && isValidDate(from)) {
    rows = rows.filter((item) => new Date(item.date) >= new Date(from));
  }

  if (to && isValidDate(to)) {
    rows = rows.filter((item) => new Date(item.date) <= new Date(to));
  }

  rows = rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(rows.map(normalizeExpense));
});

app.get('/api/expenses/:id', (req, res) => {
  const expense = getExpense(req.params.id);
  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.json(normalizeExpense(expense));
});

app.post('/api/expenses', (req, res) => {
  const payload = {
    description: req.body.description,
    type: req.body.type,
    amount: req.body.amount,
    category: req.body.category,
    date: req.body.date,
  };

  const errors = validateExpense(payload);
  if (errors.length) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  const expense = createExpense({
    description: payload.description.toString().trim(),
    type: String(payload.type).toLowerCase(),
    amount: Number(payload.amount),
    category: payload.category.toString().trim(),
    date: new Date(payload.date).toISOString().slice(0, 10),
  });

  res.status(201).json(normalizeExpense(expense));
});

app.put('/api/expenses/:id', (req, res) => {
  const payload = {
    description: req.body.description,
    type: req.body.type,
    amount: req.body.amount,
    category: req.body.category,
    date: req.body.date,
  };

  const errors = validateExpense(payload);
  if (errors.length) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  const updated = updateExpense(req.params.id, {
    description: payload.description.toString().trim(),
    type: String(payload.type).toLowerCase(),
    amount: Number(payload.amount),
    category: payload.category.toString().trim(),
    date: new Date(payload.date).toISOString().slice(0, 10),
  });

  if (!updated) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  res.json(normalizeExpense(updated));
});

app.delete('/api/expenses/:id', (req, res) => {
  const success = deleteExpense(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.status(204).send();
});

app.get('/api/summary', (req, res) => {
  const transactions = getExpenses();
  const summary = transactions.reduce(
    (acc, expense) => {
      const amount = Number(expense.amount) || 0;
      const type = expense.type === 'income' ? 'income' : 'expense';
      acc[type] += amount;
      acc.count += 1;
      acc.categories[expense.category] = (acc.categories[expense.category] || 0) + amount;
      return acc;
    },
    { income: 0, expense: 0, net: 0, count: 0, categories: {} }
  );

  summary.net = summary.income - summary.expense;
  res.json(summary);
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all for non-API routes: always serve the login page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Expense Tracker running on http://localhost:${PORT}`);
});
