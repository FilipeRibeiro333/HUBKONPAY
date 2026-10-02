// src/routes/auditRoutes.js
import express from 'express';
import User from '../models/UserModel.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

router.get('/audit', async (req, res) => {
  try {
    const users = await User.find();
    const invoices = await Invoice.find();
    res.json({ users, invoices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;