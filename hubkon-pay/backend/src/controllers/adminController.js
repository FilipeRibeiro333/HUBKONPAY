/** 
 * @file adminController.js 
 * @description Master Governance Controller for HUBKON GLOBAL.
 * @version V.1065 MASTER ✅ (Integrated Multi-Sig & Resilient Stats)
 */
import User from "../models/userModel.js";
import GlobalSettings from "../models/GlobalSettings.js";
import Transaction from "../models/transactionModel.js";
import Company from "../models/companyModel.js";
import Wallet from "../models/WalletModel.js";
import Redis from 'ioredis';
import bcrypt from "bcryptjs";
import mongoose from 'mongoose';

const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    retryStrategy: (times) => Math.min(times * 50, 2000)
});

/** 1. BUSINESS DIRECTORY */
export const getCompanies = async (req, res) => {
    try {
        const companies = await Company.find().sort({ name: 1 });
        res.json({ success: true, companies });
    } catch (err) {
        res.status(500).json({ success: false, message: "FETCH_COMPANIES_FAILED" });
    }
};

/** 2. BUSINESS PROVISIONING */
export const createCompany = async (req, res) => {
    try {
        const { name, taxId, address, adminData, plan, creditScore } = req.body;
        if (!adminData?.password) return res.status(400).json({ success: false, message: "PASSWORD_REQUIRED" });

        const newCompany = await Company.create({ 
            name, 
            taxId, 
            address, 
            plan: plan || "enterprise", 
            creditScore: creditScore || 80 
        });

        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        await User.create({ 
            name: adminData.name, 
            email: adminData.email, 
            password: hashedPassword, 
            role: "admin", 
            companyId: newCompany._id 
        });

        await Wallet.create({ company: newCompany._id, balance: 0, currency: "USD", isPlatform: false });

        res.status(201).json({ success: true, message: "BUSINESS_UNIT_INITIALIZED", company_id: newCompany._id });
    } catch (err) {
        res.status(400).json({ success: false, message: "PROVISIONING_FAILED" });
    }
};

/** 3. USER MANAGEMENT */
export const getUsers = async (req, res) => {
    try {
        const query = req.user.role === 'superadmin' ? {} : { companyId: req.user.companyId };
        const users = await User.find(query).select("-password").sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: "FETCH_USERS_FAILED" });
    }
};

export const createUser = async (req, res) => {
    try {
        const userData = { ...req.body };
        if (req.user.companyId) userData.companyId = req.user.companyId;
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }
        const user = await User.create(userData);
        res.json({ success: true, user });
    } catch (err) {
        res.status(400).json({ success: false, message: "USER_CREATION_FAILED" });
    }
};

/** 4. GLOBAL GOVERNANCE */
export const updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        const setting = await GlobalSettings.findOneAndUpdate(
            { key },
            { value, updatedBy: req.user?._id },
            { upsert: true, new: true }
        );

        // Sincronização com Cache Redis para regras críticas
        if (key === 'escrow_rules' || key === 'kill_switch') {
            await redis.set(`HUBKON_${key.toUpperCase()}`, typeof value === 'string' ? value : JSON.stringify(value));
        }

        res.json({ success: true, setting });
    } catch (err) {
        res.status(400).json({ success: false, message: "RULE_UPDATE_FAILED" });
    }
};

export const getSettings = async (req, res) => {
    try {
        const settings = await GlobalSettings.find().populate("updatedBy", "name");
        const formatted = settings.map(s => ({ 
            key: s.key, 
            value: s.value, 
            updated_at: s.updatedAt, 
            updated_by_name: s.updatedBy?.name || "Master_Admin" 
        }));
        res.json({ success: true, settings: formatted });
    } catch (err) {
        res.status(500).json({ success: false, message: "FETCH_FAILED" });
    }
};

/** 5. FINANCIAL RISK AUDIT & MULTISIG (Resilient Queue) */
export const getRiskAudit = async (req, res) => {
    try {
        const isSuper = req.user.role === 'superadmin';
        const query = isSuper ? {} : { companyId: req.user.companyId };
        
        const queue = await Transaction.find({ 
            ...query, 
            status: { $in: ["PENDING_APPROVAL", "TIMELOCK_ACTIVE"] } 
        }).sort({ createdAt: -1 });

        const formattedData = queue.map(tx => ({
            id: tx._id,
            amount: `${tx.amount || 0} ${tx.currency || 'USD'}`,
            status: tx.status,
            type: tx.type,
            approvals_count: Array.isArray(tx.approvals) ? tx.approvals.length : 0,
            release_at: tx.releaseAt || null
        }));

        res.json({ success: true, data: formattedData });
    } catch (err) {
        res.status(500).json({ success: false, message: "RISK_AUDIT_FAILED" });
    }
};

