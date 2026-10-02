export const diagnoseMiddleware = (label) => (req, res, next) => {
  console.log(`🟡 [${label}] Authorization:`, req.headers.authorization);
  console.log(`🟡 [${label}] req.user:`, req.user);
  next();
};