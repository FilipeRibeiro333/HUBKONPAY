// backend/src/routes/userRoutes.js
import { Router } from 'express';
import User from '../models/userModel.js';
import logAction from '../middlewares/auditMiddleware.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ success: false, message: "Email já cadastrado" });

    const user = await User.create({ nome, email, senha, role: "user" });
    try { await logAction(req.user?.id || null, 'create_user', { email }); } 
    catch (err) { console.warn("⚠️ Erro log:", err.message); }

    res.status(201).json({ success: true, message: "Usuário criado", user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-senha');
    res.json({ success: true, total: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
});

export default router;