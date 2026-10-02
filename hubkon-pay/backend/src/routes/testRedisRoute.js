// src/routes/testRedisRoute.js
import { Router } from "express";
import redis from "../config/redisClient.js";

const router = Router();

router.get("/teste", async (req, res) => {
  try {
    await redis.set("teste-chave", "HUBKON está funcionando!", "EX", 60);
    const valor = await redis.get("teste-chave");
    res.json({ sucesso: true, valor });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

export default router;