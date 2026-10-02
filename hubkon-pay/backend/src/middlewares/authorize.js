/**
 * Authorization Middleware
 * --------------------------------------------
 * Validates JWT tokens and attaches the user
 * to the request object.
 *
 * Security Features:
 * - JWT verification
 * - MongoDB ObjectId validation
 * - Role-based access control
 * - Prevents CastObjectId errors
 */

import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/userModel.js";

export const authorize = (roles = []) => async (req, res, next) => {

  try {

    // -----------------------------------------
    // 1. Extract Authorization Header
    // -----------------------------------------
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token required"
      });
    }

    const token = authHeader.split(" ")[1];

    // -----------------------------------------
    // 2. Verify JWT Token
    // -----------------------------------------
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // -----------------------------------------
    // 3. Validate Mongo ObjectId
    // Prevents CastObjectId errors
    // -----------------------------------------
    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({
        message: "Invalid token payload"
      });
    }

    // -----------------------------------------
    // 4. Load user from database
    // -----------------------------------------
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    // -----------------------------------------
    // 5. Role based access control
    // -----------------------------------------
    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {

    console.error("Authorization error:", error);

    return res.status(401).json({
      message: "Invalid or expired token"
    });

  }

};