export const calculateRisk = (data) => {

  let score = 0;

  if (data.mixerInteraction) score += 40;
  if (data.largeTransactions) score += 30;
  if (data.pep) score += 20;
  if (data.highRiskCountry) score += 25;

  if (score > 100) score = 100;

  return score;
};