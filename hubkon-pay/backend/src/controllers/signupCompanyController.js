/**
 * @file signupCompanyController.js
 * @version V.1018 - EMERGENCY FIX 🛡️
 */
import mongoose from "mongoose";
import Company from "../models/companyModel.js";
import User from "../models/userModel.js";
import { createWallet } from "../services/walletService.js";
import logger from "../middlewares/logger.js";

export const signupCompany = async (req, res, expressNext) => {
  // Check if expressNext is valid, if not, use a fallback to prevent the crash
  const safeNext = (typeof expressNext === 'function') ? expressNext : (err) => { 
    console.error("CRITICAL: next() was not a function inside controller.");
    return; 
  };

  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const { companyName, taxId, address, admin, email, password, name, plan } = req.body;
    
    // Normalize data
    const finalEmail = admin?.email || email;
    const finalPassword = admin?.password || password;
    const finalName = admin?.name || name;

    if (!finalEmail || !finalPassword) {
      throw new Error("MISSING_CREDENTIALS");
    }

    // 1. Check Identity
    const existingUser = await User.findOne({ email: finalEmail }).session(session);
    if (existingUser) throw new Error("EMAIL_ALREADY_EXISTS");

    // 2. Create Company
    const [company] = await Company.create([{ 
      name: companyName, 
      email: finalEmail, 
      taxId, 
      address, 
      plan: plan || "enterprise", 
      subscriptionStatus: "active" 
    }], { session });

    // 3. Create Root User
    const [user] = await User.create([{ 
      name: finalName, 
      email: finalEmail, 
      password: finalPassword, 
      role: "owner", 
      companyId: company._id 
    }], { session });

    // 4. Link Owner
    company.owner = user._id;
    await company.save({ session });

    // 5. Create Wallet (Provisioning)
    await createWallet(company._id, session); 

    await session.commitTransaction();
    
    if (logger?.audit) logger.audit(`SUCCESS: ${companyName}`);

    return res.status(201).json({ 
      success: true, 
      data: { companyId: company._id, userId: user._id } 
    });

  } catch (error) {
    // ABORT TRANSACTION
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    
    console.error("🔥 ACTUAL_DB_ERROR_FOUND:", error.message);
    
    // USE THE RENAMED SAFE NEXT
    return safeNext(error); 
  } finally {
    session.endSession();
  }
};
