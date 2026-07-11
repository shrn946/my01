import { getAgencies } from "@/lib/agency-actions";
import AgenciesClient from "./AgenciesClient";

export const revalidate = 0;

export default async function AgenciesPage() {
  const list = await getAgencies();
  return (
    <div className="container mx-auto">
      <AgenciesClient initialAgencies={list as any} />
    </div>
  );
}
