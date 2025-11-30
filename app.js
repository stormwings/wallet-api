import express from 'express';
import transactionsRoutes from './src/routes/transactionsRoutes.js';

const app = express();

app.use(express.json());

app.use('/transactions', transactionsRoutes);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});

export default app;
