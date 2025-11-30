import { requireUser, getBalance, setBalance } from './userModule.js';

export function transferFundsAtomic(originId, destinationId, amount) {
  if (amount <= 0) {
    throw new Error('amount must be greater than 0');
  }

  requireUser(originId);
  requireUser(destinationId);

  const originBalanceBefore = getBalance(originId);
  const destinationBalanceBefore = getBalance(destinationId);

  if (originBalanceBefore < amount) {
    throw new Error('insufficient funds');
  }

  const newOriginBalance = originBalanceBefore - amount;
  const newDestinationBalance = destinationBalanceBefore + amount;

  if (newOriginBalance < 0) {
    throw new Error('operation would result in negative balance');
  }

  setBalance(originId, newOriginBalance);
  setBalance(destinationId, newDestinationBalance);

  return {
    originId,
    destinationId,
    debited: amount,
    originBalanceBefore,
    originBalanceAfter: newOriginBalance,
    destinationBalanceBefore,
    destinationBalanceAfter: newDestinationBalance
  };
}
