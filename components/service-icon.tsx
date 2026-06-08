import { Bug, Gauge, LayoutTemplate, LifeBuoy, MonitorCog, Plug, ShoppingCart, Wrench } from "lucide-react";

export function ServiceIcon({ title }: { title: string }) {
  const normalized = title.toLowerCase();
  const className = "h-6 w-6";

  if (normalized.includes("elementor")) return <LayoutTemplate className={className} />;
  if (normalized.includes("woocommerce")) return <ShoppingCart className={className} />;
  if (normalized.includes("plugin")) return <Plug className={className} />;
  if (normalized.includes("speed")) return <Gauge className={className} />;
  if (normalized.includes("bug")) return <Bug className={className} />;
  if (normalized.includes("maintenance")) return <LifeBuoy className={className} />;
  if (normalized.includes("landing")) return <MonitorCog className={className} />;
  return <Wrench className={className} />;
}
