import { NextResponse } from "next/server";

import { getAiAudit } from "@/lib/ai-audit";
import { getPrisma } from "@/lib/prisma";
import { getLeadAiFields } from "@/lib/lead-ai-storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await params;
  const aiFields = await getLeadAiFields(getPrisma(), leadId);
  const audit = getAiAudit(aiFields.aiAnalysis);

  if (!audit) {
    return NextResponse.json(
      { error: "AI audit has not been generated for this lead." },
      { status: 404 },
    );
  }

  return NextResponse.json(audit);
}
