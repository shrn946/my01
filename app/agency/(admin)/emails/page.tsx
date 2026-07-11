import { getAgencyEmails } from "@/lib/agency-actions";
import EmailsClient from "./EmailsClient";

export const revalidate = 0;

export default async function EmailsPage() {
  const list = await getAgencyEmails();
  return (
    <div className="container mx-auto">
      <EmailsClient initialEmails={list as any} />
    </div>
  );
}
