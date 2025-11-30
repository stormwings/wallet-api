import Database from 'better-sqlite3';

const db = new Database(':memory:');

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    balance INTEGER NOT NULL
  );

  CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    originId INTEGER NOT NULL,
    destinationId INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (originId) REFERENCES users(id),
    FOREIGN KEY (destinationId) REFERENCES users(id)
  );

  INSERT INTO users (id, name, email, balance) VALUES
    (1, 'Alice', 'alice@example.com', 100000),
    (2, 'Bob', 'bob@example.com', 75000),
    (3, 'Charlie', 'charlie@example.com', 50000);
`);

export function getUser(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function updateBalance(id, balance) {
  db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(balance, id);
}

export function createTransaction(originId, destinationId, amount, status, date) {
  const result = db.prepare(
    'INSERT INTO transactions (originId, destinationId, amount, status, date) VALUES (?, ?, ?, ?, ?)'
  ).run(originId, destinationId, amount, status, date);
  return result.lastInsertRowid;
}

export function getTransaction(id) {
  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
}

export function updateTransactionStatus(id, status) {
  db.prepare('UPDATE transactions SET status = ? WHERE id = ?').run(status, id);
}

export function getTransactionsByUser(userId) {
  return db.prepare(
    'SELECT * FROM transactions WHERE originId = ? OR destinationId = ? ORDER BY date ASC'
  ).all(userId, userId);
}

export function resetDatabase() {
  db.exec(`
    DELETE FROM transactions;
    DELETE FROM users;
    DELETE FROM sqlite_sequence WHERE name='transactions';

    INSERT INTO users (id, name, email, balance) VALUES
      (1, 'Alice', 'alice@example.com', 100000),
      (2, 'Bob', 'bob@example.com', 75000),
      (3, 'Charlie', 'charlie@example.com', 50000);
  `);
}

export default db;
