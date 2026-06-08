import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-ink hover:border-brand">
        <LogOut size={16} />
        Logout
      </button>
    </form>
  );
}
