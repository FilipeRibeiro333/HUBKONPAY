import express from "express";
import { 
  requestUnsignedTransaction, 
  broadcastSignedTransaction 
} from "../controllers/web3OrchestrationController.js";

const router = express.Router();

// 📡 ALINHAMENTO ESTRITO DE ENDPOINTS DE INGESTÃO
router.post("/build-unsigned-tx", requestUnsignedTransaction);
router.post("/broadcast", broadcastSignedTransaction);

export default router;
