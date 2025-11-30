import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { resetDatabase } from '../src/db.js';
import { getBalance } from '../src/modules/userModule.js';
import {
  createTransaction,
  approveTransaction,
  rejectTransaction,
  listTransactionsForUser,
  STATUS_PENDING,
  STATUS_CONFIRMED,
  STATUS_REJECTED
} from '../src/modules/transactionsModule.js';

describe('pruebas del modulo de transacciones', () => {
  beforeEach(() => {
    resetDatabase();
  });

  describe('auto-confirmacion para montos <= 50,000', () => {
    it('deberia auto-confirmar transaccion de 10,000 y actualizar saldos', () => {
      const originId = 1;
      const destinationId = 2;
      const amount = 10000;

      const originBalanceBefore = getBalance(originId);
      const destinationBalanceBefore = getBalance(destinationId);

      const result = createTransaction(originId, destinationId, amount);

      assert.strictEqual(result.transaction.status, STATUS_CONFIRMED);

      const originBalanceAfter = getBalance(originId);
      const destinationBalanceAfter = getBalance(destinationId);

      assert.strictEqual(originBalanceAfter, originBalanceBefore - amount);
      assert.strictEqual(destinationBalanceAfter, destinationBalanceBefore + amount);
    });
  });

  describe('estado pendiente para montos > 50,000', () => {
    it('deberia crear transaccion pendiente de 60,000 sin cambiar saldos', () => {
      const originId = 1;
      const destinationId = 2;
      const amount = 60000;

      const originBalanceBefore = getBalance(originId);
      const destinationBalanceBefore = getBalance(destinationId);

      const result = createTransaction(originId, destinationId, amount);

      assert.strictEqual(result.transaction.status, STATUS_PENDING);

      assert.strictEqual(getBalance(originId), originBalanceBefore);
      assert.strictEqual(getBalance(destinationId), destinationBalanceBefore);
    });
  });

  describe('aprobacion de transaccion pendiente', () => {
    it('deberia aprobar transaccion pendiente y actualizar saldos', () => {
      const originId = 1;
      const destinationId = 2;
      const amount = 60000;

      const createResult = createTransaction(originId, destinationId, amount);
      const transactionId = createResult.transaction.id;

      assert.strictEqual(createResult.transaction.status, STATUS_PENDING);

      const originBalanceBefore = getBalance(originId);
      const destinationBalanceBefore = getBalance(destinationId);

      const approveResult = approveTransaction(transactionId);

      assert.strictEqual(approveResult.transaction.status, STATUS_CONFIRMED);

      assert.strictEqual(getBalance(originId), originBalanceBefore - amount);
      assert.strictEqual(getBalance(destinationId), destinationBalanceBefore + amount);
    });
  });

  describe('rechazo de transaccion pendiente', () => {
    it('deberia rechazar transaccion pendiente sin cambiar saldos', () => {
      const originId = 1;
      const destinationId = 2;
      const amount = 60000;

      const createResult = createTransaction(originId, destinationId, amount);
      const transactionId = createResult.transaction.id;

      const originBalanceBefore = getBalance(originId);
      const destinationBalanceBefore = getBalance(destinationId);

      const transaction = rejectTransaction(transactionId);

      assert.strictEqual(transaction.status, STATUS_REJECTED);

      assert.strictEqual(getBalance(originId), originBalanceBefore);
      assert.strictEqual(getBalance(destinationId), destinationBalanceBefore);
    });
  });

  describe('prevenir saldo negativo', () => {
    it('deberia lanzar error cuando el monto excede el saldo disponible', () => {
      const originId = 3;
      const destinationId = 1;
      const amount = 60000;

      assert.throws(
        () => createTransaction(originId, destinationId, amount),
        (error) => {
          return error.message.includes('insufficient funds');
        }
      );
    });
  });

  describe('listar transacciones de usuario', () => {
    it('deberia retornar todas las transacciones donde el usuario es origen o destino, ordenadas por fecha', () => {
      const userId = 1;

      createTransaction(1, 2, 10000);
      createTransaction(3, 1, 5000);
      createTransaction(1, 3, 15000);
      createTransaction(2, 3, 8000);

      const aliceTransactions = listTransactionsForUser(userId);

      assert.strictEqual(aliceTransactions.length, 3);

      aliceTransactions.forEach(tx => {
        assert.ok(tx.originId === userId || tx.destinationId === userId);
      });

      for (let i = 1; i < aliceTransactions.length; i++) {
        const prevDate = new Date(aliceTransactions[i - 1].date);
        const currDate = new Date(aliceTransactions[i].date);
        assert.ok(prevDate <= currDate);
      }
    });
  });
});
