const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, 'data');
const dbFile = path.join(dbDir, 'expenses.json');
const usersDbFile = path.join(dbDir, 'users.json');

function initDb() {
  fs.mkdirSync(dbDir, { recursive: true });
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ expenses: [], nextId: 1 }, null, 2));
  }
  if (!fs.existsSync(usersDbFile)) {
    fs.writeFileSync(usersDbFile, JSON.stringify({ users: [], nextId: 1 }, null, 2));
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

function readUsersDb() {
  initDb();
  const raw = fs.readFileSync(usersDbFile, 'utf8');
  return JSON.parse(raw);
}

function writeUsersDb(data) {
  fs.writeFileSync(usersDbFile, JSON.stringify(data, null, 2));
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

function findUserByEmail(email) {
  const data = readUsersDb();
  return data.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function createUser(user) {
  const data = readUsersDb();
  // In a real app, you MUST hash the password here.
  const newUser = { 
    id: data.nextId++, 
    email: user.email, 
    name: user.name || user.email.split('@')[0], 
    password: user.password 
  };
  data.users.push(newUser);
  writeUsersDb(data);
  // Return user without password
  return { id: newUser.id, email: newUser.email, name: newUser.name };
}

function updateUserProfile(email, name, newPassword) {
  const data = readUsersDb();
  const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  if (name) user.name = name.trim();
  if (newPassword) user.password = newPassword;
  writeUsersDb(data);
  return { id: user.id, email: user.email, name: user.name };
}

module.exports = {
  initDb,
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  findUserByEmail,
  createUser,
  updateUserProfile,
};
