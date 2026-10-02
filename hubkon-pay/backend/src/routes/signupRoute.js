/**
 * Company Signup Routes
 * ---------------------------------
 * Handles:
 * - self-service company creation
 * - authenticated dashboard access
 */

import { Router } from "express";
import { signupCompany } from "../controllers/signupCompanyController.js";
import { getCompanyDashboard } from "../controllers/dashboardController.js";
import { authorize } from "../middlewares/authorize.js";

const router = Router();

// ----------------------------------
// Public signup
// ----------------------------------
router.post("/signup", signupCompany);

// ----------------------------------
// Protected dashboard
// ----------------------------------
router.get("/dashboard", authorize(), getCompanyDashboard);

export default router;