"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function saveTemplate(data: { id?: string, name: string, subject: string, body: string }) {
  try {
    if (data.id) {
      await prisma.emailTemplate.update({
        where: { id: data.id },
        data: { name: data.name, subject: data.subject, body: data.body }
      });
    } else {
      await prisma.emailTemplate.create({
        data: { name: data.name, subject: data.subject, body: data.body }
      });
    }
    revalidatePath("/admin/email-templates");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTemplate(id: string) {
  try {
    await prisma.emailTemplate.delete({ where: { id } });
    revalidatePath("/admin/email-templates");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
