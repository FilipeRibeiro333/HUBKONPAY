/**
 * @file testOnboarding.js
 * @description V.1017 ULTIMATE - Final Infrastructure Test
 * Fixed: Explicit Next-Parameter Injection
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import Company from './src/models/companyModel.js';
import User from './src/models/userModel.js';
import Wallet from './src/models/walletModel.js';
import { signupCompany } from './src/controllers/signupCompanyController.js';

const runTest = async () => {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 HUBKON B2B: INICIANDO TESTE DE INFRAESTRUTURA");
  console.log("=".repeat(50));

  const dbUri = process.env.MONGO_URI;

  try {
    console.log("🔗 Conectando ao MongoDB...");
    await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log("✅ Conexão estabelecida.");

    const uniqueId = Date.now();
    const testPayload = {
      body: {
        companyName: `Test Corp ${uniqueId}`,
        taxId: `TAX-${uniqueId}`,
        address: "Samba, Luanda",
        email: `ceo_${uniqueId}@hubkon.com`,
        password: "Password123!",
        name: "Admin User",
        plan: "enterprise"
      }
    };

    // 1. MOCK RESPONSE
    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = data;
        return this;
      }
    };

    // 2. MOCK NEXT (The "Bug Killer")
    const mockNext = function(err) {
      if (err) {
        console.error("\n⚡ [NEXT_CAPTURED]: O Controller enviou um erro corretamente.");
        console.error(`📝 Detalhes: ${err.message || err}`);
      } else {
        console.log("\n✅ [NEXT_CALLED]: Proseguindo sem erros.");
      }
    };

    console.log("🛠️ Executando Onboarding Atômico...");
    
    // EXPLICIT INJECTION: Passing all 3 required Express arguments
    await signupCompany(testPayload, mockRes, mockNext);

    console.log("\n🔎 Verificando DB...");
    const company = await Company.findOne({ email: testPayload.body.email });
    const user = await User.findOne({ email: testPayload.body.email });
    const wallet = company ? await Wallet.findOne({ companyId: company._id }) : null;

    console.log("-".repeat(40));
    console.log(company ? "🟢 EMPRESA:  CRIADA" : "🔴 EMPRESA:  FALHOU");
    console.log(user    ? "🟢 USUÁRIO:  CRIADO" : "🔴 USUÁRIO:  FALHOU");
    console.log(wallet  ? "🟢 CARTEIRA: CRIADA" : "🔴 CARTEIRA: FALHOU");
    console.log("-".repeat(40));

    if (company && user && wallet) {
      console.log("\n🏆 SUCESSO: Master Engine 100% Operacional.");
    } else {
      console.log("\n⚠️ Persistência falhou. Veja o erro acima capturado pelo [NEXT_CAPTURED].");
    }

  } catch (err) {
    console.error("\n🔥 SCRIPT_CRASH: Erro fora do fluxo do Controller:");
    console.error(err.stack);
  } finally {
    await mongoose.connection.close();
    console.log("🚪 Sessão encerrada.");
    process.exit();
  }
};

runTest();
