import { getAgencySettings, getAgencyEmailTemplates } from "@/lib/agency-actions";
import SettingsClient from "./SettingsClient";

export const revalidate = 0;

export default async function SettingsPage() {
  const settings = await getAgencySettings();
  const templates = await getAgencyEmailTemplates();

  return (
    <div className="container mx-auto">
      <SettingsClient 
        initialSettings={settings as any} 
        templates={templates.map(t => ({ id: t.id, name: t.name }))} 
      />
    </div>
  );
}
