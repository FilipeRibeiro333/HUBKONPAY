/**
 * @file authController.js
 * @description Authentication & Identity Orchestration.
 */
import User from "../models/userModel.js";
import Company from "../models/companyModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { createWallet } from "../services/walletService.js";
import logger from "../middlewares/logger.js";

// Função Utilitária para Geração de Token
const generateToken = (id, role, companyId) => jwt.sign(
  { userId: id, role, companyId },
  process.env.JWT_SECRET,
  { expiresIn: "30d" }
);

/**
 * @function registerCompanyWithOwner
 * @description Registro Atômico de Empresa, Dono e Wallet.
 */
export const registerCompanyWithOwner = async (req, res, next) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const { companyName, companyEmail, name, email, password } = req.body;

    // 1️⃣ Check de Idempotência (Identidade)
    const userExists = await User.findOne({ email }).session(session);
    if (userExists) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, error: "USER_ALREADY_EXISTS" });
    }

    // 2️⃣ Criação do Tenant (Company)
    const [company] = await Company.create([{
      name: companyName,
      email: companyEmail,
      plan: 'enterprise',
      subscriptionStatus: 'active'
    }], { session });

    // 3️⃣ Provisionamento Financeiro (Wallet)
    // Se a wallet falha, a transação aborta para evitar "empresa sem conta"
    await createWallet(company._id, session);

    // 4️⃣ Criação do Usuário Root (Owner)
    const [user] = await User.create([{
      name,
      email,
      password, // O hash deve ser tratado no userModel (pre-save)
      role: "owner",
      companyId: company._id
    }], { session });

    // 5️⃣ Vinculação de Governança
    company.owner = user._id;
    await company.save({ session });

    await session.commitTransaction();
    
    logger.audit(`STRATEGIC_ONBOARDING_SUCCESS: ${companyEmail}`);

    res.status(201).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, companyId: user.companyId },
      token: generateToken(user._id, user.role, user.companyId)
    });

  } catch (err) {
    if (session && session.inTransaction()) await session.abortTransaction();
    next(err); // Delega para o Global Error Handler
  } finally {
    session.endSession();
  }
};

/**
 * @function loginUser
 */
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // .lean() para performance e select('+password') para pegar a senha oculta no model
    const user = await User.findOne({ email }).select("+password").lean();
    
    if (!user) {
      return res.status(401).json({ success: false, error: "INVALID_CREDENTIALS" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "INVALID_CREDENTIALS" });
    }

    const token = generateToken(user._id, user.role, user.companyId);

    // Removemos dados sensíveis antes de enviar
    delete user.password;

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, companyId: user.companyId },
      token
    });

  } catch (err) {
    next(err);
  }
};

/**
 * @function getMe
 */
export const getMe = async (req, res) => {
  // Retorna o contexto já injetado pelo authMiddleware
  res.json({ success: true, user: req.user });
};
