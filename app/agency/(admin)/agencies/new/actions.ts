"use server";

import { createAgency } from "@/lib/agency-actions";

export async function submitAddAgency(formData: any) {
  return createAgency(formData);
}
