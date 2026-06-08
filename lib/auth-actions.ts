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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return {
        ok: false,
        message: "Database tables are missing. Run Prisma migrations and seed the admin user."
      };
    }

    throw error;
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
