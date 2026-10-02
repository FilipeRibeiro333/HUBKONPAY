export const checkAML = (transaction) => {

  let alerts = [];

  if (transaction.amount > 10000) {
    alerts.push("High transaction amount");
  }

  if (transaction.frequency > 20) {
    alerts.push("Suspicious frequency");
  }

  return {
    flagged: alerts.length > 0,
    alerts
  };
};