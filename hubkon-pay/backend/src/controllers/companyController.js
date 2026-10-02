/**
 * @file authRoutes.js
 * @description Authentication & Identity Provisioning Gateway for HUBKON PAY.
 * Implements JWT-based session management and Multi-Tenant User registration.
 * 
 * @dev Frontier Hackathon Context:
 * This module bridges traditional corporate access (Web2) with decentralized 
 * permissions. It establishes the initial identity layer before HubkonID (SBT) issuance.
 */

import { Router } from "express";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Corporate User Registration
 * @access  Public (Initial Onboarding)
 */
router.post("/register", async (req, res) => {
  const { name, email, password, role, companyId } = req.body;

  try {
    // 1️⃣ IDEMPOTENCY CHECK: Preventing duplicate identity records
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "EMAIL_ALREADY_EXISTS" });

    /** 
     * 2️⃣ CREDENTIAL SECURITY
     * We use a high salt round (12) for industry-standard Bcrypt hashing.
     */
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3️⃣ PERSISTENCE: Storing the hybrid (Web2 + Web3 ready) identity
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      companyId,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId || null,
    });
  } catch (err) {
    res.status(500).json({ error: "REGISTRATION_FAILED: " + err.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Identity Verification & Token Issuance
 * @access  Public
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ IDENTITY LOOKUP
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "USER_NOT_FOUND" });

    // 2️⃣ CRYPTOGRAPHIC PASSWORD VERIFICATION
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

    /** 
     * 3️⃣ SESSION AUTHORIZATION (JWT)
     * We sign a token with a 24-hour expiration for B2B stability.
     */
    const token = jwt.sign(
      { userId: user._id, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "AUTH_SERVER_ERROR" });
  }
});

export default router;
