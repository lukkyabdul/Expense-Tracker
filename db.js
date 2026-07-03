const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, 'data');
const dbFile = path.join(dbDir, 'expenses.json');

function initDb() {
  fs.mkdirSync(dbDir, { recursive: true });
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ expenses: [], nextId: 1 }, null, 2));
  }
}

function readDb() {
  initDb();
  const raw = fs.readFileSync(dbFile, 'utf8');
  const data = JSON.parse(raw);
  let migrated = false;

  if (Array.isArray(data.expenses)) {
    data.expenses = data.expenses.map((expense) => {
      if (!expense.type) {
        migrated = true;
        return { ...expense, type: 'expense' };
      }
      return expense;
    });
  }

  if (migrated) {
    writeDb(data);
  }

  return data;
}

function writeDb(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

function getExpenses() {
  const data = readDb();
  return data.expenses;
}

function getExpense(id) {
  const data = readDb();
  return data.expenses.find((item) => item.id === Number(id));
}

function createExpense(expense) {
  const data = readDb();
  const record = { id: data.nextId++, ...expense };
  data.expenses.unshift(record);
  writeDb(data);
  return record;
}

function updateExpense(id, updated) {
  const data = readDb();
  const index = data.expenses.findIndex((item) => item.id === Number(id));
  if (index === -1) return null;
  data.expenses[index] = { id: Number(id), ...updated };
  writeDb(data);
  return data.expenses[index];
}

function deleteExpense(id) {
  const data = readDb();
  const index = data.expenses.findIndex((item) => item.id === Number(id));
  if (index === -1) return false;
  data.expenses.splice(index, 1);
  writeDb(data);
  return true;
}

module.exports = {
  initDb,
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
};
