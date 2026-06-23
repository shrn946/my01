import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Webhook event type from Resend (e.g. email.opened, email.clicked)
    const type = payload.type; 
    const data = payload.data;
    
    if (type === 'email.opened' || type === 'email.clicked') {
      const tags = data.tags || [];
      const leadIdTag = tags.find((t: any) => t.name === 'lead_id');
      
      if (leadIdTag && leadIdTag.value) {
        const leadId = leadIdTag.value;
        const prisma = getPrisma();
        
        // Only update if it's currently Contacted or Opened (so we don't downgrade Clicked to Opened)
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (lead) {
            const newStatus = type === 'email.clicked' ? 'Clicked' : 'Opened';
            
            // If already clicked, don't revert to opened
            if (!(lead.status === 'Clicked' && newStatus === 'Opened')) {
                await prisma.lead.update({
                  where: { id: leadId },
                  data: {
                    status: newStatus,
                    lastContactedAt: new Date()
                  }
                });
            }
        }
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
