import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function createToken(user: User): Promise<string> {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  return token;
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    return token || null;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = await getTokenFromCookies();
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    return user;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcryptjs.hash(password, 10);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return await bcryptjs.compare(password, hash);
}

export async function setAuthCookie(token: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
  } catch (error) {
    console.error('Error setting auth cookie:', error);
  }
}

export async function clearAuthCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
  } catch (error) {
    console.error('Error clearing auth cookie:', error);
  }
}
