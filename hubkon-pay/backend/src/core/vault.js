/**
 * HUBKON PAY - VAULT CORE
 * This file handles multi-signature logic and time-locked fund releases.
 * Strategy: "Trust No One" - Requires 4/7 approvals before any movement.
 */

const TransactionStatus = {
  CREATED: 'CREATED',
  AWAITING_APPROVALS: 'AWAITING_APPROVALS',
  TIMELOCK_ACTIVE: 'TIMELOCK_ACTIVE', // Security quarantine active
  READY_TO_EXECUTE: 'READY_TO_EXECUTE',
  EXECUTED: 'EXECUTED',
  KILLED: 'KILLED' // Emergency stop triggered
};

const TIMELOCK_DURATION_HOURS = 24;
const MIN_APPROVALS_REQUIRED = 4;

async function approveTransaction(transactionId, adminId) {
  // 1. Check if the admin has the "Approver" role (Principle of Least Privilege)
  if (!await checkAdminPermissions(adminId, 'FINANCIAL_APPROVER')) {
    throw new Error("Security Alert: Unauthorized approval attempt.");
  }

  // 2. Record the signature in the database
  await db.approvals.upsert({
    where: { transactionId_adminId: { transactionId, adminId } },
    create: { transactionId, adminId }
  });

  // 3. Count current approvals
  const approvalCount = await db.approvals.count({ where: { transactionId } });

  // 4. If threshold reached, move to Timelock phase
  if (approvalCount >= MIN_APPROVALS_REQUIRED) {
    const unlockDate = new Date();
    unlockDate.setHours(unlockDate.getHours() + TIMELOCK_DURATION_HOURS);

    await db.transaction.update({
      where: { id: transactionId },
      data: { 
        status: TransactionStatus.TIMELOCK_ACTIVE,
        availableAt: unlockDate 
      }
    });

    // Log the event for the Security Team
    console.log(`[SECURE_LOG] Transaction ${transactionId} entered Timelock. Unlocks at: ${unlockDate}`);
  }
}

module.exports = { approveTransaction, TransactionStatus };
