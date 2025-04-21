import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  // const allCookies = req.cookies.getAll();
  // console.log("All cookies:", allCookies);

  // Try with hardcoded name for now
  const token = req.cookies.get(process.env.NEXT_TOKEN as string)?.value;
  // console.log("Token from cookies:", token);

  if (!token) return null;

  try {
    const jwtSecret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, jwtSecret) as { user_id: string };
    // console.log("Decoded token:", decoded);
    return decoded.user_id;
  } catch (err) {
    console.log("Token verification failed:", err);
    return null;
  }
}
