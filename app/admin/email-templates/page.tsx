import { prisma } from "@/lib/prisma";
import EmailTemplatesClient from "./templates-client";

export const dynamic = "force-dynamic";

export default async function EmailTemplatesPage() {
  const templates = await prisma.emailTemplate.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto py-10">
      <EmailTemplatesClient initialTemplates={templates} />
    </div>
  );
}
