/**
 * HUBKON NOTIFICATION SERVICE
 * Focus: High-Priority Email Alerts for security events.
 * This service notifies the administration about Timelock and Multisig holds.
 */
import nodemailer from 'nodemailer';

/**
 * Email Transporter Configuration
 * Uses environment variables for security.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // True for port 465 (SSL)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a security alert email to the admin team.
 * Triggered by paymentService when a transaction hits a security layer.
 */
export const notifySecurityTeam = async (tx) => {
  const message = `
    🚨 HUBKON SECURITY ALERT: HIGH-VALUE TRANSACTION DETECTED
    -------------------------------------------------------
    Transaction ID: ${tx._id}
    Origin User:    ${tx.from}
    Amount:         ${tx.amount} ${tx.currency}
    Status:         ${tx.status}
    
    ACTION TAKEN:
    The transaction has been held for: 
    ${tx.status === 'TIMELOCK_ACTIVE' ? '24-hour Security Timelock' : '4/7 Manual Multisig Approval'}
    
    Please review this operation in the Admin Panel.
    -------------------------------------------------------
    HUBKON GLOBAL - Sovereign Banking Infrastructure
  `;

  try {
    // Send Email to Admins
    await transporter.sendMail({
      from: `"HUBKON Security Core" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, // Defined in your .env
      subject: `⚠️ SECURITY ALERT: ${tx.amount} ${tx.currency} ON HOLD`,
      text: message,
    });

    console.log(`[NOTIFY] Security email sent successfully for TX ${tx._id}`);
  } catch (error) {
    console.error("🚨 [NOTIFY_ERROR] Failed to delivery security email:", error.message);
  }
};
