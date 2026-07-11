import { getAgencyFollowups } from "@/lib/agency-actions";
import FollowupsClient from "./FollowupsClient";

export const revalidate = 0;

export default async function FollowupsPage() {
  const list = await getAgencyFollowups();
  return (
    <div className="container mx-auto">
      <FollowupsClient initialFollowups={list as any} />
    </div>
  );
}
