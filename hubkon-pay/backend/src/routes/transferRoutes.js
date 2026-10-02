import express from "express";
import { externalTransfer } from "../controllers/transferController.js";
import auditMiddleware from "../middlewares/auditMiddleware.js";

const router = express.Router();

// External transfer route
router.post("/external", auditMiddleware, externalTransfer);

export default router;