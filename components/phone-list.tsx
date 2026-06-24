import { useState } from "react";
import { Phone, Copy, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhoneNumbers, cleanPhoneForHref } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function PhoneList({ rawPhone, countryContext = "", maxDisplay = 2 }: { rawPhone?: string | null, countryContext?: string, maxDisplay?: number }) {
  const { toast } = useToast();
  const formattedNumbers = formatPhoneNumbers(rawPhone, countryContext);
  const [showAll, setShowAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!formattedNumbers || formattedNumbers.length === 0) {
    return <span className="text-muted-foreground text-xs opacity-70">No phone</span>;
  }

  const handleCopy = (num: string, idx: number) => {
    navigator.clipboard.writeText(num);
    setCopiedIndex(idx);
    toast({ title: "Copied!", description: `${num} copied to clipboard.` });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const displayList = showAll ? formattedNumbers : formattedNumbers.slice(0, maxDisplay);

  return (
    <div className="flex flex-col gap-2">
      {displayList.map((num, idx) => {
        const clean = cleanPhoneForHref(num);
        return (
          <div key={idx} className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold truncate max-w-[140px] sm:max-w-[200px]">{num}</span>
            {idx === 0 && <Badge variant="outline" className="text-[9px] h-4 px-1 py-0 bg-primary/5 text-primary border-primary/20 uppercase font-black">Primary</Badge>}
            
            <div className="flex items-center gap-1 ml-auto shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => window.open(`https://wa.me/${clean}`, '_blank')}
                title="WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={(e) => { e.preventDefault(); window.location.href = `tel:${clean}`; }}
                title="Call"
              >
                <Phone className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                onClick={() => handleCopy(num, idx)}
                title="Copy"
              >
                {copiedIndex === idx ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        );
      })}
      
      {formattedNumbers.length > maxDisplay && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-[10px] uppercase font-black tracking-wider text-primary hover:underline text-left mt-1"
        >
          {showAll ? "Show Less" : `+${formattedNumbers.length - maxDisplay} More`}
        </button>
      )}
    </div>
  );
}
