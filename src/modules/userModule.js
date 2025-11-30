import { getUser, updateBalance } from '../db.js';

export function findUserById(id) {
  return getUser(id) || null;
}

export function requireUser(id) {
  const user = findUserById(id);
  if (!user) {
    throw new Error('user not found');
  }
  return user;
}

export function getBalance(id) {
  const user = requireUser(id);
  return user.balance;
}

export function setBalance(id, newBalance) {
  const user = requireUser(id);
  if (typeof newBalance !== 'number' || isNaN(newBalance)) {
    throw new Error('invalid balance value');
  }
  updateBalance(id, newBalance);
  return { ...user, balance: newBalance };
}
