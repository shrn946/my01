import "server-only";

import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";

const cookieName = "portfolio_session";

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "local-development-secret-change-me");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: { id: string; email: string; role: string; name?: string | null }) {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name ?? ""
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());

  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, secret());
    return verified.payload as { id: string; email: string; role: "ADMIN" | "CLIENT"; name?: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.id) return null;

  try {
    return getPrisma().user.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
  } catch {
    return null;
  }
}

export async function requireRole(role: "ADMIN" | "CLIENT") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${role === "ADMIN" ? "/admin" : "/client"}`);
  if (role === "ADMIN" && user.role !== "ADMIN") redirect("/client");
  return user;
}
