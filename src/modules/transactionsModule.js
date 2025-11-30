import { createTransaction as dbCreateTransaction, getTransaction, updateTransactionStatus, getTransactionsByUser } from '../db.js';
import { requireUser, getBalance } from './userModule.js';
import { transferFundsAtomic } from './walletModule.js';

export const STATUS_PENDING = 'pendiente';
export const STATUS_CONFIRMED = 'confirmada';
export const STATUS_REJECTED = 'rechazada';

export const AUTO_CONFIRM_LIMIT = 50000;

export function createTransaction(originId, destinationId, amount) {
  requireUser(originId);
  requireUser(destinationId);

  if (originId === destinationId) {
    throw new Error('origin and destination must be different users');
  }

  if (amount <= 0) {
    throw new Error('amount must be greater than 0');
  }

  const date = new Date().toISOString();
  let transaction;
  let movementInfo = null;

  if (amount <= AUTO_CONFIRM_LIMIT) {
    movementInfo = transferFundsAtomic(originId, destinationId, amount);
    const id = dbCreateTransaction(originId, destinationId, amount, STATUS_CONFIRMED, date);
    transaction = { id, originId, destinationId, amount, status: STATUS_CONFIRMED, date };
  } else {
    const originBalance = getBalance(originId);
    if (originBalance < amount) {
      throw new Error('insufficient funds');
    }
    const id = dbCreateTransaction(originId, destinationId, amount, STATUS_PENDING, date);
    transaction = { id, originId, destinationId, amount, status: STATUS_PENDING, date };
  }

  return { transaction, movementInfo };
}

export function approveTransaction(id) {
  const transaction = getTransaction(id);
  if (!transaction) {
    throw new Error('transaction not found');
  }

  if (transaction.status !== STATUS_PENDING) {
    throw new Error('transaction is not pending');
  }

  requireUser(transaction.originId);
  requireUser(transaction.destinationId);

  const movementInfo = transferFundsAtomic(
    transaction.originId,
    transaction.destinationId,
    transaction.amount
  );

  updateTransactionStatus(id, STATUS_CONFIRMED);
  transaction.status = STATUS_CONFIRMED;

  return { transaction, movementInfo };
}

export function rejectTransaction(id) {
  const transaction = getTransaction(id);
  if (!transaction) {
    throw new Error('transaction not found');
  }

  if (transaction.status !== STATUS_PENDING) {
    throw new Error('transaction is not pending');
  }

  updateTransactionStatus(id, STATUS_REJECTED);
  transaction.status = STATUS_REJECTED;

  return transaction;
}

export function listTransactionsForUser(userId) {
  requireUser(userId);
  return getTransactionsByUser(userId);
}
