import express from "express";
import { submitKYC } from "../controllers/kycController.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/submit",
  upload.fields([
    { name: "documentFront" },
    { name: "documentBack" },
    { name: "selfie" }
  ]),
  submitKYC
);

export default router;