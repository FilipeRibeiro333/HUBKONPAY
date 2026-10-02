// debugMiddleware.js
export const logReqUser = (req, res, next) => {
  console.log("🟢 Debug - req.user:", req.user);
  next();
};