/**
 * ✅ APPROVE MULTISIG TRANSACTION
 * Fix: Integrado com o novo Schema e Timelock Protocol.
 */
export const approveMultisigTransaction = async (req, res) => {
    try {
        const { transactionId } = req.body;
        const adminId = req.user?._id;

        const tx = await Transaction.findById(transactionId);

        if (!tx || (tx.status !== "PENDING_APPROVAL" && tx.status !== "TIMELOCK_ACTIVE")) {
            return res.status(404).json({ success: false, message: "Protocolo inválido ou já processado." });
        }

        if (!tx.approvals) tx.approvals = [];

        // Verificação de assinatura duplicada
        if (tx.approvals.some(a => a.adminId && a.adminId.toString() === adminId.toString())) {
            return res.status(400).json({ success: false, message: "Assinatura já registrada por este nó." });
        }

        // Registro da assinatura digital no ledger
        tx.approvals.push({ 
            adminId, 
            signedAt: new Date(), 
            signature: `SIG_${Math.random().toString(36).substring(2, 9).toUpperCase()}` 
        });

        // Lógica de Consenso Institucional (4/7 assinaturas)
        if (tx.approvals.length >= 4) {
            if (tx.type === "critical_risk_escrow") {
                tx.status = "TIMELOCK_ACTIVE";
                tx.releaseAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24h quarantine
            } else {
                tx.status = "COMPLETED";
            }
        }

        await tx.save();

        // Broadcast em tempo real via Redis para atualizar o Dashboard da imagem
        await redis.publish('HUBKON_TX_UPDATED', JSON.stringify({
            id: tx._id,
            status: tx.status,
            approvals: tx.approvals.length
        }));

        res.json({ success: true, approvals: tx.approvals.length, status: tx.status });
    } catch (err) {
        console.error("SIGNATURE_CRITICAL_ERROR:", err);
        res.status(500).json({ success: false, message: "CRITICAL_MODEL_VALIDATION_ERROR" });
    }
};

/** 6. EMERGENCY KILL SWITCH */
export const toggleKillSwitch = async (req, res) => {
    try {
        const { active } = req.body;
        await redis.set('HUBKON_KILL_SWITCH', active.toString());
        await GlobalSettings.findOneAndUpdate({ key: "kill_switch" }, { value: active }, { upsert: true });
        res.json({ success: true, is_paused: active });
    } catch (err) {
        res.status(500).json({ success: false, message: "KILL_SWITCH_FAILURE" });
    }
};

/** 7. ANALYTICS STATS (Resilient Engine) */
export const getAdminDashboardStats = async (req, res) => {
    try {
        const isSuper = req.user.role === 'superadmin';
        
        let totalUnits = 0;
        if (isSuper) {
            const masterRecords = await Company.countDocuments({});
            totalUnits = masterRecords;
        } else {
            totalUnits = 1;
        }

        const revenue = await Transaction.aggregate([
            { 
                $match: isSuper 
                ? { status: { $in: ["COMPLETED", "TIMELOCK_ACTIVE"] } } 
                : { companyId: req.user.companyId, status: "COMPLETED" } 
            },
            { 
                $group: { 
                    _id: { $toUpper: "$currency" }, 
                    totalFees: { $sum: "$feeApplied" } 
                } 
            }
        ]);

        res.json({ success: true, revenue, companies_count: totalUnits });
    } catch (err) {
        res.status(500).json({ success: false, message: "STATS_FAILED" });
    }
};

export const revokeSuspiciousTransaction = async (req, res) => {
    try {
        const { transactionId, reason } = req.body;
        const tx = await Transaction.findById(transactionId);
        if (!tx) return res.status(404).json({ success: false, message: "TX_NOT_FOUND" });

        tx.status = "REVOKED";
        tx.internalNotes = `REVOKED: ${reason}`;
        await tx.save();

        res.json({ success: true, message: "TX_FROZEN" });
    } catch (err) {
        res.status(500).json({ success: false, message: "REVOKE_FAILED" });
    }
};
