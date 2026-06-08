"use server";

import { redirect } from "next/navigation";
import { Prisma, type User } from "@prisma/client";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function loginAction(_: unknown, formData: FormData) {
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const next = readString(formData, "next") || "/admin";

  if (!email || !password) {
    return { ok: false, message: "Email and password are required." };
  }

  let user: User | null;
  try {
    user = await getPrisma().user.findUnique({ where: { email } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2021", "P2022"].includes(error.code)) {
      return {
        ok: false,
        message: "Database tables are missing or out of date. Run Prisma migrations and seed the admin user."
      };
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return {
        ok: false,
        message: "Database connection failed. Check DATABASE_URL, DIRECT_URL, and Supabase access."
      };
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return {
        ok: false,
        message: "Prisma configuration is invalid. Check prisma.config.ts and your .env file."
      };
    }

    console.error("Login failed:", error);
    return {
      ok: false,
      message: "Login failed because the server could not read the user database."
    };
  }

  if (!user || !(await verifyPassword(password, user.password))) {
    return { ok: false, message: "Invalid email or password." };
  }

  await createSession(user);
  redirect(next.startsWith("/") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
