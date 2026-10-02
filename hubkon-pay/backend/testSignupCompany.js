// testSignupCompany.js
// -------------------------------------------------
// Test script for HUBKON Self-Service Signup
// - Sends POST request to /api/signup
// - Checks if user, company, and wallet are created
// -------------------------------------------------

import fetch from "node-fetch";

// Função para gerar email aleatório
const randomEmail = () => {
  const timestamp = Date.now();
  return `teste${timestamp}@hubkon.com`;
};

// Dados do signup
const signupData = {
  name: "Filipe Test",
  email: randomEmail(),
  password: "12345678",
  companyName: "HUBKON Test Company",
  plan: "basic"
};

// Função para testar signup
const testSignup = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log("📊 Signup test result:", result);
    } else {
      console.error("❌ Signup test failed:", result);
    }
  } catch (err) {
    console.error("🔥 Error during signup test:", err);
  }
};

// Executa o teste
testSignup();