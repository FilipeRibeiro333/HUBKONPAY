/**
 * @file db.js
 * @description MongoDB Persistence Layer Connector for HUBKON PAY.
 * Built for high-availability B2B indexing and KYC data storage.
 * 
 * @version V.1021 ELITE ✅
 * @dev Optimized for Node 25+ (ESM). Implements dynamic tenant detection.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

// Initialize environment variables to ensure MONGO_URI is available
dotenv.config();

/**
 * @function connectDB
 * @description Connects the HUBKON Pay Master Engine to the distributed database.
 * Implements dynamic logging to verify which tenant database is currently active.
 * @async
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    // SECURITY CHECK: Ensure connection string is present before attempting handshake
    if (!uri) {
      throw new Error("CONFIGURATION_ERROR: MONGO_URI is not defined in the .env file.");
    }

    /**
     * @constant {string} dbName
     * @description Extracts the Database name from the URI string for audit transparency.
     */
    const dbName = uri.split('/').pop().split('?')[0];

    /**
     * @constant {Object} options
     * @property {number} serverSelectionTimeoutMS - Fails fast (10s) to prevent hanging transactions.
     * @property {boolean} autoIndex - Set to true for development, false for production scaling.
     */
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    // Success log with dynamic Database name feedback
    console.log(`✅ [DATABASE] Connection established successfully: [${dbName}]`);

  } catch (error) {
    /**
     * CRITICAL FAILURE HANDLING:
     * In a B2B payment ecosystem, we cannot operate without a verified ledger state.
     * Termination prevents "ghost" transactions or data corruption.
     */
    console.error("❌ [DATABASE] Critical connection error:", error.message);
    
    // Halt the system immediately if the persistence layer is unreachable
    process.exit(1);
  }
};

export default connectDB;