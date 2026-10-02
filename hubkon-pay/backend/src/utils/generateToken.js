import jwt from "jsonwebtoken";

/**
 * Token Utility
 * ----------------------------------
 * Generates JWT authentication tokens
 * used for user sessions.
 */

export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "1d" }
  );
};