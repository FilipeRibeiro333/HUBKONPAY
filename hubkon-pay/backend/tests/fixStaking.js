import dotenv from "dotenv";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/userModel.js";
import Staking from "../src/models/stakingModel.js";

dotenv.config();

async function fixStaking() {

  await connectDB();

  const user = await User.findOne({ email: "testuser@hubkon.com" });

  if (!user) {
    console.log("❌ User not found");
    process.exit();
  }

  // remove staking antigo
  await Staking.deleteMany({ userId: user._id });

  // cria staking novo correto
  const stake = new Staking({
    userId: user._id,
    amount: 200,
    rewardRate: 0.05,
    claimed: false,
    active: true,
    startDate: new Date()
  });

  await stake.save();

  console.log("✅ Fresh staking created");
  process.exit();
}

fixStaking();