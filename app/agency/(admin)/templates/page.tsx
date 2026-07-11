import { getAgencyEmailTemplates } from "@/lib/agency-actions";
import TemplatesClient from "./TemplatesClient";

export const revalidate = 0;

export default async function TemplatesPage() {
  const list = await getAgencyEmailTemplates();
  return (
    <div className="container mx-auto">
      <TemplatesClient initialTemplates={list as any} />
    </div>
  );
}
