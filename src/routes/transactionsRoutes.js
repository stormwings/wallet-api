import { Router } from 'express';
import {
  createTransaction,
  approveTransaction,
  rejectTransaction,
  listTransactionsForUser
} from '../modules/transactionsModule.js';

const router = Router();

router.post('/', (req, res) => {
  try {
    const { originId, destinationId, amount } = req.body;
    const origin = Number(originId);
    const destination = Number(destinationId);
    const transactionAmount = Number(amount);
    const result = createTransaction(origin, destination, transactionAmount);
    res.status(201).json(result.transaction);
  } catch (error) {
    handleError(error, res);
  }
});

router.get('/', (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }
    const userIdNumber = Number(userId);
    if (isNaN(userIdNumber)) {
      return res.status(400).json({ error: 'userId must be a valid number' });
    }
    const transactions = listTransactionsForUser(userIdNumber);
    res.status(200).json(transactions);
  } catch (error) {
    handleError(error, res);
  }
});

router.patch('/:id/approve', (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = approveTransaction(id);
    res.status(200).json(result.transaction);
  } catch (error) {
    handleError(error, res);
  }
});

router.patch('/:id/reject', (req, res) => {
  try {
    const id = Number(req.params.id);
    const transaction = rejectTransaction(id);
    res.status(200).json(transaction);
  } catch (error) {
    handleError(error, res);
  }
});

function handleError(error, res) {
  if (error.message.includes('not found')) {
    return res.status(404).json({ error: error.message });
  }
  res.status(400).json({ error: error.message });
}

export default router;
