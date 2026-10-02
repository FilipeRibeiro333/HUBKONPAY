import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import redis from "../config/redisClient.js";

/**
 * User Service
 * ----------------------------------
 * Handles business logic related to users.
 * 
 * Includes:
 * - user creation
 * - user retrieval
 * - updates
 * - deletion
 * 
 * Redis caching is used to improve performance.
 */

export const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    ...data,
    password: hashedPassword,
  });

  await redis.del("users:all");

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const getAllUsers = async () => {
  const cachedUsers = await redis.get("users:all");

  if (cachedUsers) {
    console.log("♻️ Loaded from Redis cache");
    return JSON.parse(cachedUsers);
  }

  const users = await User.find().select("-password");

  await redis.set("users:all", JSON.stringify(users), "EX", 3600);

  return users;
};

export const getUserById = async (id) => {
  const cacheKey = `user:${id}`;

  const cachedUser = await redis.get(cacheKey);

  if (cachedUser) {
    return JSON.parse(cachedUser);
  }

  const user = await User.findById(id).select("-password");

  if (user) {
    await redis.set(cacheKey, JSON.stringify(user), "EX", 3600);
  }

  return user;
};

export const updateUser = async (id, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(id, data, {
    new: true,
  }).select("-password");

  if (updatedUser) {
    await redis.set(`user:${id}`, JSON.stringify(updatedUser), "EX", 3600);
    await redis.del("users:all");
  }

  return updatedUser;
};

export const deleteUser = async (id) => {
  await User.findByIdAndDelete(id);

  await redis.del(`user:${id}`);
  await redis.del("users:all");
};