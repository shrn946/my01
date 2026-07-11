import { notFound } from "next/navigation";
import { getAgencyById } from "@/lib/agency-actions";
import AgencyDetailsClient from "./AgencyDetailsClient";

export const revalidate = 0;

export default async function AgencyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const agency = await getAgencyById(resolvedParams.id);
  if (!agency) return notFound();

  return (
    <div className="container mx-auto">
      <AgencyDetailsClient agency={agency as any} />
    </div>
  );
}
