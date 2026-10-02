import jwt from "jsonwebtoken";

// ⚡️ Usar o mesmo secret do .env
const JWT_SECRET = "SuperSecreto123!";

// 🔹 SuperAdmin
const superAdminToken = jwt.sign(
  { userId: "SUPERADMIN_ID", role: "SuperAdmin", companyId: null },
  JWT_SECRET,
  { expiresIn: "7d" }
);

// 🔹 Admin
const adminToken = jwt.sign(
  { userId: "ADMIN_ID", role: "admin", companyId: null },
  JWT_SECRET,
  { expiresIn: "7d" }
);

// 🔹 User
const userToken = jwt.sign(
  { userId: "USER_ID", role: "user", companyId: null },
  JWT_SECRET,
  { expiresIn: "7d" }
);

// 🔹 Mostrar tokens no console
console.log("SUPERADMIN_TOKEN=", superAdminToken);
console.log("ADMIN_TOKEN=", adminToken);
console.log("USER_TOKEN=", userToken);