import NetworkConfig from "../models/NetworkConfigModel.js";

export const toggleSettlementRail = async (req, res) => {
  try {
    const { rail, isActive } = req.body;
    if (!rail) return res.status(400).json({ success: false, message: "Parâmetro rail obrigatório." });

    const config = await NetworkConfig.findOneAndUpdate(
      { rail: rail.toUpperCase() },
      { isActive: isActive, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    console.log(`?? [CIRCUIT BREAKER] Rota ${rail.toUpperCase()} alterada para: ACTIVE = ${isActive}`);
    return res.status(200).json({ success: true, message: "Estado do carril atualizado.", config });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
