"use server";

import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET!;

export const generateToken = (userId: number) => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: "30d" });
};